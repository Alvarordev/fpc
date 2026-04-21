import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const { data: users, error } = await supabaseAdmin
    .from("fpc_users")
    .select(`
      id,
      email,
      full_name,
      role,
      is_active,
      created_at,
      fpc_volunteers(id, nombre, apellido, estado),
      fpc_callcenter_members(id, nombre, apellido)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Error al cargar usuarios" }, { status: 500 })
  }

  return NextResponse.json({ users: users ?? [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password, role, nombre, apellido, telefono } = body

  if (!email || !password || !role || !nombre || !apellido) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios: email, password, role, nombre, apellido" },
      { status: 400 }
    )
  }

  if (role !== "callcenter" && role !== "voluntario") {
    return NextResponse.json(
      { error: "Rol inválido. Solo se permiten callcenter o voluntario" },
      { status: 400 }
    )
  }

  // 1. Crear usuario en auth.users con email confirmado
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Error al crear usuario en auth" },
      { status: 500 }
    )
  }

  const userId = authData.user.id

  // 2. Insertar en fpc_users
  const { error: profileError } = await supabaseAdmin.from("fpc_users").insert({
    id: userId,
    email,
    full_name: `${nombre} ${apellido}`,
    role,
    is_active: true,
  })

  if (profileError) {
    // Rollback: eliminar usuario de auth
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return NextResponse.json(
      { error: profileError.message ?? "Error al crear perfil de usuario" },
      { status: 500 }
    )
  }

  // 3. Insertar en tabla de perfil según rol
  if (role === "voluntario") {
    const { error: volunteerError } = await supabaseAdmin.from("fpc_volunteers").insert({
      user_id: userId,
      nombre,
      apellido,
      email,
      telefono: telefono ?? null,
      estado: "activo",
    })

    if (volunteerError) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: volunteerError.message ?? "Error al crear perfil de voluntario" },
        { status: 500 }
      )
    }
  } else if (role === "callcenter") {
    const { error: memberError } = await supabaseAdmin.from("fpc_callcenter_members").insert({
      user_id: userId,
      nombre,
      apellido,
    })

    if (memberError) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: memberError.message ?? "Error al crear perfil de callcenter" },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    id: userId,
    email,
    role,
    full_name: `${nombre} ${apellido}`,
  })
}
