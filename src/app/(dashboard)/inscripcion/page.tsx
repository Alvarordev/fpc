import type { Metadata } from "next"
import { EnrollmentShell } from "./_components/enrollment-shell"

export const metadata: Metadata = {
  title: "Inscripción SEPA — FPC",
}

export default async function InscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ prospectoId?: string }>
}) {
  const { prospectoId } = await searchParams
  return (
    <div className="-m-4 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden md:-m-6">
      <EnrollmentShell prospectoId={prospectoId} />
    </div>
  )
}
