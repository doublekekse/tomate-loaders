import { fabric, forge, LoaderId, quilt, vanilla } from "./";

type Loader<Id extends LoaderId> = {
  "vanilla": typeof vanilla;
  "fabric": typeof fabric;
  "quilt": typeof quilt;
  "forge": typeof forge;
}[Id];

export function loader<Id extends LoaderId>(id: Id): Loader<Id> {
  if (id === "fabric") return fabric as never;
  if (id === "quilt") return quilt as never;
  if (id === "forge") return forge as never;
  if (id === "vanilla") return vanilla as never;

  throw new Error(`Loader "${id}" could not be found`);
}
