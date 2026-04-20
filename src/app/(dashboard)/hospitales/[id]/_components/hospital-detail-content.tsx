"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Clock, TriangleAlert, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useHospitals, useHospitalAlerts, useUpdateHospitalAlert } from "@/hooks/use-hospitals"
import { usePatients } from "@/hooks/use-patients"

type AlertFilter = "todas" | "activa" | "resuelta"

function formatDate(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface HospitalDetailContentProps {
  id: string
}

export function HospitalDetailContent({ id }: HospitalDetailContentProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<AlertFilter>("activa")
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const { data: hospitals = [] } = useHospitals()
  const { data: alerts = [] } = useHospitalAlerts(id)
  const { data: patients = [] } = usePatients()
  const updateAlert = useUpdateHospitalAlert()

  const hospital = hospitals.find((h) => h.id === id)

  const linkedPatients = useMemo(() => {
    if (!hospital) return []

    return patients.filter((patient) => {
      return Object.entries(patient).some(([key, raw]) => {
        if (typeof raw !== "string") return false
        if (!raw.trim()) return false

        const isHospitalField =
          key.startsWith("q_establecimiento_") ||
          key.startsWith("q_hospitalDx_") ||
          key === "hospitalDiagnosticado" ||
          key === "hospitalTratamiento"

        return isHospitalField && raw.trim() === hospital.nombre
      })
    })
  }, [hospital, patients])

  const sortedAlerts = useMemo(() => {
    return [...alerts]
      .filter((a) => filter === "todas" || a.estado === filter)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [alerts, filter])

  const activeCount = alerts.filter((a) => a.estado === "activa").length

  async function handleResolve(alertId: string) {
    await updateAlert.mutateAsync({
      id: alertId,
      estado: "resuelta",
      fechaResolucion: new Date().toISOString().slice(0, 10),
    })
    setConfirmId(null)
  }

  if (!hospital) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => router.push("/hospitales")}>
          <ArrowLeft className="size-3.5" />
          Volver a hospitales
        </Button>
        <p className="text-sm text-muted-foreground">Hospital no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => router.push("/hospitales")}>
        <ArrowLeft className="size-3.5" />
        Hospitales
      </Button>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{hospital.nombre}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          <span>{hospital.ciudad}</span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {linkedPatients.length} pacientes
          </span>
          <span className="inline-flex items-center gap-1">
            <TriangleAlert className="size-3.5" />
            {activeCount} alertas activas
          </span>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Pacientes asociados</h2>

        {linkedPatients.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="text-sm font-medium">Sin pacientes asociados</p>
            <p className="text-xs text-muted-foreground mt-1">
              Aún no hay pacientes registrados con este hospital en diagnóstico o tratamiento.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {linkedPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => router.push(`/pacientes/${patient.id}`)}
                className="w-full rounded-xl border bg-card px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              >
                <p className="text-sm font-medium text-foreground">{patient.q9_nombrePaciente}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  DNI {patient.q10_dni}
                  {patient.nroPaciente ? ` · ${patient.nroPaciente}` : ""}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Alertas del hospital</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {sortedAlerts.length} {sortedAlerts.length === 1 ? "alerta" : "alertas"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(["activa", "todas", "resuelta"] as AlertFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                filter === f
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/30"
              )}
            >
              {f === "activa" ? "Activas" : f === "resuelta" ? "Resueltas" : "Todas"}
            </button>
          ))}
        </div>

        {sortedAlerts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="text-sm font-medium">Sin alertas</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === "activa"
                ? "No hay alertas activas para este hospital."
                : "No hay alertas registradas para este filtro."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAlerts.map((alert) => {
              const isPending = confirmId === alert.id

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "rounded-xl border bg-card p-4",
                    alert.estado === "activa" && "border-l-4 border-l-red-400",
                    alert.estado === "resuelta" && "border-l-4 border-l-emerald-400 opacity-80"
                  )}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <Badge
                      className={cn(
                        "border text-xs font-medium",
                        alert.estado === "activa"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      )}
                    >
                      {alert.estado === "activa" ? "Activa" : "Resuelta"}
                    </Badge>

                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDate(alert.fecha)}
                      {alert.fechaResolucion && ` · Resuelta ${formatDate(alert.fechaResolucion)}`}
                    </span>
                  </div>

                  <p className="text-sm text-foreground mt-2 leading-relaxed">{alert.detalle}</p>

                  <div className="mt-2 text-xs text-muted-foreground">
                    Paciente: {linkedPatients.find((p) => p.id === alert.pacienteId)?.q9_nombrePaciente ?? alert.pacienteId}
                  </div>

                  {alert.estado === "activa" && (
                    <div className="mt-3">
                      {isPending ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                          <p className="text-xs text-red-800 flex-1 font-medium">
                            ¿Confirmar que este problema fue resuelto?
                          </p>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-red-600 hover:bg-red-700"
                            onClick={() => handleResolve(alert.id)}
                            disabled={updateAlert.isPending}
                          >
                            <CheckCircle className="size-3 mr-1" />
                            Confirmar
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmId(alert.id)}>
                          Marcar como resuelta
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
