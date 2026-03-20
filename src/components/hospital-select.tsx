"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useHospitals, useCreateHospital } from "@/hooks/use-hospitals"

const CITIES = ["Lima", "Arequipa", "Cusco", "Trujillo", "Piura", "Chiclayo", "Iquitos", "Otros"]

interface HospitalSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function HospitalSelect({ value, onChange, placeholder, className }: HospitalSelectProps) {
  const { data: hospitals = [] } = useHospitals()
  const createHospital = useCreateHospital()

  const [adding, setAdding] = useState(false)
  const [newNombre, setNewNombre] = useState("")
  const [newCiudad, setNewCiudad] = useState("")

  const byCity = hospitals.reduce<Record<string, typeof hospitals>>((acc, h) => {
    if (!acc[h.ciudad]) acc[h.ciudad] = []
    acc[h.ciudad].push(h)
    return acc
  }, {})

  function handleChange(val: string | null) {
    if (!val) return
    if (val === "__ADD_NEW__") {
      setAdding(true)
      return
    }
    onChange(val)
  }

  async function handleConfirmAdd() {
    if (!newNombre.trim() || !newCiudad) return
    const created = await createHospital.mutateAsync({
      nombre: newNombre.trim().toUpperCase(),
      ciudad: newCiudad,
    })
    onChange(created.nombre)
    setAdding(false)
    setNewNombre("")
    setNewCiudad("")
  }

  function handleCancelAdd() {
    setAdding(false)
    setNewNombre("")
    setNewCiudad("")
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder ?? "Seleccionar establecimiento..."} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(byCity).map(([city, items]) => (
            <SelectGroup key={city}>
              <SelectLabel>{city}</SelectLabel>
              {items.map((h) => (
                <SelectItem key={h.id} value={h.nombre}>
                  {h.nombre}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
          <SelectSeparator />
          <SelectItem value="__ADD_NEW__">
            <Plus className="size-3.5" />
            Agregar nuevo hospital
          </SelectItem>
        </SelectContent>
      </Select>

      {adding && (
        <div className="rounded-lg border bg-muted/40 p-3 space-y-3">
          <p className="text-xs font-medium text-foreground">Nuevo establecimiento</p>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nombre</Label>
            <Input
              autoFocus
              placeholder="Ej: HOSPITAL NACIONAL..."
              value={newNombre}
              onChange={(e) => setNewNombre(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ciudad</Label>
            <Select value={newCiudad} onValueChange={(v) => v && setNewCiudad(v)}>
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue placeholder="Seleccionar ciudad..." />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmAdd}
              disabled={!newNombre.trim() || !newCiudad || createHospital.isPending}
              className="flex-1"
            >
              {createHospital.isPending ? "Creando..." : "Confirmar"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleCancelAdd}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
