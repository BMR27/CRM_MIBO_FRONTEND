import postgres from "postgres"

export const isDemoMode = !process.env.DATABASE_URL

// Keep `sql` always callable for TypeScript, even in demo mode.
// In demo mode it throws if used, so routes should guard with `isDemoMode`.
export const sql: ReturnType<typeof postgres> = process.env.DATABASE_URL
  ? postgres(process.env.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : (((() => {
      throw new Error("Database is not configured (DATABASE_URL missing)")
    }) as unknown) as ReturnType<typeof postgres>)

let lastLoginSchemaReady = false

/**
 * Crea las columnas de último ingreso si todavía no existen (equivalente a la
 * migración 022 del backend). Igual que con `session_key`, se hace desde la app para
 * que el módulo de usuarios de plataforma funcione aunque la migración no se haya
 * corrido todavía en ese entorno. Solo ejecuta el ALTER una vez por proceso.
 */
export async function ensureLastLoginColumns(): Promise<void> {
  if (lastLoginSchemaReady || isDemoMode) return
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip TEXT`
  lastLoginSchemaReady = true
}
