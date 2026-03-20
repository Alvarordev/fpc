'use client'

import { useRouter } from 'next/navigation'
import { Phone, Video, CalendarDays } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PsicoSession } from '@/types/follow-up'

interface AgendaSessionCardProps {
  session: PsicoSession
  patientName: string
  isToday?: boolean
  onStartSession?: (session: PsicoSession) => void
}

const estadoStyles: Record<PsicoSession['estado'], string> = {
  programada: 'bg-blue-50 text-blue-700 border-blue-200',
  completada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelada: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  no_contesto: 'bg-amber-50 text-amber-700 border-amber-200',
}

const estadoLabels: Record<PsicoSession['estado'], string> = {
  programada: 'Programada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_contesto: 'No contestó',
}

export function AgendaSessionCard({
  session,
  patientName,
  isToday,
  onStartSession,
}: AgendaSessionCardProps) {
  const router = useRouter()

  const sessionLabel =
    session.sesionNumero === 0 || !session.sesionNumero
      ? 'Sesión extra'
      : `Sesión ${session.sesionNumero}`

  const fecha = new Date(session.fecha + 'T00:00:00').toLocaleDateString(
    'es-PE',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    },
  )

  return (
    <Card
      className={cn(
        'border-border/60 transition-colors',
        isToday && 'ring-primary/30 ring-2',
      )}
    >
      <CardContent className="flex items-start gap-4 p-4">
        <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
          {session.modalidad === 'llamada' ? (
            <Phone className="size-4" />
          ) : (
            <Video className="size-4" />
          )}
        </div>
        <button
          type="button"
          className="hover:bg-muted/30 min-w-0 flex-1 space-y-1 rounded-md px-1 py-0.5 text-left transition-colors"
          onClick={() => router.push(`/pacientes/${session.pacienteId}`)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-foreground truncate text-sm font-medium">
              {patientName}
            </p>
            <Badge
              className={cn(
                'border text-xs font-medium',
                estadoStyles[session.estado],
              )}
            >
              {estadoLabels[session.estado]}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">{sessionLabel}</p>
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <CalendarDays className="size-3 shrink-0" />
            <span className="capitalize">{fecha}</span>
            <span>·</span>
            <span>
              {session.horaInicio}–{session.horaFin}
            </span>
          </div>
        </button>

        {session.estado === 'programada' && onStartSession && (
          <Button
            size="sm"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onStartSession(session)
            }}
          >
            Empezar sesión
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
