import type { Metadata } from "next"
import { NewContactContent } from "./_components/new-contact-content"

export const metadata: Metadata = {
  title: "Contacto",
}

export default async function NewPatientContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ contactId?: string }>
}) {
  const { id } = await params
  const { contactId } = await searchParams
  return <NewContactContent pacienteId={id} contactId={contactId} />
}
