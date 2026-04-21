'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateUser } from '@/hooks/use-users'

const baseSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  apellido: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const callcenterSchema = baseSchema

const voluntarioSchema = baseSchema.extend({
  telefono: z.string().optional(),
})

type CallcenterForm = z.infer<typeof callcenterSchema>
type VoluntarioForm = z.infer<typeof voluntarioSchema>

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const [tab, setTab] = useState<'callcenter' | 'voluntario'>('callcenter')
  const createUser = useCreateUser()

  const ccForm = useForm<CallcenterForm>({
    resolver: zodResolver(callcenterSchema),
    defaultValues: { nombre: '', apellido: '', email: '', password: '' },
  })

  const volForm = useForm<VoluntarioForm>({
    resolver: zodResolver(voluntarioSchema),
    defaultValues: { nombre: '', apellido: '', email: '', password: '', telefono: '' },
  })

  function handleClose() {
    onOpenChange(false)
    ccForm.reset()
    volForm.reset()
  }

  async function onSubmitCallcenter(values: CallcenterForm) {
    await createUser.mutateAsync({
      ...values,
      role: 'callcenter',
    })
    handleClose()
  }

  async function onSubmitVoluntario(values: VoluntarioForm) {
    await createUser.mutateAsync({
      ...values,
      role: 'voluntario',
      telefono: values.telefono || undefined,
    })
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[min(92vw,28rem)] p-6">
        <DialogHeader className="pb-2">
          <DialogTitle>Crear nuevo usuario</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'callcenter' | 'voluntario')}>
          <TabsList className="w-full">
            <TabsTrigger value="callcenter" className="flex-1">Callcenter</TabsTrigger>
            <TabsTrigger value="voluntario" className="flex-1">Voluntario</TabsTrigger>
          </TabsList>

          <TabsContent value="callcenter" className="mt-5 space-y-4">
            <form
              onSubmit={ccForm.handleSubmit(onSubmitCallcenter)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Nombre</Label>
                  <Input {...ccForm.register('nombre')} className="h-9 text-sm" />
                  {ccForm.formState.errors.nombre && (
                    <p className="text-xs text-destructive">{ccForm.formState.errors.nombre.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Apellido</Label>
                  <Input {...ccForm.register('apellido')} className="h-9 text-sm" />
                  {ccForm.formState.errors.apellido && (
                    <p className="text-xs text-destructive">{ccForm.formState.errors.apellido.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input type="email" {...ccForm.register('email')} className="h-9 text-sm" />
                {ccForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{ccForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Contraseña</Label>
                <Input type="password" {...ccForm.register('password')} className="h-9 text-sm" />
                {ccForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{ccForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createUser.isPending}
                >
                  {createUser.isPending ? 'Creando...' : 'Crear callcenter'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="voluntario" className="mt-5 space-y-4">
            <form
              onSubmit={volForm.handleSubmit(onSubmitVoluntario)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Nombre</Label>
                  <Input {...volForm.register('nombre')} className="h-9 text-sm" />
                  {volForm.formState.errors.nombre && (
                    <p className="text-xs text-destructive">{volForm.formState.errors.nombre.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Apellido</Label>
                  <Input {...volForm.register('apellido')} className="h-9 text-sm" />
                  {volForm.formState.errors.apellido && (
                    <p className="text-xs text-destructive">{volForm.formState.errors.apellido.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input type="email" {...volForm.register('email')} className="h-9 text-sm" />
                {volForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{volForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Contraseña</Label>
                <Input type="password" {...volForm.register('password')} className="h-9 text-sm" />
                {volForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{volForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Teléfono (opcional)</Label>
                <Input {...volForm.register('telefono')} className="h-9 text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createUser.isPending}
                >
                  {createUser.isPending ? 'Creando...' : 'Crear voluntario'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        {createUser.isError && (
          <div className="border-destructive/20 bg-destructive/5 rounded-xl border p-4 mt-4">
            <p className="text-destructive text-sm">
              {(createUser.error as Error)?.message ?? 'Error al crear usuario'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
