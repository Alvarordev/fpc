"use client"

import { PROFILE_SECTIONS } from "@/types/patient"
import type { Patient } from "@/types/patient"
import { ProfileSection } from "./profile-section"

interface PatientProfileTabProps {
  patient: Patient
  onSave: (values: Record<string, string>) => Promise<void>
  readOnly?: boolean
}

export function PatientProfileTab({ patient, onSave, readOnly }: PatientProfileTabProps) {
  const data = patient as unknown as Record<string, string>

  return (
    <div className="space-y-4">
      {PROFILE_SECTIONS.map((section) => (
        <ProfileSection
          key={section.title}
          title={section.title}
          fields={section.fields}
          data={data}
          onSave={onSave}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}
