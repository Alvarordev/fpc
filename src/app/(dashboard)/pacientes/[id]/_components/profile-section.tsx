"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Pencil, Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProfileField } from "@/types/patient"

interface ProfileSectionProps {
  title: string
  fields: ProfileField[]
  data: Record<string, string>
  onSave: (values: Record<string, string>) => Promise<void>
}

function formatDateDisplay(value: string): string {
  if (!value) return "—"
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })
}

export function ProfileSection({ title, fields, data, onSave }: ProfileSectionProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const defaultValues = Object.fromEntries(fields.map((f) => [f.key, data[f.key] ?? ""]))

  const { register, handleSubmit, reset } = useForm<Record<string, string>>({
    defaultValues,
  })

  function handleCancel() {
    reset(defaultValues)
    setEditing(false)
  }

  async function onSubmit(values: Record<string, string>) {
    setSaving(true)
    try {
      await onSave(values)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setEditing(true)}>
            <Pencil className="size-3" />
            Editar
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="size-3" />
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
            >
              <Check className="size-3" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label className="text-xs text-muted-foreground font-normal">{field.label}</Label>
              {editing ? (
                <Input
                  {...register(field.key)}
                  type={field.type === "date" ? "date" : "text"}
                  className="h-8 text-sm"
                />
              ) : (
                <p className="text-sm text-foreground">
                  {field.type === "date"
                    ? formatDateDisplay(data[field.key] ?? "")
                    : data[field.key] || "—"}
                </p>
              )}
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
