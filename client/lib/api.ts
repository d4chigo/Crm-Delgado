export function api(path: string) {
  // Use NEXT_PUBLIC_API_URL when provided (e.g., http://localhost:5000)
  // Fallback to localhost:5000 for development
  const base = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
    : (process.env.NEXT_PUBLIC_API_URL || '')
  // ensure no double slashes
  if (!path.startsWith('/')) path = '/' + path
  return `${base}${path}`
}
