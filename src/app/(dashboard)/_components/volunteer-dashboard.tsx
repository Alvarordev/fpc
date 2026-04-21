'use client'

import { Heart, Clock, CalendarCheck, CheckCircle2, CalendarDays, AlertCircle, Phone, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { KpiCard } from '@/components/kpi-card'
import { useVolunteerDashboard } from '@/hooks/use-volunteer-dashboard'
import { cn } from '@/lib/utils'

export function VolunteerDashboard() {
  const { data: stats, isLoading } = useVolunteerDashboard()

  const upcomingCount = stats?.upcomingAgenda.length ?? 0
  const hasUpcoming = upcomingCount > 0

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Panel del Voluntario</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tu agenda clínica, pacientes asignados y disponibilidad.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-border/60 bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Pacientes asignados"
            value={String(stats?.totalPatients ?? 0)}
            description="Pacientes en seguimiento"
            icon={Heart}
            trend="neutral"
          />
          <KpiCard
            title="Citas pendientes"
            value={String(stats?.pendingSessions ?? 0)}
            description="Sesiones programadas"
            icon={CalendarCheck}
            trend={stats?.pendingSessions && stats.pendingSessions > 0 ? 'up' : 'neutral'}
          />
          <KpiCard
            title="Horas disponibles"
            value={`${stats?.availableHoursThisMonth ?? 0}h`}
            description="Horas disponibles este mes"
            icon={Clock}
            trend="neutral"
          />
          <KpiCard
            title="Sesiones completadas"
            value={String(stats?.completedSessions ?? 0)}
            description="Total de sesiones realizadas"
            icon={CheckCircle2}
            trend="neutral"
          />
        </div>
      )}

      {/* Upcoming Agenda */}
      <Card className="border-border/60 shadow-none bg-card">
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Próximas sesiones
            </CardTitle>
            {hasUpcoming && (
              <Badge variant="outline" className="text-xs">
                {upcomingCount} {upcomingCount === 1 ? 'sesión' : 'sesiones'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : hasUpcoming ? (
            <div className="space-y-0">
              {stats!.upcomingAgenda.map((item, i) => {
                const isToday = item.fecha === new Date().toISOString().slice(0, 10)
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 py-3",
                      i < stats!.upcomingAgenda.length - 1 && "border-b border-border/50"
                    )}
                  >
                    <div className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      isToday ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {item.modalidad === 'Videollamada' ? (
                        <Video className="size-4" />
                      ) : (
                        <Phone className="size-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug truncate">
                        {item.pacienteNombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sesión #{item.sesionNumero} · {item.modalidad}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">
                        {new Date(item.fecha).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.horaInicio}{item.horaFin ? ` - ${item.horaFin}` : ''}
                      </p>
                    </div>
                    {isToday && (
                      <Badge variant="outline" className="shrink-0 bg-primary/5 text-primary border-primary/20 text-[10px]">
                        Hoy
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CalendarDays className="size-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No tenés sesiones programadas.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Agregá disponibilidad en la pestaña de Disponibilidad.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/60 shadow-none bg-card">
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="text-sm font-semibold text-foreground">
            Actividad reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : stats?.recentSessions && stats.recentSessions.length > 0 ? (
            <div className="space-y-0">
              {stats.recentSessions.map((item, i) => {
                const Icon = item.accent ? CheckCircle2 : CalendarCheck
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 py-3",
                      i < stats.recentSessions.length - 1 && "border-b border-border/50"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
                      item.accent
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.fecha).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <AlertCircle className="size-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Sin actividad reciente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
