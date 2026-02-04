"use client"

import { WishlistWithWishes } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2, Trash2, ExternalLink, Gift } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface WishlistCardProps {
  wishlist: WishlistWithWishes
  onDelete: (id: string) => void
}

export function WishlistCard({ wishlist, onDelete }: WishlistCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCopyShareLink = async () => {
    const shareUrl = `${window.location.origin}/share/${wishlist.share_code}`
    await navigator.clipboard.writeText(shareUrl)
    toast.success("Share link copied to clipboard!")
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", wishlist.id)

    if (error) {
      toast.error("Failed to delete wishlist")
      setIsDeleting(false)
      return
    }

    toast.success("Wishlist deleted")
    onDelete(wishlist.id)
  }

  const itemCount = wishlist.wishes?.length || 0
  const reservedCount = wishlist.wishes?.filter(w => w.is_reserved).length || 0

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{wishlist.title}</CardTitle>
            {wishlist.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {wishlist.description}
              </CardDescription>
            )}
          </div>
          <Badge variant={wishlist.is_public ? "default" : "secondary"}>
            {wishlist.is_public ? "Public" : "Private"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Gift className="w-4 h-4" />
            <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          </div>
          {reservedCount > 0 && (
            <div className="text-green-600">
              {reservedCount} reserved
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="default" className="flex-1">
            <Link href={`/dashboard/wishlist/${wishlist.id}`}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </Link>
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleCopyShareLink}>
            <Share2 className="w-4 h-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete wishlist?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{wishlist.title}&quot; and all its items. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
