// The sky map needs only the stars the eye can see. The big star file is stored brightest first,
// so this cuts its first part off at build time and nothing is kept twice in the repository.
import { readFileSync } from 'node:fs';
import type { APIRoute } from 'astro';
import { SKY_STARS } from '../../../lib/sky/chart';

export const GET: APIRoute = () => {
  const part = readFileSync('public/data/deep/stars.bin').subarray(0, SKY_STARS * 20);
  return new Response(new Uint8Array(part), { headers: { 'Content-Type': 'application/octet-stream' } });
};
