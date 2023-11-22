import { fabric, forge, LoaderId, quilt, vanilla } from "./";

export default function loader(id: LoaderId) {
  if (id === "fabric") return fabric;
  if (id === "quilt") return quilt;
  if (id === "forge") return forge;
  if (id === "vanilla") return vanilla;

  throw new Error(`Loader "${id}" could not be found`);
}
