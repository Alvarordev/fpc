import type { EnrollmentFormData } from '@/app/(dashboard)/inscripcion/_types/enrollment-types'

export type PatientStatus = 'activo' | 'inactivo' | 'prospecto'

export interface Patient extends EnrollmentFormData {
  id: string
  fechaCreacion: string
  estado: PatientStatus
  // Section 1 - Datos Personales
  sexo: string
  generoCuidador: string
  zonificacion: string
  // Section 2 - Información del Programa
  nroPaciente: string
  puntoIngreso: string
  faseSalud: string
  cancerInfantil: string
  motivoDropOut: string
  fechaDropOut: string
  // Section 3 - Seguro y Afiliación
  afiliacionSisDesdeSepa: string
  fechaAfiliacionSis: string
  carnetConadis: string
  conoceFissal: string
  // Section 4 - Diagnóstico
  dxConSepa: string
  situacionDxOncologico: string
  dxGeneral: string
  dxEspecifico: string
  tiempoEsperaDx: string
  fechaDx: string
  hospitalDiagnosticado: string
  categorizacionHospital: string
  especialidad: string
  nroHistoriaClinica: string
  sintomaChequeo: string
  detalleDerivacion: string
  // Section 5 - Tratamiento
  tratamientoDesdeSepa: string
  tratamientoBrindado: string
  tipoTratamiento: string
  situacionTratamiento: string
  hospitalTratamiento: string
  departamentoHospitalTratamiento: string
  oralIntravenosa: string
  medicamento: string
  frecuencia: string
  detalleCambioTratamiento: string
  fecha1erTratamiento: string
  motivoNoInicioTratamiento: string
  fechaAbandonoTratamiento: string
  motivoAbandono: string
  fechaUltimoContactoTto: string
  derivadoCentroSalud: string
  // Section 6 - Evolución
  detalleEvolucion: string
  evolucionEnfermedad: string
  atencionCophoePadomi: string
  teleconsultas: string
  psiquiatria: string
  comorbilidad: string
  discapacidad: string
  familiaresCancer: string
  // Section 7 - Situación Social
  violenciaIntrafamiliar: string
  cocinaLena: string
  trabaja: string
  recibeAyudaEconomica: string
  limitacionConsultas: string
  // Section 8 - Servicios y Derivaciones
  derivadoAsistentaSocial: string
  derivadoSusalud: string
  nroRegistroSusalud: string
  guiaAlimentacion: string
  participaGam: string
  satisfaccionPrograma: string
  cambiosBienestar: string
}

export const statusLabels: Record<PatientStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  prospecto: 'Prospecto',
}

export interface ProfileField {
  key: string
  label: string
  type?: 'text' | 'date'
  input?: 'text' | 'date' | 'select' | 'hospital'
  options?: string[]
  normalizeMap?: Record<string, string>
}

export interface ProfileSection {
  title: string
  fields: ProfileField[]
}

const YES_NO_OPTIONS = ['Sí', 'No']
const YES_NO_NA_OPTIONS = ['Sí', 'No', 'No aplica']
const SEXO_OPTIONS = [
  'Femenino',
  'Masculino',
  'Intersexual',
  'Prefiere no decir',
]
const GENERO_OPTIONS = ['Femenino', 'Masculino', 'Otro', 'No aplica']
const ZONIFICACION_OPTIONS = ['Urbano', 'Rural']
const CATEGORIA_OPTIONS = [
  'Signos y Síntomas / Seguro',
  'Signos y Sintomas / EPS-ESSALUD',
  'Signos y Sintomas / Privado',
  'Signos y Síntomas / No Seguro',
  'Diagnóstico de Cáncer / Seguro',
  'Diagnostico de Cancer / EPS-ESSALUD',
  'Diagnostico de Cancer / Privado',
  'Diagnóstico de Cáncer / No Seguro',
  'Servicio Psicooncológico',
  'Servicios FPC',
  'Otros',
]
const FASE_SALUD_OPTIONS = [
  'Signos y Síntomas',
  'Diagnóstico Cáncer',
  'Control',
  'Psicooncología',
  'Servicios FPC',
  'Otros',
]
const SEGURO_OPTIONS = [
  'SIS',
  'EsSalud',
  'EPS - Essalud',
  'Fuerzas Armadas',
  'Saludpol',
  'Privado',
]
const SITUACION_TRATAMIENTO_OPTIONS = [
  'En tratamiento',
  'Pendiente inicio',
  'Suspendido',
  'Finalizado',
]

function normalizeToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

const yesNoMap: Record<string, string> = {
  si: 'Sí',
  sí: 'Sí',
  s: 'Sí',
  no: 'No',
}

