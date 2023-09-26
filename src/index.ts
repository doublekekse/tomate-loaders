import type { ModLoader as TotalModsModLoader } from 'tomate-mods';
import type { ILauncherOptions } from 'minecraft-launcher-core';

export type LaunchConfig = {
  rootPath: string;
  gameVersion: string;
};

export type ModLoader = {
  getMCLCLaunchConfig(config: LaunchConfig): Partial<ILauncherOptions>;
  totalModsModLoader: TotalModsModLoader;
};

export * as fabric from './fabric';
export * as quilt from './quilt';
export * as forge from './forge';
