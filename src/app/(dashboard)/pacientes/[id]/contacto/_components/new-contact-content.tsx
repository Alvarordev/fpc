"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Brain, TriangleAlert, CalendarPlus, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HospitalSelect } from "@/components/hospital-select"
import { useAuthStore } from "@/store/auth-store"
import { PROFILE_SECTIONS, normalizeProfileValues } from "@/types/patient"
import { MOTIVOS_CONFIG } from "@/types/contact"
import { usePatient, useUpdatePatient } from "../../_hooks/use-patient"
import { useCreateContact, useUpdateContact, useContact } from "../../_hooks/use-follow-up"
import {
  useAvailableSlots,
  useCreatePsicoSession,
  usePsicoSessions,
  useVolunteers,
} from "../../_hooks/use-psico-sessions"
import { useCreateHospitalAlert, useHospitals } from "@/hooks/use-hospitals"
import type { AvailabilitySlot } from "@/types/volunteer"

/* ──────────────────────── Schemas ──────────────────────── */

const scheduleSchema = z.object({
  tipo: z.enum(["saliente", "entrante"]),
  fecha: z.string().min(1, "Fecha requerida"),
  horaInicio: z.string().min(1, "Hora requerida"),
  notas: z.string(),
})

type ScheduleValues = z.infer<typeof scheduleSchema>

const completeSchema = z
  .object({
    tipo: z.enum(["saliente", "entrante"]),
    estado: z.enum(["completado", "inconcluso"]),
    fecha: z.string().min(1, "Fecha requerida"),
    horaInicio: z.string().min(1, "Hora de inicio requerida"),
    horaFin: z.string().min(1, "Hora de fin requerida"),
    motivos: z.array(z.string()).min(1, "Seleccioná al menos un motivo"),
    notas: z.string().min(4, "Agregá una nota breve del contacto"),
    motivoInconcluso: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.estado === "inconcluso" && !values.motivoInconcluso?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["motivoInconcluso"],
        message: "Indicá por qué quedó inconcluso",
      })
    }
  })

type CompleteValues = z.infer<typeof completeSchema>

/* ──────────────────────── Patient fields ──────────────────────── */

const patientUpdateFields = [
  "q17_telefono",
  "q18_telefonoAuxiliar",
  "q19_telefonoFamiliar",
  "q20_nombreFamiliar",
  "afiliacionSisDesdeSepa",
  "fechaAfiliacionSis",
  "situacionTratamiento",
  "evolucionEnfermedad",
  "limitacionConsultas",
] as const

type PatientFieldKey = (typeof patientUpdateFields)[number]

/* ──────────────────────── Psico & Alert schemas ──────────────────────── */

const psicoSchema = z.object({
  voluntarioId: z.string().min(1, "Seleccioná voluntario"),
  slotId: z.string().min(1, "Seleccioná horario"),
  modalidad: z.enum(["llamada", "videollamada"]),
})

type PsicoValues = z.infer<typeof psicoSchema>

const alertSchema = z.object({
  hospital: z.string().min(1, "Seleccioná establecimiento"),
  detalle: z.string().min(5, "Detallá el problema reportado"),
})

type AlertValues = z.infer<typeof alertSchema>

/* ──────────────────────── Helpers ──────────────────────── */

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

/* ──────────────────────── Component ──────────────────────── */

interface NewContactContentProps {
  pacienteId: string
  contactId?: string
}

