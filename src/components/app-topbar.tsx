"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { pathTitles } from "@/lib/navigation"
import { usePatient } from "@/app/(dashboard)/pacientes/[id]/_hooks/use-patient"
import { useHospitals } from "@/hooks/use-hospitals"

type BreadcrumbState =
  | { kind: "patient-contact"; patientId: string }
  | { kind: "patient-detail"; patientId: string }
  | { kind: "hospital-detail"; hospitalId: string }
  | null

function getBreadcrumbState(pathname: string): BreadcrumbState {
  const parts = pathname.split("/").filter(Boolean)

  if (parts[0] === "pacientes") {
    const patientId = parts[1]
    if (!patientId) return null

    const isNewContact = parts[2] === "contacto"
    if (isNewContact) {
      return { kind: "patient-contact", patientId }
    }

    return { kind: "patient-detail", patientId }
  }

  if (parts[0] === "hospitales") {
    const hospitalId = parts[1]
    if (!hospitalId) return null

    return { kind: "hospital-detail", hospitalId }
  }

  return null
}

export function AppTopbar() {
  const pathname = usePathname()
  const breadcrumbState = getBreadcrumbState(pathname)
  const baseSegment = "/" + (pathname.split("/")[1] ?? "")
  const title = pathTitles[baseSegment] ?? "Dashboard"

  const { data: patient } = usePatient(
    breadcrumbState?.kind === "patient-detail" || breadcrumbState?.kind === "patient-contact"
      ? breadcrumbState.patientId
      : ""
  )
  const patientName = patient?.q9_nombrePaciente ?? "Paciente"

  const { data: hospitals = [] } = useHospitals()
  const hospital =
    breadcrumbState?.kind === "hospital-detail"
      ? hospitals.find((h) => h.id === breadcrumbState.hospitalId)
      : null

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 backdrop-blur-sm px-4">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />

      {breadcrumbState?.kind === "patient-contact" ? (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/pacientes" />}>Pacientes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/pacientes/${breadcrumbState.patientId}`} />}>
                {patientName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Nuevo contacto</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ) : breadcrumbState?.kind === "patient-detail" ? (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/pacientes" />}>Pacientes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{patientName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ) : breadcrumbState?.kind === "hospital-detail" ? (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/hospitales" />}>Hospitales</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{hospital?.nombre ?? "Detalle"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <span className="text-sm font-medium">{title}</span>
      )}

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8 text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute top-1 right-1.5 flex size-2 rounded-full bg-primary" />
        </Button>
      </div>
    </header>
  )
}
