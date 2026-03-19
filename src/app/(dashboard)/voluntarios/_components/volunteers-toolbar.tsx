import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Volunteer } from "@/types/volunteer"
import { volunteerStatusLabels } from "../_utils/volunteer-data"

type VolunteerStatus = Volunteer["estado"]

interface VolunteersToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: VolunteerStatus | null
  onStatusFilterChange: (v: VolunteerStatus | null) => void
}

const statuses: VolunteerStatus[] = ["activo", "inactivo", "licencia"]

export function VolunteersToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: VolunteersToolbarProps) {
  const hasFilters = !!statusFilter

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar voluntarios..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {statuses.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => onStatusFilterChange(statusFilter === s ? null : s)}
            >
              {volunteerStatusLabels[s]}
            </Button>
          ))}
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => onStatusFilterChange(null)}
          >
            <X className="size-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Estado:</span>
          <Badge
            variant="outline"
            className="gap-1 h-6 px-2 text-xs font-normal cursor-pointer hover:bg-muted"
            onClick={() => onStatusFilterChange(null)}
          >
            {volunteerStatusLabels[statusFilter!]}
            <X className="size-3" />
          </Badge>
        </div>
      )}
    </div>
  )
}
