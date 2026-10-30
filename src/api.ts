export function getApiBaseUrl(configuredUrl?: string): string {
  const value = configuredUrl?.trim()
  if (!value) return ""

  const url = /^[a-z][a-z\d+.-]*:\/\//i.test(value)
    ? new URL(value)
    : new URL(`https://${value}`)

  return url.origin
}
