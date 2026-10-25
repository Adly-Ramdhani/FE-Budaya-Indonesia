export type DetailFieldType = "text" | "number" | "select" | "textarea" | "chips" | "steps"

export type DetailFieldConfig = {
  name: string

  label: string

  type: DetailFieldType

  options?: string[]

  helper?: string

  placeholder?: string

  fullWidth?: boolean

  suggestions?: string[]
}

export const field = (
  name: string,

  label: string,

  type: DetailFieldType,

  options?: string[],

  helper?: string,

  fullWidth = false,

  placeholder?: string,
): DetailFieldConfig => ({
  name,

  label,

  type,

  options,

  helper,

  fullWidth,

  placeholder,
})
