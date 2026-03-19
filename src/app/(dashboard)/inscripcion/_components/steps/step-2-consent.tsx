"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ShieldCheck, Users } from "lucide-react"
import { useEnrollmentStore } from "../../_store/enrollment-store"
import type { EnrollmentFormData } from "../../_types/enrollment-types"
import { StepHeader } from "../step-header"
import { SectionHeader } from "../section-header"
import { StepNav } from "../step-nav"

const schema = z.object({
  q3_acuerdo: z.string().min(1, "Seleccione una opción"),
  q4_tipo: z.string().min(1, "Seleccione una opción"),
})

type FormValues = z.infer<typeof schema>

const fieldLabel = "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70"
const triggerClass = "w-full bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"

export function Step2Consent() {
  const { formData, saveStepData, nextStep, prevStep, setRejection } = useEnrollmentStore()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      q3_acuerdo: (formData as Partial<EnrollmentFormData>).q3_acuerdo ?? "",
      q4_tipo: (formData as Partial<EnrollmentFormData>).q4_tipo ?? "",
    },
  })

  const onSubmit = (values: FormValues) => {
    saveStepData(values)
    if (values.q3_acuerdo === "No") {
      setRejection("q3_no")
      return
    }
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <StepHeader
        step={2}
        title="Consentimiento de Datos"
        description="Verifique el acuerdo del paciente con la política de datos e identifique quién realiza la afiliación."
      />

      <div className="flex flex-col gap-6">
        <SectionHeader icon={ShieldCheck} title="Autorización de Datos" />

        <div className="flex flex-col gap-2">
          <Label className={fieldLabel}>
            Acuerdo con la política de datos <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="q3_acuerdo"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={triggerClass} aria-invalid={!!errors.q3_acuerdo}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sí">Sí, está de acuerdo</SelectItem>
                  <SelectItem value="No">No, no está de acuerdo</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.q3_acuerdo && (
            <p className="text-xs text-destructive">{errors.q3_acuerdo.message}</p>
          )}
          <p className="text-xs text-muted-foreground/60">
            Si el paciente no está de acuerdo, la inscripción no puede continuar.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <SectionHeader icon={Users} title="Tipo de Afiliación" />

        <div className="flex flex-col gap-2">
          <Label className={fieldLabel}>
            ¿Afiliación para usted o para un familiar? <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="q4_tipo"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={triggerClass} aria-invalid={!!errors.q4_tipo}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Para mi">Para mí — soy el paciente</SelectItem>
                  <SelectItem value="Para un tercero (familar /amigo)">
                    Para un tercero — familiar o amigo
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.q4_tipo && <p className="text-xs text-destructive">{errors.q4_tipo.message}</p>}
        </div>
      </div>

      <StepNav currentStep={2} onPrev={prevStep} />
    </form>
  )
}
