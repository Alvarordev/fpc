"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Plus, Search, TriangleAlert, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useHospitals, useCreateHospital, useHospitalAlerts } from "@/hooks/use-hospitals"
import { usePatients } from "@/hooks/use-patients"
import { cn } from "@/lib/utils"

const CITIES = ["Lima", "Arequipa", "Cusco", "Trujillo", "Piura", "Chiclayo", "Iquitos", "Otros"]

export function HospitalsContent() {
  const router = useRouter()
  const { data: hospitals = [] } = useHospitals()
  const { data: alerts = [] } = useHospitalAlerts()
  const { data: patients = [] } = usePatients()
  const createHospital = useCreateHospital()

  const [search, setSearch] = useState("")
  const [adding, setAdding] = useState(false)
  const [nombre, setNombre] = useState("")
  const [ciudad, setCiudad] = useState("")

  const patientHospitals = useMemo(() => {
    const map = new Map<string, Set<string>>()

    for (const patient of patients) {
      const names = new Set<string>()

      for (const [key, raw] of Object.entries(patient)) {
        if (typeof raw !== "string") continue
        if (!raw.trim()) continue

        if (
          key.startsWith("q_establecimiento_") ||
          key.startsWith("q_hospitalDx_") ||
          key === "hospitalDiagnosticado" ||
          key === "hospitalTratamiento"
        ) {
          names.add(raw.trim())
        }
      }

      for (const name of names) {
        if (!map.has(name)) map.set(name, new Set())
        map.get(name)?.add(patient.id)
      }
    }

    return map
  }, [patients])

  const activeAlertsByHospital = useMemo(() => {
    const map = new Map<string, number>()

    for (const alert of alerts) {
      if (alert.estado !== "activa") continue
      map.set(alert.hospitalId, (map.get(alert.hospitalId) ?? 0) + 1)
    }

    return map
  }, [alerts])

  const filtered = useMemo(() => {
    return hospitals
      .filter((h) => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return h.nombre.toLowerCase().includes(q) || h.ciudad.toLowerCase().includes(q)
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [hospitals, search])

  async function handleAdd() {
    if (!nombre.trim() || !ciudad) return
    await createHospital.mutateAsync({ nombre: nombre.trim().toUpperCase(), ciudad })
    setNombre("")
    setCiudad("")
    setAdding(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Hospitales</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {hospitals.length} establecimientos registrados
          </p>
        </div>
        {!adding && (
          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            Nuevo hospital
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <p className="text-sm font-medium">Nuevo establecimiento</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nombre</Label>
              <Input
                autoFocus
                placeholder="Ej: HOSPITAL NACIONAL..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Ciudad</Label>
              <Select value={ciudad} onValueChange={(v) => v && setCiudad(v)}>
                <SelectTrigger className="h-8 text-sm w-full">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!nombre.trim() || !ciudad || createHospital.isPending}
              className="flex-1"
            >
              {createHospital.isPending ? "Agregando..." : "Confirmar"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setAdding(false)
                setNombre("")
                setCiudad("")
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por hospital o ciudad..."
          className="pl-8"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((hospital) => {
          const linkedPatients = patientHospitals.get(hospital.nombre)?.size ?? 0
          const activeAlerts = activeAlertsByHospital.get(hospital.id) ?? 0

          return (
            <button
              key={hospital.id}
              type="button"
              onClick={() => router.push(`/hospitales/${hospital.id}`)}
              className={cn(
                "w-full rounded-xl border bg-card px-4 py-3 text-left transition-colors",
                "hover:bg-muted/30 hover:border-foreground/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted shrink-0">
                  <Building2 className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{hospital.nombre}</p>
                  <p className="text-xs text-muted-foreground">{hospital.ciudad}</p>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    {linkedPatients} pacientes
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <TriangleAlert className="size-3.5" />
                    {activeAlerts} alertas activas
                  </span>
                </div>
              </div>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm font-medium">Sin hospitales para mostrar</p>
            <p className="text-xs text-muted-foreground mt-1">
              Probá otro término de búsqueda o registrá un nuevo hospital.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
