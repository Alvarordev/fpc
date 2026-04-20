import type { Metadata } from "next"
import { CallcenterContactsContent } from "./_components/callcenter-contacts-content"

export const metadata: Metadata = {
  title: "Llamadas y Seguimiento",
}

export default function CallsPage() {
  return <CallcenterContactsContent />
}
