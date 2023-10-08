import axios from 'axios';
import fs from 'fs';
import path from 'path';

import type { ModLoader } from 'tomate-mods';
import { type LaunchConfig } from '.';

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
  const profile = await api.get(
    `/versions/loader/${gameVersion}/${loaderVersion}/profile/json`
  );
  return profile.data;
}

/**
 * Downloads the latest version json and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
export async function getMCLCLaunchConfig(config: LaunchConfig) {
  const loaders = await getLoaders();
  const profile = await getProfile(config.gameVersion, loaders[0].version);

  const versionPath = path.join(
    config.rootPath,
    'versions',
    `fabric-${config.gameVersion}`,
    `fabric-${config.gameVersion}.json`
  );

  fs.mkdirSync(path.dirname(versionPath), { recursive: true });
  fs.writeFileSync(versionPath, JSON.stringify(profile));

  return {
    root: config.rootPath,
    version: {
      number: config.gameVersion,
      type: 'release',
      custom: `fabric-${config.gameVersion}`,
    },
  };
}

export const totalModsModLoader: ModLoader = {
  overrideMods: {},
  modrinthCategories: ['fabric'],
  curseforgeCategory: '4',
};
