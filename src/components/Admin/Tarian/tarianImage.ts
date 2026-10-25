export function resolveTarianImage(
  value: unknown,
  apiUrl: string,
): string | undefined {
  if (typeof value !== "string") return undefined

  const image = value.trim()
  if (!image) return undefined
  if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i.test(image)) {
    const imageUrl = new URL(image)
    return apiUrl
      ? `${apiUrl}${imageUrl.pathname}${imageUrl.search}${imageUrl.hash}`
      : image
  }
  if (/^https?:\/\//i.test(image)) {
    return image.replace(/^http:\/\//i, "https://")
  }
  if (/^(data|blob):/i.test(image)) return image
  if (image.startsWith("/")) return `${apiUrl}${image}`
  return `${apiUrl}/${image.replace(/^\.?\//, "")}`
}
