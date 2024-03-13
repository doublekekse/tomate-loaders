import axios from 'axios';
import fs from 'fs';
import path from 'path';
import xml from 'xml2js';

import type { ModLoader } from 'tomate-mods';
import type { LaunchConfig } from '..';

export const id = 'forge';

export async function downloadForge(
  forgeFilePath: string,
  loaderVersion: string
) {
  fs.mkdirSync(path.dirname(forgeFilePath), { recursive: true });

  const downloadLink = getDownloadLink(loaderVersion);

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

export async function getMavenMetadata() {
  const metadataUrl =
    'https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml';
  const response = await axios.get(metadataUrl);
  const xmlData = response.data;

  const { metadata } = await xml.parseStringPromise(xmlData);
  return metadata;
}

/**
 * Lists the versions on the maven
 * They are structured like this: `${gameVersion}-${loaderVersion}`
 */
export async function getMavenVersions(): Promise<`${string}-${string}`[]> {
  const metadata = await getMavenMetadata();
  return metadata.versioning[0].versions[0].version;
}

export async function getLatestLoader(
  gameVersion: string
): Promise<`${string}-${string}` | undefined> {
  const versions = await getMavenVersions();
  const filteredVersions = versions.filter((version) =>
    version.includes(gameVersion + '-')
  );

  return filteredVersions[0];
}

function getDownloadLink(latestVersion: string) {
  const split = latestVersion.split('.');
  const minor = split[1];
  const t = split.pop();

  if (
    minor &&
    parseInt(minor) <= 12 &&
    (latestVersion.split('-')[0] !== '1.12.2' || (t && parseInt(t) <= 2847))
  ) {
    return `https://maven.minecraftforge.net/net/minecraftforge/forge/${latestVersion}/forge-${latestVersion}-universal.jar`;
  } else {
    return `https://maven.minecraftforge.net/net/minecraftforge/forge/${latestVersion}/forge-${latestVersion}-installer.jar`;
  }
}

/**
 * Downloads the latest forge jar and returns a partial MCLC config
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
    `forge-${config.gameVersion}-${loaderVersion}`,
    'forge.jar'
  );

  await downloadForge(versionPath, loaderVersion);

  return {
    root: config.rootPath,
    clientPackage: null as never,
    version: {
      number: config.gameVersion,
      type: 'release',
      custom: `forge-${config.gameVersion}-${loaderVersion}`,
    },
    forge: versionPath,
  };
}

export async function listSupportedVersions() {
  const metadata = await getMavenMetadata();
  const versions: string[] = metadata.versioning[0].versions[0].version;

  const supportedVersions = new Set<string>();

  for (let i = 0; i < versions.length; i++) {
    const version = versions[i].split('-')[0];
    supportedVersions.add(version);
  }

  return Array.from(supportedVersions).map((v) => ({
    version: v,
    stable: true,
  }));
}

export const tomateModsModLoader: ModLoader = {
  overrideMods: {},
  modrinthCategories: ['forge'],
  curseforgeCategory: '1',
};
