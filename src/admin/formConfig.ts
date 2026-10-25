import type { CategoryKey } from "./types"

import type { DetailFieldConfig } from "./formFields"

export type { DetailFieldConfig } from "./formFields"

import { laguDaerahFields } from "./categoryForms/LaguDaerahFields"

import { tarianFields } from "./categoryForms/TarianFields"

import { alatMusikFields } from "./categoryForms/AlatMusikFields"

import { senjataTradisionalFields } from "./categoryForms/SenjataTradisionalFields"

import { pakaianAdatFields } from "./categoryForms/PakaianAdatFields"

import { rumahAdatFields } from "./categoryForms/RumahAdatFields"

import { makananFields } from "./categoryForms/MakananFields"

import { daerahProvinsiFields } from "./categoryForms/DaerahProvinsiFields"

export const categoryIntro: Record<CategoryKey, string> = {
  "lagu-daerah":
    "Rawat cerita di balik melodi Nusantara. Mulai dengan Bungong Jeumpa dari Aceh.",

  tarian:
    "Rawat cerita di balik setiap gerak Nusantara. Mulai dengan Tari Saman dari Aceh.",

  "alat-musik":
    "Rawat cerita di balik bunyi dan harmoni Nusantara. Mulai dengan Angklung dari Jawa Barat.",

  "senjata-tradisional":
    "Rawat nilai seni, simbol, dan sejarah. Mulai dengan Keris dari Jawa Tengah.",

  "pakaian-adat":
    "Rawat cerita di balik helai kain dan motif Nusantara. Mulai dengan Baju Bodo dari Sulawesi Selatan.",

  "rumah-adat":
    "Rawat cerita di balik ruang dan arsitektur Nusantara. Mulai dengan Rumah Joglo dari Jawa Tengah.",

  makanan:
    "Rawat cerita di balik rasa dan rempah Nusantara. Mulai dengan Rendang dari Sumatera Barat.",

  "daerah-provinsi":
    "Atur provinsi dan sorotan daerah yang tampil di peta beranda. Mulai dengan Nusa Tenggara Timur.",
}

export const categoryDetailFields: Record<CategoryKey, DetailFieldConfig[]> = {
  "lagu-daerah": laguDaerahFields,

  tarian: tarianFields,

  "alat-musik": alatMusikFields,

  "senjata-tradisional": senjataTradisionalFields,

  "pakaian-adat": pakaianAdatFields,

  "rumah-adat": rumahAdatFields,

  makanan: makananFields,

  "daerah-provinsi": daerahProvinsiFields,
}

export const provinceAbbreviations: Record<string, string> = {
  "Nusa Tenggara Timur": "NTT",

  "Nusa Tenggara Barat": "NTB",

  "Sumatera Utara": "Sumut",

  "Sumatera Barat": "Sumbar",

  "Sumatera Selatan": "Sumsel",

  "Kalimantan Barat": "Kalbar",

  "Kalimantan Tengah": "Kalteng",

  "Kalimantan Selatan": "Kalsel",

  "Kalimantan Timur": "Kaltim",

  "Kalimantan Utara": "Kaltara",

  "Sulawesi Utara": "Sulut",

  "Sulawesi Tengah": "Sulteng",

  "Sulawesi Selatan": "Sulsel",

  "Sulawesi Tenggara": "Sultra",

  "Sulawesi Barat": "Sulbar",

  "Maluku Utara": "Malut",

  "Papua Barat": "Pabar",

  "Papua Selatan": "Papsel",

  "Papua Tengah": "Papteng",

  "Papua Pegunungan": "Papeg",

  "Papua Barat Daya": "PBD",

  "DI Yogyakarta": "DIY",

  "DKI Jakarta": "DKI",
}
