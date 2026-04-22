import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}))

vi.mock('@/components/hospital-select', () => ({
  HospitalSelect: ({ value, onChange }: { value?: string; onChange?: (v: string) => void }) => (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      data-testid="hospital-select"
    />
  ),
}))

const { useEnrollmentStore } = await import('../../_store/enrollment-store')
const { Step7Atencion } = await import('./step-7-atencion')

describe('Step 7 - Atención (Ramas por categoría)', () => {
  beforeEach(() => {
    const store = useEnrollmentStore.getState()
    store.resetEnrollment()
    store.goToStep(7)
  })

  function setupStore(categoria: string) {
    useEnrollmentStore.getState().saveStepData({ q27_categoria: categoria })
  }

  it('debe renderizar campos de Signos y Síntomas / Seguro', () => {
    setupStore('Signos y Síntomas / Seguro')
    render(<Step7Atencion />)
    expect(screen.getByRole('heading', { name: /signos y síntomas/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /atención médica/i })).toBeInTheDocument()
    expect(screen.getByText(/¿ha presentado algún malestar\?/i)).toBeInTheDocument()
  })

  it('debe renderizar campos de Signos y Sintomas / EPS-ESSALUD', () => {
    setupStore('Signos y Sintomas / EPS-ESSALUD')
    render(<Step7Atencion />)
    expect(screen.getByRole('heading', { name: /datos del seguro eps/i })).toBeInTheDocument()
    expect(screen.getByText(/eps del paciente/i)).toBeInTheDocument()
  })

  it('debe renderizar campos de Signos y Síntomas / No Seguro', () => {
    setupStore('Signos y Síntomas / No Seguro')
    render(<Step7Atencion />)
    expect(screen.getByRole('heading', { name: /signos y síntomas/i })).toBeInTheDocument()
    expect(screen.getByText(/¿cuándo podría afiliarse al sis\?/i)).toBeInTheDocument()
  })

  it('debe renderizar campos de Diagnóstico de Cáncer / Seguro', () => {
    setupStore('Diagnóstico de Cáncer / Seguro')
    render(<Step7Atencion />)
    expect(screen.getByRole('heading', { name: /diagnóstico oncológico/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /servicios de apoyo/i })).toBeInTheDocument()
    expect(screen.getByText(/¿se derivó con la asistenta social\?/i)).toBeInTheDocument()
  })

  it('debe renderizar campos de Diagnostico de Cancer / EPS-ESSALUD', () => {
    setupStore('Diagnostico de Cancer / EPS-ESSALUD')
    render(<Step7Atencion />)
    expect(screen.getByRole('heading', { name: /datos del seguro eps/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /diagnóstico oncológico/i })).toBeInTheDocument()
  })

  it('debe renderizar campos de Diagnóstico de Cáncer / No Seguro', () => {
    setupStore('Diagnóstico de Cáncer / No Seguro')
    render(<Step7Atencion />)
    expect(screen.getByRole('heading', { name: /diagnóstico oncológico/i })).toBeInTheDocument()
    expect(screen.getByText(/¿cuándo podría afiliarse al sis\?/i)).toBeInTheDocument()
  })

  it('debe renderizar campos de Servicio Psicooncológico', () => {
    setupStore('Servicio Psicooncológico')
    render(<Step7Atencion />)
    expect(screen.getByRole('heading', { name: /situación emocional/i })).toBeInTheDocument()
    expect(screen.getByText(/termómetro de malestar emocional/i)).toBeInTheDocument()
  })

  it('debe renderizar campos de Servicios FPC', () => {
    setupStore('Servicios FPC')
    render(<Step7Atencion />)
    expect(screen.getByRole('heading', { name: /servicio requerido/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/describa el servicio requerido/i)).toBeInTheDocument()
  })

  it('debe renderizar campos de Otros', () => {
    setupStore('Otros')
    render(<Step7Atencion />)
    expect(screen.getByRole('heading', { name: /descripción de la consulta/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/describa el motivo de la consulta/i)).toBeInTheDocument()
  })
})
