import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { sql, isDemoMode } from "@/lib/db"
import jwt from "jsonwebtoken"
import type { Secret, SignOptions } from "jsonwebtoken"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validar entrada
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 },
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 },
      )
    }



















  // Eliminado: ahora el registro se maneja solo por el backend NestJS
}
