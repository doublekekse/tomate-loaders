import axios from 'axios';
import fs from 'fs';
import path from 'path';

import type { ModLoader } from 'tomate-mods';
import type { LaunchConfig } from '.';

export const id = 'forge';

export async function downloadForge(
  forgeFilePath: string,
  gameVersion: string
) {
  fs.mkdirSync(path.dirname(forgeFilePath), { recursive: true });

  const forgeDownloadURL = `https://files.minecraftforge.net/net/minecraftforge/forge/index_${gameVersion}.html`;
  const response = await axios.get(forgeDownloadURL);
  const match = response.data.match(/<a href="([^"]+installer\.jar)">/);
  if (match && match[1]) {
    let downloadLink = match[1];
    if (downloadLink.includes('url='))
      downloadLink = downloadLink.split('url=').pop();

    const forgeResponse = await axios.get(downloadLink, {
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(forgeFilePath);
    forgeResponse.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log('Forge JAR downloaded successfully.');
  } else {
    throw new Error('Could not find a download link for the latest Forge JAR.');
  }
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
    // clientPackage: null,
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
