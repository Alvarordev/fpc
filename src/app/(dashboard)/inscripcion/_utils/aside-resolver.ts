import type { Q27Branch } from "../_types/enrollment-types"

export interface ChecklistItem {
  text: string
}

export interface AsideContent {
  script: string
  checklist: ChecklistItem[]
  complianceNote?: string
  reference: string
}

const STEP_CONTENT: Record<number, AsideContent> = {
  1: {
    script:
      "Buenos días / Buenas Tardes. Bienvenido/a al Programa SEPA de la Fundación Peruana de Cáncer. Le saluda [Nombre], ejecutiva del programa SEPA. ¿Me brinda su nombre por favor?",
    checklist: [
      { text: "Presentarse al inicio de la llamada con nombre completo" },
      { text: "Anotar comentarios relevantes antes de continuar" },
      { text: "Registrar la hora exacta de inicio de afiliación" },
    ],
    reference: "SEPA Protocol — Apertura de Sesión v4.2",
  },

  2: {
    script:
      "Para poder continuar, es preciso mencionarle que esta llamada se encuentra regida por la Ley 26842 y la Ley 29733 sobre la protección de Datos Personales. Esta llamada podría ser grabada por temas de calidad. ¿Está usted de acuerdo con continuar?",
    checklist: [
      { text: "Obtener acuerdo explícito del paciente antes de continuar" },
      { text: "Identificar si la afiliación es propia o de un tercero" },
      { text: "Registrar el tipo de afiliación con precisión" },
    ],
    complianceNote:
      "Sin el acuerdo explícito del paciente, la inscripción debe detenerse inmediatamente. No proceder bajo ninguna circunstancia.",
    reference: "SEPA Protocol — Autorización de Datos v4.2",
  },

  3: {
    script:
      "¿Me podría indicar si usted es el paciente oncológico, o si está realizando esta afiliación en nombre de un familiar o amigo?",
    checklist: [
      { text: "Confirmar la relación del llamante con el paciente oncológico" },
      { text: "Registrar nombre completo del acompañante o tercero si aplica" },
    ],
    reference: "SEPA Protocol — Identificación del Llamante v4.2",
  },

  4: {
    script:
      "Le voy a leer el consentimiento informado. Al finalizar la lectura, por favor indíqueme si acepta o no acepta participar en el Programa SEPA y autorizar el uso de sus datos.",
    checklist: [
      { text: "Leer el consentimiento completo sin interrupciones" },
      { text: "Registrar la respuesta del paciente con exactitud" },
      { text: "Si no acepta, finalizar la llamada cordialmente" },
    ],
    complianceNote:
      "El consentimiento verbal es jurídicamente válido. Registre la respuesta con absoluta precisión. No continúe si el paciente no acepta.",
    reference: "SEPA Protocol — Consentimiento Informado v4.2",
  },

  5: {
    script:
      "Para proceder con su registro, ¿podría indicarme el nombre completo del paciente y su número de DNI, por favor?",
    checklist: [
      { text: "Verificar que el nombre coincida exactamente con el DNI" },
      { text: "Confirmar dirección actual de residencia para seguimiento" },
      { text: "Preguntar si el paciente tiene número de contacto secundario" },
    ],
    complianceNote:
      "Asegúrese de que el paciente comprende que sus datos serán tratados bajo las regulaciones de privacidad de la Fundación Peruana de Cáncer.",
    reference: "SEPA Protocol — Verificación de Identidad v4.2",
  },

  6: {
    script:
      "Con base en la información brindada, vamos a identificar la categoría que mejor describe su situación, para conectarle con la atención más adecuada dentro del programa.",
    checklist: [
      { text: "Determinar si el paciente cuenta con seguro de salud activo" },
      { text: "Identificar si presenta signos/síntomas o tiene diagnóstico confirmado" },
      { text: "Los pacientes con seguro privado no son elegibles para el programa" },
    ],
    complianceNote:
      "Las personas con seguro privado (EPS particular) no son elegibles para el Programa SEPA. Deben ser redirigidas a sus aseguradoras correspondientes.",
    reference: "SEPA Protocol — Categorización Clínica v4.2",
  },

  8: {
    script:
      "Muchas gracias por su tiempo. Finalmente, le informo que le enviaremos una breve encuesta de satisfacción del 1 al 5 por WhatsApp. Recuerde que puede contactarnos al 080074012 de lunes a viernes de 8:30 a.m. a 5:30 p.m.",
    checklist: [
      { text: "Confirmar y revisar todos los datos antes de cerrar" },
      { text: "Informar al paciente sobre la encuesta de satisfacción por WhatsApp" },
      { text: "Registrar la hora exacta de fin de llamada" },
    ],
    reference: "SEPA Protocol — Cierre de Sesión v4.2",
  },
}

