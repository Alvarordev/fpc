"use client"

import { PROFILE_SECTIONS } from "@/types/patient"
import type { Patient } from "@/types/patient"
import { ProfileSection } from "./profile-section"

interface PatientProfileTabProps {
  patient: Patient
  onSave: (values: Record<string, string>) => Promise<void>
}

export function PatientProfileTab({ patient, onSave }: PatientProfileTabProps) {
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
        />
      ))}
    </div>
  )
}
