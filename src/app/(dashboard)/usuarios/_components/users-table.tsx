import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AppUser } from '@/types/user'

interface UsersTableProps {
  users: AppUser[]
  isLoading: boolean
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  callcenter: 'Callcenter',
  voluntario: 'Voluntario',
  fundacion: 'Fundación',
}

const roleBadgeStyles: Record<string, string> = {
  admin: 'bg-amber-50 text-amber-700 border-amber-200',
  callcenter: 'bg-blue-50 text-blue-700 border-blue-200',
  voluntario: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  fundacion: 'bg-purple-50 text-purple-700 border-purple-200',
}

export function UsersTable({ users, isLoading }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No hay usuarios registrados todavía.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Nombre</TableHead>
            <TableHead className="text-xs">Email</TableHead>
            <TableHead className="text-xs">Rol</TableHead>
            <TableHead className="text-xs">Estado</TableHead>
            <TableHead className="text-xs">Registrado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="text-sm font-medium">
                {u.full_name ?? '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {u.email}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={roleBadgeStyles[u.role] ?? ''}
                >
                  {roleLabels[u.role] ?? u.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    u.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                  }
                >
                  {u.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString('es-PE')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
