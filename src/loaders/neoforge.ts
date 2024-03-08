import axios from 'axios';
import fs from 'fs';
import path from 'path';
import xml from 'xml2js';

import type { ModLoader } from 'tomate-mods';
import type { LaunchConfig } from '..';

export const id = 'neoforge';

export async function downloadNeoForge(
  neoForgeFilePath: string,
  gameVersion: string
) {
  fs.mkdirSync(path.dirname(neoForgeFilePath), { recursive: true });

  const metadata = await getMavenMetadata();
  const versions: string[] = metadata.versioning[0].versions[0].version;

  const [_major, minor, patch] = gameVersion.split('.');

  // Filter versions based on game version
  const filteredVersions = versions.filter(
    (version) =>
      !version.includes('-beta') && version.includes(`${minor}.${patch}.`)
  );

  const latestVersion = filteredVersions[0];

  const downloadLink = `https://maven.neoforged.net/releases/net/neoforged/neoforge/${latestVersion}/neoforge-${latestVersion}-installer.jar`;

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
 * Downloads the latest neoforge jar and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
export async function getMCLCLaunchConfig(config: LaunchConfig) {
  const versionPath = path.join(
    config.rootPath,
    'versions',
    `neoforge-${config.gameVersion}`,
    'neoforge.jar'
  );

  await downloadNeoForge(versionPath, config.gameVersion);

  return {
    root: config.rootPath,
    clientPackage: null as never,
    version: {
      number: config.gameVersion,
      type: 'release',
      custom: `neoforge-${config.gameVersion}`,
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
