"use client"

import { useState } from "react"
import { Plus, Building2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useHospitals, useCreateHospital } from "@/hooks/use-hospitals"

const CITIES = ["Lima", "Arequipa", "Cusco", "Trujillo", "Piura", "Chiclayo", "Iquitos", "Otros"]

export function HospitalsTab() {
  const { data: hospitals = [] } = useHospitals()
  const createHospital = useCreateHospital()

  const [adding, setAdding] = useState(false)
  const [nombre, setNombre] = useState("")
  const [ciudad, setCiudad] = useState("")

  const byCity = hospitals.reduce<Record<string, typeof hospitals>>((acc, h) => {
    if (!acc[h.ciudad]) acc[h.ciudad] = []
    acc[h.ciudad].push(h)
    return acc
  }, {})

  async function handleAdd() {
    if (!nombre.trim() || !ciudad) return
    await createHospital.mutateAsync({ nombre: nombre.trim().toUpperCase(), ciudad })
    setNombre("")
    setCiudad("")
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{hospitals.length} establecimientos registrados</p>
        {!adding && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            Agregar hospital
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <p className="text-sm font-medium">Nuevo establecimiento</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nombre</Label>
              <Input
                autoFocus
                placeholder="Ej: HOSPITAL NACIONAL..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Ciudad</Label>
              <Select value={ciudad} onValueChange={(v) => v && setCiudad(v)}>
                <SelectTrigger className="h-8 text-sm w-full">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!nombre.trim() || !ciudad || createHospital.isPending}
              className="flex-1"
            >
              {createHospital.isPending ? "Agregando..." : "Confirmar"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setAdding(false); setNombre(""); setCiudad("") }}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(byCity).map(([city, items]) => (
          <div key={city}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{city}</p>
            <div className="space-y-1.5">
              {items.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
                >
                  <div className="flex size-7 items-center justify-center rounded-full bg-muted shrink-0">
                    <Building2 className="size-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground">{h.nombre}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
