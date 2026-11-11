/**
 * Resolves a path inside the public/ directory safely against Vite's configured BASE_URL
 * without triggering Vite's public directory module import warnings.
 */
export const getAssetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${normalizedBase}${cleanPath}`;
};
