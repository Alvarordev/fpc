'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, Clock, ClipboardCheck } from 'lucide-react'
import { useEnrollmentStore } from '../../_store/enrollment-store'
import type { EnrollmentFormData } from '../../_types/enrollment-types'
import { StepHeader } from '../step-header'
import { SectionHeader } from '../section-header'
import { StepNav } from '../step-nav'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/lib/auth'
import { useAuthStore } from '@/store/auth-store'

const schema = z.object({
  q132_encuestaAceptada: z.string().min(1, 'Seleccione una opción'),
  q133_horaFin: z.string().min(1, 'Ingrese la hora de fin'),
})

type FormValues = z.infer<typeof schema>

const fl =
  'text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70'
const ic =
  'max-w-48 bg-card border focus-visible:ring-1 focus-visible:ring-primary/40'
const sc =
  'w-full bg-card border focus-visible:ring-1 focus-visible:ring-primary/40'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function monthsEs(date: Date) {
  return [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ][date.getMonth()]
}

function calculateAge(isoDate?: string) {
  if (!isoDate) return ''
  const birth = new Date(isoDate)
  if (Number.isNaN(birth.getTime())) return ''

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  return age >= 0 ? String(age) : ''
}

function calculateDuration(start?: string, end?: string) {
  if (!start || !end) return ''
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return ''

  const startMin = sh * 60 + sm
  let endMin = eh * 60 + em
  if (endMin < startMin) endMin += 24 * 60
  const diff = endMin - startMin
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function resolveFaseSalud(categoria?: string) {
  if (!categoria) return ''
  if (categoria.includes('Signos y Síntomas')) return 'Signos y Síntomas'
  if (
    categoria.includes('Diagnóstico de Cáncer') ||
    categoria.includes('Diagnostico de Cancer')
  ) {
    return 'Diagnóstico Cáncer'
  }
  if (categoria.includes('Psicooncológico')) return 'Psicooncología'
  if (categoria.includes('Servicios FPC')) return 'Servicios FPC'
  return 'Otros'
}

function inferPayload(data: Partial<EnrollmentFormData>) {
  const now = new Date()
  const fechaEnrolamiento = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
  const mesEnrolamiento = monthsEs(now)
  const edad = calculateAge(data.q11_fechaNacimiento)
  const duracionLlamada = calculateDuration(
    data.q2_horaInicio,
    data.q133_horaFin,
  )
  const faseSalud = resolveFaseSalud(data.q27_categoria)

  const merged = {
    ...data,
    fechaEnrolamiento,
    mesEnrolamiento,
    edad,
    duracionLlamada,
    faseSalud,
  }

  return {
    ...merged,
    nombresApellidos: merged.q9_nombrePaciente ?? '',
    codigo: merged.q10_dni ?? '',
    numeroCelular: merged.q17_telefono ?? '',
    numeroAuxiliar: merged.q18_telefonoAuxiliar ?? '',
    lugarNacimiento: merged.q12_lugarNacimiento ?? '',
    departamentoResidencia: merged.q14_departamentoResidencia ?? '',
    gradoInstruccion: merged.q22_gradoInstruccion ?? '',
    lenguaOriginaria: merged.q23_lenguaOriginaria ?? '',
    tipoSeguro: merged.q26_tipoSeguro ?? '',
  }
}

async function submitEnrollment({
  data,
  agenteId,
}: {
  data: Partial<EnrollmentFormData>
  agenteId: string
}) {
  const inferredData = inferPayload(data)
  const patientRes = await fetch(`${API_URL}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...inferredData,
      fechaCreacion: new Date().toISOString(),
      estado: 'activo',
    }),
  })
  if (!patientRes.ok) throw new Error('Error al guardar')

  const patient = await patientRes.json()

  const start = inferredData.q2_horaInicio ?? ''
  const end = inferredData.q133_horaFin ?? ''

  const contactRes = await fetch(`${API_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `ct-enroll-${Date.now()}`,
      pacienteId: String(patient.id),
      agenteId,
      origen: 'enrolamiento',
      tipo: 'entrante',
      estado: 'completado',
      fecha: (patient.fechaCreacion ?? new Date().toISOString()).slice(0, 10),
      horaInicio: start,
      horaFin: end,
      motivos: ['otro'],
      notas: 'Contacto inicial de enrolamiento en programa SEPA',
      camposActualizados: [],
    }),
  })

  if (!contactRes.ok) throw new Error('Paciente creado sin contacto inicial')

  return patient
}

