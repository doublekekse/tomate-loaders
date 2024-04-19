import axios, { AxiosError } from 'axios';
import path from 'path';
import fs from 'fs';

import type { ModLoader } from 'tomate-mods';
import type { LaunchConfig } from '..';

export const id = 'quilt';

const api = axios.create({
  baseURL: 'https://meta.quiltmc.org/v3/',
});

export const url = 'https://quiltmc.org/';

export type Loader = {
  separator: string;
  build: number;
  maven: string;
  version: string;
};

export async function getLoaders() {
  const loaders = await api.get<Loader[]>('/versions/loader');

  if (loaders.data.length <= 0)
    throw new Error(
      'Error while fetching quilt metadata; Loader length is zero'
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
      if (e.response?.status === 404) {
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
    `quilt-${config.gameVersion}-${config.loaderVersion}`,
    `quilt-${config.gameVersion}-${config.loaderVersion}.json`
  );

  fs.mkdirSync(path.dirname(versionPath), { recursive: true });
  fs.writeFileSync(versionPath, JSON.stringify(profile));

  return {
    root: config.rootPath,
    version: {
      number: config.gameVersion,
      type: 'release',
      custom: `quilt-${config.gameVersion}-${config.loaderVersion}`,
    },
  };
}

export async function listSupportedVersions() {
  return (
    await api.get<{ version: string; stable: boolean }[]>('/versions/game')
  ).data;
}

export const tomateModsModLoader: ModLoader = {
  overrideMods: {
    P7dR8mSH: 'qvIfYCYJ', // Fabric Api -> QFAPI
    '308769': '634179', // Fabric Api -> QFAPI

    Ha28R6CL: 'lwVhp9o5', // Fabric Language Kotlin -> QKL
    '306612': '720410', // Fabric Language Kotlin -> QKL
  },
  modrinthCategories: ['quilt', 'fabric'],
  curseforgeCategory: '5',
};
