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
import { MOTIVOS_CONFIG } from "@/types/follow-up"
import { useAuthStore } from "@/store/auth-store"
import { useCreateFollowUpCall } from "../_hooks/use-follow-up"

const schema = z.object({
  tipo: z.enum(["saliente", "entrante"]),
  fecha: z.string().min(1, "Fecha requerida"),
  horaInicio: z.string().min(1, "Hora de inicio requerida"),
  horaFin: z.string().min(1, "Hora de fin requerida"),
  motivos: z.array(z.string()).min(1, "Seleccione al menos un motivo"),
  notas: z.string(),
  proximaLlamada: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

interface FollowUpCallSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId: string
}

export function FollowUpCallSheet({ open, onOpenChange, pacienteId }: FollowUpCallSheetProps) {
  const user = useAuthStore((s) => s.user)
  const createCall = useCreateFollowUpCall(pacienteId)

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
      fecha: todayISO(),
      horaInicio: "",
      horaFin: "",
      motivos: [],
      notas: "",
      proximaLlamada: "",
    },
  })

  const selectedMotivos = watch("motivos")

  function toggleMotivo(key: string) {
    const current = selectedMotivos
    setValue(
      "motivos",
      current.includes(key) ? current.filter((m) => m !== key) : [...current, key],
      { shouldValidate: true }
    )
  }

  async function onSubmit(values: FormValues) {
    await createCall.mutateAsync({
      id: `fuc${Date.now()}`,
      pacienteId,
      agenteId: String(user?.id ?? ""),
      fecha: values.fecha,
      horaInicio: values.horaInicio,
      horaFin: values.horaFin,
      tipo: values.tipo,
      motivos: values.motivos,
      notas: values.notas,
      camposActualizados: [],
      ...(values.proximaLlamada ? { proximaLlamada: values.proximaLlamada } : {}),
    })
    reset({ tipo: "saliente", fecha: todayISO(), horaInicio: "", horaFin: "", motivos: [], notas: "", proximaLlamada: "" })
    onOpenChange(false)
  }

  function handleOpenChange(open: boolean) {
    if (!open) reset({ tipo: "saliente", fecha: todayISO(), horaInicio: "", horaFin: "", motivos: [], notas: "", proximaLlamada: "" })
    onOpenChange(open)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60">
          <SheetTitle>Registrar llamada de seguimiento</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex-1 space-y-5 p-6">
            <div className="space-y-1.5">
              <Label className="text-sm">Tipo de llamada</Label>
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saliente">Llamada saliente (del agente al paciente)</SelectItem>
                      <SelectItem value="entrante">Llamada entrante (del paciente al agente)</SelectItem>
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
                Si acordó una próxima comunicación, indique la fecha aquí.
              </p>
            </div>
          </div>

          <SheetFooter className="border-t border-border/60">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar llamada"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
