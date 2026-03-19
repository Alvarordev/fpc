import type { EnrollmentFormData } from "@/app/(dashboard)/inscripcion/_types/enrollment-types"

export type PatientStatus = "activo" | "inactivo"

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
  activo: "Activo",
  inactivo: "Inactivo",
}

export interface ProfileField {
  key: string
  label: string
  type?: "text" | "date"
}

export interface ProfileSection {
  title: string
  fields: ProfileField[]
}

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    title: "Datos Personales",
    fields: [
      { key: "q9_nombrePaciente", label: "Nombre completo" },
      { key: "q10_dni", label: "DNI" },
      { key: "q11_fechaNacimiento", label: "Fecha de nacimiento", type: "date" },
      { key: "q12_lugarNacimiento", label: "Lugar de nacimiento" },
      { key: "sexo", label: "Sexo" },
      { key: "q13_direccion", label: "Dirección" },
      { key: "q14_departamentoResidencia", label: "Departamento de residencia" },
      { key: "zonificacion", label: "Zonificación" },
      { key: "q17_telefono", label: "Teléfono" },
      { key: "q18_telefonoAuxiliar", label: "Teléfono auxiliar" },
      { key: "q19_telefonoFamiliar", label: "Teléfono familiar" },
      { key: "q20_nombreFamiliar", label: "Nombre del familiar" },
      { key: "generoCuidador", label: "Género del cuidador" },
      { key: "q21_tieneWhatsapp", label: "Tiene WhatsApp" },
      { key: "q22_gradoInstruccion", label: "Grado de instrucción" },
      { key: "q23_lenguaOriginaria", label: "Lengua originaria" },
      { key: "q24_requiereTraduccion", label: "Requiere traducción" },
    ],
  },
  {
    title: "Información del Programa",
    fields: [
      { key: "nroPaciente", label: "N° de paciente" },
      { key: "fechaCreacion", label: "Fecha de registro", type: "date" },
      { key: "estado", label: "Estado" },
      { key: "q27_categoria", label: "Categoría" },
      { key: "puntoIngreso", label: "Punto de ingreso" },
      { key: "faseSalud", label: "Fase de salud" },
      { key: "cancerInfantil", label: "Cáncer infantil" },
      { key: "motivoDropOut", label: "Motivo de drop out" },
      { key: "fechaDropOut", label: "Fecha de drop out", type: "date" },
    ],
  },
  {
    title: "Seguro y Afiliación",
    fields: [
      { key: "q25_tieneSeguro", label: "¿Tiene seguro?" },
      { key: "q26_tipoSeguro", label: "Tipo de seguro" },
      { key: "afiliacionSisDesdeSepa", label: "Afiliación SIS desde SEPA" },
      { key: "fechaAfiliacionSis", label: "Fecha de afiliación SIS", type: "date" },
      { key: "carnetConadis", label: "Carnet CONADIS" },
      { key: "conoceFissal", label: "¿Conoce FISSAL?" },
    ],
  },
  {
    title: "Diagnóstico",
    fields: [
      { key: "dxConSepa", label: "Diagnóstico con SEPA" },
      { key: "situacionDxOncologico", label: "Situación diagnóstico oncológico" },
      { key: "dxGeneral", label: "Diagnóstico general" },
      { key: "dxEspecifico", label: "Diagnóstico específico" },
      { key: "tiempoEsperaDx", label: "Tiempo de espera para diagnóstico" },
      { key: "fechaDx", label: "Fecha de diagnóstico", type: "date" },
      { key: "hospitalDiagnosticado", label: "Hospital diagnosticado" },
      { key: "categorizacionHospital", label: "Categorización del hospital" },
      { key: "especialidad", label: "Especialidad" },
      { key: "nroHistoriaClinica", label: "N° historia clínica" },
      { key: "sintomaChequeo", label: "Síntoma de chequeo" },
      { key: "detalleDerivacion", label: "Detalle de derivación" },
    ],
  },
  {
    title: "Tratamiento",
    fields: [
      { key: "tratamientoDesdeSepa", label: "Tratamiento desde SEPA" },
      { key: "tratamientoBrindado", label: "¿Recibe tratamiento?" },
      { key: "tipoTratamiento", label: "Tipo de tratamiento" },
      { key: "situacionTratamiento", label: "Situación del tratamiento" },
      { key: "hospitalTratamiento", label: "Hospital de tratamiento" },
      { key: "departamentoHospitalTratamiento", label: "Departamento del hospital" },
      { key: "oralIntravenosa", label: "Vía de administración" },
      { key: "medicamento", label: "Medicamento" },
      { key: "frecuencia", label: "Frecuencia" },
      { key: "detalleCambioTratamiento", label: "Detalle cambio de tratamiento" },
      { key: "fecha1erTratamiento", label: "Fecha 1er tratamiento", type: "date" },
      { key: "motivoNoInicioTratamiento", label: "Motivo de no inicio de tratamiento" },
      { key: "fechaAbandonoTratamiento", label: "Fecha de abandono", type: "date" },
      { key: "motivoAbandono", label: "Motivo de abandono" },
      { key: "fechaUltimoContactoTto", label: "Fecha último contacto", type: "date" },
      { key: "derivadoCentroSalud", label: "Derivado a centro de salud desde SEPA" },
    ],
  },
  {
    title: "Evolución",
    fields: [
      { key: "detalleEvolucion", label: "Detalle de evolución" },
      { key: "evolucionEnfermedad", label: "Evolución de la enfermedad" },
      { key: "atencionCophoePadomi", label: "Atención COPHOE/PADOMI" },
      { key: "teleconsultas", label: "Teleconsultas" },
      { key: "psiquiatria", label: "Psiquiatría" },
      { key: "comorbilidad", label: "Comorbilidad" },
      { key: "discapacidad", label: "Discapacidad" },
      { key: "familiaresCancer", label: "Familiares con cáncer" },
    ],
  },
  {
    title: "Situación Social",
    fields: [
      { key: "violenciaIntrafamiliar", label: "Violencia intrafamiliar" },
      { key: "cocinaLena", label: "Cocina a leña" },
      { key: "trabaja", label: "¿Trabaja?" },
      { key: "recibeAyudaEconomica", label: "Recibe ayuda económica" },
      { key: "limitacionConsultas", label: "Limitación para consultas" },
    ],
  },
  {
    title: "Servicios y Derivaciones",
    fields: [
      { key: "derivadoAsistentaSocial", label: "Derivado a asistenta social" },
      { key: "derivadoSusalud", label: "Derivado a SUSALUD" },
      { key: "nroRegistroSusalud", label: "N° registro SUSALUD" },
      { key: "guiaAlimentacion", label: "Guía de alimentación" },
      { key: "participaGam", label: "Participa en GAM" },
      { key: "satisfaccionPrograma", label: "Satisfacción con el programa" },
      { key: "cambiosBienestar", label: "Cambios en bienestar" },
    ],
  },
]
