'use client'

import { useForm, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Activity, Hospital, Stethoscope, HeartPulse } from 'lucide-react'
import { HospitalSelect } from '@/components/hospital-select'
import { useEnrollmentStore } from '../../_store/enrollment-store'
import type { EnrollmentFormData } from '../../_types/enrollment-types'
import { Q27_BRANCH_MAP, BRANCH_LABELS } from '../../_types/enrollment-types'
import { StepHeader } from '../step-header'
import { SectionHeader } from '../section-header'
import { StepNav } from '../step-nav'

const fl =
  'text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70'
const ic = 'bg-card border focus-visible:ring-1 focus-visible:ring-primary/40'
const sc =
  'w-full bg-card border focus-visible:ring-1 focus-visible:ring-primary/40'

const EPS_OPTIONS = [
  'PACIFICO SEGUROS',
  'RIMAC SEGUROS',
  'MAPFRE SEGUROS',
  'POSITIVA SEGUROS',
  'SANITAS',
  'ONCOSALUD',
  'Otros',
]

const TIPOS_CANCER = [
  'Mama',
  'Cervicouterino',
  'Pulmón',
  'Próstata',
  'Colon / Recto',
  'Leucemia',
  'Linfoma',
  'Estómago',
  'Piel',
  'Tiroides',
  'Hígado',
  'Páncreas',
  'Ovario',
  'Otros',
]

const SITUACION_TRATAMIENTO = [
  'En tratamiento',
  'Pendiente inicio',
  'Suspendido',
  'Finalizado',
]

function F({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className={fl}>{label}</Label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

function YN({
  name,
  control,
}: {
  name: string
  control: ReturnType<typeof useForm>['control']
}) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <Select value={field.value as string} onValueChange={field.onChange}>
          <SelectTrigger className={sc}>
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sí">Sí</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
      )}
    />
  )
}

function TF({
  name,
  control,
  placeholder,
  multi,
}: {
  name: string
  control: ReturnType<typeof useForm>['control']
  placeholder?: string
  multi?: boolean
}) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
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

function HS({
  name,
  control,
}: {
  name: string
  control: ReturnType<typeof useForm>['control']
}) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <HospitalSelect
          value={field.value as string}
          onChange={field.onChange}
          className="w-full bg-card border focus-visible:ring-1 focus-visible:ring-primary/40"
        />
      )}
    />
  )
}

function BranchSignosSeguro({
  control,
}: {
  control: ReturnType<typeof useForm>['control']
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Activity} title="Signos y Síntomas" />
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Ha presentado algún malestar?">
            <YN name="q28_malestares" control={control} />
          </F>
          <F label="¿Actualmente ha solicitado o asistió a una consulta médica?">
            <YN name="q31_solicitoConsulta" control={control} />
          </F>
        </div>
        <F label="¿Qué signos o síntomas ha presentado o qué lo motivó al examen médico?">
          <TF
            name="q30_signosSintomas"
            control={control}
            placeholder="Describa los signos o síntomas presentados..."
            multi
          />
        </F>
        <F label="Comentarios">
          <TF
            name="q29_comentarios_ss"
            control={control}
            placeholder="Comentarios adicionales..."
            multi
          />
        </F>
      </section>
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Hospital} title="Atención Médica" />
        <div className="grid grid-cols-2 gap-4">
          <F label="¿En qué establecimiento de salud se atendió?">
            <HS name="q32_establecimiento" control={control} />
          </F>
          <F label="¿Con qué especialidad médica?">
            <TF
              name="q33_especialidad"
              control={control}
              placeholder="Ej: Oncología"
            />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Cuándo fue la primera consulta?">
            <TF
              name="q34_primeraConsulta"
              control={control}
              placeholder="Fecha aproximada"
            />
          </F>
          <F label="¿Hace cuánto tiempo espera diagnóstico?">
            <TF
              name="q35_tiempoEspera"
              control={control}
              placeholder="Ej: 3 meses"
            />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Le brindaron hoja de referencia?">
            <YN name="q36_hojaReferencia" control={control} />
          </F>
          <F label="¿Actualmente le han brindado tratamiento?">
            <YN name="q40_tieneTratamiento" control={control} />
          </F>
        </div>
        <F label="Si hay referencia: ¿a dónde lo derivaron? Si no: ¿por qué no hubo referencia?">
          <HS name="q37_referidoA" control={control} />
        </F>
        <F label="¿Le brindaron algún diagnóstico? ¿Cuál?">
          <TF
            name="q38_diagnostico"
            control={control}
            placeholder="Diagnóstico o presunción diagnóstica"
          />
        </F>
        <F label="¿Cuándo es su siguiente consulta o por qué no tiene cita?">
          <TF
            name="q39_siguienteConsulta"
            control={control}
            placeholder="Fecha o motivo"
          />
        </F>
        <F label="Si tiene tratamiento: ¿cuál y con qué frecuencia? Si no: motivo">
          <TF
            name="q41_tratamiento"
            control={control}
            placeholder="Describe el tratamiento y su frecuencia"
            multi
          />
        </F>
        <F label="¿Familiares interesados en charlas de prevención del cáncer?">
          <YN name="q42_familiaresCharlas" control={control} />
        </F>
      </section>
    </div>
  )
}

