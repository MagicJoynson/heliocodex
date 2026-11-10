import { buildTile, makeSource, type SourceSpec, type TileRequest } from './tilebuild';

// one height source per body, made on first use
const sources = new Map<string, ReturnType<typeof makeSource>>();

(self as unknown as Worker).onmessage = (e: MessageEvent<{ id: number; spec: SourceSpec; tile: TileRequest }>) => {
  const { id, spec, tile } = e.data;
  const key = JSON.stringify(spec);
  let src = sources.get(key);
  if (!src) { src = makeSource(spec); sources.set(key, src); }
  const t = buildTile(src, tile);
  (self as unknown as Worker).postMessage({ id, t }, [t.position.buffer, t.morph.buffer, t.normal.buffer, t.mnormal.buffer, t.shade.buffer]);
};
