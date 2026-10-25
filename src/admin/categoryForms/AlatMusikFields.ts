import { field, type DetailFieldConfig } from "../formFields"

export const alatMusikFields: DetailFieldConfig[] = [
  field(
    "instrumentType",

    "Jenis",

    "select",

    ["Tiup", "Petik", "Pukul"],

    "Pilihan: Tiup · Petik · Pukul",
  ),

  field(
    "material",

    "Bahan pembuat",

    "text",

    undefined,

    "Bahan utama tabung, bingkai, dan pengikat.",

    false,

    "Bambu, kayu, logam, atau bahan setempat",
  ),

  field(
    "playingMethod",

    "Cara memainkan",

    "textarea",

    undefined,

    undefined,

    true,

    "Jelaskan cara memainkan alat musik ini.",
  ),
]
