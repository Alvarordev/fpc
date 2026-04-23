import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"

const createProspectoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  dni: z.string().optional(),
  celular: z.string().min(1, "El celular es obligatorio"),
  correo: z.string().email("El correo no es válido").optional().or(z.literal("")),
  diagnostico: z.string().optional(),
  esPaciente: z.boolean().optional().default(true),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  hora: z.string().min(1, "La hora es obligatoria"),
  canal: z.string().optional(),
  notas: z.string().optional(),
  agenteId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la petición no es un JSON válido" },
      { status: 400 }
    )
  }

  const parseResult = createProspectoSchema.safeParse(body)

  if (!parseResult.success) {
    const errors = parseResult.error.flatten().fieldErrors
    return NextResponse.json(
      { error: "Datos inválidos", details: errors },
      { status: 400 }
    )
  }

  const data = parseResult.data
  const nowIso = new Date().toISOString()
  const legacyId = `prospect-${Date.now()}`

  // 1. Insertar paciente prospecto en fpc_patients
  const { data: patient, error: patientError } = await supabaseAdmin
    .from("fpc_patients")
    .insert({
      legacy_id: legacyId,
      status: "prospecto",
      full_name: data.nombre,
      phone: data.celular,
      dni: data.dni || null,
      entry_point: data.canal || "API Externa",
      enrollment_payload: {
        id: legacyId,
        q9_nombrePaciente: data.nombre,
        q17_telefono: data.celular,
        q10_dni: data.dni || "",
        q16_correo: data.correo || "",
        diagnostico: data.diagnostico || "",
        esPaciente: data.esPaciente,
        puntoIngreso: data.canal || "API Externa",
        fechaCreacion: nowIso,
        estado: "prospecto",
      },
      created_by_user_id: data.agenteId || null,
    })
    .select("id, legacy_id")
    .single()

  if (patientError || !patient) {
    console.error("[prospectos] Error al crear paciente:", patientError)
    return NextResponse.json(
      { error: "Error al crear prospecto en la base de datos", detail: patientError?.message },
      { status: 500 }
    )
  }

  // 2. Insertar contacto agendado en fpc_contacts
  const contactLegacyId = `scheduled-${Date.now()}`
  const { error: contactError } = await supabaseAdmin.from("fpc_contacts").insert({
    legacy_id: contactLegacyId,
    patient_id: patient.id,
    created_by_user_id: data.agenteId || null,
    assigned_user_id: data.agenteId || null,
    origin: "seguimiento",
    direction: "saliente",
    status: "agendado",
    contact_date: data.fecha,
    start_time: data.hora ? `${data.hora}:00` : null,
    notes:
      data.notas ||
      `Prospecto creado vía API. Diagnóstico: ${data.diagnostico || "No especificado"}`,
  })

  if (contactError) {
    console.error("[prospectos] Error al crear contacto:", contactError)
    // Intento de rollback: eliminar el paciente creado
    await supabaseAdmin.from("fpc_patients").delete().eq("id", patient.id)
    return NextResponse.json(
      { error: "Error al agendar contacto del prospecto", detail: contactError?.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      patientId: String(patient.legacy_id ?? patient.id),
      contactId: contactLegacyId,
      nombre: data.nombre,
      dni: data.dni,
      celular: data.celular,
      correo: data.correo,
      diagnostico: data.diagnostico,
      esPaciente: data.esPaciente,
      fecha: data.fecha,
      hora: data.hora,
      canal: data.canal || "API Externa",
      estado: "prospecto",
      fechaCreacion: nowIso,
    },
    { status: 201 }
  )
}

export async function GET() {
  const { data: patients, error } = await supabaseAdmin
    .from("fpc_patients")
    .select("id, legacy_id, full_name, phone, dni, status, enrollment_payload, created_at")
    .eq("status", "prospecto")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[prospectos] Error al cargar prospectos:", error)
    return NextResponse.json(
      { error: "Error al cargar prospectos" },
      { status: 500 }
    )
  }

  const prospectos = (patients ?? []).map((p) => {
    const payload = (p.enrollment_payload ?? {}) as Record<string, unknown>
    return {
      id: String(p.legacy_id ?? p.id),
      nombre: p.full_name ?? "",
      celular: p.phone ?? "",
      dni: p.dni ?? "",
      correo: (payload.q16_correo as string) || "",
      diagnostico: (payload.diagnostico as string) || "",
      esPaciente: (payload.esPaciente as boolean) ?? true,
      estado: p.status,
      fechaCreacion: p.created_at,
    }
  })

  return NextResponse.json({ prospectos })
}
