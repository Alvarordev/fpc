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
import { Tag } from "lucide-react"
import { useEnrollmentStore } from "../../_store/enrollment-store"
import type { EnrollmentFormData } from "../../_types/enrollment-types"
import { Q27_BRANCH_MAP } from "../../_types/enrollment-types"
import { StepHeader } from "../step-header"
import { SectionHeader } from "../section-header"
import { StepNav } from "../step-nav"

const Q27_OPTIONS = [
  "Signos y Síntomas / Seguro",
  "Signos y Sintomas / EPS-ESSALUD",
  "Signos y Sintomas / Privado",
  "Signos y Síntomas / No Seguro",
  "Diagnóstico de Cáncer / Seguro",
  "Diagnostico de Cancer / EPS-ESSALUD",
  "Diagnostico de Cancer / Privado",
  "Diagnóstico de Cáncer / No Seguro",
  "Servicio Psicooncológico",
  "Servicios FPC",
  "Otros",
]

const schema = z.object({
  q27_categoria: z.string().min(1, "Seleccione la categoría del paciente"),
})

type FormValues = z.infer<typeof schema>

const fl = "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70"
const sc = "w-full bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"

export function Step6Categoria() {
  const { formData, saveStepData, nextStep, prevStep, setRejection } = useEnrollmentStore()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      q27_categoria: (formData as Partial<EnrollmentFormData>).q27_categoria ?? "",
    },
  })

  const onSubmit = (values: FormValues) => {
    saveStepData(values)
    const branch = Q27_BRANCH_MAP[values.q27_categoria]
    if (branch === "signos_privado" || branch === "dx_privado") {
      setRejection("q27_privado")
      return
    }
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <StepHeader
        step={6}
        title="Categorización del Paciente"
        description="Seleccione la categoría que mejor describe la situación del paciente para determinar el flujo de atención."
      />

      <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-700/80">
          Aviso importante
        </p>
        <p className="text-sm leading-relaxed text-foreground/70">
          Esta selección determina las preguntas del siguiente paso. Los pacientes con seguro
          privado (EPS particular) no son elegibles para el Programa SEPA.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <SectionHeader icon={Tag} title="Perfil Clínico" />

        <div className="flex flex-col gap-2">
          <Label className={fl}>
            Categorización del paciente <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="q27_categoria"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={sc} aria-invalid={!!errors.q27_categoria}>
                  <SelectValue placeholder="Seleccionar categoría..." />
                </SelectTrigger>
                <SelectContent>
                  {Q27_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.q27_categoria && (
            <p className="text-xs text-destructive">{errors.q27_categoria.message}</p>
          )}
        </div>
      </div>

      <StepNav currentStep={6} onPrev={prevStep} />
    </form>
  )
}
