import bcrypt from "bcryptjs"
import { sql } from "./db"
import { isDemoMode } from "./db"

export interface User {
  id: number
  email: string
  name: string
  role: string
  avatar_url?: string
  status: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (isDemoMode) {
    return null
  }

  const users = (await sql`
    SELECT u.id, u.email, u.name, COALESCE(r.name, 'agent') as role, u.avatar_url, u.status
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.email = ${email}
    LIMIT 1
  `) as unknown as User[]
  return users.length > 0 ? users[0] : null
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  if (isDemoMode) {
    return null
  }

  const users = (await sql`
    SELECT u.id, u.email, u.password_hash, u.name, COALESCE(r.name, 'agent') as role, u.avatar_url, u.status
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.email = ${email}
    LIMIT 1
  `) as unknown as Array<User & { password_hash: string }>

  if (users.length === 0) {
    return null
  }

  const user = users[0]
  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) {
    return null
  }

  // Return user without password_hash
  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword as User
}