export function NewContactContent({ pacienteId, contactId }: NewContactContentProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isScheduleMode = !contactId

  const { data: patient, isLoading: loadingPatient } = usePatient(pacienteId)
  const updatePatient = useUpdatePatient(pacienteId)
  const createContact = useCreateContact(pacienteId)
  const updateContact = useUpdateContact(pacienteId)

  const { data: existingContact, isLoading: loadingContact } = useContact(contactId ?? "")
  const createAlert = useCreateHospitalAlert()
  const { data: hospitals = [] } = useHospitals()

  const { data: existingSessions = [] } = usePsicoSessions(pacienteId)
  const { data: volunteers = [] } = useVolunteers()
  const createSession = useCreatePsicoSession(pacienteId)

  const [psicoOpen, setPsicoOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)

  const [psicoDraft, setPsicoDraft] = useState<PsicoValues | null>(null)
  const [alertDraft, setAlertDraft] = useState<AlertValues | null>(null)

  /* ── Psico & Alert forms (declarados antes de usarlos) ── */
  const psicoForm = useForm<PsicoValues>({
    resolver: zodResolver(psicoSchema),
    defaultValues: { voluntarioId: "", slotId: "", modalidad: "llamada" },
  })

  const alertForm = useForm<AlertValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: { hospital: "", detalle: "" },
  })

  const selectedVolunteer = psicoForm.watch("voluntarioId")

  const { data: availableSlots = [] } = useAvailableSlots(selectedVolunteer)

  const activeVolunteers = volunteers.filter((v) => v.estado === "activo")
  const slotsForVolunteer = availableSlots
    .filter((s) => s.voluntarioId === selectedVolunteer)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  /* ── Schedule form ── */
  const scheduleForm = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      tipo: "saliente",
      fecha: todayISO(),
      horaInicio: "",
      notas: "",
    },
  })

  /* ── Complete form ── */
  const completeForm = useForm<CompleteValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      tipo: "saliente",
      estado: "completado",
      fecha: todayISO(),
      horaInicio: "",
      horaFin: "",
      motivos: [],
      notas: "",
      motivoInconcluso: "",
    },
  })

  // Precargar datos del contacto agendado en modo completar
  useEffect(() => {
    if (existingContact && !isScheduleMode) {
      completeForm.reset({
        tipo: existingContact.tipo ?? "saliente",
        estado: "completado",
        fecha: existingContact.fecha ?? todayISO(),
        horaInicio: existingContact.horaInicio ?? "",
        horaFin: existingContact.horaFin ?? "",
        motivos: [],
        notas: existingContact.notas ?? "",
        motivoInconcluso: "",
      })
    }
  }, [existingContact, isScheduleMode, completeForm])

  // Formulario activo con tipado relajado para evitar uniones incompatibles
  const form = (isScheduleMode ? scheduleForm : completeForm) as any
  const selectedMotivos = completeForm.watch("motivos")
  const selectedEstado = completeForm.watch("estado")

  /* ── Patient quick-update form ── */
  const patientDefaults = useMemo(() => {
    if (!patient) {
      return patientUpdateFields.reduce<Record<PatientFieldKey, string>>((acc, key) => {
        acc[key] = ""
        return acc
      }, {} as Record<PatientFieldKey, string>)
    }
    return patientUpdateFields.reduce<Record<PatientFieldKey, string>>((acc, key) => {
      acc[key] = String((patient as Record<string, unknown>)[key] ?? "")
      return acc
    }, {} as Record<PatientFieldKey, string>)
  }, [patient])

  const patientForm = useForm<Record<PatientFieldKey, string>>({
    values: patientDefaults,
  })

  function toggleMotivo(key: string) {
    const current = completeForm.getValues("motivos")
    completeForm.setValue(
      "motivos",
      current.includes(key) ? current.filter((m) => m !== key) : [...current, key],
      { shouldValidate: true },
    )
  }

  async function onScheduleSubmit(values: ScheduleValues) {
    if (!patient) return
    await createContact.mutateAsync({
      id: `scheduled-${Date.now()}`,
      pacienteId,
      agenteId: String(user?.id ?? ""),
      origen: "seguimiento",
      tipo: values.tipo,
      estado: "agendado",
      fecha: values.fecha,
      horaInicio: values.horaInicio,
      notas: values.notas || "Contacto de seguimiento agendado",
      motivos: [],
      camposActualizados: [],
    })
    router.push(`/pacientes/${pacienteId}`)
  }

  async function onCompleteSubmit(values: CompleteValues) {
    if (!patient || !contactId) return

    // Patient updates
    const changedPatientFields = Object.entries(patientForm.getValues())
      .filter(([key, value]) => String((patient as Record<string, unknown>)[key] ?? "") !== value)
      .reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {})

    const normalizedPatientPatch = normalizeProfileValues(changedPatientFields)
    const camposActualizados = Object.keys(normalizedPatientPatch)

    if (camposActualizados.length > 0) {
      await updatePatient.mutateAsync(normalizedPatientPatch)
    }

    // Update existing scheduled contact
    await updateContact.mutateAsync({
      id: contactId,
      data: {
        tipo: values.tipo,
        estado: values.estado,
        fecha: values.fecha,
        horaInicio: values.horaInicio,
        horaFin: values.horaFin,
        motivos: values.motivos,
        notas: values.notas,
        camposActualizados,
        ...(values.estado === "inconcluso" && values.motivoInconcluso?.trim()
          ? { motivoInconcluso: values.motivoInconcluso.trim() }
          : {}),
      },
    })

    // Alert
    if (alertDraft) {
      const hospital = hospitals.find((h) => h.nombre === alertDraft.hospital)
      if (hospital) {
        await createAlert.mutateAsync({
          hospitalId: hospital.id,
          pacienteId,
          agenteId: String(user?.id ?? ""),
          detalle: alertDraft.detalle,
          fecha: values.fecha,
          estado: "activa",
        })
      }
    }

    // Psico session
    if (psicoDraft) {
      const slot = availableSlots.find((s) => s.id === psicoDraft.slotId)
      if (slot) {
        await createSession.mutateAsync({
          session: {
            id: `ps${Date.now()}`,
            pacienteId,
            voluntarioId: psicoDraft.voluntarioId,
            availabilitySlotId: psicoDraft.slotId,
            sesionNumero: existingSessions.length + 1,
            fecha: slot.fecha,
            horaInicio: slot.horaInicio,
            horaFin: slot.horaFin,
            modalidad: psicoDraft.modalidad,
            estado: "programada",
            notas: "",
          },
          slotId: psicoDraft.slotId,
        })
      }
    }

    router.push(`/pacientes/${pacienteId}`)
  }

  const isLoading = loadingPatient || (!isScheduleMode && loadingContact)

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {isScheduleMode ? "Cargando paciente..." : "Cargando contacto..."}
        </p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">No se pudo cargar el paciente.</p>
      </div>
    )
  }

  if (!isScheduleMode && !existingContact) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">No se encontró el contacto agendado.</p>
      </div>
    )
  }

  const allPending =
    form.formState.isSubmitting ||
    updatePatient.isPending ||
    createContact.isPending ||
    updateContact.isPending ||
    createAlert.isPending ||
    createSession.isPending

  const patientName = patient.q9_nombrePaciente

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {isScheduleMode ? "Agendar contacto" : "Completar contacto"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isScheduleMode
            ? `Programá un nuevo contacto con ${patientName}.`
            : `Registrá el contacto agendado con ${patientName}.`}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(
          isScheduleMode ? (onScheduleSubmit as any) : (onCompleteSubmit as any)
        )}
        className="grid grid-cols-1 xl:grid-cols-3 gap-5"
      >
        <Card className="xl:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">
              {isScheduleMode ? "Datos del agendamiento" : "Datos del contacto"}
            </CardTitle>
            <CardDescription>
              {isScheduleMode
                ? "Indicá cuándo se realizará el contacto."
                : "Completá origen, estado, tiempo de llamada, motivos y notas."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de contacto</Label>
                <Controller
                  name="tipo"
                  control={form.control as any}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saliente">Saliente (agente → paciente)</SelectItem>
                        <SelectItem value="entrante">Entrante (paciente → agente)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {!isScheduleMode && (
                <div className="space-y-1.5">
                  <Label>Estado del contacto</Label>
                  <Controller
                    name="estado"
                    control={completeForm.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completado">
                            <span className="inline-flex items-center gap-2">
                              <CheckCircle2 className="size-3.5 text-emerald-600" />
                              Completado
                            </span>
                          </SelectItem>
                          <SelectItem value="inconcluso">Inconcluso</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Fecha / Hora */}
            <div className={isScheduleMode ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "grid grid-cols-1 md:grid-cols-3 gap-3"}>
              <div className="space-y-1.5">
                <Label>Fecha</Label>
                <Input type="date" {...form.register("fecha")} />
                {form.formState.errors.fecha && (
                  <p className="text-xs text-destructive">{form.formState.errors.fecha.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>{isScheduleMode ? "Hora programada" : "Hora inicio"}</Label>
                <Input type="time" {...form.register("horaInicio")} />
                {form.formState.errors.horaInicio && (
                  <p className="text-xs text-destructive">{form.formState.errors.horaInicio.message}</p>
                )}
              </div>
              {!isScheduleMode && (
                <div className="space-y-1.5">
                  <Label>Hora fin</Label>
                  <Input type="time" {...completeForm.register("horaFin")} />
                  {completeForm.formState.errors.horaFin && (
                    <p className="text-xs text-destructive">{completeForm.formState.errors.horaFin.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Motivos — solo en modo completar */}
            {!isScheduleMode && (
              <div className="space-y-2">
                <Label>Motivos</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(MOTIVOS_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleMotivo(key)}
                      className={
                        selectedMotivos.includes(key)
                          ? "rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                          : "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40"
                      }
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
                {completeForm.formState.errors.motivos && (
                  <p className="text-xs text-destructive">{completeForm.formState.errors.motivos.message}</p>
                )}
              </div>
            )}

            {/* Notas */}
            <div className="space-y-1.5">
              <Label>{isScheduleMode ? "Notas (opcional)" : "Notas del contacto"}</Label>
              <Textarea
                {...form.register("notas")}
                className="min-h-28 resize-none"
                placeholder={
                  isScheduleMode
                    ? "Observaciones sobre el agendamiento..."
                    : "Resumen de lo hablado, acuerdos y observaciones..."
                }
              />
              {form.formState.errors.notas && (
                <p className="text-xs text-destructive">{form.formState.errors.notas.message}</p>
              )}
            </div>

            {/* Motivo inconcluso */}
            {!isScheduleMode && selectedEstado === "inconcluso" && (
              <div className="space-y-1.5">
                <Label>Motivo de inconcluso</Label>
                <Textarea
                  {...completeForm.register("motivoInconcluso")}
                  className="min-h-20 resize-none"
                  placeholder="¿Por qué no se completó el contacto?"
                />
                {completeForm.formState.errors.motivoInconcluso && (
                  <p className="text-xs text-destructive">{completeForm.formState.errors.motivoInconcluso.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Intervenciones y cierre</CardTitle>
            <CardDescription>
              {isScheduleMode
                ? "Acciones que se vincularán al agendamiento."
                : "Agendá servicios desde este contacto y guardá todo junto."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isScheduleMode && (
              <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => setPsicoOpen(true)}>
                <Brain className="size-4 text-violet-500" />
                Agendar psicosesión
              </Button>
            )}
            {psicoDraft && (
              <p className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-md px-3 py-2">
                Psicosesión lista para guardar en el cierre del contacto.
              </p>
            )}

            {!isScheduleMode && (
              <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => setAlertOpen(true)}>
                <TriangleAlert className="size-4 text-amber-500" />
                Reportar alerta hospitalaria
              </Button>
            )}
            {alertDraft && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Alerta preparada para registrarse junto al contacto.
              </p>
            )}

            <div className="pt-2 border-t border-border/60">
              <Button type="submit" className="w-full" disabled={allPending}>
                {allPending
                  ? "Guardando..."
                  : isScheduleMode
                  ? "Agendar contacto"
                  : "Guardar contacto"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full mt-2"
                onClick={() => router.push(`/pacientes/${pacienteId}`)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient quick-update — solo en modo completar */}
        {!isScheduleMode && (
          <Card className="xl:col-span-3 border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Actualización rápida de ficha del paciente</CardTitle>
              <CardDescription>
                Estos datos se guardan con este contacto y se registran en campos actualizados.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {patientUpdateFields.map((key) => {
                const field = PROFILE_SECTIONS.flatMap((section) => section.fields).find((f) => f.key === key)
                const label = field?.label ?? key
                return (
                  <div key={key} className="space-y-1.5">
                    <Label>{label}</Label>
                    <Input {...patientForm.register(key)} />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </form>

      {/* Psico dialog */}
      <Dialog open={psicoOpen} onOpenChange={setPsicoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar psicosesión</DialogTitle>
            <DialogDescription>Esta programación quedará vinculada al contacto cuando guardes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-6">
            <div className="space-y-1.5">
              <Label>Voluntario / Psicólogo</Label>
              <Controller
                name="voluntarioId"
                control={psicoForm.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      psicoForm.setValue("slotId", "")
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar voluntario" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeVolunteers.map((vol) => (
                        <SelectItem key={String(vol.id)} value={String(vol.id)}>
                          {vol.nombre} {vol.apellido} — {vol.especialidad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Horario</Label>
              <Controller
                name="slotId"
                control={psicoForm.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!selectedVolunteer}>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          !selectedVolunteer ? "Primero seleccioná voluntario" : "Seleccionar horario"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {slotsForVolunteer.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {formatSlot(slot)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Modalidad</Label>
              <Controller
                name="modalidad"
                control={psicoForm.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as PsicoValues["modalidad"])}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llamada">Llamada</SelectItem>
                      <SelectItem value="videollamada">Videollamada</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPsicoOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={async () => {
                const valid = await psicoForm.trigger()
                if (!valid) return
                setPsicoDraft(psicoForm.getValues())
                setPsicoOpen(false)
              }}
            >
              Guardar programación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert dialog */}
      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar alerta hospitalaria</DialogTitle>
            <DialogDescription>La alerta se creará al guardar el contacto.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-6">
            <div className="space-y-1.5">
              <Label>Establecimiento</Label>
              <Controller
                name="hospital"
                control={alertForm.control}
                render={({ field }) => <HospitalSelect value={field.value} onChange={field.onChange} />}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Detalle</Label>
              <Textarea
                {...alertForm.register("detalle")}
                className="min-h-24 resize-none"
                placeholder="Describí el problema reportado por el paciente..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAlertOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={async () => {
                const valid = await alertForm.trigger()
                if (!valid) return
                setAlertDraft(alertForm.getValues())
                setAlertOpen(false)
              }}
            >
              Guardar alerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
