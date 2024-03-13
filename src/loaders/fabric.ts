import axios, { AxiosError } from 'axios';
import fs from 'fs';
import path from 'path';

import type { ModLoader } from 'tomate-mods';
import { type LaunchConfig } from '..';

export const id = 'fabric';

const api = axios.create({
  baseURL: 'https://meta.fabricmc.net/v2',
});

export type Loader = {
  separator: string;
  build: number;
  maven: string;
  version: string;
  stable: boolean;
};

export async function getLoaders() {
  const loaders = await api.get<Loader[]>('/versions/loader');

  if (loaders.data.length <= 0)
    throw new Error(
      'Error while fetching fabric metadata; Loader length is zero'
    );

  return loaders.data;
}

export async function getProfile(gameVersion: string, loaderVersion: string) {
  try {
    const profile = await api.get(
      `/versions/loader/${gameVersion}/${loaderVersion}/profile/json`
    );
    return profile.data;
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.response?.status === 400) {
        throw new Error(`Version "${gameVersion}" could not be found`);
      }
    }
    throw e;
  }
}

/**
 * Downloads the latest version json and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
export async function getMCLCLaunchConfig(config: LaunchConfig) {
  if (!config.loaderVersion) {
    const [loader] = await getLoaders();
    config.loaderVersion = loader.version;
  }

  const profile = await getProfile(config.gameVersion, config.loaderVersion);

  const versionPath = path.join(
    config.rootPath,
    'versions',
    `fabric-${config.gameVersion}-${config.loaderVersion}`,
    `fabric-${config.gameVersion}-${config.loaderVersion}.json`
  );

  fs.mkdirSync(path.dirname(versionPath), { recursive: true });
  fs.writeFileSync(versionPath, JSON.stringify(profile));

  return {
    root: config.rootPath,
    version: {
      number: config.gameVersion,
      type: 'release',
      custom: `fabric-${config.gameVersion}-${config.loaderVersion}`,
    },
  };
}

export async function listSupportedVersions() {
  return (
    await api.get<{ version: string; stable: boolean }[]>('/versions/game')
  ).data;
}

export const tomateModsModLoader: ModLoader = {
  overrideMods: {},
  modrinthCategories: ['fabric'],
  curseforgeCategory: '4',
};
