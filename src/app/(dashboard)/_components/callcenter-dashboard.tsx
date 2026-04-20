"use client"

import Link from "next/link"
import { AlertTriangle, CalendarClock, Clock3, PhoneIncoming, PhoneOutgoing, UserRound } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCallcenterContacts } from "@/app/(dashboard)/llamadas/_hooks/use-callcenter-contacts"
import { useHospitalAlerts } from "@/hooks/use-hospitals"
import { cn } from "@/lib/utils"

function toMinutes(contact: { horaInicio?: string }) {
  if (!contact.horaInicio) return Number.MAX_SAFE_INTEGER
  const [h, m] = contact.horaInicio.split(":").map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return Number.MAX_SAFE_INTEGER
  return h * 60 + m
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const TODAY = new Date().toISOString().slice(0, 10)

export function CallcenterDashboard() {
  const { data: contacts = [], isLoading } = useCallcenterContacts()
  const { data: alerts = [] } = useHospitalAlerts()

  const scheduledContacts = contacts
    .filter((c) => c.estado === "agendado" && c.fecha >= TODAY)
    .sort((a, b) => {
      const byDate = a.fecha.localeCompare(b.fecha)
      if (byDate !== 0) return byDate
      return toMinutes(a) - toMinutes(b)
    })

  const activeAlerts = alerts.filter((a) => a.estado === "activa")
  const dueToday = scheduledContacts.filter((c) => c.fecha === TODAY)
  const upcoming = scheduledContacts.filter((c) => c.fecha > TODAY)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Panel de Call Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Arrancá por tus próximos contactos: hoy primero, luego agenda futura.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Próximos contactos agendados</CardTitle>
            <CardDescription>
              {scheduledContacts.length} total · {dueToday.length} para hoy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando contactos...</p>
            ) : scheduledContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay contactos agendados por ahora.</p>
            ) : (
              scheduledContacts.map((contact) => {
                const isToday = contact.fecha === TODAY
                return (
                  <Link
                    key={contact.id}
                    href={`/pacientes/${contact.pacienteId}`}
                    className={cn(
                      "block rounded-xl border px-4 py-3 transition-colors hover:bg-accent/40 cursor-pointer",
                      isToday ? "border-amber-300 bg-amber-50/60" : "border-border/60 bg-background",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{contact.patientName}</p>
                      <Badge className={cn("border", isToday ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-zinc-100 text-zinc-700 border-zinc-200")}>{isToday ? "Hoy" : "Agendado"}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="size-3.5" />
                        {formatDate(contact.fecha)}
                      </span>
                      {contact.horaInicio && (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-3.5" />
                          {contact.horaInicio}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        {contact.tipo === "entrante" ? <PhoneIncoming className="size-3.5" /> : <PhoneOutgoing className="size-3.5" />}
                        {contact.tipo}
                      </span>
                    </div>
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>

        <aside className="space-y-5">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Alertas activas</CardTitle>
              <CardDescription>Prioridad clínica reportada por pacientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin alertas activas.</p>
              ) : (
                activeAlerts.slice(0, 6).map((alert) => (
                  <div key={alert.id} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                    <p className="text-xs font-medium text-red-700 inline-flex items-center gap-1">
                      <AlertTriangle className="size-3.5" /> Alerta activa
                    </p>
                    <p className="text-xs text-red-800 mt-1 line-clamp-2">{alert.detalle}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Resumen operativo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contactos para hoy</span>
                <span className="font-medium text-foreground">{dueToday.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Próximos (futuros)</span>
                <span className="font-medium text-foreground">{upcoming.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pacientes con agenda</span>
                <span className="font-medium text-foreground inline-flex items-center gap-1">
                  <UserRound className="size-3.5" />
                  {new Set(scheduledContacts.map((c) => c.pacienteId)).size}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