function BranchSignosEPS({
  control,
}: {
  control: ReturnType<typeof useForm>['control']
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Activity} title="Datos del Seguro EPS" />
        <F label="EPS del paciente">
          <Controller
            name="q43_eps"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                value={field.value as string}
                onValueChange={field.onChange}
              >
                <SelectTrigger className={sc}>
                  <SelectValue placeholder="Seleccionar EPS..." />
                </SelectTrigger>
                <SelectContent>
                  {EPS_OPTIONS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </F>
        <F label="¿Qué signos o síntomas ha presentado?">
          <TF
            name="q44_signosSintomas_eps"
            control={control}
            placeholder="Describa los signos o síntomas..."
            multi
          />
        </F>
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Actualmente ha solicitado o asistió a una consulta médica?">
            <YN name="q45_solicitoConsulta_eps" control={control} />
          </F>
          <F label="¿Hace cuánto tiempo espera diagnóstico?">
            <TF
              name="q50_tiempoEspera_eps"
              control={control}
              placeholder="Ej: 3 meses"
            />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <F label="¿En qué establecimiento de salud se atendió?">
            <HS name="q47_establecimiento_eps" control={control} />
          </F>
          <F label="¿Con qué especialidad médica?">
            <TF
              name="q48_especialidad_eps"
              control={control}
              placeholder="Ej: Oncología"
            />
          </F>
        </div>
        <F label="¿Cuándo fue la primera consulta?">
          <TF
            name="q49_primeraConsulta_eps"
            control={control}
            placeholder="Fecha aproximada"
          />
        </F>
        <F label="¿Le brindaron algún diagnóstico? ¿Cuál?">
          <TF
            name="q51_diagnostico_eps"
            control={control}
            placeholder="Diagnóstico o presunción"
          />
        </F>
        <F label="¿Cuándo es su siguiente consulta o por qué no tiene cita?">
          <TF
            name="q52_siguienteConsulta_eps"
            control={control}
            placeholder="Fecha o motivo"
          />
        </F>
        <F label="¿Actualmente le han brindado tratamiento?">
          <YN name="q53_tieneTratamiento_eps" control={control} />
        </F>
        <F label="¿Familiares interesados en charlas de prevención del cáncer?">
          <YN name="q54_familiaresCharlas_eps" control={control} />
        </F>
        <F label="Comentarios">
          <TF
            name="q46_comentarios_eps"
            control={control}
            placeholder="Comentarios adicionales..."
            multi
          />
        </F>
      </section>
    </div>
  )
}

