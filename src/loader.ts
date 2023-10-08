import { fabric, quilt, forge, LoaderId } from './';

export default function loader(id: LoaderId) {
  if (id === 'fabric') return fabric;
  if (id === 'quilt') return quilt;
  if (id === 'forge') return forge;

  throw new Error(`Loader "${id}" could not be found`);
}
