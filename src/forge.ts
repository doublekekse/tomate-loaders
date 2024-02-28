import axios from 'axios';
import fs from 'fs';
import path from 'path';
import xml from 'xml2js';

import type { ModLoader } from 'tomate-mods';
import type { LaunchConfig } from '.';

export const id = 'forge';

export async function downloadForge(
  forgeFilePath: string,
  gameVersion: string
) {
  fs.mkdirSync(path.dirname(forgeFilePath), { recursive: true });

  const metadataUrl =
    'https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml';
  const response = await axios.get(metadataUrl);
  const xmlData = response.data;

  const { metadata } = await xml.parseStringPromise(xmlData);
  const versions: string[] = metadata.versioning[0].versions[0].version;

  // Filter versions based on game version
  const filteredVersions = versions.filter((version) =>
    version.includes(gameVersion + '-')
  );

  // Sort filtered versions to get the latest one
  const latestVersion = filteredVersions[0];

  const downloadLink = `https://maven.minecraftforge.net/net/minecraftforge/forge/${latestVersion}/forge-${latestVersion}-installer.jar`;

  const forgeResponse = await axios.get(downloadLink, {
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(forgeFilePath);
  forgeResponse.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

/**
 * Downloads the latest forge jar and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
export async function getMCLCLaunchConfig(config: LaunchConfig) {
  const versionPath = path.join(
    config.rootPath,
    'versions',
    `forge-${config.gameVersion}`,
    'forge.jar'
  );

  await downloadForge(versionPath, config.gameVersion);

  return {
    root: config.rootPath,
    clientPackage: null as never,
    version: {
      number: config.gameVersion,
      type: 'release',
    },
    forge: versionPath,
  };
}

export const totalModsModLoader: ModLoader = {
  overrideMods: {},
  modrinthCategories: ['forge'],
  curseforgeCategory: '1',
};
