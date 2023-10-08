# Tomate Loaders

Tomate Loaders is a JavaScript library designed to facilitate the management and launching of Minecraft game instances with different mod loaders, specifically Fabric and Forge. This README.md provides an overview of how to use Tomate Loaders in your own projects.

## Installation

To use Tomate Loaders in your project, you can install it via npm:

```bash
npm install github:doublekekse/tomate-loaders
```

## Usage


### Quilt
Quilt has the same api in Tomate Loaders. Just replace the `import { fabric } from 'tomate-loaders'` with `import { quilt } from 'tomate-loaders'`

### Fabric
Tomate Loaders provides functionality for working with the Fabric mod loader. Here's how you can use it in your project:

```javascript
import { fabric } from 'tomate-loaders';
import { Client, Authenticator } from 'minecraft-launcher-core';

// Get a list of available Fabric loaders
const loaders = await fabric.getLoaders();

// Get a Fabric profile for a specific Minecraft version and loader
const profile = await fabric.getProfile('1.19.4', loaders[0].version);

// Create a Minecraft launcher instance
const launcher = new Client();

// Get the launch configuration for Fabric
const launchConfig = await fabric.getMCLCLaunchConfig({
  gameVersion: '1.20.2',
  rootPath: './minecraft',
});

// Launch Minecraft with Fabric
launcher.launch({
  ...launchConfig,
  authorization: Authenticator.getAuth('username'), // You can use https://www.npmjs.com/package/msmc for microsoft auth
  memory: {
    min: 2000,
    max: 5000,
  },
  javaPath: 'javaw',
});
```

### Forge
Tomate Loaders also supports working with the Forge mod loader. Here's how you can use it in your project:

```javascript
import { forge } from 'tomate-loaders';

// Download Forge for a specific Minecraft version
await forge.downloadForge('./forge.jar', '1.19.2');

// Create a Minecraft launcher instance
const launcher = new Client();

// Get the launch configuration for Forge
const launchConfig = await forge.getMCLCLaunchConfig({
  gameVersion: '1.20.2',
  rootPath: './minecraft',
});

// Launch Minecraft with Forge
launcher.launch({
  ...launchConfig,
  authorization: Authenticator.getAuth('username'), // You can use https://www.npmjs.com/package/msmc for microsoft auth
  memory: {
    min: 2000,
    max: 5000,
  },
  javaPath: 'javaw',
});
```

### Loader id
Each modloader has an unique id
```javascript
console.log(fabric.id); // "fabric"
```

```javascript
const fabric = loader('fabric');
```

### TomateMods loader config
You can get the loader config for `tomate-mods` for any of the mod loaders like this:
```javascript
const fabricLoader = fabric.totalModsModLoader;
```
