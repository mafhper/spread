/**
 * Resolve um caminho de asset público respeitando o BASE_URL configurado.
 *
 * GitHub Pages serve o app sob base '/spread'; dev e outros hosts usam '/'.
 * Centraliza a regra que antes vivia hardcoded como "/spread/logo.svg" em
 * vários componentes, garantindo que preview, export e landing resolvam
 * assets da mesma forma.
 *
 * @example resolvePublicAsset('logo.svg') // '/spread/logo.svg' no GitHub Pages
 */
export function resolvePublicAsset(path: string): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return `${base}/${path.replace(/^\//, '')}`
}
