"use client"

import { useForm, Controller } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Activity, Hospital, Stethoscope, HeartPulse } from "lucide-react"
import { useEnrollmentStore } from "../../_store/enrollment-store"
import type { EnrollmentFormData } from "../../_types/enrollment-types"
import { Q27_BRANCH_MAP, BRANCH_LABELS } from "../../_types/enrollment-types"
import { StepHeader } from "../step-header"
import { SectionHeader } from "../section-header"
import { StepNav } from "../step-nav"

const fl = "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70"
const ic = "bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"
const sc = "w-full bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"

const EPS_OPTIONS = [
  "PACIFICO SEGUROS", "RIMAC SEGUROS", "MAPFRE SEGUROS",
  "POSITIVA SEGUROS", "SANITAS", "ONCOSALUD", "Otros",
]

const TIPOS_CANCER = [
  "Mama", "Cervicouterino", "Pulmón", "Próstata", "Colon / Recto",
  "Leucemia", "Linfoma", "Estómago", "Piel", "Tiroides",
  "Hígado", "Páncreas", "Ovario", "Otros",
]

function F({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className={fl}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function YN({ name, control }: { name: string; control: ReturnType<typeof useForm>["control"] }) {
  return (
    <Controller name={name} control={control} defaultValue=""
      render={({ field }) => (
        <Select value={field.value as string} onValueChange={field.onChange}>
          <SelectTrigger className={sc}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Sí">Sí</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
      )}
    />
  )
}

function TF({ name, control, placeholder, multi }: {
  name: string; control: ReturnType<typeof useForm>["control"]
  placeholder?: string; multi?: boolean
}) {
  return (
    <Controller name={name} control={control} defaultValue=""
      render={({ field }) =>
        multi ? (
          <Textarea
            placeholder={placeholder}
            value={field.value as string}
            onChange={(e) => field.onChange(e.target.value)}
            className={ic}
          />
        ) : (
          <Input
            placeholder={placeholder}
            value={field.value as string}
            onChange={(e) => field.onChange(e.target.value)}
            className={ic}
          />
        )
      }
    />
  )
}

function BranchSignosSeguro({ control }: { control: ReturnType<typeof useForm>["control"] }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Activity} title="Signos y Síntomas" />
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Ha presentado algún malestar?"><YN name="q28_malestares" control={control} /></F>
          <F label="¿Ha solicitado consulta médica?"><YN name="q31_solicitoConsulta" control={control} /></F>
        </div>
        <F label="Signos o síntomas / motivación para examen"><TF name="q30_signosSintomas" control={control} placeholder="Describa los signos o síntomas presentados..." multi /></F>
        <F label="Comentarios"><TF name="q29_comentarios_ss" control={control} placeholder="Comentarios adicionales..." multi /></F>
      </section>
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Hospital} title="Atención Médica" />
        <div className="grid grid-cols-2 gap-4">
          <F label="Establecimiento de salud"><TF name="q32_establecimiento" control={control} placeholder="Nombre del establecimiento" /></F>
          <F label="Especialidad médica"><TF name="q33_especialidad" control={control} placeholder="Ej: Oncología" /></F>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <F label="Fecha de 1ra consulta"><TF name="q34_primeraConsulta" control={control} placeholder="Fecha aproximada" /></F>
          <F label="Tiempo esperando diagnóstico"><TF name="q35_tiempoEspera" control={control} placeholder="Ej: 3 meses" /></F>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Hoja de referencia?"><YN name="q36_hojaReferencia" control={control} /></F>
          <F label="¿Tratamiento brindado?"><YN name="q40_tieneTratamiento" control={control} /></F>
        </div>
        <F label="Referido a / Motivo sin hoja"><TF name="q37_referidoA" control={control} placeholder="Establecimiento de referencia o motivo" /></F>
        <F label="Diagnóstico recibido"><TF name="q38_diagnostico" control={control} placeholder="Diagnóstico o presunción diagnóstica" /></F>
        <F label="Siguiente consulta / Motivo sin cita"><TF name="q39_siguienteConsulta" control={control} placeholder="Fecha o motivo" /></F>
        <F label="Tipo y frecuencia de tratamiento"><TF name="q41_tratamiento" control={control} placeholder="Describe el tratamiento y su frecuencia" multi /></F>
        <F label="¿Familiares interesados en charlas?"><YN name="q42_familiaresCharlas" control={control} /></F>
      </section>
    </div>
  )
}

