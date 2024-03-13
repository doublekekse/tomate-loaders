import axios from 'axios';
import fs from 'fs';
import path from 'path';
import xml from 'xml2js';

import type { ModLoader } from 'tomate-mods';
import type { LaunchConfig } from '..';

export const id = 'neoforge';

export async function downloadNeoForge(
  neoForgeFilePath: string,
  loaderVersion: string
) {
  fs.mkdirSync(path.dirname(neoForgeFilePath), { recursive: true });

  const downloadLink = `https://maven.neoforged.net/releases/net/neoforged/neoforge/${loaderVersion}/neoforge-${loaderVersion}-installer.jar`;

  const neoForgeResponse = await axios.get(downloadLink, {
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(neoForgeFilePath);
  neoForgeResponse.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

export async function getMavenMetadata() {
  const metadataUrl =
    'https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml';
  const response = await axios.get(metadataUrl);
  const xmlData = response.data;

  const { metadata } = await xml.parseStringPromise(xmlData);
  return metadata;
}

/**
 * Lists the versions on the maven
 * They are structured like this: `${gameVersion.minor}.${gameVersion.patch}.${loaderVersion}`
 */
export async function getMavenVersions(): Promise<
  `${string}.${string}.${string}`[]
> {
  const metadata = await getMavenMetadata();
  return metadata.versioning[0].versions[0].version;
}

/**
 * @returns The latest loader version for the given gameVersion
 */
export async function getLatestLoader(
  gameVersion: string
): Promise<`${string}.${string}.${string}` | undefined> {
  const [_major, minor, patch] = gameVersion.split('.');

  const versions = await getMavenVersions();

  const filteredVersions = versions.filter(
    (version) =>
      !version.includes('-beta') && version.includes(`${minor}.${patch}.`)
  );

  return filteredVersions[0];
}

/**
 * Downloads the latest neoforge jar and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
export async function getMCLCLaunchConfig(config: LaunchConfig) {
  const loaderVersion =
    config.loaderVersion ?? (await getLatestLoader(config.gameVersion));

  if (!loaderVersion) {
    throw new Error(`Version "${config.gameVersion}" could not be found`);
  }

  const versionPath = path.join(
    config.rootPath,
    'versions',
    `neoforge-${config.gameVersion}-${loaderVersion}`,
    'neoforge.jar'
  );

  console.log(loaderVersion);

  await downloadNeoForge(versionPath, loaderVersion);

  return {
    root: config.rootPath,
    clientPackage: null as never,
    version: {
      number: config.gameVersion,
      type: 'release',
      custom: `neoforge-${config.gameVersion}-${loaderVersion}`,
    },
    forge: versionPath,
  };
}

export async function listSupportedVersions() {
  const metadata = await getMavenMetadata();
  const versions: string[] = metadata.versioning[0].versions[0].version;

  const supportedVersions = new Set<string>();

  for (let i = 0; i < versions.length; i++) {
    const version = versions[i];

    // Filter out beta versions
    if (version.includes('-beta')) {
      continue;
    }

    const [major, minor] = version.split('.');

    supportedVersions.add(`1.${major}.${minor}`);
  }

  return Array.from(supportedVersions).map((v) => ({
    version: v,
    stable: true,
  }));
}

export const tomateModsModLoader: ModLoader = {
  overrideMods: {},
  modrinthCategories: ['neoforge'],
  curseforgeCategory: '6',
};
