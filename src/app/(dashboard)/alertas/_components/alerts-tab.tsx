"use client"

import { useState } from "react"
import { TriangleAlert, CheckCircle, X, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useHospitals, useHospitalAlerts, useUpdateHospitalAlert } from "@/hooks/use-hospitals"

type Filter = "todas" | "activa" | "resuelta"

function formatDate(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function AlertsTab() {
  const [filter, setFilter] = useState<Filter>("activa")
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const { data: hospitals = [] } = useHospitals()
  const { data: alerts = [] } = useHospitalAlerts()
  const updateAlert = useUpdateHospitalAlert()

  const hospitalMap = Object.fromEntries(hospitals.map((h) => [h.id, h]))

  const filtered = alerts.filter((a) => filter === "todas" || a.estado === filter)
  const sorted = [...filtered].sort((a, b) => b.fecha.localeCompare(a.fecha))

  async function handleResolve(id: string) {
    await updateAlert.mutateAsync({
      id,
      estado: "resuelta",
      fechaResolucion: new Date().toISOString().slice(0, 10),
    })
    setConfirmId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(["activa", "todas", "resuelta"] as Filter[]).map((f) => (
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
        <span className="ml-auto text-xs text-muted-foreground">
          {sorted.length} {sorted.length === 1 ? "alerta" : "alertas"}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <p className="text-sm font-medium text-foreground">Sin alertas</p>
          <p className="text-xs text-muted-foreground">
            {filter === "activa" ? "No hay alertas activas en este momento." : "No hay alertas registradas."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((alert) => {
            const hospital = hospitalMap[alert.hospitalId]
            const isPending = confirmId === alert.id

            return (
              <div
                key={alert.id}
                className={cn(
                  "rounded-xl border bg-card p-4",
                  alert.estado === "activa" && "border-l-4 border-l-red-400",
                  alert.estado === "resuelta" && "border-l-4 border-l-emerald-400 opacity-75"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full shrink-0",
                      alert.estado === "activa" ? "bg-red-50" : "bg-emerald-50"
                    )}
                  >
                    {alert.estado === "activa" ? (
                      <TriangleAlert className="size-4 text-red-600" />
                    ) : (
                      <CheckCircle className="size-4 text-emerald-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {hospital?.nombre ?? alert.hospitalId}
                        </p>
                        {hospital && (
                          <p className="text-xs text-muted-foreground">{hospital.ciudad}</p>
                        )}
                      </div>
                      <Badge
                        className={cn(
                          "border text-xs font-medium shrink-0",
                          alert.estado === "activa"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        )}
                      >
                        {alert.estado === "activa" ? "Activa" : "Resuelta"}
                      </Badge>
                    </div>

                    <p className="text-sm text-foreground mt-2 leading-relaxed">{alert.detalle}</p>

                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      <span>Reportada el {formatDate(alert.fecha)}</span>
                      {alert.fechaResolucion && (
                        <span className="ml-2">· Resuelta el {formatDate(alert.fechaResolucion)}</span>
                      )}
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => setConfirmId(null)}
                            >
                              <X className="size-3 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setConfirmId(alert.id)}
                          >
                            Marcar como resuelta
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
