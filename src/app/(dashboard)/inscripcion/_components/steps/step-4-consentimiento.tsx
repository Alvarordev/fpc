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
import { ClipboardList } from "lucide-react"
import { useEnrollmentStore } from "../../_store/enrollment-store"
import type { EnrollmentFormData } from "../../_types/enrollment-types"
import { StepHeader } from "../step-header"
import { SectionHeader } from "../section-header"
import { StepNav } from "../step-nav"

const schema = z.object({
  q8_consentimiento: z.string().min(1, "Seleccione una opción"),
})

type FormValues = z.infer<typeof schema>

const fieldLabel = "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70"
const triggerClass = "w-full bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"

export function Step4Consentimiento() {
  const { formData, saveStepData, nextStep, prevStep, setRejection } = useEnrollmentStore()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      q8_consentimiento: (formData as Partial<EnrollmentFormData>).q8_consentimiento ?? "",
    },
  })

  const onSubmit = (values: FormValues) => {
    saveStepData(values)
    if (values.q8_consentimiento === "No acepto") {
      setRejection("q8_no")
      return
    }
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <StepHeader
        step={4}
        title="Consentimiento Informado"
        description="Lea el consentimiento al paciente y registre su respuesta."
      />

      <div className="rounded-xl border border-primary/15 bg-primary/5 p-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary/70">
          Instrucción para el agente
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          Lea el consentimiento informado completo disponible en el panel derecho. Al finalizar la
          lectura, solicite al paciente que confirme si acepta o no acepta su participación en el
          Programa SEPA y el uso de sus datos personales.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <SectionHeader icon={ClipboardList} title="Respuesta del Paciente" />

        <div className="flex flex-col gap-2">
          <Label className={fieldLabel}>
            Consentimiento informado <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="q8_consentimiento"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={triggerClass} aria-invalid={!!errors.q8_consentimiento}>
                  <SelectValue placeholder="Seleccionar respuesta del paciente..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Acepto">Acepto — el paciente acepta</SelectItem>
                  <SelectItem value="No acepto">No acepto — el paciente no acepta</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.q8_consentimiento && (
            <p className="text-xs text-destructive">{errors.q8_consentimiento.message}</p>
          )}
          <p className="text-xs text-muted-foreground/60">
            Si el paciente no acepta, la inscripción finalizará en este paso.
          </p>
        </div>
      </div>

      <StepNav currentStep={4} onPrev={prevStep} />
    </form>
  )
}
