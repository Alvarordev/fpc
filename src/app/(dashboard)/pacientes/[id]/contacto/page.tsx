import type { Metadata } from "next"
import { NewContactContent } from "./_components/new-contact-content"

export const metadata: Metadata = {
  title: "Nuevo contacto",
}

export default async function NewPatientContactPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <NewContactContent pacienteId={id} />
}
