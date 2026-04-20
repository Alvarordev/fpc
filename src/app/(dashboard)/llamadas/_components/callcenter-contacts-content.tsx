"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Clock3, PhoneIncoming, PhoneOutgoing } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  useCallcenterContacts,
  useUpdateCallcenterContact,
  type ContactWithPatient,
} from "../_hooks/use-callcenter-contacts"

const TODAY = new Date().toISOString().slice(0, 10)

const statusConfig = {
  agendado: { label: "Agendado", className: "bg-amber-50 text-amber-700 border-amber-200" },
  completado: { label: "Completado", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  inconcluso: { label: "Inconcluso", className: "bg-zinc-100 text-zinc-700 border-zinc-200" },
} as const

function formatDate(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function sortByDateAsc(a: ContactWithPatient, b: ContactWithPatient): number {
  return a.fecha.localeCompare(b.fecha)
}

function sortByDateDesc(a: ContactWithPatient, b: ContactWithPatient): number {
  return b.fecha.localeCompare(a.fecha)
}

export function CallcenterContactsContent() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "agendado" | "completado" | "inconcluso">("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { data: contacts = [], isLoading } = useCallcenterContacts()
  const updateContact = useUpdateCallcenterContact()

  const scheduledToday = useMemo(
    () => contacts
      .filter((c) => c.estado === "agendado" && c.fecha === TODAY)
      .sort(sortByDateAsc),
    [contacts]
  )

  const scheduledUpcoming = useMemo(
    () => contacts
      .filter((c) => c.estado === "agendado" && c.fecha > TODAY)
      .sort(sortByDateAsc),
    [contacts]
  )

  const recentHistory = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return contacts
      .filter((c) => c.estado !== "agendado")
      .filter((c) => {
        if (!needle) return true
        return (
          c.patientName.toLowerCase().includes(needle) ||
          c.patientDni.includes(needle) ||
          c.notas.toLowerCase().includes(needle)
        )
      })
      .filter((c) => (statusFilter === "all" ? true : c.estado === statusFilter))
      .sort(sortByDateDesc)
  }, [contacts, search, statusFilter])

  async function markAsInconclusive(contactId: string) {
    setUpdatingId(contactId)
    try {
      await updateContact.mutateAsync({
        id: contactId,
        data: {
          estado: "inconcluso",
          motivoInconcluso: "No se logró concretar el contacto programado",
          notas: "Contacto marcado automáticamente como inconcluso desde la agenda.",
        },
      })
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando agenda de contactos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Llamadas y Seguimiento</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Prioridad del día para callcenter: contactos agendados.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Contactos de hoy</CardTitle>
          <CardDescription>
            {scheduledToday.length} contacto{scheduledToday.length !== 1 ? "s" : ""} agendado{scheduledToday.length !== 1 ? "s" : ""} para hoy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {scheduledToday.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay contactos pendientes para hoy.</p>
          ) : (
            scheduledToday.map((contact) => (
              <div
                key={contact.id}
                className="rounded-xl border border-border/60 px-4 py-3 flex flex-wrap items-center gap-3 justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{contact.patientName}</p>
                  <p className="text-xs text-muted-foreground">DNI {contact.patientDni} · {formatDate(contact.fecha)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("border", statusConfig[contact.estado].className)}>
                    {statusConfig[contact.estado].label}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/pacientes/${contact.pacienteId}`)}>
                    Ir al paciente
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsInconclusive(contact.id)}
                    disabled={updatingId === contact.id}
                  >
                    {updatingId === contact.id ? "Actualizando..." : "Marcar inconcluso"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Próximos contactos agendados</CardTitle>
          <CardDescription>
            Agenda futura para organizar las próximas llamadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {scheduledUpcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin contactos agendados a futuro.</p>
          ) : (
            scheduledUpcoming.map((contact) => (
              <div
                key={contact.id}
                className="rounded-lg border border-border/50 px-3 py-2 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{contact.patientName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(contact.fecha)}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => router.push(`/pacientes/${contact.pacienteId}`)}>
                  Ver
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Historial reciente de contactos</CardTitle>
          <CardDescription>
            Contactos completados o inconclusos ya registrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="search-contact">Buscar</Label>
              <Input
                id="search-contact"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, DNI o texto de nota..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="inconcluso">Inconcluso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            {recentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay resultados para esos filtros.</p>
            ) : (
              recentHistory.slice(0, 20).map((contact) => (
                <div key={contact.id} className="rounded-lg border border-border/50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{contact.patientName}</p>
                    <Badge className={cn("border", statusConfig[contact.estado].className)}>
                      {statusConfig[contact.estado].label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" /> {formatDate(contact.fecha)}</span>
                    <span className="inline-flex items-center gap-1">
                      {contact.tipo === "entrante" ? <PhoneIncoming className="size-3" /> : <PhoneOutgoing className="size-3" />}
                      {contact.tipo}
                    </span>
                    {contact.horaInicio && contact.horaFin && (
                      <span className="inline-flex items-center gap-1"><Clock3 className="size-3" /> {contact.horaInicio}–{contact.horaFin}</span>
                    )}
                  </div>
                  {contact.notas && (
                    <p className="text-xs text-foreground/80 mt-1.5 line-clamp-2">{contact.notas}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