const BRANCH_CONTENT: Record<Q27Branch, AsideContent> = {
  signos_seguro: {
    script:
      "Entiendo su situación. Dado que cuenta con seguro y presenta signos o síntomas, nuestro equipo le brindará orientación para acceder a la atención médica correspondiente a través de su seguro.",
    checklist: [
      { text: "Registrar signos y síntomas con detalle" },
      { text: "Verificar si ya solicitó consulta médica" },
      { text: "Confirmar si cuenta con hoja de referencia" },
    ],
    reference: "SEPA Protocol — Signos y Síntomas / Seguro v4.2",
  },
  signos_eps: {
    script:
      "Entiendo. Con su cobertura EPS/EsSalud, puede acceder a su aseguradora directamente. ¿Podría indicarme con qué EPS cuenta actualmente?",
    checklist: [
      { text: "Identificar la EPS o cobertura EsSalud del paciente" },
      { text: "Registrar los signos y síntomas presentados" },
      { text: "Verificar si ha solicitado consulta médica previamente" },
    ],
    complianceNote:
      "Si el paciente no ha solicitado consulta médica, proporcionar información de contacto de su EPS para orientación.",
    reference: "SEPA Protocol — Signos y Síntomas / EPS v4.2",
  },
  signos_privado: {
    script:
      "Estimado/a, el Programa SEPA está dirigido exclusivamente a población vulnerable sin seguro privado. Por este motivo, las personas con seguro privado no pueden inscribirse. Le estaremos enviando información de contacto de su aseguradora por WhatsApp.",
    checklist: [
      { text: "Informar al paciente sobre la inelegibilidad del programa" },
      { text: "Enviar información de contacto de aseguradoras por WhatsApp" },
      { text: "Compartir enlace del canal de prevención de WhatsApp" },
    ],
    complianceNote:
      "Este paciente no es elegible para el Programa SEPA. Proporcionar información de seguros privados y finalizar la inscripción.",
    reference: "SEPA Protocol — Derivación Seguro Privado v4.2",
  },
  signos_noseguro: {
    script:
      "Le comentamos que actualmente toda persona sin seguro puede afiliarse al SIS de forma gratuita. Puede llamar a la línea 113 opción 4, escribir al WhatsApp SIS 941 986 682, o descargar la app Asegúrate e Infórmate.",
    checklist: [
      { text: "Informar sobre opciones de afiliación al SIS" },
      { text: "Registrar signos y síntomas del paciente" },
      { text: "Generar caso para seguimiento de un asesor" },
    ],
    reference: "SEPA Protocol — Signos y Síntomas / Sin Seguro v4.2",
  },
  dx_seguro: {
    script:
      "Entendemos que el paciente tiene un diagnóstico de cáncer confirmado y cuenta con seguro. Nuestro equipo le brindará acompañamiento integral a lo largo de su tratamiento.",
    checklist: [
      { text: "Registrar tipo de cáncer y estadio si está disponible" },
      { text: "Confirmar si tiene informe médico para enviar por WhatsApp" },
      { text: "Verificar si está recibiendo tratamiento actualmente" },
    ],
    complianceNote:
      "Si el paciente está fuera de Lima con seguro SIS y necesita transporte u hospedaje, referirlo a la asistenta social del hospital.",
    reference: "SEPA Protocol — Diagnóstico de Cáncer / Seguro v4.2",
  },
  dx_eps: {
    script:
      "Con su cobertura EPS/EsSalud y diagnóstico confirmado, puede acceder a los grupos de acompañamiento mutuo: Grupo Cerezos en Flor para el paciente, y Grupo Fortaleza para familiares.",
    checklist: [
      { text: "Registrar tipo de cáncer y EPS del paciente" },
      { text: "Confirmar si tiene informe médico disponible" },
      { text: "Informar sobre los grupos de acompañamiento mutuo" },
    ],
    reference: "SEPA Protocol — Diagnóstico de Cáncer / EPS v4.2",
  },
  dx_privado: {
    script:
      "Estimado/a, el Programa SEPA está dirigido exclusivamente a población vulnerable sin seguro privado. Le estaremos enviando información de su aseguradora y el enlace de nuestro canal de prevención en WhatsApp.",
    checklist: [
      { text: "Informar sobre la inelegibilidad para el programa" },
      { text: "Enviar información de aseguradoras privadas por WhatsApp" },
      { text: "Compartir canal de prevención de WhatsApp" },
    ],
    complianceNote:
      "Este paciente no es elegible para el Programa SEPA. Proporcionar derivación a seguro privado y finalizar.",
    reference: "SEPA Protocol — Derivación Seguro Privado v4.2",
  },
  dx_noseguro: {
    script:
      "Entendemos la situación. Con un diagnóstico de cáncer y sin seguro activo, nuestro equipo le orientará en el proceso de afiliación al SIS y en el acceso a los servicios del programa.",
    checklist: [
      { text: "Registrar tipo de cáncer y estadio si disponible" },
      { text: "Confirmar si tiene informe médico" },
      { text: "Orientar sobre afiliación al SIS y servicios disponibles" },
    ],
    reference: "SEPA Protocol — Diagnóstico de Cáncer / Sin Seguro v4.2",
  },
  psico: {
    script:
      "La Fundación Peruana de Cáncer ofrece cuatro sesiones individuales de psicooncología, cada una de 30 a 45 minutos. También puede participar de las sesiones grupales ilimitadas a través de la alianza Desde el Jardín de los Cerezos.",
    checklist: [
      { text: "Informar sobre las 4 sesiones individuales disponibles" },
      { text: "Mencionar los grupos de acompañamiento mutuo" },
      { text: "El asesor confirmará fecha y hora en máximo 48 horas" },
    ],
    complianceNote:
      "Si el paciente es pediátrico, los padres deciden quién llevará las consultas psicológicas.",
    reference: "SEPA Protocol — Servicio Psicooncológico v4.2",
  },
  fpc: {
    script:
      "El Programa SEPA se limita a brindar servicios gratuitos de educación en prevención y acompañamiento al paciente oncológico. Para otros servicios de nuestro Albergue, le derivaremos para que puedan orientarle.",
    checklist: [
      { text: "Identificar el servicio específico que requiere el paciente" },
      { text: "Evaluar si aplica derivación al Albergue FPC" },
      { text: "Registrar necesidad de charlas educativas si aplica" },
    ],
    reference: "SEPA Protocol — Servicios FPC v4.2",
  },
  otros: {
    script:
      "Entendemos su consulta. Por favor, descríbame con detalle la situación para poder orientarle de la mejor manera posible dentro de los servicios del Programa SEPA.",
    checklist: [
      { text: "Registrar el motivo de consulta con detalle" },
      { text: "Identificar el tipo de atención o derivación necesaria" },
    ],
    reference: "SEPA Protocol — Consulta General v4.2",
  },
}

export function resolveAsideContent(
  step: number,
  branch?: Q27Branch | null,
): AsideContent {
  if (step === 7 && branch && BRANCH_CONTENT[branch]) {
    return BRANCH_CONTENT[branch]
  }
  return (
    STEP_CONTENT[step] ?? {
      script: "Complete los campos de este paso para continuar con la inscripción.",
      checklist: [],
      reference: "SEPA Protocol v4.2",
    }
  )
}
