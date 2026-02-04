"use client"

import { useState } from "react"
import { WishlistWithWishes, Wish, ReferralSetting, Profile } from "@/lib/types"
import { applyReferralToUrl } from "@/lib/referral"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Gift, ExternalLink, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"

interface SharedWishlistContentProps {
  wishlist: WishlistWithWishes
  ownerProfile: Pick<Profile, "full_name" | "avatar_url"> | null
  referralSettings: ReferralSetting[]
}

export function SharedWishlistContent({ 
  wishlist: initialWishlist, 
  ownerProfile,
  referralSettings 
}: SharedWishlistContentProps) {
  const [wishlist, setWishlist] = useState(initialWishlist)

  const handleReserve = async (wish: Wish) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("wishes")
      .update({
        is_reserved: !wish.is_reserved,
        reserved_at: wish.is_reserved ? null : new Date().toISOString(),
      })
      .eq("id", wish.id)
      .select()
      .single()

    if (error) {
      toast.error("Failed to update reservation")
      return
    }

    toast.success(data.is_reserved ? "Item reserved! You can now purchase it." : "Reservation cancelled")
    setWishlist({
      ...wishlist,
      wishes: wishlist.wishes.map((w) => (w.id === data.id ? data : w)),
    })
  }

  const getDisplayUrl = (wish: Wish) => {
    // Apply referral URL for shared views
    if (wish.referral_url) return wish.referral_url
    return applyReferralToUrl(wish.original_url, referralSettings)
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return null
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price)
  }

  const reservedCount = wishlist.wishes.filter(w => w.is_reserved).length
  const availableCount = wishlist.wishes.length - reservedCount

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{wishlist.title}</h1>
              {wishlist.description && (
                <p className="text-muted-foreground">{wishlist.description}</p>
              )}
            </div>
          </div>
          
          {ownerProfile && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Avatar className="h-8 w-8">
                <AvatarImage src={ownerProfile.avatar_url || ""} />
                <AvatarFallback>
                  {ownerProfile.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Wishlist by <span className="font-medium text-foreground">{ownerProfile.full_name || "Someone special"}</span>
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6 text-sm">
          <span className="text-muted-foreground">
            {wishlist.wishes.length} {wishlist.wishes.length === 1 ? "item" : "items"}
          </span>
          {reservedCount > 0 && (
            <>
              <span className="text-muted-foreground">|</span>
              <span className="text-green-600">{reservedCount} reserved</span>
            </>
          )}
          {availableCount > 0 && (
            <>
              <span className="text-muted-foreground">|</span>
              <span>{availableCount} available</span>
            </>
          )}
        </div>

        {wishlist.wishes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="mb-2">No items yet</CardTitle>
              <CardDescription className="text-center">
                This wishlist is empty. Check back later!
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.wishes.map((wish) => (
              <Card key={wish.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {wish.image_url ? (
                    <img
                      src={wish.image_url}
                      alt={wish.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                  {wish.is_reserved && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge className="bg-green-500 text-white text-sm">Reserved</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-1">{wish.title}</h3>
                    {wish.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {wish.description}
                      </p>
                    )}
                  </div>

                  {wish.price && (
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(wish.price, wish.currency)}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Button asChild variant="default" className="flex-1" size="sm">
                      <a href={getDisplayUrl(wish)} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Buy This Gift
                      </a>
                    </Button>

                    {!wish.is_purchased && (
                      <Button
                        variant={wish.is_reserved ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleReserve(wish)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {wish.is_reserved ? "Unreserve" : "Reserve"}
                      </Button>
                    )}
                  </div>

                  {wish.is_reserved && (
                    <p className="text-xs text-center text-muted-foreground">
                      Someone is planning to buy this gift!
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want to create your own wishlist?
          </p>
          <Button asChild variant="outline">
            <Link href="/auth/login">
              <Gift className="w-4 h-4 mr-2" />
              Create Your Wishlist
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
