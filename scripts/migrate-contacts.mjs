import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const dbPath = resolve(process.cwd(), "db.json")

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0
}

function normalizeContact(raw, idx) {
  const id = isNonEmptyString(raw?.id) ? String(raw.id) : `ct-${Date.now()}-${idx}`

  const contact = {
    id,
    pacienteId: String(raw?.pacienteId ?? ""),
    agenteId: isNonEmptyString(raw?.agenteId) ? String(raw.agenteId) : "system-migration",
    origen: raw?.origen === "enrolamiento" ? "enrolamiento" : "seguimiento",
    tipo: raw?.tipo === "entrante" ? "entrante" : "saliente",
    estado:
      raw?.estado === "agendado" || raw?.estado === "inconcluso" || raw?.estado === "completado"
        ? raw.estado
        : "completado",
    fecha: isNonEmptyString(raw?.fecha)
      ? String(raw.fecha)
      : new Date().toISOString().slice(0, 10),
    motivos: Array.isArray(raw?.motivos) ? raw.motivos.map(String) : [],
    notas: isNonEmptyString(raw?.notas) ? String(raw.notas) : "",
    camposActualizados: Array.isArray(raw?.camposActualizados)
      ? raw.camposActualizados.map(String)
      : [],
  }

  if (isNonEmptyString(raw?.horaInicio)) {
    contact.horaInicio = String(raw.horaInicio)
  }
  if (isNonEmptyString(raw?.horaFin)) {
    contact.horaFin = String(raw.horaFin)
  }
  if (isNonEmptyString(raw?.motivoInconcluso)) {
    contact.motivoInconcluso = String(raw.motivoInconcluso)
  }

  return contact
}

function ensureUniqueId(id, usedIds) {
  if (!usedIds.has(id)) return id
  let n = 1
  while (usedIds.has(`${id}-${n}`)) n += 1
  return `${id}-${n}`
}

async function main() {
  const raw = await readFile(dbPath, "utf8")
  const db = JSON.parse(raw)

  const legacy = Array.isArray(db.followUpCalls) ? db.followUpCalls : []
  const current = Array.isArray(db.contacts) ? db.contacts : []
  const sourceContacts = current.length > 0 ? current : legacy

  const usedIds = new Set()
  const migrated = []

  for (let i = 0; i < sourceContacts.length; i += 1) {
    const source = sourceContacts[i]
    const base = normalizeContact(source, i)
    base.id = ensureUniqueId(base.id, usedIds)
    usedIds.add(base.id)
    migrated.push(base)

    if (isNonEmptyString(source?.proximaLlamada)) {
      const scheduledId = ensureUniqueId(`scheduled-${base.id}`, usedIds)
      usedIds.add(scheduledId)
      migrated.push({
        id: scheduledId,
        pacienteId: base.pacienteId,
        agenteId: base.agenteId,
        origen: "seguimiento",
        tipo: "saliente",
        estado: "agendado",
        fecha: String(source.proximaLlamada),
        motivos: [],
        notas: "Contacto de seguimiento agendado",
        camposActualizados: [],
      })
    }
  }

  const patients = Array.isArray(db.patients) ? db.patients : []

  for (const patient of patients) {
    if (!isNonEmptyString(patient?.id)) continue
    const pacienteId = String(patient.id)
    const hasEnrollment = migrated.some(
      (c) => c.pacienteId === pacienteId && c.origen === "enrolamiento",
    )

    if (hasEnrollment) continue

    const preferredDate = isNonEmptyString(patient?.fechaCreacion)
      ? String(patient.fechaCreacion).slice(0, 10)
      : isNonEmptyString(patient?.fechaEnrolamiento)
        ? String(patient.fechaEnrolamiento)
        : new Date().toISOString().slice(0, 10)

    const enrollmentId = ensureUniqueId(`ct-enroll-${pacienteId}`, usedIds)
    usedIds.add(enrollmentId)

    const enrollmentContact = {
      id: enrollmentId,
      pacienteId,
      agenteId: "system-enrollment",
      origen: "enrolamiento",
      tipo: "entrante",
      estado: "completado",
      fecha: preferredDate,
      motivos: ["otro"],
      notas: "Contacto inicial de enrolamiento en programa SEPA",
      camposActualizados: [],
    }

    if (isNonEmptyString(patient?.q2_horaInicio)) {
      enrollmentContact.horaInicio = String(patient.q2_horaInicio)
    }
    if (isNonEmptyString(patient?.q133_horaFin)) {
      enrollmentContact.horaFin = String(patient.q133_horaFin)
    }

    migrated.push(enrollmentContact)
  }

  migrated.sort((a, b) => {
    const byDate = String(a.fecha).localeCompare(String(b.fecha))
    if (byDate !== 0) return byDate
    return String(a.id).localeCompare(String(b.id))
  })

  db.contacts = migrated
  if (db.followUpCalls) {
    delete db.followUpCalls
  }

  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf8")

  console.log(
    `Migración completada: ${sourceContacts.length} contactos fuente -> ${migrated.length} contactos finales`,
  )
}

main().catch((error) => {
  console.error("Error en migración de contactos:", error)
  process.exit(1)
})
