import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}))

vi.mock('@/app/(dashboard)/pacientes/[id]/_hooks/use-patient', () => ({
  usePatient: () => ({ data: null }),
  useDeleteProspect: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ error: null }),
      eq: () => ({ single: () => ({ data: null, error: null }) }),
    }),
  },
}))

const { useEnrollmentStore } = await import('../_store/enrollment-store')
const { EnrollmentShell } = await import('./enrollment-shell')

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('Enrollment Shell - Integración', () => {
  beforeEach(() => {
    useEnrollmentStore.getState().resetEnrollment()
  })

  it('debe renderizar el paso 1 por defecto', () => {
    render(<EnrollmentShell />)
    expect(screen.getByRole('heading', { name: /paso 1: inicio de afiliación/i })).toBeInTheDocument()
  })

  it('debe renderizar el paso 2 cuando currentStep es 2', () => {
    useEnrollmentStore.getState().goToStep(2)
    render(<EnrollmentShell />)
    expect(screen.getByRole('heading', { name: /paso 2: consentimiento de datos/i })).toBeInTheDocument()
  })

  it('debe renderizar el paso 3 cuando currentStep es 3', () => {
    useEnrollmentStore.getState().goToStep(3)
    render(<EnrollmentShell />)
    expect(screen.getByRole('heading', { name: /paso 3: identificación del llamante/i })).toBeInTheDocument()
  })

  it('debe renderizar el paso 4 cuando currentStep es 4', () => {
    useEnrollmentStore.getState().goToStep(4)
    render(<EnrollmentShell />)
    expect(screen.getByRole('heading', { name: /paso 4: consentimiento informado/i })).toBeInTheDocument()
  })

  it('debe renderizar el paso 5 cuando currentStep es 5', () => {
    useEnrollmentStore.getState().goToStep(5)
    render(<EnrollmentShell />)
    expect(screen.getByRole('heading', { name: /paso 5: datos del paciente/i })).toBeInTheDocument()
  })

  it('debe renderizar el paso 6 cuando currentStep es 6', () => {
    useEnrollmentStore.getState().goToStep(6)
    render(<EnrollmentShell />)
    expect(screen.getByRole('heading', { name: /paso 6: categorización del paciente/i })).toBeInTheDocument()
  })

  it('debe renderizar el paso 7 cuando currentStep es 7', () => {
    useEnrollmentStore.getState().goToStep(7)
    useEnrollmentStore.getState().saveStepData({ q27_categoria: 'Servicios FPC' })
    render(<EnrollmentShell />)
    expect(screen.getByRole('heading', { name: /paso 7: atención especializada/i })).toBeInTheDocument()
  })

  it('debe renderizar el paso 8 cuando currentStep es 8', () => {
    useEnrollmentStore.getState().goToStep(8)
    renderWithQuery(<EnrollmentShell />)
    expect(screen.getByRole('heading', { name: /paso 8: cierre de llamada/i })).toBeInTheDocument()
  })

  it('debe renderizar pantalla de rechazo cuando hay rejectionReason q3_no', () => {
    useEnrollmentStore.getState().goToStep(2)
    useEnrollmentStore.getState().setRejection('q3_no')
    render(<EnrollmentShell />)
    expect(screen.getByText(/acuerdo no otorgado/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /inscripción no autorizada/i })).toBeInTheDocument()
  })

  it('debe renderizar pantalla de rechazo cuando hay rejectionReason q8_no', () => {
    useEnrollmentStore.getState().goToStep(4)
    useEnrollmentStore.getState().setRejection('q8_no')
    render(<EnrollmentShell />)
    expect(screen.getByText(/consentimiento rechazado/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /consentimiento informado no aceptado/i })).toBeInTheDocument()
  })

  it('debe renderizar pantalla de rechazo cuando hay rejectionReason q27_privado', () => {
    useEnrollmentStore.getState().goToStep(6)
    useEnrollmentStore.getState().setRejection('q27_privado')
    render(<EnrollmentShell />)
    expect(screen.getByText(/seguro privado detectado/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /paciente no elegible/i })).toBeInTheDocument()
  })
})
