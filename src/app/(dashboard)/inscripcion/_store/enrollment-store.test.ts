import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}))

const { useEnrollmentStore } = await import('../_store/enrollment-store')
const { TOTAL_STEPS } = await import('../_types/enrollment-types')

describe('Enrollment Store', () => {
  beforeEach(() => {
    useEnrollmentStore.getState().resetEnrollment()
  })

  describe('navegación entre pasos', () => {
    it('debe iniciar en el paso 1', () => {
      expect(useEnrollmentStore.getState().currentStep).toBe(1)
    })

    it('debe avanzar al siguiente paso con nextStep()', () => {
      useEnrollmentStore.getState().nextStep()
      expect(useEnrollmentStore.getState().currentStep).toBe(2)
    })

    it('debe retroceder al paso anterior con prevStep()', () => {
      useEnrollmentStore.getState().goToStep(5)
      useEnrollmentStore.getState().prevStep()
      expect(useEnrollmentStore.getState().currentStep).toBe(4)
    })

    it('no debe pasar del último paso', () => {
      useEnrollmentStore.getState().goToStep(TOTAL_STEPS)
      useEnrollmentStore.getState().nextStep()
      expect(useEnrollmentStore.getState().currentStep).toBe(TOTAL_STEPS)
    })

    it('no debe retroceder del paso 1', () => {
      useEnrollmentStore.getState().prevStep()
      expect(useEnrollmentStore.getState().currentStep).toBe(1)
    })

    it('debe permitir ir a un paso específico con goToStep()', () => {
      useEnrollmentStore.getState().goToStep(3)
      expect(useEnrollmentStore.getState().currentStep).toBe(3)
    })

    it('no debe permitir ir a un paso menor que 1', () => {
      useEnrollmentStore.getState().goToStep(0)
      expect(useEnrollmentStore.getState().currentStep).toBe(1)
    })

    it('no debe permitir ir a un paso mayor que TOTAL_STEPS', () => {
      useEnrollmentStore.getState().goToStep(99)
      expect(useEnrollmentStore.getState().currentStep).toBe(TOTAL_STEPS)
    })
  })

  describe('guardado de datos', () => {
    it('debe guardar datos del paso con saveStepData()', () => {
      useEnrollmentStore.getState().saveStepData({ q1_comentarios: 'Test comment' })
      expect(useEnrollmentStore.getState().formData.q1_comentarios).toBe('Test comment')
    })

    it('debe mergear datos sin sobrescribir los anteriores', () => {
      const store = useEnrollmentStore.getState()
      store.saveStepData({ q1_comentarios: 'Comment 1' })
      store.saveStepData({ q2_horaInicio: '10:00' })
      expect(useEnrollmentStore.getState().formData).toMatchObject({
        q1_comentarios: 'Comment 1',
        q2_horaInicio: '10:00',
      })
    })
  })

  describe('rechazos', () => {
    it('debe registrar rechazo por q3_no', () => {
      useEnrollmentStore.getState().setRejection('q3_no')
      expect(useEnrollmentStore.getState().rejectionReason).toBe('q3_no')
    })

    it('debe registrar rechazo por q8_no', () => {
      useEnrollmentStore.getState().setRejection('q8_no')
      expect(useEnrollmentStore.getState().rejectionReason).toBe('q8_no')
    })

    it('debe registrar rechazo por q27_privado', () => {
      useEnrollmentStore.getState().setRejection('q27_privado')
      expect(useEnrollmentStore.getState().rejectionReason).toBe('q27_privado')
    })

    it('debe limpiar el rechazo con clearRejection()', () => {
      const store = useEnrollmentStore.getState()
      store.setRejection('q3_no')
      store.clearRejection()
      expect(store.rejectionReason).toBeNull()
    })

    it('debe permitir volver al paso anterior después de un rechazo', () => {
      const store = useEnrollmentStore.getState()
      store.goToStep(4)
      store.setRejection('q8_no')
      store.clearRejection()
      store.prevStep()
      expect(useEnrollmentStore.getState().currentStep).toBe(3)
    })
  })

  describe('gestión de prospecto', () => {
    it('debe guardar el prospectoId', () => {
      useEnrollmentStore.getState().setProspectoId('prospect-123')
      expect(useEnrollmentStore.getState().prospectoId).toBe('prospect-123')
    })

    it('debe limpiar el prospectoId al resetear', () => {
      const store = useEnrollmentStore.getState()
      store.setProspectoId('prospect-123')
      store.resetEnrollment()
      expect(store.prospectoId).toBeNull()
    })
  })

  describe('completar enrolamiento', () => {
    it('debe marcar como completo', () => {
      useEnrollmentStore.getState().completeEnrollment()
      expect(useEnrollmentStore.getState().isComplete).toBe(true)
    })
  })

  describe('reset', () => {
    it('debe resetear todo el estado al inicial', () => {
      const store = useEnrollmentStore.getState()
      store.goToStep(5)
      store.saveStepData({ q1_comentarios: 'test' })
      store.setRejection('q3_no')
      store.setProspectoId('123')
      store.completeEnrollment()

      store.resetEnrollment()

      expect(store.currentStep).toBe(1)
      expect(store.formData).toEqual({})
      expect(store.rejectionReason).toBeNull()
      expect(store.prospectoId).toBeNull()
      expect(store.isComplete).toBe(false)
    })
  })
})
