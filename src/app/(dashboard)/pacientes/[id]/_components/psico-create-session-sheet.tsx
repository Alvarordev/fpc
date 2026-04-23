"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PsicoSession } from "@/types/follow-up"
import type { AvailabilitySlot } from "@/types/volunteer"
import { useVolunteers, useAvailableSlots, useCreatePsicoSession } from "../_hooks/use-psico-sessions"

const schema = z.object({
  voluntarioId: z.string().min(1, "Seleccione un voluntario"),
  slotId: z.string().min(1, "Seleccione un horario"),
  modalidad: z.enum(["llamada", "videollamada"]),
})

type FormValues = z.infer<typeof schema>

function formatSlot(slot: AvailabilitySlot): string {
  const date = new Date(slot.fecha + "T12:00:00").toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
  return `${date} — ${slot.horaInicio} a ${slot.horaFin}`
}

interface PsicoCreateSessionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId: string
  existingSessions: PsicoSession[]
}

export function PsicoCreateSessionSheet({
  open,
  onOpenChange,
  pacienteId,
  existingSessions,
}: PsicoCreateSessionSheetProps) {
  const createSession = useCreatePsicoSession(pacienteId)

  const { control, watch, handleSubmit, reset, formState: { isSubmitting, errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { voluntarioId: "", slotId: "", modalidad: "llamada" },
    })

  const selectedVoluntarioId = watch("voluntarioId")

  const { data: volunteers = [] } = useVolunteers()
  const { data: availableSlots = [] } = useAvailableSlots(selectedVoluntarioId)

  const activeVolunteers = volunteers.filter((v) => v.estado === "activo")
  const slotsForVolunteer = availableSlots.filter(
    (s) => s.voluntarioId === selectedVoluntarioId
  )

  async function onSubmit(values: FormValues) {
    const slot = availableSlots.find((s) => s.id === values.slotId)
    if (!slot) return

    const sesionNumero = existingSessions.length + 1

    const newSession: PsicoSession & { id: string } = {
      id: `ps${Date.now()}`,
      pacienteId,
      voluntarioId: values.voluntarioId,
      availabilitySlotId: values.slotId,
      sesionNumero,
      fecha: slot.fecha,
      horaInicio: slot.horaInicio,
      horaFin: slot.horaFin,
      modalidad: values.modalidad,
      estado: "programada",
      notas: "",
    }

    await createSession.mutateAsync({ session: newSession, slotId: values.slotId })
    reset()
    onOpenChange(false)
  }

  function handleOpenChange(open: boolean) {
    if (!open) reset()
    onOpenChange(open)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60">
          <SheetTitle>Agendar sesión de psicooncología</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex-1 space-y-5 p-6">
            <div className="space-y-1.5">
              <Label className="text-sm">Voluntario / Psicólogo</Label>
              <Controller
                name="voluntarioId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar voluntario" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeVolunteers.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.nombre} {v.apellido} — {v.especialidad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.voluntarioId && (
                <p className="text-xs text-destructive">{errors.voluntarioId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Horario disponible</Label>
              <Controller
                name="slotId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedVoluntarioId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          selectedVoluntarioId
                            ? slotsForVolunteer.length === 0
                              ? "Sin horarios disponibles"
                              : "Seleccionar horario"
                            : "Primero seleccione un voluntario"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {slotsForVolunteer
                        .sort((a, b) => a.fecha.localeCompare(b.fecha))
                        .map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {formatSlot(slot)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.slotId && (
                <p className="text-xs text-destructive">{errors.slotId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Medio de consulta</Label>
              <Controller
                name="modalidad"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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

          <SheetFooter className="border-t border-border/60">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Agendando..." : "Agendar sesión"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
