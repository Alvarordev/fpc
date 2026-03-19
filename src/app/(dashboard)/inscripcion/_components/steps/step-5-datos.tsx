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
import { CreditCard, MapPin, Phone, GraduationCap, ShieldCheck } from "lucide-react"
import { useEnrollmentStore } from "../../_store/enrollment-store"
import type { EnrollmentFormData } from "../../_types/enrollment-types"
import { PERU_DEPARTAMENTOS } from "../../_types/enrollment-types"
import { StepHeader } from "../step-header"
import { SectionHeader } from "../section-header"
import { StepNav } from "../step-nav"

const schema = z.object({
  q9_nombrePaciente: z.string().min(1, "Ingrese el nombre completo"),
  q10_dni: z.string().min(8, "Ingrese un DNI válido"),
  q11_fechaNacimiento: z.string().min(1, "Ingrese la fecha de nacimiento"),
  q12_lugarNacimiento: z.string().min(1, "Seleccione el departamento"),
  q13_direccion: z.string().min(1, "Ingrese la dirección"),
  q14_departamentoResidencia: z.string().min(1, "Seleccione el departamento"),
  q15_tiempoHospital: z.string(),
  q16_dniCoincide: z.string().min(1, "Seleccione una opción"),
  q17_telefono: z.string().min(1, "Ingrese el número de teléfono"),
  q18_telefonoAuxiliar: z.string(),
  q19_telefonoFamiliar: z.string(),
  q20_nombreFamiliar: z.string(),
  q21_tieneWhatsapp: z.string().min(1, "Seleccione una opción"),
  q22_gradoInstruccion: z.string().min(1, "Seleccione el grado"),
  q23_lenguaOriginaria: z.string().min(1, "Seleccione la lengua"),
  q24_requiereTraduccion: z.string().min(1, "Seleccione una opción"),
  q25_tieneSeguro: z.string().min(1, "Seleccione una opción"),
  q26_tipoSeguro: z.string(),
})

type FormValues = z.infer<typeof schema>

const fl = "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70"
const ic = "bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"
const sc = "w-full bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"

const GRADOS = [
  "Inicial", "Primaria incompleta", "Primaria", "Secundaria incompleta",
  "Secundaria", "Educación técnica", "Educación Técnica incompleta",
  "Educación superior", "Educación superior incompleta", "No cuenta con grado de instrucción",
]
const LENGUAS = ["Castellano/Español", "Quechua", "Aymara", "Lengua de señas", "Otros"]
const SEGUROS = ["SIS", "EsSalud", "EPS - Essalud", "Fuerzas Armadas", "Saludpol", "Privado"]

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive">{msg}</p>
}

