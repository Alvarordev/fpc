import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Replicamos los schemas de cada paso para testear su validación
// Esto asegura que las reglas de negocio del formulario estén correctas

const step1Schema = z.object({
  q1_comentarios: z.string(),
  q2_horaInicio: z.string().min(1, 'Ingrese la hora de inicio'),
})

const step2Schema = z.object({
  q3_acuerdo: z.string().min(1, 'Seleccione una opción'),
  q4_tipo: z.string().min(1, 'Seleccione una opción'),
})

const step3Schema = z
  .object({
    q5_esPacienteOnco: z.string(),
    q6_esFamiliar: z.string(),
    q7_nombreTercero: z.string(),
    _tipo: z.string(),
  })
  .refine(
    (data) => data._tipo !== 'Para mi' || data.q5_esPacienteOnco !== '',
    { message: 'Seleccione una opción', path: ['q5_esPacienteOnco'] },
  )
  .refine(
    (data) => data._tipo !== 'Para un tercero (familar /amigo)' || data.q6_esFamiliar !== '',
    { message: 'Seleccione una opción', path: ['q6_esFamiliar'] },
  )

const step4Schema = z.object({
  q8_consentimiento: z.string().min(1, 'Seleccione una opción'),
})

const step6Schema = z.object({
  q27_categoria: z.string().min(1, 'Seleccione la categoría del paciente'),
})

const step8Schema = z.object({
  q132_encuestaAceptada: z.string().min(1, 'Seleccione una opción'),
  q133_horaFin: z.string().min(1, 'Ingrese la hora de fin'),
})

describe('Schemas de Validación del Enrolamiento', () => {
  describe('Step 1 - Inicio', () => {
    it('debe aceptar datos válidos', () => {
      const result = step1Schema.safeParse({
        q1_comentarios: 'Comentario de prueba',
        q2_horaInicio: '10:30',
      })
      expect(result.success).toBe(true)
    })

    it('debe rechazar si falta la hora de inicio', () => {
      const result = step1Schema.safeParse({
        q1_comentarios: '',
        q2_horaInicio: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('q2_horaInicio')
      }
    })

    it('debe permitir comentarios vacíos', () => {
      const result = step1Schema.safeParse({
        q1_comentarios: '',
        q2_horaInicio: '09:00',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Step 2 - Consentimiento', () => {
    it('debe aceptar cuando el paciente está de acuerdo y afiliación es para él', () => {
      const result = step2Schema.safeParse({
        q3_acuerdo: 'Sí',
        q4_tipo: 'Para mi',
      })
      expect(result.success).toBe(true)
    })

    it('debe aceptar cuando el paciente NO está de acuerdo (para testear rechazo)', () => {
      const result = step2Schema.safeParse({
        q3_acuerdo: 'No',
        q4_tipo: 'Para mi',
      })
      expect(result.success).toBe(true)
    })

    it('debe aceptar afiliación para tercero', () => {
      const result = step2Schema.safeParse({
        q3_acuerdo: 'Sí',
        q4_tipo: 'Para un tercero (familar /amigo)',
      })
      expect(result.success).toBe(true)
    })

    it('debe rechazar si falta q3_acuerdo', () => {
      const result = step2Schema.safeParse({
        q3_acuerdo: '',
        q4_tipo: 'Para mi',
      })
      expect(result.success).toBe(false)
    })

    it('debe rechazar si falta q4_tipo', () => {
      const result = step2Schema.safeParse({
        q3_acuerdo: 'Sí',
        q4_tipo: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('Step 3 - Identificación', () => {
    it('debe aceptar cuando el tipo es "Para mi" y es paciente oncológico', () => {
      const result = step3Schema.safeParse({
        _tipo: 'Para mi',
        q5_esPacienteOnco: 'Sí',
        q6_esFamiliar: '',
        q7_nombreTercero: '',
      })
      expect(result.success).toBe(true)
    })

    it('debe rechazar cuando el tipo es "Para mi" pero no responde q5', () => {
      const result = step3Schema.safeParse({
        _tipo: 'Para mi',
        q5_esPacienteOnco: '',
        q6_esFamiliar: '',
        q7_nombreTercero: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('q5_esPacienteOnco')
      }
    })

    it('debe aceptar cuando el tipo es tercero y es familiar', () => {
      const result = step3Schema.safeParse({
        _tipo: 'Para un tercero (familar /amigo)',
        q5_esPacienteOnco: '',
        q6_esFamiliar: 'Sí',
        q7_nombreTercero: 'Juan Pérez',
      })
      expect(result.success).toBe(true)
    })

    it('debe rechazar cuando el tipo es tercero pero no responde q6', () => {
      const result = step3Schema.safeParse({
        _tipo: 'Para un tercero (familar /amigo)',
        q5_esPacienteOnco: '',
        q6_esFamiliar: '',
        q7_nombreTercero: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('q6_esFamiliar')
      }
    })
  })

  describe('Step 4 - Consentimiento Informado', () => {
    it('debe aceptar "Acepto"', () => {
      const result = step4Schema.safeParse({ q8_consentimiento: 'Acepto' })
      expect(result.success).toBe(true)
    })

    it('debe aceptar "No acepto" (para testear rechazo)', () => {
      const result = step4Schema.safeParse({ q8_consentimiento: 'No acepto' })
      expect(result.success).toBe(true)
    })

    it('debe rechazar valor vacío', () => {
      const result = step4Schema.safeParse({ q8_consentimiento: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('Step 6 - Categorización', () => {
    it('debe aceptar todas las categorías válidas', () => {
      const categorias = [
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

      for (const cat of categorias) {
        const result = step6Schema.safeParse({ q27_categoria: cat })
        expect(result.success, `Categoría "${cat}" debería ser válida`).toBe(true)
      }
    })

    it('debe rechazar categoría vacía', () => {
      const result = step6Schema.safeParse({ q27_categoria: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('Step 8 - Cierre', () => {
    it('debe aceptar datos de cierre válidos', () => {
      const result = step8Schema.safeParse({
        q132_encuestaAceptada: 'Sí',
        q133_horaFin: '11:30',
      })
      expect(result.success).toBe(true)
    })

    it('debe rechazar si falta la encuesta', () => {
      const result = step8Schema.safeParse({
        q132_encuestaAceptada: '',
        q133_horaFin: '11:30',
      })
      expect(result.success).toBe(false)
    })

    it('debe rechazar si falta la hora de fin', () => {
      const result = step8Schema.safeParse({
        q132_encuestaAceptada: 'No',
        q133_horaFin: '',
      })
      expect(result.success).toBe(false)
    })
  })
})
