import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"

const ROOT = process.cwd()
const DB_PATH = resolve(ROOT, "db.json")
const ENV_PATH = resolve(ROOT, ".env.local")

function parseEnv(content) {
  const out = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const idx = trimmed.indexOf("=")
    if (idx < 0) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    out[key] = value
  }
  return out
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0
}

function toDate(value) {
  if (!isNonEmptyString(value)) return null
  const str = String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  const parsed = new Date(str)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

function toTime(value) {
  if (!isNonEmptyString(value)) return null
  const str = String(value).trim()
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) return str.length === 5 ? `${str}:00` : str
  return null
}

function normalizePatientStatus(v) {
  return v === "inactivo" ? "inactivo" : "activo"
}

function normalizeContactDirection(v) {
  return v === "entrante" ? "entrante" : "saliente"
}

function normalizeContactOrigin(v) {
  return v === "enrolamiento" ? "enrolamiento" : "seguimiento"
}

function normalizeContactStatus(v) {
  if (v === "agendado" || v === "inconcluso" || v === "completado") return v
  return "completado"
}

function normalizeVolunteerStatus(v) {
  if (v === "activo" || v === "inactivo" || v === "licencia") return v
  return "activo"
}

function normalizeSlotStatus(v) {
  if (v === "disponible" || v === "asignado" || v === "completado") return v
  return "disponible"
}

function normalizeSessionStatus(v) {
  if (v === "programada" || v === "completada" || v === "cancelada" || v === "no_contesto") return v
  return "programada"
}

function normalizeSessionMode(v) {
  return v === "videollamada" ? "videollamada" : "llamada"
}

function normalizeAlertStatus(v) {
  return v === "resuelta" ? "resuelta" : "activa"
}

function titleizeMotive(code) {
  return String(code)
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

async function fetchAll(client, table, select = "*") {
  const { data, error } = await client.from(table).select(select)
  if (error) throw error
  return data ?? []
}

async function upsertInChunks(client, table, rows, onConflict, chunkSize = 200) {
  if (!rows.length) return
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await client.from(table).upsert(chunk, { onConflict })
    if (error) throw error
  }
}

