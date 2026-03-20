"use client"

import { useRouter } from "next/navigation"
import { Phone, Video, CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PsicoSession } from "@/types/follow-up"

interface AgendaSessionCardProps {
  session: PsicoSession
  patientName: string
  isToday?: boolean
}

const estadoStyles: Record<PsicoSession["estado"], string> = {
  programada: "bg-blue-50 text-blue-700 border-blue-200",
  completada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelada: "bg-zinc-100 text-zinc-600 border-zinc-200",
  no_contesto: "bg-amber-50 text-amber-700 border-amber-200",
}

const estadoLabels: Record<PsicoSession["estado"], string> = {
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_contesto: "No contestó",
}

export function AgendaSessionCard({ session, patientName, isToday }: AgendaSessionCardProps) {
  const router = useRouter()

  const sessionLabel =
    session.sesionNumero === 0 || !session.sesionNumero
      ? "Sesión extra"
      : `Sesión ${session.sesionNumero}`

  const fecha = new Date(session.fecha + "T00:00:00").toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <Card
      className={cn(
        "border-border/60 cursor-pointer transition-colors hover:bg-muted/30",
        isToday && "ring-2 ring-primary/30"
      )}
      onClick={() => router.push(`/pacientes/${session.pacienteId}`)}
    >
      <CardContent className="p-4 flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {session.modalidad === "llamada" ? (
            <Phone className="size-4" />
          ) : (
            <Video className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground truncate">{patientName}</p>
            <Badge className={cn("border text-xs font-medium", estadoStyles[session.estado])}>
              {estadoLabels[session.estado]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{sessionLabel}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3 shrink-0" />
            <span className="capitalize">{fecha}</span>
            <span>·</span>
            <span>
              {session.horaInicio}–{session.horaFin}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