export function Step5Datos() {
  const { formData, saveStepData, nextStep, prevStep } = useEnrollmentStore()
  const partial = formData as Partial<EnrollmentFormData>

  const {
    register, control, handleSubmit, watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      q9_nombrePaciente: partial.q9_nombrePaciente ?? "",
      q10_dni: partial.q10_dni ?? "",
      q11_fechaNacimiento: partial.q11_fechaNacimiento ?? "",
      q12_lugarNacimiento: partial.q12_lugarNacimiento ?? "",
      q13_direccion: partial.q13_direccion ?? "",
      q14_departamentoResidencia: partial.q14_departamentoResidencia ?? "",
      q15_tiempoHospital: partial.q15_tiempoHospital ?? "",
      q16_dniCoincide: partial.q16_dniCoincide ?? "",
      q17_telefono: partial.q17_telefono ?? "",
      q18_telefonoAuxiliar: partial.q18_telefonoAuxiliar ?? "",
      q19_telefonoFamiliar: partial.q19_telefonoFamiliar ?? "",
      q20_nombreFamiliar: partial.q20_nombreFamiliar ?? "",
      q21_tieneWhatsapp: partial.q21_tieneWhatsapp ?? "",
      q22_gradoInstruccion: partial.q22_gradoInstruccion ?? "",
      q23_lenguaOriginaria: partial.q23_lenguaOriginaria ?? "",
      q24_requiereTraduccion: partial.q24_requiereTraduccion ?? "",
      q25_tieneSeguro: partial.q25_tieneSeguro ?? "",
      q26_tipoSeguro: partial.q26_tipoSeguro ?? "",
    },
  })

  const tieneSeguro = watch("q25_tieneSeguro")

  const onSubmit = (values: FormValues) => {
    saveStepData(values)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
      <StepHeader
        step={5}
        title="Datos del Paciente"
        description="Complete los datos de identidad y contacto del paciente conforme a sus registros oficiales."
      />

      <section className="flex flex-col gap-5">
        <SectionHeader icon={CreditCard} title="Información de Identidad" />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="q10_dni" className={fl}>Tipo y número de DNI <span className="text-destructive">*</span></Label>
            <Input id="q10_dni" placeholder="e.g. 74829304" className={ic} aria-invalid={!!errors.q10_dni} {...register("q10_dni")} />
            <FieldError msg={errors.q10_dni?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="q11_fechaNacimiento" className={fl}>Fecha de nacimiento <span className="text-destructive">*</span></Label>
            <Input id="q11_fechaNacimiento" type="date" className={ic} aria-invalid={!!errors.q11_fechaNacimiento} {...register("q11_fechaNacimiento")} />
            <FieldError msg={errors.q11_fechaNacimiento?.message} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="q9_nombrePaciente" className={fl}>Nombre legal completo <span className="text-destructive">*</span></Label>
          <Input id="q9_nombrePaciente" placeholder="Tal como aparece en el documento de identidad" className={ic} aria-invalid={!!errors.q9_nombrePaciente} {...register("q9_nombrePaciente")} />
          <FieldError msg={errors.q9_nombrePaciente?.message} />
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader icon={MapPin} title="Residencia y Origen" />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className={fl}>Lugar de nacimiento <span className="text-destructive">*</span></Label>
            <Controller name="q12_lugarNacimiento" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={sc} aria-invalid={!!errors.q12_lugarNacimiento}><SelectValue placeholder="Departamento..." /></SelectTrigger>
                  <SelectContent>{[...PERU_DEPARTAMENTOS, "VENEZUELA", "Otros"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            <FieldError msg={errors.q12_lugarNacimiento?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className={fl}>Dpto. de residencia actual <span className="text-destructive">*</span></Label>
            <Controller name="q14_departamentoResidencia" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={sc} aria-invalid={!!errors.q14_departamentoResidencia}><SelectValue placeholder="Departamento..." /></SelectTrigger>
                  <SelectContent>{PERU_DEPARTAMENTOS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            <FieldError msg={errors.q14_departamentoResidencia?.message} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="q13_direccion" className={fl}>Dirección y distrito actuales <span className="text-destructive">*</span></Label>
          <Input id="q13_direccion" placeholder="Calle / Av. / Jr., número, distrito" className={ic} aria-invalid={!!errors.q13_direccion} {...register("q13_direccion")} />
          <FieldError msg={errors.q13_direccion?.message} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="q15_tiempoHospital" className={fl}>Tiempo al hospital</Label>
            <Input id="q15_tiempoHospital" placeholder="Ej: 30 min, 1 hora" className={ic} {...register("q15_tiempoHospital")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className={fl}>DNI coincide con domicilio <span className="text-destructive">*</span></Label>
            <Controller name="q16_dniCoincide" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={sc} aria-invalid={!!errors.q16_dniCoincide}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Si">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              )} />
            <FieldError msg={errors.q16_dniCoincide?.message} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader icon={Phone} title="Información de Contacto" />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="q17_telefono" className={fl}>Teléfono principal <span className="text-destructive">*</span></Label>
            <Input id="q17_telefono" placeholder="9XX XXX XXX" className={ic} aria-invalid={!!errors.q17_telefono} {...register("q17_telefono")} />
            <FieldError msg={errors.q17_telefono?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="q18_telefonoAuxiliar" className={fl}>Teléfono auxiliar</Label>
            <Input id="q18_telefonoAuxiliar" placeholder="9XX XXX XXX" className={ic} {...register("q18_telefonoAuxiliar")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="q19_telefonoFamiliar" className={fl}>Teléfono familiar / cuidador</Label>
            <Input id="q19_telefonoFamiliar" placeholder="9XX XXX XXX" className={ic} {...register("q19_telefonoFamiliar")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="q20_nombreFamiliar" className={fl}>Nombre del familiar / cuidador</Label>
            <Input id="q20_nombreFamiliar" placeholder="Nombre y apellidos" className={ic} {...register("q20_nombreFamiliar")} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label className={fl}>¿Los teléfonos tienen WhatsApp? <span className="text-destructive">*</span></Label>
          <Controller name="q21_tieneWhatsapp" control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={sc} aria-invalid={!!errors.q21_tieneWhatsapp}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            )} />
          <FieldError msg={errors.q21_tieneWhatsapp?.message} />
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader icon={GraduationCap} title="Perfil Socioeducativo" />
        <div className="flex flex-col gap-2">
          <Label className={fl}>Grado de instrucción <span className="text-destructive">*</span></Label>
          <Controller name="q22_gradoInstruccion" control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={sc} aria-invalid={!!errors.q22_gradoInstruccion}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>{GRADOS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          <FieldError msg={errors.q22_gradoInstruccion?.message} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className={fl}>Lengua originaria <span className="text-destructive">*</span></Label>
            <Controller name="q23_lenguaOriginaria" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={sc} aria-invalid={!!errors.q23_lenguaOriginaria}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{LENGUAS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            <FieldError msg={errors.q23_lenguaOriginaria?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className={fl}>¿Requiere traducción? <span className="text-destructive">*</span></Label>
            <Controller name="q24_requiereTraduccion" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={sc} aria-invalid={!!errors.q24_requiereTraduccion}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              )} />
            <FieldError msg={errors.q24_requiereTraduccion?.message} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader icon={ShieldCheck} title="Seguro de Salud" />
        <div className="flex flex-col gap-2">
          <Label className={fl}>¿Cuenta con seguro de salud? <span className="text-destructive">*</span></Label>
          <Controller name="q25_tieneSeguro" control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={sc} aria-invalid={!!errors.q25_tieneSeguro}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent><SelectItem value="Si">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            )} />
          <FieldError msg={errors.q25_tieneSeguro?.message} />
        </div>
        {tieneSeguro === "Si" && (
          <div className="flex flex-col gap-2">
            <Label className={fl}>¿Qué tipo de seguro tiene? <span className="text-destructive">*</span></Label>
            <Controller name="q26_tipoSeguro" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={sc}><SelectValue placeholder="Seleccionar tipo de seguro..." /></SelectTrigger>
                  <SelectContent>{SEGUROS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              )} />
          </div>
        )}
      </section>

      <StepNav currentStep={5} onPrev={prevStep} />
    </form>
  )
}
