import type { Metadata } from "next"
import { VolunteersContent } from "./_components/volunteers-content"

export const metadata: Metadata = {
  title: "Voluntarios — FPC",
}

export default function VolunteersPage() {
  return <VolunteersContent />
}
