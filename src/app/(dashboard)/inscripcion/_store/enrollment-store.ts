import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { EnrollmentFormData, RejectionReason } from "../_types/enrollment-types"
import { TOTAL_STEPS } from "../_types/enrollment-types"

interface EnrollmentState {
  currentStep: number
  rejectionReason: RejectionReason | null
  formData: Partial<EnrollmentFormData>
  isComplete: boolean
  prospectoId: string | null

  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  saveStepData: (data: Partial<EnrollmentFormData>) => void
  setRejection: (reason: RejectionReason) => void
  clearRejection: () => void
  completeEnrollment: () => void
  resetEnrollment: () => void
  setProspectoId: (id: string | null) => void
}

const initialState = {
  currentStep: 1,
  rejectionReason: null as RejectionReason | null,
  formData: {} as Partial<EnrollmentFormData>,
  isComplete: false,
  prospectoId: null as string | null,
}

export const useEnrollmentStore = create<EnrollmentState>()(
  persist(
    (set) => ({
      ...initialState,

      goToStep: (step) =>
        set({ currentStep: Math.max(1, Math.min(step, TOTAL_STEPS)) }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      saveStepData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      setRejection: (reason) => set({ rejectionReason: reason }),

      clearRejection: () => set({ rejectionReason: null }),

      completeEnrollment: () => set({ isComplete: true }),

      resetEnrollment: () => set(initialState),

      setProspectoId: (id) => set({ prospectoId: id }),
    }),
    {
      name: "fpc-enrollment-draft",
    },
  ),
)
