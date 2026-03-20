"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SlotPreviewList } from "./slot-preview-list"
import { useCreateSlot, useCreateBulkSlots } from "../_hooks/use-availability"
import type { BulkSlotPayload } from "../_hooks/use-availability"

const TODAY = new Date().toISOString().slice(0, 10)

const singleSchema = z
  .object({
    fecha: z.string().min(1, "Requerido").refine((v) => v >= TODAY, "La fecha debe ser hoy o futura"),
    horaInicio: z.string().min(1, "Requerido"),
    horaFin: z.string().min(1, "Requerido"),
  })
  .refine((d) => d.horaFin > d.horaInicio, {
    message: "La hora de fin debe ser posterior al inicio",
    path: ["horaFin"],
  })

type SingleForm = z.infer<typeof singleSchema>

const recurringSchema = z.object({
  diaSemana: z.string().min(1, "Requerido"),
  horaInicio: z.string().min(1, "Requerido"),
  horaFin: z.string().min(1, "Requerido"),
  semanas: z.string().min(1, "Requerido"),
})

type RecurringForm = z.infer<typeof recurringSchema>

const DIAS = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "0", label: "Domingo" },
]

function computeRecurringDates(
  diaSemana: number,
  horaInicio: string,
  horaFin: string,
  semanas: number
): BulkSlotPayload[] {
  const result: BulkSlotPayload[] = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  for (let w = 0; w < semanas; w++) {
    const date = new Date(now)
    const currentDay = date.getDay()
    const diff = ((diaSemana - currentDay) + 7) % 7
    date.setDate(date.getDate() + diff + w * 7)

    if (date < now) continue
    const fecha = date.toISOString().slice(0, 10)
    if (fecha >= TODAY) {
      result.push({ fecha, horaInicio, horaFin })
    }
  }

  return result
}

interface AddAvailabilitySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voluntarioId: string
  defaultDate?: string
}

export function AddAvailabilitySheet({
  open,
  onOpenChange,
  voluntarioId,
  defaultDate,
}: AddAvailabilitySheetProps) {
  const [tab, setTab] = useState("individual")
  const createSlot = useCreateSlot(voluntarioId)
  const createBulk = useCreateBulkSlots(voluntarioId)

  const singleForm = useForm<SingleForm>({
    resolver: zodResolver(singleSchema),
    defaultValues: { fecha: defaultDate ?? "", horaInicio: "", horaFin: "" },
  })

  const recurringForm = useForm<RecurringForm>({
    resolver: zodResolver(recurringSchema),
    defaultValues: { diaSemana: "", horaInicio: "", horaFin: "", semanas: "4" },
  })

  const recurringValues = recurringForm.watch()
  const previewSlots =
    recurringValues.diaSemana && recurringValues.horaInicio && recurringValues.horaFin && recurringValues.semanas
      ? computeRecurringDates(
          Number(recurringValues.diaSemana),
          recurringValues.horaInicio,
          recurringValues.horaFin,
          Number(recurringValues.semanas)
        )
      : []

  function handleClose() {
    singleForm.reset({ fecha: "", horaInicio: "", horaFin: "" })
    recurringForm.reset({ diaSemana: "", horaInicio: "", horaFin: "", semanas: "4" })
    onOpenChange(false)
  }

  async function onSingleSubmit(values: SingleForm) {
    await createSlot.mutateAsync({
      voluntarioId: Number(voluntarioId),
      fecha: values.fecha,
      horaInicio: values.horaInicio,
      horaFin: values.horaFin,
      estado: "disponible",
    })
    handleClose()
  }

  async function onRecurringSubmit() {
    if (previewSlots.length === 0) return
    await createBulk.mutateAsync(previewSlots)
    handleClose()
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Agregar disponibilidad</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="individual" className="flex-1">Fecha individual</TabsTrigger>
              <TabsTrigger value="recurrente" className="flex-1">Recurrente</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Fecha</Label>
                <Input
                  type="date"
                  min={TODAY}
                  {...singleForm.register("fecha")}
                  className="h-9 text-sm"
                />
                {singleForm.formState.errors.fecha && (
                  <p className="text-xs text-destructive">{singleForm.formState.errors.fecha.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Hora inicio</Label>
                  <Input
                    type="time"
                    {...singleForm.register("horaInicio")}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Hora fin</Label>
                  <Input
                    type="time"
                    {...singleForm.register("horaFin")}
                    className="h-9 text-sm"
                  />
                  {singleForm.formState.errors.horaFin && (
                    <p className="text-xs text-destructive">{singleForm.formState.errors.horaFin.message}</p>
                  )}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={singleForm.handleSubmit(onSingleSubmit)}
                disabled={createSlot.isPending}
              >
                {createSlot.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </TabsContent>

            <TabsContent value="recurrente" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Día de la semana</Label>
                <Select
                  value={recurringForm.watch("diaSemana")}
                  onValueChange={(v) => recurringForm.setValue("diaSemana", v ?? "")}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Seleccionar día" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Hora inicio</Label>
                  <Input
                    type="time"
                    {...recurringForm.register("horaInicio")}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Hora fin</Label>
                  <Input
                    type="time"
                    {...recurringForm.register("horaFin")}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Número de semanas</Label>
                <Select
                  value={recurringForm.watch("semanas")}
                  onValueChange={(v) => recurringForm.setValue("semanas", v ?? "4")}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Semanas" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "semana" : "semanas"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {previewSlots.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs">Vista previa ({previewSlots.length} fechas)</Label>
                  <SlotPreviewList slots={previewSlots} />
                </div>
              )}

              <Button
                className="w-full"
                onClick={recurringForm.handleSubmit(onRecurringSubmit)}
                disabled={createBulk.isPending || previewSlots.length === 0}
              >
                {createBulk.isPending
                  ? "Guardando..."
                  : `Crear ${previewSlots.length} slot${previewSlots.length !== 1 ? "s" : ""}`}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
