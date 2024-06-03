import axios from 'axios';
import type { LaunchConfig } from '..';

export const id = 'vanilla';

export const url = 'https://www.minecraft.net/';

export type VersionManifest = {
  latest: { release: string; snapshot: string };
  versions: {
    id: string;
    type: 'snapshot' | 'release';
    url: string;
    time: string;
    releaseTime: string;
    sha1: string;
    complianceLevel: number;
  }[];
};

export async function getVersionManifest() {
  return (
    await axios.get<VersionManifest>(
      'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
    )
  ).data;
}

/**
 * Downloads the latest version json and returns a partial MCLC config
 */
export async function getMCLCLaunchConfig(config: LaunchConfig) {
  return {
    root: config.rootPath,
    version: {
      number: config.gameVersion,
      type: 'release',
    },
  };
}

/**
 * Returns all game versions a loader supports
 */
export async function listSupportedGameVersions() {
  const versionManifest = await getVersionManifest();
  return versionManifest.versions.map((version) => ({
    version: version.id,
    stable: version.type === 'release',
  }));
}
