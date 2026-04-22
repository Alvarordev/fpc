"use client"

import { useEffect, useRef, useCallback } from "react"
import { useEnrollmentStore } from "../_store/enrollment-store"
import { EnrollmentStepper } from "./enrollment-stepper"
import { EnrollmentAside } from "./enrollment-aside"
import { EnrollmentRejection } from "./enrollment-rejection"
import { Step1Inicio } from "./steps/step-1-inicio"
import { Step2Consent } from "./steps/step-2-consent"
import { Step3Identificacion } from "./steps/step-3-identificacion"
import { Step4Consentimiento } from "./steps/step-4-consentimiento"
import { Step5Datos } from "./steps/step-5-datos"
import { Step6Categoria } from "./steps/step-6-categoria"
import { Step7Atencion } from "./steps/step-7-atencion"
import { Step8Cierre } from "./steps/step-8-cierre"
import { resolveAsideContent } from "../_utils/aside-resolver"
import type { EnrollmentFormData } from "../_types/enrollment-types"
import { Q27_BRANCH_MAP } from "../_types/enrollment-types"
import { usePatient, useDeleteProspect } from "@/app/(dashboard)/pacientes/[id]/_hooks/use-patient"

function CurrentStep({ step }: { step: number }) {
  switch (step) {
    case 1: return <Step1Inicio />
    case 2: return <Step2Consent />
    case 3: return <Step3Identificacion />
    case 4: return <Step4Consentimiento />
    case 5: return <Step5Datos />
    case 6: return <Step6Categoria />
    case 7: return <Step7Atencion />
    case 8: return <Step8Cierre />
    default: return <Step1Inicio />
  }
}

interface EnrollmentShellProps {
  prospectoId?: string
}

export function EnrollmentShell({ prospectoId }: EnrollmentShellProps) {
  const {
    currentStep,
    rejectionReason,
    formData,
    resetEnrollment,
    prevStep,
    clearRejection,
    setProspectoId,
    saveStepData,
    prospectoId: storeProspectoId,
  } = useEnrollmentStore()

  const { data: prospectPatient } = usePatient(prospectoId ?? "")
  const deleteProspect = useDeleteProspect()
  const prospectoIdRef = useRef(storeProspectoId)

  // Mantener ref actualizada para usar en handlers
  useEffect(() => {
    prospectoIdRef.current = storeProspectoId
  }, [storeProspectoId])

  const partial = formData as Partial<EnrollmentFormData>
  const categoria = partial.q27_categoria ?? ""
  const branch = Q27_BRANCH_MAP[categoria] ?? null

  const asideContent = resolveAsideContent(currentStep, branch)

  // Precargar datos del prospecto al iniciar
  useEffect(() => {
    if (prospectoId && prospectPatient) {
      setProspectoId(prospectoId)
      saveStepData({
        q9_nombrePaciente: prospectPatient.q9_nombrePaciente,
        q17_telefono: prospectPatient.q17_telefono,
        q10_dni: prospectPatient.q10_dni,
        puntoIngreso: prospectPatient.puntoIngreso,
      })
    }
  }, [prospectoId, prospectPatient, setProspectoId, saveStepData])

  const handleRejectionBack = () => {
    clearRejection()
    prevStep()
  }

  const handleReset = useCallback(async () => {
    const currentProspectoId = prospectoIdRef.current

    // Si venimos de un prospecto y el rechazo fue por consentimiento (q8_no),
    // borramos el prospecto y sus contactos
    if (currentProspectoId) {
      await deleteProspect.mutateAsync(currentProspectoId)
    }

    resetEnrollment()
  }, [deleteProspect, resetEnrollment])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-center border-b border-border/50 bg-background px-6 py-4">
        <EnrollmentStepper currentStep={currentStep} />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-8 py-10">
            {rejectionReason ? (
              <EnrollmentRejection
                reason={rejectionReason}
                onReset={handleReset}
                onBack={handleRejectionBack}
              />
            ) : (
              <CurrentStep step={currentStep} />
            )}
          </div>
        </div>

        <div className="hidden w-80 shrink-0 overflow-y-auto border-l border-border/50 bg-muted/30 lg:block xl:w-96">
          <div className="px-6 py-8">
            <EnrollmentAside
              content={asideContent}
              currentStep={currentStep}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
