import AdminCategoryPage from "../AdminCategoryPage"
import AdminContentForm from "../AdminContentForm"

export default function SenjataTradisionalPage() {
  return <AdminCategoryPage category="senjata-tradisional" />
}

export function SenjataTradisionalFormPage({
  mode,
}: {
  mode: "create" | "edit"
}) {
  return <AdminContentForm category="senjata-tradisional" mode={mode} />
}
