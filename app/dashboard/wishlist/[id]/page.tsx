import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { WishlistDetailContent } from "@/components/wishlist/wishlist-detail-content"

interface Props {
  params: Promise<{ id: string }>
}

export default async function WishlistDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: wishlist, error } = await supabase
    .from("wishlists")
    .select("*, wishes(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !wishlist) {
    notFound()
  }

  const { data: referralSettings } = await supabase
    .from("referral_settings")
    .select("*")
    .eq("user_id", user.id)

  return (
    <WishlistDetailContent 
      wishlist={wishlist}
      referralSettings={referralSettings || []}
    />
  )
}
