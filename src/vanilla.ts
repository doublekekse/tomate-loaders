import type { LaunchConfig } from ".";
export const id = "vanilla";

/**
 * Downloads the latest version json and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
export async function getMCLCLaunchConfig(config: LaunchConfig) {
  return {
    root: config.rootPath,
    version: {
      number: config.gameVersion,
      type: "release",
    },
  };
}
