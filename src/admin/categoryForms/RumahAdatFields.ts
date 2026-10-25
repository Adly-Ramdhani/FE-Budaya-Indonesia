import { field, type DetailFieldConfig } from "../formFields"

export const rumahAdatFields: DetailFieldConfig[] = [
  field(
    "roofShape",

    "Bentuk atap",

    "text",

    undefined,

    undefined,

    false,

    "Atap gonjong atau bentuk khas setempat",
  ),

  field(
    "buildingMaterial",

    "Bahan bangunan",

    "text",

    undefined,

    undefined,

    false,

    "Kayu, bambu, ijuk; menyesuaikan daerah",
  ),

  field(
    "structure",

    "Struktur",

    "select",

    ["Rumah panggung", "Rumah tapak", "Lainnya"],

    "Pilihan: Rumah panggung · Rumah tapak · Lainnya",

    true,
  ),

  field(
    "rooms",

    "Bagian & fungsi ruang",

    "textarea",

    undefined,

    undefined,

    true,

    "Jelaskan bagian rumah dan fungsi setiap ruang.",
  ),

  field(
    "philosophy",

    "Filosofi arsitektur",

    "textarea",

    undefined,

    undefined,

    true,

    "Jelaskan filosofi bentuk dan susunan rumah.",
  ),

  field(
    "occupant",

    "Penghuni / pemilik",

    "text",

    undefined,

    undefined,

    true,

    "Keluarga besar atau komunitas setempat",
  ),
]
