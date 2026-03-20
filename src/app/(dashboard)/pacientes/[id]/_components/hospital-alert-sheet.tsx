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
import { HospitalSelect } from "@/components/hospital-select"
import { useHospitals, useCreateHospitalAlert } from "@/hooks/use-hospitals"
import { useAuthStore } from "@/store/auth-store"

const schema = z.object({
  hospitalNombre: z.string().min(1, "Seleccione un establecimiento"),
  detalle: z.string().min(5, "Describa el problema"),
  fecha: z.string().min(1, "Fecha requerida"),
})

type FormValues = z.infer<typeof schema>

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

interface HospitalAlertSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId: string
}

export function HospitalAlertSheet({ open, onOpenChange, pacienteId }: HospitalAlertSheetProps) {
  const user = useAuthStore((s) => s.user)
  const { data: hospitals = [] } = useHospitals()
  const createAlert = useCreateHospitalAlert()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hospitalNombre: "",
      detalle: "",
      fecha: todayISO(),
    },
  })

  async function onSubmit(values: FormValues) {
    const hospital = hospitals.find((h) => h.nombre === values.hospitalNombre)
    if (!hospital) return

    await createAlert.mutateAsync({
      hospitalId: hospital.id,
      pacienteId,
      agenteId: String(user?.id ?? ""),
      detalle: values.detalle,
      fecha: values.fecha,
      estado: "activa",
    })

    reset({ hospitalNombre: "", detalle: "", fecha: todayISO() })
    onOpenChange(false)
  }

  function handleOpenChange(val: boolean) {
    if (!val) reset({ hospitalNombre: "", detalle: "", fecha: todayISO() })
    onOpenChange(val)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60">
          <SheetTitle>Reportar alerta de hospital</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex-1 space-y-5 p-6">
            <div className="space-y-1.5">
              <Label className="text-sm">Establecimiento</Label>
              <Controller
                name="hospitalNombre"
                control={control}
                render={({ field }) => (
                  <HospitalSelect value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.hospitalNombre && (
                <p className="text-xs text-destructive">{errors.hospitalNombre.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Fecha</Label>
              <Input type="date" {...register("fecha")} className="h-9" />
              {errors.fecha && <p className="text-xs text-destructive">{errors.fecha.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Descripción del problema</Label>
              <Textarea
                {...register("detalle")}
                placeholder="Describa el problema reportado por el paciente en este establecimiento..."
                className="min-h-32 text-sm resize-none"
              />
              {errors.detalle && (
                <p className="text-xs text-destructive">{errors.detalle.message}</p>
              )}
            </div>
          </div>

          <SheetFooter className="border-t border-border/60">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creando alerta..." : "Crear alerta"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
