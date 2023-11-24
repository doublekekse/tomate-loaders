import { fabric, forge, LoaderId, quilt, vanilla } from "./";

type Loader<Id extends LoaderId> = 
    Id extends "vanilla" ? typeof vanilla
  : Id extends "fabric" ? typeof fabric
  : Id extends "quilt" ? typeof quilt
  : Id extends "forge" ? typeof forge
  : never;

export function loader<Id extends LoaderId>(id: Id): Loader<Id> {
  if (id === "fabric") return fabric as never;
  if (id === "quilt") return quilt as never;
  if (id === "forge") return forge as never;
  if (id === "vanilla") return vanilla as never;

  throw new Error(`Loader "${id}" could not be found`);
}

