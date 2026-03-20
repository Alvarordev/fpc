'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Pencil, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HospitalSelect } from '@/components/hospital-select'
import type { ProfileField } from '@/types/patient'

interface ProfileSectionProps {
  title: string
  fields: ProfileField[]
  data: Record<string, string>
  onSave: (values: Record<string, string>) => Promise<void>
  readOnly?: boolean
}

function formatDateDisplay(value: string): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ProfileSection({
  title,
  fields,
  data,
  onSave,
  readOnly,
}: ProfileSectionProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const defaultValues = Object.fromEntries(
    fields.map((f) => [f.key, data[f.key] ?? '']),
  )

  const { register, control, handleSubmit, reset } = useForm<
    Record<string, string>
  >({
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-foreground text-sm font-semibold">
          {title}
        </CardTitle>
        {!readOnly &&
          (!editing ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3" />
              Editar
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-7 gap-1.5 text-xs"
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
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          ))}
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label className="text-muted-foreground text-xs font-normal">
                {field.label}
              </Label>
              {editing ? (
                field.input === 'select' && field.options ? (
                  <Controller
                    name={field.key}
                    control={control}
                    render={({ field: controlledField }) => {
                      const value = controlledField.value ?? ''
                      const hasFallback =
                        value && !field.options?.includes(value)
                      return (
                        <Select
                          value={value}
                          onValueChange={controlledField.onChange}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                            {hasFallback && (
                              <SelectItem
                                value={value}
                              >{`Otro: ${value}`}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                ) : field.input === 'hospital' ? (
                  <Controller
                    name={field.key}
                    control={control}
                    render={({ field: controlledField }) => (
                      <HospitalSelect
                        value={controlledField.value ?? ''}
                        onChange={controlledField.onChange}
                        className="h-8 text-sm"
                      />
                    )}
                  />
                ) : (
                  <Input
                    {...register(field.key)}
                    type={
                      field.type === 'date' || field.input === 'date'
                        ? 'date'
                        : 'text'
                    }
                    className="h-8 text-sm"
                  />
                )
              ) : (
                <p className="text-foreground text-sm">
                  {field.type === 'date'
                    ? formatDateDisplay(data[field.key] ?? '')
                    : data[field.key] || '—'}
                </p>
              )}
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
