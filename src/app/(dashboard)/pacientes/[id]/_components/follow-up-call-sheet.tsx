"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { ChevronDown, ChevronUp, TriangleAlert, Brain } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { MOTIVOS_CONFIG } from "@/types/contact"
import { useAuthStore } from "@/store/auth-store"
import { useCreateContact } from "../_hooks/use-follow-up"
import { usePsicoSessions, useVolunteers, useAvailableSlots, useCreatePsicoSession } from "../_hooks/use-psico-sessions"
import { HospitalSelect } from "@/components/hospital-select"
import { useHospitals, useCreateHospitalAlert } from "@/hooks/use-hospitals"
import type { AvailabilitySlot } from "@/types/volunteer"

const schema = z.object({
  tipo: z.enum(["saliente", "entrante"]),
  estado: z.enum(["completado", "inconcluso"]),
  fecha: z.string().min(1, "Fecha requerida"),
  horaInicio: z.string().min(1, "Hora de inicio requerida"),
  horaFin: z.string().min(1, "Hora de fin requerida"),
  motivos: z.array(z.string()).min(1, "Seleccione al menos un motivo"),
  notas: z.string(),
  proximaLlamada: z.string().optional(),
  motivoInconcluso: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.estado === "inconcluso" && !values.motivoInconcluso?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["motivoInconcluso"],
      message: "Ingrese el motivo del contacto inconcluso",
    })
  }
})

type FormValues = z.infer<typeof schema>

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatSlot(slot: AvailabilitySlot): string {
  const date = new Date(slot.fecha + "T12:00:00").toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
  return `${date} — ${slot.horaInicio} a ${slot.horaFin}`
}

interface FollowUpCallSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId: string
}

