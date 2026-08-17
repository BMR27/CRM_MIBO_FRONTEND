import { redirect } from "next/navigation"

// El registro público de agentes ya no existe: crear un agente ahora requiere
// una sesión de administrador (ver POST /auth/signup en el backend). El registro
// público pasa a ser el de una compañía nueva, que crea su propio espacio de trabajo.
export default function SignupRedirectPage() {
  redirect("/signup-company")
}
