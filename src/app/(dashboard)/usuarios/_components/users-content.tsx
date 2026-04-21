'use client'

import { useState } from 'react'
import { Plus, ShieldUser } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { useUsers } from '@/hooks/use-users'
import { CreateUserDialog } from './create-user-dialog'
import { UsersTable } from './users-table'

export function UsersContent() {
  const user = useAuthStore((s) => s.user)
  const { data: users = [], isLoading } = useUsers()
  const [dialogOpen, setDialogOpen] = useState(false)

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldUser className="size-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground">
          No tenés permisos para ver esta sección.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Nuevo usuario
        </Button>
      </div>

      <UsersTable users={users} isLoading={isLoading} />
      <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
