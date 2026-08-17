import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { InboxHeader } from "@/components/inbox-header"
import { ProfileClient } from "@/components/profile-client"

export default async function PerfilPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <>
      <InboxHeader />
      <ProfileClient user={user} />
    </>
  )
}