export function FollowUpCallSheet({ open, onOpenChange, pacienteId }: FollowUpCallSheetProps) {
  const user = useAuthStore((s) => s.user)
  const createContact = useCreateContact(pacienteId)

  const { data: hospitals = [] } = useHospitals()
  const createAlert = useCreateHospitalAlert()

  const { data: existingSessions = [] } = usePsicoSessions(pacienteId)
  const { data: volunteers = [] } = useVolunteers()
  const createSession = useCreatePsicoSession(pacienteId)

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertHospital, setAlertHospital] = useState("")
  const [alertDetalle, setAlertDetalle] = useState("")

  const [psicoOpen, setPsicoOpen] = useState(false)
  const [psicoVoluntarioId, setPsicoVoluntarioId] = useState("")
  const [psicoSlotId, setPsicoSlotId] = useState("")
  const [psicoModalidad, setPsicoModalidad] = useState<"llamada" | "videollamada">("llamada")

  const { data: availableSlots = [] } = useAvailableSlots(psicoVoluntarioId)
  const activeVolunteers = volunteers.filter((v) => v.estado === "activo")
  const slotsForVolunteer = availableSlots.filter(
    (s) => String(s.voluntarioId) === psicoVoluntarioId
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: "saliente",
      estado: "completado",
      fecha: todayISO(),
      horaInicio: "",
      horaFin: "",
      motivos: [],
      notas: "",
      proximaLlamada: "",
      motivoInconcluso: "",
    },
  })

  const selectedMotivos = watch("motivos")
  const selectedStatus = watch("estado")

  function toggleMotivo(key: string) {
    const current = selectedMotivos
    setValue(
      "motivos",
      current.includes(key) ? current.filter((m) => m !== key) : [...current, key],
      { shouldValidate: true }
    )
  }

  function resetAll() {
    reset({ tipo: "saliente", estado: "completado", fecha: todayISO(), horaInicio: "", horaFin: "", motivos: [], notas: "", proximaLlamada: "", motivoInconcluso: "" })
    setAlertOpen(false)
    setAlertHospital("")
    setAlertDetalle("")
    setPsicoOpen(false)
    setPsicoVoluntarioId("")
    setPsicoSlotId("")
    setPsicoModalidad("llamada")
  }

  async function onSubmit(values: FormValues) {
    const baseId = `ct${Date.now()}`

    await createContact.mutateAsync({
      id: `${baseId}-main`,
      pacienteId,
      agenteId: String(user?.id ?? ""),
      origen: "seguimiento",
      fecha: values.fecha,
      horaInicio: values.horaInicio,
      horaFin: values.horaFin,
      tipo: values.tipo,
      estado: values.estado,
      motivos: values.motivos,
      notas: values.notas,
      camposActualizados: [],
      ...(values.estado === "inconcluso" && values.motivoInconcluso?.trim()
        ? { motivoInconcluso: values.motivoInconcluso.trim() }
        : {}),
    })

    if (values.proximaLlamada) {
      await createContact.mutateAsync({
        id: `${baseId}-next`,
        pacienteId,
        agenteId: String(user?.id ?? ""),
        origen: "seguimiento",
        fecha: values.proximaLlamada,
        tipo: "saliente",
        estado: "agendado",
        motivos: [],
        notas: "Contacto de seguimiento agendado",
        camposActualizados: [],
      })
    }

    if (alertOpen && alertHospital && alertDetalle.trim()) {
      const hospital = hospitals.find((h) => h.nombre === alertHospital)
      if (hospital) {
        await createAlert.mutateAsync({
          hospitalId: hospital.id,
          pacienteId,
          agenteId: String(user?.id ?? ""),
          detalle: alertDetalle.trim(),
          fecha: values.fecha,
          estado: "activa",
        })
      }
    }

    if (psicoOpen && psicoVoluntarioId && psicoSlotId) {
      const slot = availableSlots.find((s) => String(s.id) === psicoSlotId)
      if (slot) {
        await createSession.mutateAsync({
          session: {
            id: `ps${Date.now()}`,
            pacienteId,
            voluntarioId: Number(psicoVoluntarioId),
            availabilitySlotId: psicoSlotId,
            sesionNumero: existingSessions.length + 1,
            fecha: slot.fecha,
            horaInicio: slot.horaInicio,
            horaFin: slot.horaFin,
            modalidad: psicoModalidad,
            estado: "programada",
            notas: "",
          },
          slotId: psicoSlotId,
        })
      }
    }

    resetAll()
    onOpenChange(false)
  }

  function handleOpenChange(val: boolean) {
    if (!val) resetAll()
    onOpenChange(val)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border/60">
          <SheetTitle>Registrar contacto de seguimiento</SheetTitle>
          </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex-1 space-y-5 p-6">
            <div className="space-y-1.5">
              <Label className="text-sm">Tipo de contacto</Label>
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saliente">Contacto saliente (del agente al paciente)</SelectItem>
                      <SelectItem value="entrante">Contacto entrante (del paciente al agente)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Estado del contacto</Label>
              <Controller
                name="estado"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="inconcluso">Inconcluso</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Fecha</Label>
              <Input type="date" {...register("fecha")} className="h-9" />
              {errors.fecha && <p className="text-xs text-destructive">{errors.fecha.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Hora inicio</Label>
                <Input type="time" {...register("horaInicio")} className="h-9" />
                {errors.horaInicio && <p className="text-xs text-destructive">{errors.horaInicio.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Hora fin</Label>
                <Input type="time" {...register("horaFin")} className="h-9" />
                {errors.horaFin && <p className="text-xs text-destructive">{errors.horaFin.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Motivos de la llamada</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(MOTIVOS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleMotivo(key)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
                      selectedMotivos.includes(key)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
              {errors.motivos && <p className="text-xs text-destructive">{errors.motivos.message}</p>}
            </div>

            {selectedStatus === "inconcluso" && (
              <div className="space-y-1.5">
                <Label className="text-sm">Motivo de inconcluso</Label>
                <Textarea
                  {...register("motivoInconcluso")}
                  placeholder="Ej: no contestó, llamada cortada, paciente solicitó reprogramar..."
                  className="min-h-20 text-sm resize-none"
                />
                {errors.motivoInconcluso && (
                  <p className="text-xs text-destructive">{errors.motivoInconcluso.message}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm">Notas</Label>
              <Textarea
                {...register("notas")}
                placeholder="Resumen de la llamada, acuerdos, observaciones..."
                className="min-h-28 text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">
                Fecha de próxima llamada{" "}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input type="date" {...register("proximaLlamada")} className="h-9" />
              <p className="text-xs text-muted-foreground">
                Se registrará como un nuevo contacto agendado para el historial.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Acciones durante el contacto
              </p>

              <div className="rounded-xl border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAlertOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <TriangleAlert className="size-4 text-amber-500" />
                    <span className="font-medium">Reportar problema en hospital</span>
                  </div>
                  {alertOpen ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </button>

                {alertOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Establecimiento con problema</Label>
                      <HospitalSelect value={alertHospital} onChange={setAlertHospital} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Descripción del problema</Label>
                      <Textarea
                        placeholder="¿Qué problema reportó el paciente en este establecimiento?"
                        value={alertDetalle}
                        onChange={(e) => setAlertDetalle(e.target.value)}
                        className="min-h-20 text-sm resize-none"
                      />
                    </div>
                    {alertOpen && (!alertHospital || !alertDetalle.trim()) && (
                      <p className="text-xs text-muted-foreground">
                        Completa ambos campos para crear la alerta al guardar la llamada.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPsicoOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Brain className="size-4 text-violet-500" />
                    <span className="font-medium">Agendar sesión de psicooncología</span>
                  </div>
                  {psicoOpen ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </button>

                {psicoOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Voluntario / Psicólogo</Label>
                      <Select
                        value={psicoVoluntarioId}
                        onValueChange={(v) => {
                          if (v) {
                            setPsicoVoluntarioId(v)
                            setPsicoSlotId("")
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar voluntario" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeVolunteers.map((v) => (
                            <SelectItem key={String(v.id)} value={String(v.id)}>
                              {v.nombre} {v.apellido} — {v.especialidad}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Horario disponible</Label>
                      <Select
                        value={psicoSlotId}
                        onValueChange={(v) => v && setPsicoSlotId(v)}
                        disabled={!psicoVoluntarioId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              !psicoVoluntarioId
                                ? "Primero seleccione un voluntario"
                                : slotsForVolunteer.length === 0
                                ? "Sin horarios disponibles"
                                : "Seleccionar horario"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {slotsForVolunteer
                            .sort((a, b) => a.fecha.localeCompare(b.fecha))
                            .map((slot) => (
                              <SelectItem key={String(slot.id)} value={String(slot.id)}>
                                {formatSlot(slot)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Medio de consulta</Label>
                      <Select
                        value={psicoModalidad}
                        onValueChange={(v) => v && setPsicoModalidad(v as "llamada" | "videollamada")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llamada">Llamada</SelectItem>
                          <SelectItem value="videollamada">Videollamada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {psicoOpen && (!psicoVoluntarioId || !psicoSlotId) && (
                      <p className="text-xs text-muted-foreground">
                        Selecciona voluntario y horario para agendar la sesión al guardar la llamada.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="border-t border-border/60">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar contacto"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
