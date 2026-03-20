'use client'

import { useForm, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { PsicoSession } from '@/types/follow-up'
import { useUpdateAgendaSession } from '../_hooks/use-volunteer-agenda'

interface AgendaSessionResultSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: PsicoSession | null
  patientName: string
  voluntarioId: string | undefined
}

interface FormValues {
  estado: PsicoSession['estado']
  notas: string
}

export function AgendaSessionResultSheet({
  open,
  onOpenChange,
  session,
  patientName,
  voluntarioId,
}: AgendaSessionResultSheetProps) {
  const updateSession = useUpdateAgendaSession(voluntarioId)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      estado: 'completada',
      notas: '',
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset({ estado: 'completada', notas: '' })
    } else if (session) {
      reset({
        estado: session.estado === 'programada' ? 'completada' : session.estado,
        notas: session.notas ?? '',
      })
    }

    onOpenChange(nextOpen)
  }

  async function onSubmit(values: FormValues) {
    if (!session) return

    await updateSession.mutateAsync({
      id: session.id,
      pacienteId: session.pacienteId,
      data: {
        estado: values.estado,
        notas: values.notas,
      },
    })

    handleOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-border/60 border-b">
          <SheetTitle>Registrar sesión</SheetTitle>
          {session && (
            <p className="text-muted-foreground text-sm">
              {patientName} · {session.horaInicio}–{session.horaFin}
            </p>
          )}
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-full flex-col"
        >
          <div className="flex-1 space-y-5 overflow-y-auto p-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                ¿El paciente asistió?
              </Label>
              <Controller
                name="estado"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completada">Sí, asistió</SelectItem>
                      <SelectItem value="no_contesto">No contestó</SelectItem>
                      <SelectItem value="cancelada">
                        No asistió / cancelada
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Notas de la sesión
              </Label>
              <Textarea
                {...register('notas')}
                placeholder="Registra observaciones, acuerdos y próximos pasos..."
                className="min-h-32 resize-none"
              />
            </div>
          </div>

          <SheetFooter className="border-border/60 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !session || updateSession.isPending}
            >
              {isSubmitting || updateSession.isPending
                ? 'Guardando...'
                : 'Guardar sesión'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
