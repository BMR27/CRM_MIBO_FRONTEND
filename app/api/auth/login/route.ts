import { NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import jwt from "jsonwebtoken"
import type { Secret, SignOptions } from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
    // Eliminado: ahora el login se maneja solo por el backend NestJS
    return NextResponse.json(
      {
        access_token: token,
        token_type: "Bearer",
        expires_in: process.env.JWT_EXPIRATION || "7d",
        user,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Login error:", error)

    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        return NextResponse.json(
          {
            error: "Cannot connect to database. Verify DATABASE_URL and that PostgreSQL is running.",
          },
          { status: 500 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