function BranchSignosNoSeguro({
  control,
}: {
  control: ReturnType<typeof useForm>['control']
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Activity} title="Signos y Síntomas" />
        <F label="¿Cuándo podría afiliarse al SIS?">
          <TF
            name="q55_cuandoAfiliarseSis_ns"
            control={control}
            placeholder="Fecha o periodo aproximado"
          />
        </F>
        <F label="Comentarios sobre la afiliación SIS">
          <TF
            name="q56_comentariosAfiliacion_ns"
            control={control}
            placeholder="Comentarios..."
            multi
          />
        </F>
        <F label="Si no puede afiliarse al SIS, ¿cuál es el motivo?">
          <TF
            name="q57_motivoNoAfiliarseSis_ns"
            control={control}
            placeholder="Detalle del motivo"
            multi
          />
        </F>
        <F label="¿Ha presentado algún malestar?">
          <YN name="q58_malestares_ns" control={control} />
        </F>
        <F label="¿Qué signos o síntomas ha presentado o qué motivó el examen médico?">
          <TF
            name="q59_signosSintomas_ns"
            control={control}
            placeholder="Describa los signos o síntomas..."
            multi
          />
        </F>
        <F label="¿Ha solicitado o asistió a una consulta médica?">
          <YN name="q60_consultaMedica_ns" control={control} />
        </F>
        <div className="grid grid-cols-2 gap-4">
          <F label="Si asistió, ¿en qué establecimiento de salud?">
            <HS name="q61_establecimiento_ns" control={control} />
          </F>
          <F label="Si asistió, ¿con qué especialidad médica?">
            <TF
              name="q62_especialidad_ns"
              control={control}
              placeholder="Especialidad"
            />
          </F>
        </div>
        <F label="Si asistió, ¿cuándo fue la primera consulta y qué indicaciones recibió?">
          <TF
            name="q63_primeraConsultaIndicacion_ns"
            control={control}
            placeholder="Fecha/indicaciones"
            multi
          />
        </F>
        <F label="¿Familiares interesados en charlas de prevención del cáncer?">
          <YN name="q64_familiaresCharlas_ns" control={control} />
        </F>
      </section>
    </div>
  )
}

