import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: wishlists } = await supabase
    .from("wishlists")
    .select("*, wishes(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardContent 
      user={user} 
      profile={profile} 
      wishlists={wishlists || []} 
    />
  )
}