function normalizeWithMap(
  value: string,
  normalizeMap?: Record<string, string>,
): string {
  if (!normalizeMap) return value
  const direct = normalizeMap[value]
  if (direct) return direct
  const byToken = normalizeMap[normalizeToken(value)]
  return byToken ?? value
}

function normalizeByOptions(value: string, options?: string[]): string {
  if (!options || options.length === 0) return value
  const token = normalizeToken(value)
  const matched = options.find((opt) => normalizeToken(opt) === token)
  return matched ?? value
}

export function normalizeProfileValues(
  values: Record<string, string>,
): Record<string, string> {
  const normalized: Record<string, string> = {}

  for (const [key, rawValue] of Object.entries(values)) {
    const value = typeof rawValue === 'string' ? rawValue.trim() : ''
    const field = PROFILE_FIELDS_BY_KEY[key]

    if (!field || !value) {
      normalized[key] = value
      continue
    }

    let next = value
    next = normalizeWithMap(next, field.normalizeMap)
    next = normalizeByOptions(next, field.options)
    normalized[key] = next
  }

  return normalized
}

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    title: 'Datos Personales',
    fields: [
      { key: 'q9_nombrePaciente', label: 'Nombre completo' },
      { key: 'q10_dni', label: 'DNI' },
      {
        key: 'q11_fechaNacimiento',
        label: 'Fecha de nacimiento',
        type: 'date',
      },
      { key: 'q12_lugarNacimiento', label: 'Lugar de nacimiento' },
      { key: 'sexo', label: 'Sexo', input: 'select', options: SEXO_OPTIONS },
      { key: 'q13_direccion', label: 'Dirección' },
      {
        key: 'q14_departamentoResidencia',
        label: 'Departamento de residencia',
      },
      {
        key: 'zonificacion',
        label: 'Zonificación',
        input: 'select',
        options: ZONIFICACION_OPTIONS,
      },
      { key: 'q17_telefono', label: 'Teléfono' },
      { key: 'q18_telefonoAuxiliar', label: 'Teléfono auxiliar' },
      { key: 'q19_telefonoFamiliar', label: 'Teléfono familiar' },
      { key: 'q20_nombreFamiliar', label: 'Nombre del familiar' },
      {
        key: 'generoCuidador',
        label: 'Género del cuidador',
        input: 'select',
        options: GENERO_OPTIONS,
      },
      {
        key: 'q21_tieneWhatsapp',
        label: 'Tiene WhatsApp',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      { key: 'q22_gradoInstruccion', label: 'Grado de instrucción' },
      { key: 'q23_lenguaOriginaria', label: 'Lengua originaria' },
      {
        key: 'q24_requiereTraduccion',
        label: 'Requiere traducción',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
    ],
  },
  {
    title: 'Información del Programa',
    fields: [
      { key: 'nroPaciente', label: 'N° de paciente' },
      { key: 'fechaCreacion', label: 'Fecha de registro', type: 'date' },
      {
        key: 'estado',
        label: 'Estado',
        input: 'select',
        options: ['activo', 'inactivo', 'prospecto'],
      },
      {
        key: 'q27_categoria',
        label: 'Categoría',
        input: 'select',
        options: CATEGORIA_OPTIONS,
      },
      { key: 'puntoIngreso', label: 'Punto de ingreso' },
      {
        key: 'faseSalud',
        label: 'Fase de salud',
        input: 'select',
        options: FASE_SALUD_OPTIONS,
      },
      { key: 'cancerInfantil', label: 'Cáncer infantil' },
      { key: 'motivoDropOut', label: 'Motivo de drop out' },
      { key: 'fechaDropOut', label: 'Fecha de drop out', type: 'date' },
    ],
  },
  {
    title: 'Seguro y Afiliación',
    fields: [
      {
        key: 'q25_tieneSeguro',
        label: '¿Tiene seguro?',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      {
        key: 'q26_tipoSeguro',
        label: 'Tipo de seguro',
        input: 'select',
        options: SEGURO_OPTIONS,
      },
      {
        key: 'afiliacionSisDesdeSepa',
        label: 'Afiliación SIS desde SEPA',
        input: 'select',
        options: ['Sí', 'No', 'En proceso'],
        normalizeMap: yesNoMap,
      },
      {
        key: 'fechaAfiliacionSis',
        label: 'Fecha de afiliación SIS',
        type: 'date',
      },
      {
        key: 'carnetConadis',
        label: 'Carnet CONADIS',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      {
        key: 'conoceFissal',
        label: '¿Conoce FISSAL?',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
    ],
  },
  {
    title: 'Diagnóstico',
    fields: [
      {
        key: 'dxConSepa',
        label: 'Diagnóstico con SEPA',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      {
        key: 'situacionDxOncologico',
        label: 'Situación diagnóstico oncológico',
      },
      { key: 'dxGeneral', label: 'Diagnóstico general' },
      { key: 'dxEspecifico', label: 'Diagnóstico específico' },
      { key: 'tiempoEsperaDx', label: 'Tiempo de espera para diagnóstico' },
      { key: 'fechaDx', label: 'Fecha de diagnóstico', type: 'date' },
      {
        key: 'hospitalDiagnosticado',
        label: 'Hospital diagnosticado',
        input: 'hospital',
      },
      { key: 'categorizacionHospital', label: 'Categorización del hospital' },
      { key: 'especialidad', label: 'Especialidad' },
      { key: 'nroHistoriaClinica', label: 'N° historia clínica' },
      { key: 'sintomaChequeo', label: 'Síntoma de chequeo' },
      { key: 'detalleDerivacion', label: 'Detalle de derivación' },
    ],
  },
  {
    title: 'Tratamiento',
    fields: [
      {
        key: 'tratamientoDesdeSepa',
        label: 'Tratamiento desde SEPA',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      {
        key: 'tratamientoBrindado',
        label: '¿Recibe tratamiento?',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      { key: 'tipoTratamiento', label: 'Tipo de tratamiento' },
      {
        key: 'situacionTratamiento',
        label: 'Situación del tratamiento',
        input: 'select',
        options: SITUACION_TRATAMIENTO_OPTIONS,
      },
      {
        key: 'hospitalTratamiento',
        label: 'Hospital de tratamiento',
        input: 'hospital',
      },
      {
        key: 'departamentoHospitalTratamiento',
        label: 'Departamento del hospital',
      },
      { key: 'oralIntravenosa', label: 'Vía de administración' },
      { key: 'medicamento', label: 'Medicamento' },
      { key: 'frecuencia', label: 'Frecuencia' },
      {
        key: 'detalleCambioTratamiento',
        label: 'Detalle cambio de tratamiento',
      },
      {
        key: 'fecha1erTratamiento',
        label: 'Fecha 1er tratamiento',
        type: 'date',
      },
      {
        key: 'motivoNoInicioTratamiento',
        label: 'Motivo de no inicio de tratamiento',
      },
      {
        key: 'fechaAbandonoTratamiento',
        label: 'Fecha de abandono',
        type: 'date',
      },
      { key: 'motivoAbandono', label: 'Motivo de abandono' },
      {
        key: 'fechaUltimoContactoTto',
        label: 'Fecha último contacto',
        type: 'date',
      },
      {
        key: 'derivadoCentroSalud',
        label: 'Derivado a centro de salud desde SEPA',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
    ],
  },
  {
    title: 'Evolución',
    fields: [
      { key: 'detalleEvolucion', label: 'Detalle de evolución' },
      { key: 'evolucionEnfermedad', label: 'Evolución de la enfermedad' },
      {
        key: 'atencionCophoePadomi',
        label: 'Atención COPHOE/PADOMI',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      {
        key: 'teleconsultas',
        label: 'Teleconsultas',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      {
        key: 'psiquiatria',
        label: 'Psiquiatría',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      { key: 'comorbilidad', label: 'Comorbilidad' },
      { key: 'discapacidad', label: 'Discapacidad' },
      { key: 'familiaresCancer', label: 'Familiares con cáncer' },
    ],
  },
  {
    title: 'Situación Social',
    fields: [
      {
        key: 'violenciaIntrafamiliar',
        label: 'Violencia intrafamiliar',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      {
        key: 'cocinaLena',
        label: 'Cocina a leña',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      {
        key: 'trabaja',
        label: '¿Trabaja?',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      {
        key: 'recibeAyudaEconomica',
        label: 'Recibe ayuda económica',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      { key: 'limitacionConsultas', label: 'Limitación para consultas' },
    ],
  },
  {
    title: 'Servicios y Derivaciones',
    fields: [
      {
        key: 'derivadoAsistentaSocial',
        label: 'Derivado a asistenta social',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      {
        key: 'derivadoSusalud',
        label: 'Derivado a SUSALUD',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      { key: 'nroRegistroSusalud', label: 'N° registro SUSALUD' },
      { key: 'guiaAlimentacion', label: 'Guía de alimentación' },
      {
        key: 'participaGam',
        label: 'Participa en GAM',
        input: 'select',
        options: YES_NO_OPTIONS,
        normalizeMap: yesNoMap,
      },
      { key: 'satisfaccionPrograma', label: 'Satisfacción con el programa' },
      {
        key: 'cambiosBienestar',
        label: 'Cambios en bienestar',
        input: 'select',
        options: YES_NO_NA_OPTIONS,
        normalizeMap: yesNoMap,
      },
    ],
  },
]

export const PROFILE_FIELDS_BY_KEY: Record<string, ProfileField> =
  Object.fromEntries(
    PROFILE_SECTIONS.flatMap((section) =>
      section.fields.map((field) => [field.key, field]),
    ),
  )
