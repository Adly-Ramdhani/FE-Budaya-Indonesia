import { categoryConfigs, provinces } from "./categoryConfig"
import type {
  CategoryKey,
  ContentFormData,
  ContentFormDraft,
  ContentItem,
  ContentStatus,
  SeedContent,
} from "./types"

const referenceDate = new Date("2026-10-10T12:00:00")
const categoryKeys = Object.keys(categoryConfigs) as CategoryKey[]
// TODO: Replace this in-memory mock store with the project's content API.
const contentStore = new Map<CategoryKey, ContentItem[]>()

function dateFor(daysAgo: number) {
  const date = new Date(referenceDate)
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

function currentDate() {
  return new Date().toISOString().slice(0, 10)
}

export function slugify(value: string) {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function formDataFromDraft(draft: ContentFormDraft): ContentFormData {
  return {
    fullDescription: draft.fullDescription,
    source: draft.source,
    photoCredit: draft.photoCredit,
    coverUrl: draft.coverUrl,
    coverFileName: draft.coverFileName,
    coverFileSize: draft.coverFileSize,
    gallery: [...draft.gallery],
    tags: [...draft.tags],
    showInHome: draft.showInHome,
    featured: draft.featured,
    details: { ...draft.details },
    audioUrl: draft.audioUrl,
    audioFileName: draft.audioFileName,
    youtubeUrl: draft.youtubeUrl,
    publishDate: draft.scheduleDate,
    publishTime: draft.scheduleTime,
    languages: [...draft.languages],
    bannerTitle: draft.bannerTitle,
    bannerParagraph: draft.bannerParagraph,
    bannerImageUrl: draft.bannerImageUrl,
    summaryTitle: draft.summaryTitle,
    summaryDescription: draft.summaryDescription,
    summaryTags: [...draft.summaryTags],
    latitude: draft.latitude,
    longitude: draft.longitude,
    showOnMap: draft.showOnMap,
    highlight: draft.highlight,
  }
}

function toItem(
  category: CategoryKey,
  seed: SeedContent,
  index: number,
  status: ContentStatus,
  dummy = false,
): ContentItem {
  const config = categoryConfigs[category]
  const base = {
    id: `${category}-${index}-${slugify(seed.title)}`,
    slug: slugify(seed.title),
    title: seed.title,
    region: seed.region,
    description: seed.description,
    status,
    updatedAt: dateFor(index < 6 ? index : index % 6),
    dummy,
  }
  if (config.kind === "province") {
    return {
      ...base,
      kind: "province",
      capital: seed.capital ?? "—",
      storyCount: seed.storyCount ?? 0,
    }
  }
  return { ...base, kind: "content", province: seed.province ?? "Jawa Tengah" }
}

function makeInitialContents(category: CategoryKey): ContentItem[] {
  const config = categoryConfigs[category]
  const seeded = config.seeds.map((seed, index) =>
    toItem(
      category,
      seed,
      index,
      index === 1 || index === 4 ? "Draf" : "Terbit",
    ),
  )
  if (config.kind === "province") {
    return provinces
      .map((province, index) => {
        const seed = config.seeds.find((item) => item.title === province.name)
        return seed
          ? toItem(
              category,
              seed,
              index,
              province.name === "Banten" || province.name === "Papua Barat"
                ? "Draf"
                : "Terbit",
            )
          : toItem(
              category,
              {
                title: province.name,
                region: province.region,
                capital: province.capital,
                description: `Profil wilayah ${province.name} dan ragam warisan budayanya.`,
                storyCount: (index * 7 + 13) % 64,
              },
              index,
              "Terbit",
              true,
            )
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
  const fillers = Array.from(
    { length: Math.max(0, config.total - seeded.length) },
    (_, offset) => {
      const index = seeded.length + offset
      const province =
        provinces[(index * 7 + category.length) % provinces.length]
      const status: ContentStatus =
        offset < Math.max(0, config.drafts - 2) ? "Draf" : "Terbit"
      return toItem(
        category,
        {
          title: `Contoh ${config.singular} ${String(offset + 1).padStart(3, "0")}`,
          province: province.name,
          region: province.region,
          description:
            "Data dummy untuk simulasi daftar, filter, dan pagination.",
        },
        index,
        status,
        true,
      )
    },
  )
  return [...seeded, ...fillers].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )
}

function ensureCategory(category: CategoryKey) {
  if (!contentStore.has(category))
    contentStore.set(category, makeInitialContents(category))
  return contentStore.get(category) ?? []
}

/** Local mock repository. Replace this implementation with the API/database client when the backend is ready. */
export function getContents(category: CategoryKey): ContentItem[] {
  return [...ensureCategory(category)]
}

export function getContentBySlug(category: CategoryKey, slug: string) {
  return ensureCategory(category).find((item) => item.slug === slug)
}

function uniqueSlug(category: CategoryKey, requested: string) {
  const base = slugify(requested) || "konten"
  const existing = ensureCategory(category)
  let slug = base
  let suffix = 2
  while (existing.some((item) => item.slug === slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  return slug
}

function countStoriesForProvince(provinceName: string) {
  return categoryKeys
    .filter((category) => category !== "daerah-provinsi")
    .reduce(
      (total, category) =>
        total +
        ensureCategory(category).filter(
          (item) => item.kind === "content" && item.province === provinceName,
        ).length,
      0,
    )
}

export function createContent(
  category: CategoryKey,
  draft: ContentFormDraft,
): ContentItem {
  const config = categoryConfigs[category]
  const slug = uniqueSlug(category, draft.slug || draft.title)
  const base = {
    id: `${category}-${Date.now()}-${slug}`,
    slug,
    title: draft.title.trim(),
    region: draft.region,
    description: draft.shortDescription.trim(),
    status: draft.status,
    updatedAt: currentDate(),
    dummy: false,
    formData: formDataFromDraft(draft),
  }
  const item: ContentItem =
    config.kind === "province"
      ? {
          ...base,
          kind: "province",
          capital: draft.capital.trim() || "—",
          storyCount: countStoriesForProvince(draft.title.trim()),
        }
      : { ...base, kind: "content", province: draft.province }
  const items = ensureCategory(category)
  contentStore.set(category, [item, ...items])
  return item
}

export function updateContent(
  category: CategoryKey,
  slug: string,
  draft: ContentFormDraft,
): ContentItem | undefined {
  const existing = ensureCategory(category).find((item) => item.slug === slug)
  if (!existing) return undefined
  const base = {
    ...existing,
    title: draft.title.trim(),
    region: draft.region,
    description: draft.shortDescription.trim(),
    status: draft.status,
    updatedAt: currentDate(),
    dummy: false,
    formData: formDataFromDraft(draft),
  }
  const updated: ContentItem =
    existing.kind === "province"
      ? {
          ...base,
          kind: "province",
          capital: draft.capital.trim() || "—",
          storyCount: countStoriesForProvince(draft.title.trim()),
        }
      : { ...base, kind: "content", province: draft.province }
  contentStore.set(
    category,
    ensureCategory(category).map((item) =>
      item.slug === slug ? updated : item,
    ),
  )
  return updated
}

export function deleteContent(category: CategoryKey, slug: string) {
  contentStore.set(
    category,
    ensureCategory(category).filter((item) => item.slug !== slug),
  )
}
