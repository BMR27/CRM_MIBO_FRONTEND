export interface User {
  id: string
  email: string
  name: string
  role: string
  role_id?: string
  tenant_id?: string
  avatar_url?: string
  status: string
  is_platform_admin?: boolean
}
