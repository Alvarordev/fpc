import type { Metadata } from "next"
import { PatientsContent } from "./_components/patients-content"

export const metadata: Metadata = {
  title: "Pacientes — FPC",
}

export default function PatientsPage() {
  return <PatientsContent />
}
