"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Clock, ClipboardCheck } from "lucide-react"
import { useEnrollmentStore } from "../../_store/enrollment-store"
import type { EnrollmentFormData } from "../../_types/enrollment-types"
import { StepHeader } from "../step-header"
import { SectionHeader } from "../section-header"
import { StepNav } from "../step-nav"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"

const schema = z.object({
  q132_encuestaAceptada: z.string().min(1, "Seleccione una opción"),
  q133_horaFin: z.string().min(1, "Ingrese la hora de fin"),
})

type FormValues = z.infer<typeof schema>

const fl = "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70"
const ic = "max-w-48 bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"
const sc = "w-full bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"

async function submitEnrollment(data: Partial<EnrollmentFormData>) {
  const res = await fetch("http://localhost:3001/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      fechaCreacion: new Date().toISOString(),
      estado: "activo",
    }),
  })
  if (!res.ok) throw new Error("Error al guardar")
  return res.json()
}

export function Step8Cierre() {
  const { formData, saveStepData, prevStep, completeEnrollment, resetEnrollment, isComplete } =
    useEnrollmentStore()
  const partial = formData as Partial<EnrollmentFormData>
  const now = new Date().toTimeString().slice(0, 5)

  const {
    control, register, handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      q132_encuestaAceptada: partial.q132_encuestaAceptada ?? "",
      q133_horaFin: partial.q133_horaFin ?? now,
    },
  })

  const mutation = useMutation({
    mutationFn: submitEnrollment,
    onSuccess: () => completeEnrollment(),
  })

  const onSubmit = (values: FormValues) => {
    saveStepData(values)
    mutation.mutate({ ...partial, ...values })
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
          Inscripción completada
        </p>
        <h2 className="mb-3 text-2xl font-bold text-foreground">Registro exitoso</h2>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
          El paciente ha sido registrado exitosamente en el Programa SEPA. Los datos han sido
          guardados en el sistema.
        </p>
        <Button onClick={resetEnrollment} size="lg" className="px-8">
          Nueva inscripción
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <StepHeader
        step={8}
        title="Cierre de Llamada"
        description="Registre el cierre de la sesión y confirme la encuesta de satisfacción."
      />

      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-emerald-700/80">
          Resumen de la inscripción
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">Paciente</span>
          <span className="font-medium">{partial.q9_nombrePaciente ?? "—"}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">DNI</span>
          <span className="font-medium">{partial.q10_dni ?? "—"}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">Categoría</span>
          <span className="font-medium">{partial.q27_categoria ?? "—"}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">Inicio</span>
          <span className="font-medium">{partial.q2_horaInicio ?? "—"}</span>
        </div>
      </div>

      <section className="flex flex-col gap-5">
        <SectionHeader icon={ClipboardCheck} title="Encuesta de Satisfacción" />
        <div className="flex flex-col gap-2">
          <Label className={fl}>¿El paciente acepta la encuesta? <span className="text-destructive">*</span></Label>
          <Controller name="q132_encuestaAceptada" control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={sc} aria-invalid={!!errors.q132_encuestaAceptada}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sí">Sí, acepta participar</SelectItem>
                  <SelectItem value="No">No desea participar</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.q132_encuestaAceptada && (
            <p className="text-xs text-destructive">{errors.q132_encuestaAceptada.message}</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader icon={Clock} title="Registro de Tiempo" />
        <div className="flex flex-col gap-2">
          <Label htmlFor="q133_horaFin" className={fl}>Hora de fin de llamada <span className="text-destructive">*</span></Label>
          <Input
            id="q133_horaFin"
            type="time"
            className={ic}
            aria-invalid={!!errors.q133_horaFin}
            {...register("q133_horaFin")}
          />
          {errors.q133_horaFin && (
            <p className="text-xs text-destructive">{errors.q133_horaFin.message}</p>
          )}
        </div>
      </section>

      {mutation.isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Error al guardar. Verifique que el servidor esté activo (
            <code className="rounded bg-destructive/10 px-1">pnpm server</code>) e intente
            nuevamente.
          </p>
        </div>
      )}

      <StepNav
        currentStep={8}
        onPrev={prevStep}
        isLast
        isLoading={mutation.isPending}
      />
    </form>
  )
}
