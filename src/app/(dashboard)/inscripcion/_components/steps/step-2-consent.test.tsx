import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}))

// Mock de Select para usar selects nativos de HTML en tests
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: (v: string) => void }) => (
    <select
      value={value ?? ''}
      onChange={(e) => onValueChange?.(e.target.value)}
      data-testid="select"
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder ?? 'Seleccionar...'}</option>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
  SelectGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectLabel: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectSeparator: () => null,
  SelectScrollUpButton: () => null,
  SelectScrollDownButton: () => null,
}))

const { useEnrollmentStore } = await import('../../_store/enrollment-store')
const { Step2Consent } = await import('./step-2-consent')

describe('Step 2 - Consentimiento (Rechazo q3_no)', () => {
  beforeEach(() => {
    const store = useEnrollmentStore.getState()
    store.resetEnrollment()
    store.goToStep(2)
  })

  it('debe registrar rechazo q3_no cuando el paciente no acepta la política', async () => {
    const user = userEvent.setup()
    render(<Step2Consent />)

    const selects = screen.getAllByTestId('select')
    await user.selectOptions(selects[0], 'No')
    await user.selectOptions(selects[1], 'Para mi')

    const submitButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(useEnrollmentStore.getState().rejectionReason).toBe('q3_no')
    })
  })

  it('debe avanzar al paso 3 cuando el paciente acepta', async () => {
    const user = userEvent.setup()
    render(<Step2Consent />)

    const selects = screen.getAllByTestId('select')
    await user.selectOptions(selects[0], 'Sí')
    await user.selectOptions(selects[1], 'Para mi')

    expect(selects[0]).toHaveValue('Sí')
    expect(selects[1]).toHaveValue('Para mi')

    const submitButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(useEnrollmentStore.getState().formData.q3_acuerdo).toBe('Sí')
      expect(useEnrollmentStore.getState().formData.q4_tipo).toBe('Para mi')
      expect(useEnrollmentStore.getState().currentStep).toBe(3)
      expect(useEnrollmentStore.getState().rejectionReason).toBeNull()
    })
  })
})
