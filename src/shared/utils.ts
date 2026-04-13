/**
 * Masks an API key showing only the last 4 characters.
 * Example: "abc123xyz" → "****xyz"
 */
export function maskApiKey(apiKey: string | null | undefined): string {
  if (!apiKey) return '****'
  if (apiKey.length <= 4) return '****'

  const lastFour = apiKey.slice(-4)
  return `****${lastFour}`
}