async function main() {
  const envRaw = await readFile(ENV_PATH, "utf8")
  const env = parseEnv(envRaw)

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local")
  }

  const client = createClient(supabaseUrl, supabaseAnonKey)

  const adminEmail = process.env.MIGRATION_ADMIN_EMAIL ?? "fpc.admin.20260420@gmail.com"
  const adminPassword = process.env.MIGRATION_ADMIN_PASSWORD ?? "AdminTemp#2026"

  const { error: signInError } = await client.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  })

  if (signInError) {
    throw new Error(`No se pudo autenticar para migración: ${signInError.message}`)
  }

  const db = JSON.parse(await readFile(DB_PATH, "utf8"))

  const legacyUsers = Array.isArray(db.users) ? db.users : []
  const legacyHospitals = Array.isArray(db.hospitals) ? db.hospitals : []
  const legacyPatients = Array.isArray(db.patients) ? db.patients : []
  const legacyVolunteers = Array.isArray(db.volunteers) ? db.volunteers : []
  const legacySlots = Array.isArray(db.availabilitySlots) ? db.availabilitySlots : []
  const legacyContacts = Array.isArray(db.contacts) ? db.contacts : []
  const legacyPsico = Array.isArray(db.psicoSessions) ? db.psicoSessions : []
  const legacyAlerts = Array.isArray(db.hospitalAlerts) ? db.hospitalAlerts : []

  const fpcUsers = await fetchAll(client, "fpc_users", "id,email,role")
  const userByRole = new Map()
  const userByEmail = new Map()
  for (const u of fpcUsers) {
    if (!userByRole.has(u.role)) userByRole.set(u.role, u.id)
    userByEmail.set(String(u.email).toLowerCase(), u.id)
  }

  const legacyUserIdToFpcUserId = new Map()
  for (const lu of legacyUsers) {
    const byEmail = userByEmail.get(String(lu.email ?? "").toLowerCase())
    const byRole = userByRole.get(lu.role)
    legacyUserIdToFpcUserId.set(String(lu.id), byEmail ?? byRole ?? null)
  }

  const hospitalRows = legacyHospitals.map((h) => ({
    legacy_id: String(h.id),
    nombre: String(h.nombre ?? ""),
    ciudad: isNonEmptyString(h.ciudad) ? String(h.ciudad) : null,
  }))

  await upsertInChunks(client, "fpc_hospitals", hospitalRows, "legacy_id")

  const fpcHospitals = await fetchAll(client, "fpc_hospitals", "id,legacy_id,nombre")
  const hospitalIdByLegacy = new Map()
  const hospitalIdByName = new Map()
  for (const h of fpcHospitals) {
    if (h.legacy_id) hospitalIdByLegacy.set(String(h.legacy_id), h.id)
    hospitalIdByName.set(String(h.nombre).toLowerCase(), h.id)
  }

  const patientRows = legacyPatients.map((p) => {
    const diagnosedHospitalName = p.hospitalDiagnosticado ?? p.q_establecimiento_dn ?? p.q_establecimiento_ds ?? p.q_establecimiento_sn ?? p.q_establecimiento_psico ?? p.q47_establecimiento_eps
    const treatmentHospitalName = p.hospitalTratamiento ?? p.q_establecimiento_dn ?? p.q_establecimiento_ds

    return {
      legacy_id: String(p.id),
      status: normalizePatientStatus(p.estado),
      patient_number: isNonEmptyString(p.nroPaciente) ? String(p.nroPaciente) : null,
      full_name: String(p.q9_nombrePaciente ?? p.nombresApellidos ?? "Sin nombre"),
      dni: isNonEmptyString(p.q10_dni) ? String(p.q10_dni) : isNonEmptyString(p.codigo) ? String(p.codigo) : null,
      birth_date: toDate(p.q11_fechaNacimiento),
      phone: isNonEmptyString(p.q17_telefono) ? String(p.q17_telefono) : isNonEmptyString(p.numeroCelular) ? String(p.numeroCelular) : null,
      aux_phone: isNonEmptyString(p.q18_telefonoAuxiliar) ? String(p.q18_telefonoAuxiliar) : isNonEmptyString(p.numeroAuxiliar) ? String(p.numeroAuxiliar) : null,
      family_phone: isNonEmptyString(p.q19_telefonoFamiliar) ? String(p.q19_telefonoFamiliar) : null,
      caregiver_name: isNonEmptyString(p.q20_nombreFamiliar) ? String(p.q20_nombreFamiliar) : null,
      caregiver_gender: isNonEmptyString(p.generoCuidador) ? String(p.generoCuidador) : null,
      entry_point: isNonEmptyString(p.puntoIngreso) ? String(p.puntoIngreso) : null,
      health_phase: isNonEmptyString(p.faseSalud) ? String(p.faseSalud) : null,
      enrolled_at: toDate(p.fechaCreacion) ?? toDate(p.fechaEnrolamiento),
      diagnosed_hospital_id: isNonEmptyString(diagnosedHospitalName)
        ? hospitalIdByName.get(String(diagnosedHospitalName).toLowerCase()) ?? null
        : null,
      treatment_hospital_id: isNonEmptyString(treatmentHospitalName)
        ? hospitalIdByName.get(String(treatmentHospitalName).toLowerCase()) ?? null
        : null,
      enrollment_payload: p,
      created_by_user_id: null,
    }
  })

  await upsertInChunks(client, "fpc_patients", patientRows, "legacy_id")

  const fpcPatients = await fetchAll(client, "fpc_patients", "id,legacy_id")
  const patientIdByLegacy = new Map(fpcPatients.map((p) => [String(p.legacy_id), p.id]))

  const volunteerRows = legacyVolunteers.map((v) => ({
    legacy_id: Number(v.id),
    nombre: String(v.nombre ?? ""),
    apellido: String(v.apellido ?? ""),
    email: String(v.email ?? ""),
    telefono: isNonEmptyString(v.telefono) ? String(v.telefono) : null,
    estado: normalizeVolunteerStatus(v.estado),
    especialidad: isNonEmptyString(v.especialidad) ? String(v.especialidad) : null,
    user_id: null,
  }))

  await upsertInChunks(client, "fpc_volunteers", volunteerRows, "legacy_id")

  const fpcVolunteers = await fetchAll(client, "fpc_volunteers", "id,legacy_id")
  const volunteerIdByLegacy = new Map(fpcVolunteers.map((v) => [String(v.legacy_id), v.id]))

  const slotRows = legacySlots
    .filter((s) => volunteerIdByLegacy.has(String(s.voluntarioId)))
    .map((s) => ({
      legacy_id: String(s.id),
      volunteer_id: volunteerIdByLegacy.get(String(s.voluntarioId)),
      slot_date: toDate(s.fecha),
      start_time: toTime(s.horaInicio),
      end_time: toTime(s.horaFin),
      status: normalizeSlotStatus(s.estado),
    }))
    .filter((s) => s.slot_date && s.start_time && s.end_time)

  await upsertInChunks(client, "fpc_availability_slots", slotRows, "legacy_id")

  const fpcSlots = await fetchAll(client, "fpc_availability_slots", "id,legacy_id")
  const slotIdByLegacy = new Map(fpcSlots.map((s) => [String(s.legacy_id), s.id]))

  const contactsRows = legacyContacts.map((c) => {
    const legacyAgentId = String(c.agenteId ?? "")
    const mappedUserId = legacyUserIdToFpcUserId.get(legacyAgentId) ?? null

    return {
      legacy_id: String(c.id),
      patient_id: patientIdByLegacy.get(String(c.pacienteId)) ?? null,
      created_by_user_id: mappedUserId,
      assigned_user_id: mappedUserId,
      origin: normalizeContactOrigin(c.origen),
      direction: normalizeContactDirection(c.tipo),
      status: normalizeContactStatus(c.estado),
      contact_date: toDate(c.fecha),
      start_time: toTime(c.horaInicio),
      end_time: toTime(c.horaFin),
      notes: isNonEmptyString(c.notas) ? String(c.notas) : "",
      lead_name: null,
      lead_phone: null,
      lead_channel: null,
      inconclusive_reason: isNonEmptyString(c.motivoInconcluso) ? String(c.motivoInconcluso) : null,
      updated_fields: Array.isArray(c.camposActualizados) ? c.camposActualizados.map(String) : [],
    }
  }).filter((c) => c.contact_date)

  await upsertInChunks(client, "fpc_contacts", contactsRows, "legacy_id")

  const fpcContacts = await fetchAll(client, "fpc_contacts", "id,legacy_id")
  const contactIdByLegacy = new Map(fpcContacts.map((c) => [String(c.legacy_id), c.id]))

  const motiveCodes = new Set()
  for (const c of legacyContacts) {
    if (!Array.isArray(c.motivos)) continue
    for (const m of c.motivos) motiveCodes.add(String(m))
  }

  const motiveRows = [...motiveCodes].map((code) => ({
    code,
    label: titleizeMotive(code),
    section_title: "",
    is_active: true,
  }))
  await upsertInChunks(client, "fpc_motives", motiveRows, "code")

  const contactMotiveRows = []
  for (const c of legacyContacts) {
    const contactId = contactIdByLegacy.get(String(c.id))
    if (!contactId || !Array.isArray(c.motivos)) continue
    for (const m of c.motivos) {
      contactMotiveRows.push({
        contact_id: contactId,
        motive_code: String(m),
      })
    }
  }
  await upsertInChunks(client, "fpc_contact_motives", contactMotiveRows, "contact_id,motive_code")

  const psicoRows = legacyPsico
    .filter((s) => patientIdByLegacy.has(String(s.pacienteId)) && volunteerIdByLegacy.has(String(s.voluntarioId)))
    .map((s) => ({
      legacy_id: String(s.id),
      patient_id: patientIdByLegacy.get(String(s.pacienteId)),
      volunteer_id: volunteerIdByLegacy.get(String(s.voluntarioId)),
      availability_slot_id: isNonEmptyString(s.availabilitySlotId)
        ? slotIdByLegacy.get(String(s.availabilitySlotId)) ?? null
        : null,
      session_number: Number(s.sesionNumero) || 1,
      session_date: toDate(s.fecha),
      start_time: toTime(s.horaInicio),
      end_time: toTime(s.horaFin),
      mode: normalizeSessionMode(s.modalidad),
      status: normalizeSessionStatus(s.estado),
      notes: isNonEmptyString(s.notas) ? String(s.notas) : "",
      satisfaction: Number.isFinite(Number(s.satisfaccion)) ? Number(s.satisfaccion) : null,
      extra_needed: typeof s.extraNeeded === "boolean" ? s.extraNeeded : null,
    }))
    .filter((s) => s.session_date && s.start_time && s.end_time)

  await upsertInChunks(client, "fpc_psico_sessions", psicoRows, "legacy_id")

  const alertRows = legacyAlerts
    .filter((a) => hospitalIdByLegacy.has(String(a.hospitalId)))
    .map((a) => ({
      legacy_id: String(a.id),
      hospital_id: hospitalIdByLegacy.get(String(a.hospitalId)),
      patient_id: patientIdByLegacy.get(String(a.pacienteId)) ?? null,
      contact_id: null,
      created_by_user_id: legacyUserIdToFpcUserId.get(String(a.agenteId ?? "")) ?? null,
      detail: String(a.detalle ?? ""),
      alert_date: toDate(a.fecha),
      status: normalizeAlertStatus(a.estado),
      resolved_at: toDate(a.fechaResolucion) ? `${toDate(a.fechaResolucion)}T00:00:00Z` : null,
    }))
    .filter((a) => a.alert_date)

  await upsertInChunks(client, "fpc_hospital_alerts", alertRows, "legacy_id")

  const countTables = [
    "fpc_hospitals",
    "fpc_patients",
    "fpc_contacts",
    "fpc_contact_motives",
    "fpc_volunteers",
    "fpc_availability_slots",
    "fpc_psico_sessions",
    "fpc_hospital_alerts",
  ]

  const summary = {}
  for (const t of countTables) {
    const { count, error } = await client.from(t).select("*", { count: "exact", head: true })
    if (error) throw error
    summary[t] = count ?? 0
  }

  console.log("Migración completada ✅")
  console.log(summary)

  await client.auth.signOut()
}

main().catch((error) => {
  console.error("Error migrando db.json a Supabase:", error)
  process.exit(1)
})
