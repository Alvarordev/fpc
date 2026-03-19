import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PatientStatus } from "../_utils/patient-data"
import { statusLabels } from "../_utils/patient-data"

interface ActiveFilter {
  key: string
  label: string
  value: string
}

interface PatientsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: PatientStatus | null
  onStatusFilterChange: (status: PatientStatus | null) => void
}

const statuses: PatientStatus[] = ["activo", "en_tratamiento", "seguimiento", "alta"]

export function PatientsToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: PatientsToolbarProps) {
  const activeFilters: ActiveFilter[] = statusFilter
    ? [{ key: "estado", label: "Estado", value: statusLabels[statusFilter] }]
    : []

  const hasFilters = activeFilters.length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm bg-background"
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() =>
              onStatusFilterChange(
                statusFilter
                  ? statuses[(statuses.indexOf(statusFilter) + 1) % statuses.length]
                  : statuses[0]
              )
            }
          >
            <SlidersHorizontal className="size-3.5" />
            Filtrar
            {hasFilters && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFilters.length}
              </span>
            )}
          </Button>
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
          {activeFilters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">{filter.label}:</span>
              <Badge
                variant="outline"
                className="gap-1 h-6 px-2 text-xs font-normal cursor-pointer hover:bg-muted"
                onClick={() => onStatusFilterChange(null)}
              >
                {filter.value}
                <X className="size-3" />
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
