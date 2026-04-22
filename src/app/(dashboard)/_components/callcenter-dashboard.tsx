"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Clock3,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Plus,
  UserRound,
  Users,
  MessageCircle,
  Headphones,
  Share2,
  Globe,
  Hash,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCallcenterContacts } from "@/app/(dashboard)/llamadas/_hooks/use-callcenter-contacts"
import { useHospitalAlerts } from "@/hooks/use-hospitals"
import { useCreateProspect } from "@/app/(dashboard)/pacientes/[id]/_hooks/use-patient"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

function toMinutes(contact: { horaInicio?: string }) {
  if (!contact.horaInicio) return Number.MAX_SAFE_INTEGER
  const [h, m] = contact.horaInicio.split(":").map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return Number.MAX_SAFE_INTEGER
  return h * 60 + m
}

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
  })
}

function daysFromToday(date: string): number {
  const TODAY = new Date().toISOString().slice(0, 10)
  const today = new Date(TODAY)
  const target = new Date(`${date}T12:00:00`)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const TODAY = new Date().toISOString().slice(0, 10)

const CANALES = [
  { value: "WhatsApp", label: "WhatsApp", icon: MessageCircle },
  { value: "Llamada directa", label: "Llamada directa", icon: Phone },
  { value: "Referido por paciente", label: "Referido por paciente", icon: Share2 },
  { value: "Redes sociales FPC", label: "Redes sociales FPC", icon: Globe },
  { value: "Otro", label: "Otro", icon: Hash },
]

export function CallcenterDashboard() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { data: contacts = [], isLoading } = useCallcenterContacts()
  const { data: alerts = [] } = useHospitalAlerts()
  const createProspect = useCreateProspect()

  const [prospectDialogOpen, setProspectDialogOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [dni, setDni] = useState("")
  const [canal, setCanal] = useState("")
  const [fecha, setFecha] = useState(TODAY)
  const [hora, setHora] = useState("")
  const [notas, setNotas] = useState("")

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

  async function handleCreateProspect() {
    if (!nombre.trim() || !telefono.trim() || !canal || !fecha || !hora) return
    await createProspect.mutateAsync({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      dni: dni.trim() || undefined,
      canal,
      fecha,
      hora,
      notas: notas.trim() || undefined,
      agenteId: String(user?.id ?? ""),
    })
    setProspectDialogOpen(false)
    resetProspectForm()
  }

  function resetProspectForm() {
    setNombre("")
    setTelefono("")
    setDni("")
    setCanal("")
    setFecha(TODAY)
    setHora("")
    setNotas("")
  }

  function handleCardClick(contact: typeof scheduledContacts[0]) {
    if (contact.patientStatus === "prospecto") {
      router.push(`/inscripcion?prospectoId=${contact.pacienteId}`)
    } else {
      router.push(`/pacientes/${contact.pacienteId}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Call Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tu agenda de contactos agendados y alertas activas.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setProspectDialogOpen(true)}>
          <Plus className="size-4" />
          Agendar contacto a prospecto
        </Button>
      </div>

      {/* ── Dialog: Agendar contacto a prospecto ── */}
      <Dialog open={prospectDialogOpen} onOpenChange={setProspectDialogOpen}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogHeader className="pb-2">
            <DialogTitle>Agendar contacto a prospecto</DialogTitle>
            <DialogDescription>
              Creá un prospecto y agendá el primer contacto para iniciar el enrolamiento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="prospect-nombre">Nombre completo *</Label>
                <Input
                  id="prospect-nombre"
                  placeholder="Ej: María Elena Torres"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prospect-telefono">Teléfono *</Label>
                <Input
                  id="prospect-telefono"
                  placeholder="Ej: 987654321"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="prospect-dni">DNI</Label>
                <Input
                  id="prospect-dni"
                  placeholder="Opcional"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prospect-canal">Canal de ingreso *</Label>
                <Select value={canal} onValueChange={(v) => v && setCanal(v)}>
                  <SelectTrigger id="prospect-canal">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CANALES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="inline-flex items-center gap-2">
                          <c.icon className="size-3.5 text-muted-foreground" />
                          {c.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="prospect-fecha">Fecha agendada *</Label>
                <Input
                  id="prospect-fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prospect-hora">Hora agendada *</Label>
                <Input
                  id="prospect-hora"
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prospect-notas">Notas</Label>
              <Textarea
                id="prospect-notas"
                placeholder="Observaciones sobre el contacto..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="min-h-20 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setProspectDialogOpen(false); resetProspectForm(); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateProspect}
              disabled={
                !nombre.trim() ||
                !telefono.trim() ||
                !canal ||
                !fecha ||
                !hora ||
                createProspect.isPending
              }
            >
              {createProspect.isPending ? "Guardando..." : "Agendar contacto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          {/* ── Contactos para hoy ── */}
          <Card className="border-border/60 overflow-hidden">
            <CardHeader className="bg-amber-50/50 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-amber-100">
                    <Clock3 className="size-4 text-amber-700" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Contactos para hoy</CardTitle>
                    <CardDescription className="text-xs">
                      {dueToday.length === 0
                        ? "Nada agendado para hoy"
                        : `${dueToday.length} contacto${dueToday.length !== 1 ? "s" : ""} pendiente${dueToday.length !== 1 ? "s" : ""}`}
                    </CardDescription>
                  </div>
                </div>
                {dueToday.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-medium">
                    Hoy
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">Cargando contactos...</p>
                </div>
              ) : dueToday.length === 0 ? (
                <div className="p-6 text-center">
                  <CalendarClock className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No hay contactos agendados para hoy.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {dueToday.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} variant="today" onClick={() => handleCardClick(contact)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Próximos contactos ── */}
          {upcoming.length > 0 && (
            <Card className="border-border/60 overflow-hidden">
              <CardHeader className="bg-blue-50/30 border-b border-blue-100/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                      <CalendarDays className="size-4 text-blue-700" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Próximos contactos</CardTitle>
                      <CardDescription className="text-xs">
                        {upcoming.length} contacto{upcoming.length !== 1 ? "s" : ""} agendado{upcoming.length !== 1 ? "s" : ""} a futuro
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {upcoming.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} variant="upcoming" onClick={() => handleCardClick(contact)} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Sidebar ── */}
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
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  Para hoy
                </span>
                <span className="font-medium text-foreground">{dueToday.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  Próximos
                </span>
                <span className="font-medium text-foreground">{upcoming.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  Pacientes con agenda
                </span>
                <span className="font-medium text-foreground">
                  {new Set(scheduledContacts.filter((c) => c.patientStatus !== "prospecto").map((c) => c.pacienteId)).size}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                  <UserRound className="size-3.5" />
                  Prospectos
                </span>
                <span className="font-medium text-foreground">
                  {new Set(scheduledContacts.filter((c) => c.patientStatus === "prospecto").map((c) => c.pacienteId)).size}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" />
                  Alertas activas
                </span>
                <span className="font-medium text-foreground">{activeAlerts.length}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

/* ── ContactCard sub-component ── */

interface ContactCardProps {
  contact: {
    id: string
    pacienteId: string
    patientName: string
    patientDni: string
    patientPhone: string
    patientStatus: string
    fecha: string
    horaInicio?: string
    tipo: "saliente" | "entrante"
    notas: string
  }
  variant: "today" | "upcoming"
  onClick: () => void
}

function ContactCard({ contact, variant, onClick }: ContactCardProps) {
  const isToday = variant === "today"
  const daysAway = daysFromToday(contact.fecha)
  const isProspect = contact.patientStatus === "prospecto"

  const canalMap: Record<string, string> = {
    "WhatsApp": "WhatsApp",
    "Llamada directa": "Llamada",
    "Referido por paciente": "Referido",
    "Redes sociales FPC": "Redes sociales",
    "Otro": "Otro",
  }

  const canalLabel = canalMap[contact.patientDni] || "Seguimiento"

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-4 px-4 py-3.5 transition-colors hover:bg-accent/40 cursor-pointer group text-left w-full",
        isToday && "bg-amber-50/30 hover:bg-amber-50/60"
      )}
    >
      {/* Avatar inicial */}
      <div className={cn(
        "flex size-10 items-center justify-center rounded-full shrink-0 text-sm font-semibold",
        isProspect ? "bg-violet-100 text-violet-800" : isToday ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
      )}>
        {contact.patientName
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {contact.patientName}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {isProspect ? (
              <Badge className="bg-violet-100 text-violet-800 border-violet-200 text-[10px] font-semibold">
                PROSPECTO
              </Badge>
            ) : isToday ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-semibold">
                SEGUIMIENTO
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50">
                SEGUIMIENTO
              </Badge>
            )}
            {isToday && !isProspect && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
                HOY
              </Badge>
            )}
            {isToday && isProspect && (
              <Badge className="bg-violet-100 text-violet-800 border-violet-200 text-[10px]">
                HOY
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {contact.patientPhone && (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Phone className="size-3 text-emerald-600" />
              {contact.patientPhone}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <CalendarClock className="size-3" />
            {isToday ? "Hoy" : formatDate(contact.fecha)}
          </span>
          {contact.horaInicio && (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Clock3 className="size-3" />
              {contact.horaInicio}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            {contact.tipo === "entrante" ? (
              <PhoneIncoming className="size-3" />
            ) : (
              <PhoneOutgoing className="size-3" />
            )}
            {contact.tipo === "entrante" ? "Entrante" : "Saliente"}
          </span>
        </div>

        {contact.notas && contact.notas !== "Contacto de seguimiento agendado" && (
          <p className="mt-1.5 text-xs text-muted-foreground/80 line-clamp-1">
            {contact.notas}
          </p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0 mt-2 transition-colors" />
    </button>
  )
}
