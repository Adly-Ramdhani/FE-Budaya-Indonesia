import CreateMusik, { type CreateMusikProps } from "./CreateMusik"

type EditeMusikProps = Omit<CreateMusikProps, "mode">

export default function EditeMusik(props: EditeMusikProps) {
  return <CreateMusik {...props} mode="edit" />
}