function BranchDx({
  branch,
  control,
}: {
  branch: string
  control: ReturnType<typeof useForm>['control']
}) {
  const prefix =
    branch === 'dx_eps' ? 'de' : branch === 'dx_noseguro' ? 'dn' : 'ds'
  return (
    <div className="flex flex-col gap-8">
      {branch === 'dx_eps' && (
        <section className="flex flex-col gap-5">
          <SectionHeader icon={Activity} title="Datos del Seguro EPS" />
          <F label="EPS del paciente">
            <Controller
              name={`q86_eps_${prefix}`}
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select
                  value={field.value as string}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={sc}>
                    <SelectValue placeholder="Seleccionar EPS..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EPS_OPTIONS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </F>
        </section>
      )}
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Stethoscope} title="Diagnóstico Oncológico" />
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Cuál es su diagnóstico oncológico?">
            <Controller
              name={`q_tipoCancer_${prefix}`}
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select
                  value={field.value as string}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={sc}>
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CANCER.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </F>
          <F label="¿Conoce el estadio del diagnóstico? (1, 2, 3, 4 o desconoce)">
            <TF
              name={`q_estadio_${prefix}`}
              control={control}
              placeholder="Estadio"
            />
          </F>
        </div>
        <F label="¿Qué síntoma lo llevó a realizarse su chequeo médico?">
          <TF
            name={`q_sintomaChequeo_${prefix}`}
            control={control}
            placeholder="Motivo o síntoma principal"
            multi
          />
        </F>
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Cuándo fue diagnosticado?">
            <TF
              name={`q_fechaDx_${prefix}`}
              control={control}
              placeholder="Fecha aproximada"
            />
          </F>
          <F label="¿Cuánto tiempo esperó para el diagnóstico?">
            <TF
              name={`q_tiempoEsperaDx_${prefix}`}
              control={control}
              placeholder="Ej: 6 semanas"
            />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Dónde fue diagnosticado?">
            <HS name={`q_hospitalDx_${prefix}`} control={control} />
          </F>
          <F label="¿Qué especialidad lo diagnosticó?">
            <TF
              name={`q_especialidadDx_${prefix}`}
              control={control}
              placeholder="Especialidad"
            />
          </F>
        </div>
        <F label="¿Actualmente asiste a sus consultas médicas?">
          <YN name={`q_asisteConsultas_${prefix}`} control={control} />
        </F>
        <F label="Si asiste: ¿cuándo fue su última consulta y especialidad?">
          <TF
            name={`q_ultimaConsulta_${prefix}`}
            control={control}
            placeholder="Fecha y especialidad"
            multi
          />
        </F>
        <F label="¿Cuándo es su siguiente consulta y especialidad?">
          <TF
            name={`q_siguienteConsulta_${prefix}`}
            control={control}
            placeholder="Fecha y especialidad"
            multi
          />
        </F>
        <F label="¿Tiene alguna dificultad para sus consultas médicas?">
          <TF
            name={`q_limitacionConsultas_${prefix}`}
            control={control}
            placeholder="Detalle de barreras o dificultades"
            multi
          />
        </F>
        <F label="¿En qué establecimiento de salud se atiende actualmente?">
          <HS name={`q_establecimiento_${prefix}`} control={control} />
        </F>
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Cuenta con informe médico de respaldo?">
            <YN name={`q_tieneInforme_${prefix}`} control={control} />
          </F>
          <F label="¿Actualmente recibe tratamiento médico?">
            <YN name={`q_recibeTratamiento_${prefix}`} control={control} />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Qué tipo de tratamiento recibe?">
            <TF
              name={`q_tipoTratamiento_${prefix}`}
              control={control}
              placeholder="Ej: Quimioterapia"
            />
          </F>
          <F label="Situación del tratamiento">
            <Controller
              name={`q_situacionTratamiento_${prefix}`}
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select
                  value={field.value as string}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={sc}>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SITUACION_TRATAMIENTO.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </F>
        </div>
        <F label="Tipo y frecuencia de tratamiento / motivo si no recibe">
          <TF
            name={`q_tratamiento_${prefix}`}
            control={control}
            placeholder="Tipo de tratamiento y frecuencia"
            multi
          />
        </F>
        {branch === 'dx_noseguro' && (
          <>
            <F label="¿Cuándo podría afiliarse al SIS?">
              <TF
                name="q120_cuandoAfiliarseSis_dn"
                control={control}
                placeholder="Fecha o periodo aproximado"
              />
            </F>
            <F label="Si no puede afiliarse al SIS, ¿cuál es el motivo?">
              <TF
                name="q121_motivoNoAfiliarseSis_dn"
                control={control}
                placeholder="Detalle del motivo"
                multi
              />
            </F>
          </>
        )}
      </section>
      <section className="flex flex-col gap-5">
        <SectionHeader icon={HeartPulse} title="Servicios de Apoyo" />
        <div className="grid grid-cols-2 gap-4">
          <F label="¿Desea recibir soporte emocional (psicooncología)?">
            <YN name={`q_psico_${prefix}`} control={control} />
          </F>
          {branch === 'dx_seguro' && (
            <F label="¿Se derivó con la asistenta social?">
              <YN name="q72_social_ds" control={control} />
            </F>
          )}
        </div>
        {branch === 'dx_seguro' && (
          <F label="¿Familiares interesados en charlas de prevención del cáncer?">
            <YN name="q81_familiaresCharlas_ds" control={control} />
          </F>
        )}
      </section>
    </div>
  )
}

