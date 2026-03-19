export type Q27Branch =
  | "signos_seguro"
  | "signos_eps"
  | "signos_privado"
  | "signos_noseguro"
  | "dx_seguro"
  | "dx_eps"
  | "dx_privado"
  | "dx_noseguro"
  | "psico"
  | "fpc"
  | "otros"

export type RejectionReason = "q3_no" | "q8_no" | "q27_privado"

export const Q27_BRANCH_MAP: Record<string, Q27Branch> = {
  "Signos y Síntomas / Seguro": "signos_seguro",
  "Signos y Sintomas / EPS-ESSALUD": "signos_eps",
  "Signos y Sintomas / Privado": "signos_privado",
  "Signos y Síntomas / No Seguro": "signos_noseguro",
  "Diagnóstico de Cáncer / Seguro": "dx_seguro",
  "Diagnostico de Cancer / EPS-ESSALUD": "dx_eps",
  "Diagnostico de Cancer / Privado": "dx_privado",
  "Diagnóstico de Cáncer / No Seguro": "dx_noseguro",
  "Servicio Psicooncológico": "psico",
  "Servicios FPC": "fpc",
  Otros: "otros",
}

export const BRANCH_LABELS: Record<Q27Branch, string> = {
  signos_seguro: "Signos y Síntomas / Seguro",
  signos_eps: "Signos y Síntomas / EPS-EsSalud",
  signos_privado: "Signos y Síntomas / Privado",
  signos_noseguro: "Signos y Síntomas / Sin Seguro",
  dx_seguro: "Diagnóstico de Cáncer / Seguro",
  dx_eps: "Diagnóstico de Cáncer / EPS-EsSalud",
  dx_privado: "Diagnóstico de Cáncer / Privado",
  dx_noseguro: "Diagnóstico de Cáncer / Sin Seguro",
  psico: "Servicio Psicooncológico",
  fpc: "Servicios FPC",
  otros: "Otros",
}

export interface EnrollmentFormData {
  // Step 1
  q1_comentarios: string
  q2_horaInicio: string
  // Step 2
  q3_acuerdo: string
  q4_tipo: string
  // Step 3
  q5_esPacienteOnco: string
  q6_esFamiliar: string
  q7_nombreTercero: string
  // Step 4
  q8_consentimiento: string
  // Step 5
  q9_nombrePaciente: string
  q10_dni: string
  q11_fechaNacimiento: string
  q12_lugarNacimiento: string
  q13_direccion: string
  q14_departamentoResidencia: string
  q15_tiempoHospital: string
  q16_dniCoincide: string
  q17_telefono: string
  q18_telefonoAuxiliar: string
  q19_telefonoFamiliar: string
  q20_nombreFamiliar: string
  q21_tieneWhatsapp: string
  q22_gradoInstruccion: string
  q23_lenguaOriginaria: string
  q24_requiereTraduccion: string
  q25_tieneSeguro: string
  q26_tipoSeguro: string
  // Step 6
  q27_categoria: string
  // Step 7 branch fields
  [key: string]: string
}

export const TOTAL_STEPS = 8

export const STEP_LABELS: Record<number, string> = {
  1: "Inicio",
  2: "Datos",
  3: "Identificación",
  4: "Consentimiento",
  5: "Paciente",
  6: "Categorización",
  7: "Atención",
  8: "Cierre",
}

export const PERU_DEPARTAMENTOS = [
  "AMAZONAS",
  "ANCASH",
  "APURIMAC",
  "AREQUIPA",
  "AYACUCHO",
  "CAJAMARCA",
  "CALLAO",
  "CUSCO",
  "HUANCAVELICA",
  "HUANUCO",
  "ICA",
  "JUNIN",
  "LA LIBERTAD",
  "LAMBAYEQUE",
  "LIMA",
  "LORETO",
  "MADRE DE DIOS",
  "MOQUEGUA",
  "PASCO",
  "PIURA",
  "PUNO",
  "SAN MARTIN",
  "TACNA",
  "TUMBES",
  "UCAYALI",
]
