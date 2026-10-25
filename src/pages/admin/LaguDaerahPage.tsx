import AdminCategoryPage from "../AdminCategoryPage"
import AdminContentForm from "../AdminContentForm"

export default function LaguDaerahPage() {
  return <AdminCategoryPage category="lagu-daerah" />
}

export function LaguDaerahFormPage({ mode }: { mode: "create" | "edit" }) {
  return <AdminContentForm category="lagu-daerah" mode={mode} />
}
