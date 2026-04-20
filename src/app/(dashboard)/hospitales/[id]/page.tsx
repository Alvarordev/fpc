import type { Metadata } from "next"
import { HospitalDetailContent } from "./_components/hospital-detail-content"

export const metadata: Metadata = {
  title: "Detalle del hospital",
}

export default async function HospitalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <HospitalDetailContent id={id} />
}
