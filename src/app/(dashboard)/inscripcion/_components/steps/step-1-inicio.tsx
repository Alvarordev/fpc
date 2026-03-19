"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { FileText, Clock } from "lucide-react"
import { useEnrollmentStore } from "../../_store/enrollment-store"
import type { EnrollmentFormData } from "../../_types/enrollment-types"
import { StepHeader } from "../step-header"
import { SectionHeader } from "../section-header"
import { StepNav } from "../step-nav"

const schema = z.object({
  q1_comentarios: z.string(),
  q2_horaInicio: z.string().min(1, "Ingrese la hora de inicio"),
})

type FormValues = z.infer<typeof schema>

const fieldLabel = "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70"

export function Step1Inicio() {
  const { formData, saveStepData, nextStep } = useEnrollmentStore()

  const now = new Date().toTimeString().slice(0, 5)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      q1_comentarios: (formData as Partial<EnrollmentFormData>).q1_comentarios ?? "",
      q2_horaInicio: (formData as Partial<EnrollmentFormData>).q2_horaInicio ?? now,
    },
  })

  const onSubmit = (values: FormValues) => {
    saveStepData(values)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <StepHeader
        step={1}
        title="Inicio de Afiliación"
        description="Registre los datos iniciales de la llamada antes de comenzar el proceso de inscripción."
      />

      <div className="flex flex-col gap-6">
        <SectionHeader icon={FileText} title="Notas del Caso" />

        <div className="flex flex-col gap-2">
          <Label htmlFor="q1_comentarios" className={fieldLabel}>
            Comentarios sobre el caso
          </Label>
          <Textarea
            id="q1_comentarios"
            placeholder="Anote los comentarios iniciales del paciente o familiar..."
            className="min-h-24 bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"
            {...register("q1_comentarios")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <SectionHeader icon={Clock} title="Registro de Tiempo" />

        <div className="flex flex-col gap-2">
          <Label htmlFor="q2_horaInicio" className={fieldLabel}>
            Hora de inicio de afiliación <span className="text-destructive">*</span>
          </Label>
          <Input
            id="q2_horaInicio"
            type="time"
            aria-invalid={!!errors.q2_horaInicio}
            className="max-w-48 bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"
            {...register("q2_horaInicio")}
          />
          {errors.q2_horaInicio && (
            <p className="text-xs text-destructive">{errors.q2_horaInicio.message}</p>
          )}
        </div>
      </div>

      <StepNav currentStep={1} isFirst />
    </form>
  )
}
