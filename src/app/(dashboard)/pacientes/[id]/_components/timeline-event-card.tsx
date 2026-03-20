"use client"

import { useState } from "react"
import { UserPlus, Phone, PhoneIncoming, Brain, ChevronDown, ChevronUp, Calendar, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MOTIVOS_CONFIG, type TimelineEvent } from "@/types/follow-up"
import { PROFILE_SECTIONS } from "@/types/patient"

const fieldLabelMap: Record<string, string> = Object.fromEntries(
  PROFILE_SECTIONS.flatMap((s) => s.fields.map((f) => [f.key, f.label]))
)

const typeConfig = {
  inscripcion: {
    accent: "border-emerald-400",
    dot: "bg-emerald-400",
    icon: UserPlus,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  llamada_saliente: {
    accent: "border-blue-400",
    dot: "bg-blue-400",
    icon: Phone,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  llamada_entrante: {
    accent: "border-sky-400",
    dot: "bg-sky-400",
    icon: PhoneIncoming,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50",
  },
  psico: {
    accent: "border-violet-400",
    dot: "bg-violet-400",
    icon: Brain,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
  },
  alerta: {
    accent: "border-red-400",
    dot: "bg-red-400",
    icon: TriangleAlert,
    iconColor: "text-red-600",
    iconBg: "bg-red-50",
  },
}

const psicoEstadoConfig: Record<string, { label: string; className: string }> = {
  programada: { label: "Programada", className: "bg-blue-50 text-blue-700 border-blue-200" },
  completada: { label: "Completada", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelada: { label: "Cancelada", className: "bg-red-50 text-red-700 border-red-200" },
  no_contesto: { label: "No contestó", className: "bg-amber-50 text-amber-700 border-amber-200" },
}

function formatDate(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatShortDate(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function callDuration(horaInicio: string, horaFin: string): string {
  const [sh, sm] = horaInicio.split(":").map(Number)
  const [eh, em] = horaFin.split(":").map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return ""
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`
}

interface TimelineEventCardProps {
  event: TimelineEvent
  isLast: boolean
}

export function TimelineEventCard({ event, isLast }: TimelineEventCardProps) {
  const [expanded, setExpanded] = useState(false)

  const tipo = event.type === "llamada"
    ? (event.meta?.tipo === "entrante" ? "llamada_entrante" : "llamada_saliente")
    : event.type as keyof typeof typeConfig

  const config = typeConfig[tipo as keyof typeof typeConfig]
  const Icon = config.icon

  const motivos = (event.meta?.motivos as string[] | undefined) ?? []
  const camposActualizados = (event.meta?.camposActualizados as string[] | undefined) ?? []
  const proximaLlamada = event.meta?.proximaLlamada as string | undefined
  const horaInicio = event.meta?.horaInicio as string | undefined
  const horaFin = event.meta?.horaFin as string | undefined
  const psicoEstado = event.meta?.estado as string | undefined

  const hasDetails = event.description || motivos.length > 0 || camposActualizados.length > 0 || proximaLlamada

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className={cn("flex size-9 items-center justify-center rounded-full shrink-0", config.iconBg)}>
          <Icon className={cn("size-4", config.iconColor)} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 mt-2 bg-border/60 min-h-6" />}
      </div>

      <div className="pb-6 flex-1 min-w-0">
        <div className={cn("rounded-xl border bg-card p-4 border-l-4", config.accent)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(event.fecha)}</p>
              {horaInicio && horaFin && (
                <p className="text-xs text-muted-foreground">
                  {horaInicio}–{horaFin}
                  {callDuration(horaInicio, horaFin) && (
                    <span className="ml-1.5 text-muted-foreground/70">
                      ({callDuration(horaInicio, horaFin)})
                    </span>
                  )}
                </p>
              )}
            </div>

            {psicoEstado && psicoEstadoConfig[psicoEstado] && (
              <Badge
                className={cn(
                  "border text-xs font-medium shrink-0",
                  psicoEstadoConfig[psicoEstado].className
                )}
              >
                {psicoEstadoConfig[psicoEstado].label}
              </Badge>
            )}
          </div>

          {motivos.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {motivos.map((m) => (
                <Badge key={m} variant="outline" className="text-xs font-normal px-2 py-0.5">
                  {MOTIVOS_CONFIG[m]?.label ?? m}
                </Badge>
              ))}
            </div>
          )}

          {hasDetails && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2.5"
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? "Ocultar" : "Ver detalles"}
            </button>
          )}

          {expanded && (
            <div className="mt-3 space-y-3 border-t border-border/40 pt-3">
              {event.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
                </div>
              )}

              {camposActualizados.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Campos actualizados en el perfil</p>
                  <div className="flex flex-wrap gap-1.5">
                    {camposActualizados.map((key) => (
                      <span
                        key={key}
                        className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md"
                      >
                        {fieldLabelMap[key] ?? key}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {proximaLlamada && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <Calendar className="size-3.5 shrink-0" />
                  <span>Próxima llamada agendada: <strong>{formatShortDate(proximaLlamada)}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
