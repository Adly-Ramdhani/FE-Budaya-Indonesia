import AdminCategoryPage from "../AdminCategoryPage"
import AdminContentForm from "../AdminContentForm"

export default function TarianPage() {
  return <AdminCategoryPage category="tarian" />
}

export function TarianFormPage({ mode }: { mode: "create" | "edit" }) {
  return <AdminContentForm category="tarian" mode={mode} />
}
