import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: (v: string) => void }) => (
    <select value={value ?? ''} onChange={(e) => onValueChange?.(e.target.value)} data-testid="select">
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder ?? 'Seleccionar...'}</option>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>,
  SelectGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectLabel: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectSeparator: () => null,
  SelectScrollUpButton: () => null,
  SelectScrollDownButton: () => null,
}))

const { useEnrollmentStore } = await import('../../_store/enrollment-store')
const { Step4Consentimiento } = await import('./step-4-consentimiento')
const { Step6Categoria } = await import('./step-6-categoria')

describe('Step 4 - Consentimiento Informado (Rechazo q8_no)', () => {
  beforeEach(() => {
    const store = useEnrollmentStore.getState()
    store.resetEnrollment()
    store.goToStep(4)
  })

  it('debe registrar rechazo q8_no cuando el paciente no acepta', async () => {
    const user = userEvent.setup()
    render(<Step4Consentimiento />)

    const select = screen.getByTestId('select')
    await user.selectOptions(select, 'No acepto')

    const submitButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(useEnrollmentStore.getState().rejectionReason).toBe('q8_no')
    })
  })

  it('debe avanzar al paso 5 cuando el paciente acepta', async () => {
    const user = userEvent.setup()
    render(<Step4Consentimiento />)

    const select = screen.getByTestId('select')
    await user.selectOptions(select, 'Acepto')

    const submitButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(useEnrollmentStore.getState().currentStep).toBe(5)
      expect(useEnrollmentStore.getState().rejectionReason).toBeNull()
    })
  })
})

describe('Step 6 - Categorización (Rechazo q27_privado)', () => {
  beforeEach(() => {
    const store = useEnrollmentStore.getState()
    store.resetEnrollment()
    store.goToStep(6)
  })

  it('debe registrar rechazo q27_privado para Signos y Sintomas / Privado', async () => {
    const user = userEvent.setup()
    render(<Step6Categoria />)

    const select = screen.getByTestId('select')
    await user.selectOptions(select, 'Signos y Sintomas / Privado')

    const submitButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(useEnrollmentStore.getState().rejectionReason).toBe('q27_privado')
    })
  })

  it('debe registrar rechazo q27_privado para Diagnostico de Cancer / Privado', async () => {
    const user = userEvent.setup()
    render(<Step6Categoria />)

    const select = screen.getByTestId('select')
    await user.selectOptions(select, 'Diagnostico de Cancer / Privado')

    const submitButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(useEnrollmentStore.getState().rejectionReason).toBe('q27_privado')
    })
  })

  it('debe avanzar al paso 7 para una categoría no privada', async () => {
    const user = userEvent.setup()
    render(<Step6Categoria />)

    const select = screen.getByTestId('select')
    await user.selectOptions(select, 'Servicio Psicooncológico')

    const submitButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(useEnrollmentStore.getState().currentStep).toBe(7)
      expect(useEnrollmentStore.getState().rejectionReason).toBeNull()
    })
  })
})