export function Step8Cierre() {
  const {
    formData,
    saveStepData,
    prevStep,
    completeEnrollment,
    resetEnrollment,
    isComplete,
  } = useEnrollmentStore()
  const partial = formData as Partial<EnrollmentFormData>
  const user = useAuthStore((s) => s.user)
  const now = new Date().toTimeString().slice(0, 5)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      q132_encuestaAceptada: partial.q132_encuestaAceptada ?? '',
      q133_horaFin: partial.q133_horaFin ?? now,
    },
  })

  const mutation = useMutation({
    mutationFn: submitEnrollment,
    onSuccess: () => completeEnrollment(),
  })

  const onSubmit = (values: FormValues) => {
    saveStepData(values)
    mutation.mutate({
      data: { ...partial, ...values },
      agenteId: String(user?.id ?? 'system-enrollment'),
    })
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>
        <p className="mb-1 text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
          Inscripción completada
        </p>
        <h2 className="text-foreground mb-3 text-2xl font-bold">
          Registro exitoso
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm text-sm leading-relaxed">
          El paciente ha sido registrado exitosamente en el Programa SEPA. Los
          datos han sido guardados en el sistema.
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
        <p className="mb-3 text-[10px] font-bold tracking-widest text-emerald-700/80 uppercase">
          Resumen de la inscripción
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <span className="text-muted-foreground/60 text-[10px] font-bold tracking-wide uppercase">
            Paciente
          </span>
          <span className="font-medium">
            {partial.q9_nombrePaciente ?? '—'}
          </span>
          <span className="text-muted-foreground/60 text-[10px] font-bold tracking-wide uppercase">
            DNI
          </span>
          <span className="font-medium">{partial.q10_dni ?? '—'}</span>
          <span className="text-muted-foreground/60 text-[10px] font-bold tracking-wide uppercase">
            Categoría
          </span>
          <span className="font-medium">{partial.q27_categoria ?? '—'}</span>
          <span className="text-muted-foreground/60 text-[10px] font-bold tracking-wide uppercase">
            Inicio
          </span>
          <span className="font-medium">{partial.q2_horaInicio ?? '—'}</span>
        </div>
      </div>

      <section className="flex flex-col gap-5">
        <SectionHeader icon={ClipboardCheck} title="Encuesta de Satisfacción" />
        <div className="flex flex-col gap-2">
          <Label className={fl}>
            ¿El paciente acepta la encuesta?{' '}
            <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="q132_encuestaAceptada"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={sc}
                  aria-invalid={!!errors.q132_encuestaAceptada}
                >
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
            <p className="text-destructive text-xs">
              {errors.q132_encuestaAceptada.message}
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader icon={Clock} title="Registro de Tiempo" />
        <div className="flex flex-col gap-2">
          <Label htmlFor="q133_horaFin" className={fl}>
            Hora de fin de llamada <span className="text-destructive">*</span>
          </Label>
          <Input
            id="q133_horaFin"
            type="time"
            className={ic}
            aria-invalid={!!errors.q133_horaFin}
            {...register('q133_horaFin')}
          />
          {errors.q133_horaFin && (
            <p className="text-destructive text-xs">
              {errors.q133_horaFin.message}
            </p>
          )}
        </div>
      </section>

      {mutation.isError && (
        <div className="border-destructive/20 bg-destructive/5 rounded-xl border p-4">
          <p className="text-destructive text-sm">
            Error al guardar. Verifique que el servidor esté activo (
            <code className="bg-destructive/10 rounded px-1">pnpm server</code>)
            e intente nuevamente.
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