function BranchSignosEPS({ control }: { control: ReturnType<typeof useForm>["control"] }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Activity} title="Datos del Seguro EPS" />
        <F label="EPS del paciente">
          <Controller name="q43_eps" control={control} defaultValue=""
            render={({ field }) => (
              <Select value={field.value as string} onValueChange={field.onChange}>
                <SelectTrigger className={sc}><SelectValue placeholder="Seleccionar EPS..." /></SelectTrigger>
                <SelectContent>{EPS_OPTIONS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            )}
          />
        </F>
        <F label="Signos o síntomas presentados"><TF name="q44_signosSintomas_eps" control={control} placeholder="Describa los signos o síntomas..." multi /></F>
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Ha solicitado consulta médica?"><YN name="q45_solicitoConsulta_eps" control={control} /></F>
          <F label="Tiempo esperando diagnóstico"><TF name="q50_tiempoEspera_eps" control={control} placeholder="Ej: 3 meses" /></F>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <F label="Establecimiento de salud"><TF name="q47_establecimiento_eps" control={control} placeholder="Nombre del establecimiento" /></F>
          <F label="Especialidad médica"><TF name="q48_especialidad_eps" control={control} placeholder="Ej: Oncología" /></F>
        </div>
        <F label="Fecha de 1ra consulta"><TF name="q49_primeraConsulta_eps" control={control} placeholder="Fecha aproximada" /></F>
        <F label="Diagnóstico recibido"><TF name="q51_diagnostico_eps" control={control} placeholder="Diagnóstico o presunción" /></F>
        <F label="Siguiente consulta / Motivo sin cita"><TF name="q52_siguienteConsulta_eps" control={control} placeholder="Fecha o motivo" /></F>
        <F label="Comentarios"><TF name="q46_comentarios_eps" control={control} placeholder="Comentarios adicionales..." multi /></F>
      </section>
    </div>
  )
}

function BranchSignosNoSeguro({ control }: { control: ReturnType<typeof useForm>["control"] }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Activity} title="Signos y Síntomas" />
        <F label="Signos o síntomas presentados"><TF name="q55_signosSintomas_ns" control={control} placeholder="Describa los signos o síntomas..." multi /></F>
        <F label="¿Ha solicitado consulta médica?"><YN name="q56_consultaMedica_ns" control={control} /></F>
        <div className="grid grid-cols-2 gap-4">
          <F label="Establecimiento de salud"><TF name="q57_establecimiento_ns" control={control} placeholder="Nombre del establecimiento" /></F>
          <F label="Especialidad médica"><TF name="q58_especialidad_ns" control={control} placeholder="Especialidad" /></F>
        </div>
        <F label="Diagnóstico recibido"><TF name="q59_diagnostico_ns" control={control} placeholder="Diagnóstico o presunción" /></F>
        <F label="Comentarios adicionales"><TF name="q63_comentarios_ns" control={control} placeholder="Comentarios..." multi /></F>
      </section>
    </div>
  )
}

