export function api(path: string) {
  // Use NEXT_PUBLIC_API_URL when provided (e.g., http://localhost:5000)
  // Fallback to localhost:5000 for development
  const envBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const base = typeof window !== 'undefined' ? envBase : (process.env.NEXT_PUBLIC_API_URL || '')

  // normalize base (remove trailing slashes)
  const normalizedBase = base.replace(/\/+$/,'')

  // If both base and path include the /api prefix, avoid duplicating it.
  // Examples:
  // - base: http://localhost:5000/api, path: /api/admin/ -> should become http://localhost:5000/api/admin
  // - base: http://localhost:5000, path: /api/admin -> should become http://localhost:5000/api/admin
  let normalizedPath = path
  if (!normalizedPath.startsWith('/')) normalizedPath = '/' + normalizedPath

  if (normalizedBase.endsWith('/api') && normalizedPath.startsWith('/api')) {
    // strip the leading /api from the path to avoid /api/api
    normalizedPath = normalizedPath.replace(/^\/api/, '')
  }

  // finally join without duplicate slashes
  return `${normalizedBase.replace(/\/+$/,'')}${normalizedPath}`
}
