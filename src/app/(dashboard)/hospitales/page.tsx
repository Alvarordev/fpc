import type { Metadata } from "next"
import { HospitalsContent } from "./_components/hospitals-content"

export const metadata: Metadata = {
  title: "Hospitales — FPC",
}

export default function HospitalsPage() {
  return <HospitalsContent />
}