function BranchDx({ branch, control }: { branch: string; control: ReturnType<typeof useForm>["control"] }) {
  const prefix = branch === "dx_eps" ? "de" : branch === "dx_noseguro" ? "dn" : "ds"
  return (
    <div className="flex flex-col gap-8">
      {branch === "dx_eps" && (
        <section className="flex flex-col gap-5">
          <SectionHeader icon={Activity} title="Datos del Seguro EPS" />
          <F label="EPS del paciente">
            <Controller name={`q86_eps_${prefix}`} control={control} defaultValue=""
              render={({ field }) => (
                <Select value={field.value as string} onValueChange={field.onChange}>
                  <SelectTrigger className={sc}><SelectValue placeholder="Seleccionar EPS..." /></SelectTrigger>
                  <SelectContent>{EPS_OPTIONS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              )}
            />
          </F>
        </section>
      )}
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Stethoscope} title="Diagnóstico Oncológico" />
        <div className="grid grid-cols-2 gap-4">
          <F label="Tipo de cáncer">
            <Controller name={`q_tipoCancer_${prefix}`} control={control} defaultValue=""
              render={({ field }) => (
                <Select value={field.value as string} onValueChange={field.onChange}>
                  <SelectTrigger className={sc}><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger>
                  <SelectContent>{TIPOS_CANCER.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              )}
            />
          </F>
          <F label="Estadio del cáncer"><TF name={`q_estadio_${prefix}`} control={control} placeholder="Estadio" /></F>
        </div>
        <F label="Establecimiento de salud"><TF name={`q_establecimiento_${prefix}`} control={control} placeholder="Hospital o clínica" /></F>
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Tiene informe médico?"><YN name={`q_tieneInforme_${prefix}`} control={control} /></F>
          <F label="¿Recibe tratamiento actualmente?"><YN name={`q_recibeTratamiento_${prefix}`} control={control} /></F>
        </div>
        <F label="Tipo y frecuencia de tratamiento"><TF name={`q_tratamiento_${prefix}`} control={control} placeholder="Tipo de tratamiento y frecuencia" multi /></F>
      </section>
      <section className="flex flex-col gap-5">
        <SectionHeader icon={HeartPulse} title="Servicios de Apoyo" />
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Requiere psicooncología?"><YN name={`q_psico_${prefix}`} control={control} /></F>
          {branch === "dx_seguro" && (
            <F label="¿Requiere trabajo social?"><YN name="q72_social_ds" control={control} /></F>
          )}
        </div>
        {branch === "dx_seguro" && (
          <F label="¿Familiares interesados en charlas?"><YN name="q81_familiaresCharlas_ds" control={control} /></F>
        )}
      </section>
    </div>
  )
}

function BranchPsico({ control }: { control: ReturnType<typeof useForm>["control"] }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <SectionHeader icon={HeartPulse} title="Situación Emocional" />
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Sesiones de psicología previas?"><YN name="q129_sesionesAntes_p" control={control} /></F>
          <F label="¿Toma medicación psiquiátrica?"><YN name="q130_medicacion_p" control={control} /></F>
        </div>
        <F label="Comentarios sobre situación emocional"><TF name="q131_comentariosEmo_p" control={control} placeholder="Describa la situación emocional del paciente..." multi /></F>
      </section>
    </div>
  )
}

function BranchFPC({ control }: { control: ReturnType<typeof useForm>["control"] }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Activity} title="Servicio Requerido" />
        <F label="¿Qué servicio de la FPC requiere?"><TF name="q123_servicioFPC" control={control} placeholder="Describa el servicio requerido..." multi /></F>
        <F label="¿Requiere charlas educativas?"><YN name="q124_charlasEduc" control={control} /></F>
        <F label="Comentarios adicionales"><TF name="q125_comentariosFPC" control={control} placeholder="Comentarios..." multi /></F>
      </section>
    </div>
  )
}

function BranchOtros({ control }: { control: ReturnType<typeof useForm>["control"] }) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader icon={Activity} title="Descripción de la Consulta" />
      <F label="Motivo de la consulta"><TF name="q_otros_descripcion" control={control} placeholder="Describa el motivo de la consulta..." multi /></F>
      <F label="Acciones o derivaciones tomadas"><TF name="q_otros_acciones" control={control} placeholder="Acciones realizadas..." multi /></F>
    </div>
  )
}

export function Step7Atencion() {
  const { formData, saveStepData, nextStep, prevStep } = useEnrollmentStore()
  const partial = formData as Partial<EnrollmentFormData>
  const categoria = partial.q27_categoria ?? ""
  const branch = Q27_BRANCH_MAP[categoria]
  const branchLabel = branch ? BRANCH_LABELS[branch] : categoria

  const { control, handleSubmit } = useForm({
    defaultValues: partial as Record<string, string>,
  })

  const onSubmit = (values: Record<string, unknown>) => {
    saveStepData(values as Partial<EnrollmentFormData>)
    nextStep()
  }

  const renderBranch = () => {
    switch (branch) {
      case "signos_seguro": return <BranchSignosSeguro control={control} />
      case "signos_eps": return <BranchSignosEPS control={control} />
      case "signos_noseguro": return <BranchSignosNoSeguro control={control} />
      case "dx_seguro":
      case "dx_eps":
      case "dx_noseguro": return <BranchDx branch={branch} control={control} />
      case "psico": return <BranchPsico control={control} />
      case "fpc": return <BranchFPC control={control} />
      default: return <BranchOtros control={control} />
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <StepHeader
        step={7}
        title="Atención Especializada"
        description={`Rama activa: ${branchLabel}`}
      />

      <div className="rounded-xl bg-card px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Categoría seleccionada
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{branchLabel}</p>
      </div>

      {renderBranch()}

      <StepNav currentStep={7} onPrev={prevStep} />
    </form>
  )
}
