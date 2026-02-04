import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SharedWishlistContent } from "@/components/shared/shared-wishlist-content"

interface Props {
  params: Promise<{ code: string }>
}

export default async function SharedWishlistPage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()

  // Fetch wishlist by share code (public access)
  const { data: wishlist, error } = await supabase
    .from("wishlists")
    .select("*, wishes(*), profiles(full_name, avatar_url)")
    .eq("share_code", code)
    .eq("is_public", true)
    .single()

  if (error || !wishlist) {
    notFound()
  }

  // Get referral settings for the wishlist owner
  const { data: referralSettings } = await supabase
    .from("referral_settings")
    .select("*")
    .eq("user_id", wishlist.user_id)

  return (
    <SharedWishlistContent 
      wishlist={wishlist}
      ownerProfile={wishlist.profiles}
      referralSettings={referralSettings || []}
    />
  )
}
