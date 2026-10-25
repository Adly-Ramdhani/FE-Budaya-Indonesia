import { field, type DetailFieldConfig } from "../formFields"

export const tarianFields: DetailFieldConfig[] = [
  field(
    "danceType",

    "Jenis tarian",

    "select",

    ["Penyambutan", "Upacara", "Pergaulan", "Perang", "Hiburan"],

    "Pilihan: Penyambutan · Upacara · Pergaulan · Perang · Hiburan",
  ),

  field(
    "dancerCount",

    "Jumlah penari",

    "text",

    undefined,

    undefined,

    false,

    "Berkelompok; jumlah menyesuaikan pertunjukan",
  ),

  field(
    "duration",

    "Durasi pertunjukan",

    "text",

    undefined,

    undefined,

    false,

    "Sekitar 10–15 menit",
  ),

  field(
    "costume",

    "Busana & properti",

    "text",

    undefined,

    undefined,

    false,

    "Busana Gayo bersulam; tanpa properti tangan",
  ),

  field(
    "accompaniment",

    "Iringan",

    "text",

    undefined,

    "Pilihan: tepukan dada · tabuhan · alat musik terkait",

    true,

    "Tepukan dada, tabuhan, dan syair",
  ),

  field(
    "movementMeaning",

    "Makna gerak",

    "textarea",

    undefined,

    undefined,

    true,

    "Jelaskan gerak dan maknanya dalam tradisi setempat.",
  ),
]
