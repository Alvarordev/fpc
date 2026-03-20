"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatientsToolbar } from "./patients-toolbar"
import { PatientsTable } from "./patients-table"
import { VolunteerPatientsContent } from "./volunteer-patients-content"
import { patientColumns } from "../_utils/patient-columns"
import { type Patient, type PatientStatus } from "../_utils/patient-data"
import { API_URL } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_URL}/patients`)
  if (!res.ok) throw new Error("Error al cargar pacientes")
  return res.json()
}

export function PatientsContent() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<PatientStatus | null>(null)
  const router = useRouter()
  const role = useAuthStore((s) => s.user?.role)

  if (role === "voluntario") return <VolunteerPatientsContent />

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatients,
  })

  const filtered = patients.filter((p) => {
    const matchesSearch =
      !search ||
      p.q9_nombrePaciente.toLowerCase().includes(search.toLowerCase()) ||
      p.q10_dni.includes(search)

    const matchesStatus = !statusFilter || p.estado === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {patients.length} pacientes registrados
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => router.push("/inscripcion")}>
          <UserPlus className="size-4" />
          Nuevo paciente
        </Button>
      </div>

      <PatientsToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <PatientsTable
        data={filtered}
        columns={patientColumns}
        onRowClick={(p) => router.push(`/pacientes/${p.id}`)}
      />
    </div>
  )
}
