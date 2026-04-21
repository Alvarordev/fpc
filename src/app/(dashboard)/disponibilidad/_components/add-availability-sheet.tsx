"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { cn } from "@/lib/utils"
import { SlotPreviewList } from "./slot-preview-list"
import { useCreateSlot, useCreateBulkSlots } from "../_hooks/use-availability"
import type { BulkSlotPayload } from "../_hooks/use-availability"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  horaInicio: z.string().min(1, "Requerido"),
  horaFin: z.string().min(1, "Requerido"),
  semanas: z.string().min(1, "Requerido"),
})

type RecurringForm = z.infer<typeof recurringSchema>

const DIAS = [
  { value: 1, label: "L", title: "Lunes" },
  { value: 2, label: "M", title: "Martes" },
  { value: 3, label: "X", title: "Miércoles" },
  { value: 4, label: "J", title: "Jueves" },
  { value: 5, label: "V", title: "Viernes" },
  { value: 6, label: "S", title: "Sábado" },
  { value: 0, label: "D", title: "Domingo" },
]

function computeRecurringDates(
  diasSemana: number[],
  horaInicio: string,
  horaFin: string,
  semanas: number
): BulkSlotPayload[] {
  const result: BulkSlotPayload[] = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  for (const dia of diasSemana) {
    for (let w = 0; w < semanas; w++) {
      const date = new Date(now)
      const currentDay = date.getDay()
      const diff = ((dia - currentDay) + 7) % 7
      date.setDate(date.getDate() + diff + w * 7)
      date.setHours(0, 0, 0, 0)

      if (date < now) continue
      const fecha = date.toISOString().slice(0, 10)
      if (fecha >= TODAY) {
        result.push({ fecha, horaInicio, horaFin })
      }
    }
  }

  return result.sort((a, b) => a.fecha.localeCompare(b.fecha))
}

interface SheetFormProps {
  voluntarioId: string
  defaultDate?: string
  selectedWeekday?: number
  onClose: () => void
  side?: "left" | "right"
}

function SheetForm({ voluntarioId, defaultDate, selectedWeekday, onClose, side = "right" }: SheetFormProps) {
  const [tab, setTab] = useState("individual")
  const [selectedDias, setSelectedDias] = useState<number[]>(
    typeof selectedWeekday === "number" ? [selectedWeekday] : []
  )
  const createSlot = useCreateSlot(voluntarioId)
  const createBulk = useCreateBulkSlots(voluntarioId)

  const singleForm = useForm<SingleForm>({
    resolver: zodResolver(singleSchema),
    defaultValues: { fecha: defaultDate ?? "", horaInicio: "", horaFin: "" },
  })

  const recurringForm = useForm<RecurringForm>({
    resolver: zodResolver(recurringSchema),
    defaultValues: { horaInicio: "", horaFin: "", semanas: "4" },
  })

  const recurringValues = recurringForm.watch()
  const previewSlots =
    selectedDias.length > 0 && recurringValues.horaInicio && recurringValues.horaFin && recurringValues.semanas
      ? computeRecurringDates(
          selectedDias,
          recurringValues.horaInicio,
          recurringValues.horaFin,
          Number(recurringValues.semanas)
        )
      : []

  function toggleDia(value: number) {
    setSelectedDias((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    )
  }

  async function onSingleSubmit(values: SingleForm) {
    await createSlot.mutateAsync({
      fecha: values.fecha,
      horaInicio: values.horaInicio,
      horaFin: values.horaFin,
      estado: "disponible",
    })
    onClose()
  }

  async function onRecurringSubmit() {
    if (previewSlots.length === 0) return
    await createBulk.mutateAsync(previewSlots)
    onClose()
  }

  return (
    <div className={cn("px-5 pb-5", side === "left" ? "pr-6" : "pl-6")}>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="individual" className="flex-1">Fecha individual</TabsTrigger>
          <TabsTrigger value="recurrente" className="flex-1">Recurrente</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="mt-5 space-y-4">
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
              {singleForm.formState.errors.horaInicio && (
                <p className="text-xs text-destructive">{singleForm.formState.errors.horaInicio.message}</p>
              )}
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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={singleForm.handleSubmit(onSingleSubmit)}
              disabled={createSlot.isPending}
            >
              {createSlot.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="recurrente" className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Días de la semana</Label>
            <div className="flex gap-1.5">
              {DIAS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  title={d.title}
                  onClick={() => toggleDia(d.value)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-xs font-semibold border transition-colors",
                    selectedDias.includes(d.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {selectedDias.length === 0 && (
              <p className="text-xs text-muted-foreground">Selecciona al menos un día.</p>
            )}
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
              <Label className="text-xs">Vista previa — {previewSlots.length} slot{previewSlots.length !== 1 ? "s" : ""}</Label>
              <SlotPreviewList slots={previewSlots} />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={recurringForm.handleSubmit(onRecurringSubmit)}
              disabled={createBulk.isPending || previewSlots.length === 0 || selectedDias.length === 0}
            >
              {createBulk.isPending
                ? "Guardando..."
                : previewSlots.length === 0
                ? "Selecciona días y horario"
                : `Crear ${previewSlots.length} slot${previewSlots.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AddAvailabilitySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voluntarioId: string
  defaultDate?: string
  selectedWeekday?: number
  anchorPosition?: { x: number; y: number; side: "left" | "right" }
}

export function AddAvailabilitySheet({
  open,
  onOpenChange,
  voluntarioId,
  defaultDate,
  selectedWeekday,
  anchorPosition,
}: AddAvailabilitySheetProps) {
  function handleClose() {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        noOverlay
        showCloseButton={false}
        className="w-[360px] max-w-[calc(100vw-2rem)] p-0"
        style={
          anchorPosition
            ? {
                top: `${anchorPosition.y}px`,
                left: `${anchorPosition.x}px`,
                transform: "none",
              }
            : undefined
        }
      >
        <DialogHeader className="px-5 pt-5 pb-4">
          <DialogTitle>Agregar disponibilidad</DialogTitle>
        </DialogHeader>
        <SheetForm
          key={`${open ? "open" : "closed"}-${defaultDate ?? "none"}-${selectedWeekday ?? "none"}`}
          voluntarioId={voluntarioId}
          defaultDate={defaultDate}
          selectedWeekday={selectedWeekday}
          onClose={handleClose}
          side={anchorPosition?.side}
        />
      </DialogContent>
    </Dialog>
  )
}
