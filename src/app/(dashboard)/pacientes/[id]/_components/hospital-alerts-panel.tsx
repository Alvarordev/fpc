"use client"

import { TriangleAlert, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"
import { useHospitals, useHospitalAlerts, useUpdateHospitalAlert } from "@/hooks/use-hospitals"
import { usePatient } from "../_hooks/use-patient"

function formatDate(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface HospitalAlertsPanelProps {
  pacienteId: string
}

export function HospitalAlertsPanel({ pacienteId }: HospitalAlertsPanelProps) {
  const user = useAuthStore((s) => s.user)
  const canResolve = ["callcenter", "admin", "fundacion"].includes(user?.role ?? "")

  const { data: patient } = usePatient(pacienteId)
  const { data: hospitals = [] } = useHospitals()
  const { data: allAlerts = [] } = useHospitalAlerts()
  const updateAlert = useUpdateHospitalAlert()

  if (!patient) return null

  const patientHospitalNames = new Set<string>()
  const patientData = patient as Record<string, string>
  for (const key of Object.keys(patientData)) {
    if (
      (key.startsWith("q_establecimiento_") ||
        key.startsWith("q_hospitalDx_") ||
        key === "hospitalDiagnosticado" ||
        key === "hospitalTratamiento") &&
      patientData[key]
    ) {
      patientHospitalNames.add(patientData[key])
    }
  }

  const patientHospitalIds = new Set(
    hospitals
      .filter((h) => patientHospitalNames.has(h.nombre))
      .map((h) => h.id)
  )

  const activeAlerts = allAlerts.filter(
    (a) => a.estado === "activa" && patientHospitalIds.has(a.hospitalId)
  )

  if (activeAlerts.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      {activeAlerts.map((alert) => {
        const hospital = hospitals.find((h) => h.id === alert.hospitalId)
        return (
          <div
            key={alert.id}
            className="rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-red-100 shrink-0">
                <TriangleAlert className="size-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      Alerta: {hospital?.nombre ?? alert.hospitalId}
                    </p>
                    <p className="text-xs text-red-700/70 mt-0.5">{formatDate(alert.fecha)}</p>
                  </div>
                  {canResolve && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 h-7 text-xs border-red-200 text-red-700 hover:bg-red-100"
                      onClick={() =>
                        updateAlert.mutate({
                          id: alert.id,
                          estado: "resuelta",
                          fechaResolucion: new Date().toISOString().slice(0, 10),
                        })
                      }
                      disabled={updateAlert.isPending}
                    >
                      <CheckCircle className="size-3 mr-1" />
                      Resolver
                    </Button>
                  )}
                </div>
                <p className="text-sm text-red-800 mt-1.5 leading-relaxed">{alert.detalle}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
