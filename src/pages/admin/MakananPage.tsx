import AdminCategoryPage from "../AdminCategoryPage"
import AdminContentForm from "../AdminContentForm"

export default function MakananPage() {
  return <AdminCategoryPage category="makanan" />
}

export function MakananFormPage({ mode }: { mode: "create" | "edit" }) {
  return <AdminContentForm category="makanan" mode={mode} />
}
