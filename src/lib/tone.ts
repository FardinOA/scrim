/*
  Whether the silk is behind the nav. Each curtain scene claims it while its
  drape covers the top of the screen; the nav reads the union, so it can turn
  cream on the cloth and ink on the lit page.
*/
const claims = new Set<string>();
const listeners = new Set<(silk: boolean) => void>();

export function claimSilk(id: string, on: boolean) {
  if (on === claims.has(id)) return;
  if (on) claims.add(id);
  else claims.delete(id);
  listeners.forEach((fn) => fn(claims.size > 0));
}

export function onSilk(fn: (silk: boolean) => void) {
  listeners.add(fn);
  fn(claims.size > 0);
  return () => {
    listeners.delete(fn);
  };
}
