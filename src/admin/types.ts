import type { LucideIcon } from "lucide-react"

export type CategoryKey = "lagu-daerah" | "tarian" | "alat-musik" | "senjata-tradisional" | "pakaian-adat" | "rumah-adat" | "makanan" | "daerah-provinsi"

export type ContentStatus = "Terbit" | "Draf"
export type ContentView = "grid" | "list"

export type SavedMedia = {
  id: string
  name: string
  size: number
  url: string
}

export type CategoryDetailValues = Record<string, string | string[]>

export type ContentFormData = {
  fullDescription: string
  source: string
  photoCredit: string
  coverUrl: string
  coverFileName: string
  coverFileSize: number
  gallery: SavedMedia[]
  tags: string[]
  showInHome: boolean
  featured: boolean
  details: CategoryDetailValues
  audioUrl: string
  audioFileName: string
  youtubeUrl: string
  publishDate: string
  publishTime: string
  languages: string[]
  bannerTitle: string
  bannerParagraph: string
  bannerImageUrl: string
  summaryTitle: string
  summaryDescription: string
  summaryTags: string[]
  latitude: number
  longitude: number
  showOnMap: boolean
  highlight: boolean
}

export type ContentFormDraft = {
  title: string
  slug: string
  region: string
  province: string
  capital: string
  shortDescription: string
  status: ContentStatus
  scheduleDate: string
  scheduleTime: string
  photoCredit: string
  coverUrl: string
  coverFileName: string
  coverFileSize: number
  gallery: SavedMedia[]
  audioUrl: string
  audioFileName: string
  youtubeUrl: string
  fullDescription: string
  source: string
  tags: string[]
  showInHome: boolean
  featured: boolean
  details: CategoryDetailValues
  languages: string[]
  bannerTitle: string
  bannerParagraph: string
  bannerImageUrl: string
  summaryTitle: string
  summaryDescription: string
  summaryTags: string[]
  latitude: number
  longitude: number
  showOnMap: boolean
  highlight: boolean
}

type ContentBase = {
  id: string
  slug: string
  title: string
  region: string
  description: string
  status: ContentStatus
  updatedAt: string
  dummy: boolean
  formData?: ContentFormData
}

export type CulturalContentItem = ContentBase & {
  kind: "content"
  province: string
}

export type ProvinceContentItem = ContentBase & {
  kind: "province"
  capital: string
  storyCount: number
}

export type ContentItem = CulturalContentItem | ProvinceContentItem

export type SeedContent = {
  title: string
  province?: string
  region: string
  description: string
  capital?: string
  storyCount?: number
  fullDescription?: string
  source?: string
}

export type CategoryConfig = {
  key: CategoryKey
  title: string
  subtitle: string
  addLabel: string
  singular: string
  plural: string
  searchLabel: string
  searchPlaceholder: string
  kind: "content" | "province"
  icon: LucideIcon
  total: number
  published: number
  drafts: number
  previewPath: string
  seeds: SeedContent[]
}

export type ProvinceRecord = {
  name: string
  region: string
  capital: string
}
