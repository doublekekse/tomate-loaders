import { fabric, forge, LoaderId, quilt, vanilla } from "./";

type Loader<Id extends LoaderId> = 
    Id extends "vanilla" ? typeof vanilla
  : Id extends "fabric" ? typeof fabric
  : Id extends "quilt" ? typeof quilt
  : Id extends "forge" ? typeof forge
  : never;

export function loader(id: LoaderId): Loader<typeof id> {
  if (id === "fabric") return fabric;
  if (id === "quilt") return quilt;
  if (id === "forge") return forge;
  if (id === "vanilla") return vanilla;

  throw new Error(`Loader "${id}" could not be found`);
}
