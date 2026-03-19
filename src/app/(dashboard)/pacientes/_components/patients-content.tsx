"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatientsToolbar } from "./patients-toolbar"
import { PatientsTable } from "./patients-table"
import { patientColumns } from "../_utils/patient-columns"
import { patients, type PatientStatus } from "../_utils/patient-data"

export function PatientsContent() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<PatientStatus | null>(null)

  const filtered = patients.filter((p) => {
    const fullName = `${p.nombre} ${p.apellido}`.toLowerCase()
    const matchesSearch =
      !search ||
      fullName.includes(search.toLowerCase()) ||
      p.dni.includes(search) ||
      p.diagnostico.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = !statusFilter || p.estado === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {patients.length} pacientes registrados
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0">
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

      <PatientsTable data={filtered} columns={patientColumns} />
    </div>
  )
}