function BranchPsico({
  control,
}: {
  control: ReturnType<typeof useForm>['control']
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <SectionHeader icon={HeartPulse} title="Situación Emocional" />
        <div className="grid grid-cols-2 gap-4">
          <F label="¿En las últimas 2 semanas tuvo preocupaciones excesivas por su enfermedad?">
            <YN name="q129_sesionesAntes_p" control={control} />
          </F>
          <F label="Termómetro de malestar emocional (1 a 10)">
            <TF
              name="q130_medicacion_p"
              control={control}
              placeholder="Ej: 7"
            />
          </F>
        </div>
        <F label="¿Prefiere soporte emocional por llamada o videollamada?">
          <TF
            name="q131_comentariosEmo_p"
            control={control}
            placeholder="Llamada / Videollamada y comentarios"
            multi
          />
        </F>
      </section>
    </div>
  )
}

function BranchFPC({
  control,
}: {
  control: ReturnType<typeof useForm>['control']
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <SectionHeader icon={Activity} title="Servicio Requerido" />
        <F label="¿Cuál es el servicio de la FPC que requiere?">
          <TF
            name="q123_servicioFPC"
            control={control}
            placeholder="Describa el servicio requerido..."
            multi
          />
        </F>
        <F label="¿Tiene familiares interesados en charlas educativas de prevención del cáncer?">
          <YN name="q124_charlasEduc" control={control} />
        </F>
        <F label="Si desea charla, ¿a cuál le gustaría inscribirse?">
          <TF
            name="q125_comentariosFPC"
            control={control}
            placeholder="Ej: Cáncer de mama"
          />
        </F>
        <div className="grid grid-cols-3 gap-4">
          <F label="Nombre del familiar para charla">
            <TF
              name="q126_nombreFamiliarCharla"
              control={control}
              placeholder="Nombre completo"
            />
          </F>
          <F label="Celular del familiar">
            <TF
              name="q127_celularFamiliarCharla"
              control={control}
              placeholder="9XX XXX XXX"
            />
          </F>
          <F label="Correo del familiar">
            <TF
              name="q128_correoFamiliarCharla"
              control={control}
              placeholder="correo@dominio.com"
            />
          </F>
        </div>
      </section>
    </div>
  )
}

function BranchOtros({
  control,
}: {
  control: ReturnType<typeof useForm>['control']
}) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader icon={Activity} title="Descripción de la Consulta" />
      <F label="Motivo de la consulta">
        <TF
          name="q_otros_descripcion"
          control={control}
          placeholder="Describa el motivo de la consulta..."
          multi
        />
      </F>
      <F label="Acciones o derivaciones tomadas">
        <TF
          name="q_otros_acciones"
          control={control}
          placeholder="Acciones realizadas..."
          multi
        />
      </F>
    </div>
  )
}

export function Step7Atencion() {
  const { formData, saveStepData, nextStep, prevStep } = useEnrollmentStore()
  const partial = formData as Partial<EnrollmentFormData>
  const categoria = partial.q27_categoria ?? ''
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
      case 'signos_seguro':
        return <BranchSignosSeguro control={control} />
      case 'signos_eps':
        return <BranchSignosEPS control={control} />
      case 'signos_noseguro':
        return <BranchSignosNoSeguro control={control} />
      case 'dx_seguro':
      case 'dx_eps':
      case 'dx_noseguro':
        return <BranchDx branch={branch} control={control} />
      case 'psico':
        return <BranchPsico control={control} />
      case 'fpc':
        return <BranchFPC control={control} />
      default:
        return <BranchOtros control={control} />
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <StepHeader
        step={7}
        title="Atención Especializada"
        description={`Rama activa: ${branchLabel}`}
      />

      <div className="bg-card rounded-xl px-4 py-3">
        <p className="text-muted-foreground/60 text-[10px] font-bold tracking-widest uppercase">
          Categoría seleccionada
        </p>
        <p className="text-foreground mt-0.5 text-sm font-semibold">
          {branchLabel}
        </p>
      </div>

      {renderBranch()}

      <StepNav currentStep={7} onPrev={prevStep} />
    </form>
  )
}
