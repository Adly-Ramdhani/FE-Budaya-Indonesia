export type Island = {
  id: string
  name: string
  slug?: string
}

export type Province = {
  id: string
  name: string
  island_id?: string
  island?: Island
}

export type Instrument = {
  id: number | string
  name: string
  province: string
  region: string
  status: string
  composer?: string
  language?: string
  description: string
  lyrics?: string
  audio?: string
  audio_url?: string
  updated: string
}
