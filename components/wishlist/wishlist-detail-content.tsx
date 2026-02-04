"use client"

import { useState } from "react"
import { WishlistWithWishes, Wish, ReferralSetting } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Share2, Settings, Gift } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { AddWishDialog } from "./add-wish-dialog"
import { WishItem } from "./wish-item"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

interface WishlistDetailContentProps {
  wishlist: WishlistWithWishes
  referralSettings: ReferralSetting[]
}

export function WishlistDetailContent({ wishlist: initialWishlist, referralSettings }: WishlistDetailContentProps) {
  const [wishlist, setWishlist] = useState(initialWishlist)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const handleCopyShareLink = async () => {
    const shareUrl = `${window.location.origin}/share/${wishlist.share_code}`
    await navigator.clipboard.writeText(shareUrl)
    toast.success("Share link copied to clipboard!")
  }

  const handleWishAdded = (newWish: Wish) => {
    setWishlist({
      ...wishlist,
      wishes: [...wishlist.wishes, newWish],
    })
    setIsAddOpen(false)
  }

  const handleWishUpdated = (updatedWish: Wish) => {
    setWishlist({
      ...wishlist,
      wishes: wishlist.wishes.map((w) => (w.id === updatedWish.id ? updatedWish : w)),
    })
  }

  const handleWishDeleted = (wishId: string) => {
    setWishlist({
      ...wishlist,
      wishes: wishlist.wishes.filter((w) => w.id !== wishId),
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{wishlist.title}</h1>
                <Badge variant={wishlist.is_public ? "default" : "secondary"}>
                  {wishlist.is_public ? "Public" : "Private"}
                </Badge>
              </div>
              {wishlist.description && (
                <p className="text-sm text-muted-foreground">{wishlist.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCopyShareLink}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="/settings">
                  <Settings className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {wishlist.wishes.length} {wishlist.wishes.length === 1 ? "item" : "items"} in this wishlist
          </p>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {wishlist.wishes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="mb-2">No items yet</CardTitle>
              <CardDescription className="text-center mb-4">
                Add items to your wishlist by pasting product URLs from your favorite stores
              </CardDescription>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.wishes.map((wish) => (
              <WishItem
                key={wish.id}
                wish={wish}
                onUpdate={handleWishUpdated}
                onDelete={handleWishDeleted}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </main>

      <AddWishDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        wishlistId={wishlist.id}
        referralSettings={referralSettings}
        onSuccess={handleWishAdded}
      />
    </div>
  )
}
