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
import { UserCheck } from "lucide-react"
import { useEnrollmentStore } from "../../_store/enrollment-store"
import type { EnrollmentFormData } from "../../_types/enrollment-types"
import { StepHeader } from "../step-header"
import { SectionHeader } from "../section-header"
import { StepNav } from "../step-nav"

const schema = z
  .object({
    q5_esPacienteOnco: z.string(),
    q6_esFamiliar: z.string(),
    q7_nombreTercero: z.string(),
    _tipo: z.string(),
  })
  .refine(
    (data) => data._tipo !== "Para mi" || data.q5_esPacienteOnco !== "",
    { message: "Seleccione una opción", path: ["q5_esPacienteOnco"] },
  )
  .refine(
    (data) => data._tipo !== "Para un tercero (familar /amigo)" || data.q6_esFamiliar !== "",
    { message: "Seleccione una opción", path: ["q6_esFamiliar"] },
  )

type FormValues = z.infer<typeof schema>

const fieldLabel = "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70"
const triggerClass = "w-full bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"
const inputClass = "bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"

export function Step3Identificacion() {
  const { formData, saveStepData, nextStep, prevStep } = useEnrollmentStore()
  const partial = formData as Partial<EnrollmentFormData>
  const tipo = partial.q4_tipo ?? ""
  const isParaMi = tipo === "Para mi"
  const isParaTercero = tipo === "Para un tercero (familar /amigo)"

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      q5_esPacienteOnco: partial.q5_esPacienteOnco ?? "",
      q6_esFamiliar: partial.q6_esFamiliar ?? "",
      q7_nombreTercero: partial.q7_nombreTercero ?? "",
      _tipo: tipo,
    },
  })

  const onSubmit = (values: FormValues) => {
    const { _tipo: _, ...rest } = values
    saveStepData(rest)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <StepHeader
        step={3}
        title="Identificación del Llamante"
        description="Determine la relación del llamante con el paciente oncológico."
      />

      <div className="flex flex-col gap-6">
        <SectionHeader icon={UserCheck} title="Relación con el Paciente" />

        {isParaMi && (
          <div className="flex flex-col gap-2">
            <Label className={fieldLabel}>
              ¿Usted es paciente oncológico?
            </Label>
            <Controller
              name="q5_esPacienteOnco"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={triggerClass} aria-invalid={!!errors.q5_esPacienteOnco}>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sí">Sí, soy paciente oncológico</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.q5_esPacienteOnco && (
              <p className="text-xs text-destructive">{errors.q5_esPacienteOnco.message}</p>
            )}
          </div>
        )}

        {isParaTercero && (
          <>
            <div className="flex flex-col gap-2">
              <Label className={fieldLabel}>
                ¿Usted es familiar del paciente oncológico?
              </Label>
              <Controller
                name="q6_esFamiliar"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={triggerClass} aria-invalid={!!errors.q6_esFamiliar}>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sí">Sí, soy familiar</SelectItem>
                      <SelectItem value="No">No, soy amigo u otra persona</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.q6_esFamiliar && (
                <p className="text-xs text-destructive">{errors.q6_esFamiliar.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="q7_nombreTercero" className={fieldLabel}>
                Nombre completo del familiar o acompañante
              </Label>
              <Input
                id="q7_nombreTercero"
                placeholder="Nombre y apellidos de quien llama"
                className={inputClass}
                {...register("q7_nombreTercero")}
              />
            </div>
          </>
        )}

        {!isParaMi && !isParaTercero && (
          <div className="rounded-xl bg-card p-4 text-sm text-muted-foreground">
            Tipo de afiliación no definido. Regrese al paso anterior.
          </div>
        )}
      </div>

      <StepNav currentStep={3} onPrev={prevStep} />
    </form>
  )
}
