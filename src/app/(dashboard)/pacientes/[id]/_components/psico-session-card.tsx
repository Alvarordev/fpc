"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Phone, Video, ChevronDown, ChevronUp, Star } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { PsicoSession } from "@/types/follow-up"
import type { UserRole } from "@/types/auth"
import { useUpdatePsicoSession } from "../_hooks/use-psico-sessions"

const statusConfig: Record<
  PsicoSession["estado"],
  { label: string; className: string }
> = {
  programada: { label: "Programada", className: "bg-blue-50 text-blue-700 border-blue-200" },
  completada: { label: "Completada", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelada: { label: "Cancelada", className: "bg-red-50 text-red-700 border-red-200" },
  no_contesto: { label: "No contestó", className: "bg-amber-50 text-amber-700 border-amber-200" },
}

function sessionLabel(num: number): string {
  if (num <= 4) return `Sesión ${num}`
  return `Extra ${num - 4}`
}

function formatDate(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

interface StarRatingProps {
  value: number
  onChange: (v: number) => void
}

function StarRating({ value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-amber-400 hover:scale-110 transition-transform"
        >
          <Star
            className="size-5"
            fill={(hovered || value) >= n ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  )
}

interface SessionResultFormProps {
  session: PsicoSession
  pacienteId: string
  onDone: () => void
}

function SessionResultForm({ session, pacienteId, onDone }: SessionResultFormProps) {
  const updateSession = useUpdatePsicoSession(pacienteId)
  const { register, control, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      estado: session.estado,
      notas: session.notas ?? "",
      extraNeeded: session.extraNeeded ?? false,
    },
  })

  async function onSubmit(values: { estado: string; notas: string; extraNeeded: boolean }) {
    await updateSession.mutateAsync({
      id: session.id,
      data: {
        estado: values.estado as PsicoSession["estado"],
        notas: values.notas,
        ...(session.sesionNumero === 4 ? { extraNeeded: values.extraNeeded } : {}),
      },
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-3 border-t border-border/50">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Estado de la sesión</Label>
        <Controller
          name="estado"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="no_contesto">No contestó</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Comentarios del psicólogo</Label>
        <Textarea
          {...register("notas")}
          placeholder="Observaciones de la sesión..."
          className="min-h-20 text-sm resize-none"
        />
      </div>

      {session.sesionNumero === 4 && (
        <div className="flex items-center gap-2">
          <input
            id={`extra-${session.id}`}
            type="checkbox"
            {...register("extraNeeded")}
            className="size-4 rounded border-border accent-primary"
          />
          <Label htmlFor={`extra-${session.id}`} className="text-sm cursor-pointer">
            Requiere sesiones extra (5ª y 6ª)
          </Label>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-7 text-xs" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

interface SatisfactionFormProps {
  session: PsicoSession
  pacienteId: string
  onDone: () => void
}

function SatisfactionForm({ session, pacienteId, onDone }: SatisfactionFormProps) {
  const updateSession = useUpdatePsicoSession(pacienteId)
  const { control, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { satisfaccion: session.satisfaccion ?? 0 },
  })

  async function onSubmit(values: { satisfaccion: number }) {
    await updateSession.mutateAsync({ id: session.id, data: { satisfaccion: values.satisfaccion } })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-3 border-t border-border/50">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Satisfacción del paciente (1–5)</Label>
        <Controller
          name="satisfaccion"
          control={control}
          render={({ field }) => (
            <StarRating value={field.value} onChange={field.onChange} />
          )}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-7 text-xs" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

interface PsicoSessionCardProps {
  session: PsicoSession
  volunteerName: string
  pacienteId: string
  isExpanded: boolean
  onToggle: () => void
  role: UserRole
}

export function PsicoSessionCard({
  session,
  volunteerName,
  pacienteId,
  isExpanded,
  onToggle,
  role,
}: PsicoSessionCardProps) {
  const canManage = ["callcenter", "admin", "fundacion"].includes(role)
  const isVoluntario = role === "voluntario"
  const status = statusConfig[session.estado]

  const showResultForm =
    isVoluntario && session.estado === "programada"
  const showSatisfactionForm =
    canManage && session.estado === "completada" && !session.satisfaccion

  return (
    <Card
      className={cn(
        "border-border/60 min-w-[240px] max-w-[280px] shrink-0 transition-all duration-200",
        isExpanded && "ring-1 ring-primary/20"
      )}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-primary">{sessionLabel(session.sesionNumero)}</p>
            <p className="text-sm font-medium text-foreground leading-tight">{volunteerName}</p>
          </div>
          <Badge className={cn("border text-xs font-medium shrink-0", status.className)}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 space-y-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDate(session.fecha)}</span>
          <span>{session.horaInicio}–{session.horaFin}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {session.modalidad === "llamada" ? (
              <Phone className="size-3.5" />
            ) : (
              <Video className="size-3.5" />
            )}
            <span className="capitalize">{session.modalidad}</span>
          </div>

          {session.satisfaccion !== undefined && (
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className="size-3 text-amber-400"
                  fill={(session.satisfaccion ?? 0) >= n ? "currentColor" : "none"}
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          {isExpanded ? "Ocultar" : "Ver detalles"}
        </button>

        {isExpanded && (
          <div className="space-y-3">
            {session.notas && !showResultForm && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="text-xs text-foreground leading-relaxed">{session.notas}</p>
              </div>
            )}

            {session.extraNeeded && (
              <p className="text-xs text-amber-600 font-medium">
                ✓ Sesiones extra solicitadas
              </p>
            )}

            {showResultForm && (
              <SessionResultForm session={session} pacienteId={pacienteId} onDone={onToggle} />
            )}

            {showSatisfactionForm && (
              <SatisfactionForm session={session} pacienteId={pacienteId} onDone={onToggle} />
            )}

            {!showResultForm && !showSatisfactionForm && (
              <div className="text-xs text-muted-foreground">
                {isVoluntario && session.estado !== "programada" && "Sesión ya registrada."}
                {canManage && session.estado === "completada" && session.satisfaccion !== undefined && "Satisfacción registrada."}
                {canManage && session.estado !== "completada" && session.estado !== "programada" && "Sin acciones disponibles."}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
