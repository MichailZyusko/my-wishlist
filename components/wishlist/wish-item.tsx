"use client"

import { useState } from "react"
import { Wish } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Trash2, Check, Gift } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
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

interface WishItemProps {
  wish: Wish
  onUpdate?: (wish: Wish) => void
  onDelete?: (id: string) => void
  isOwner: boolean
  onReserve?: () => void
}

export function WishItem({ wish, onUpdate, onDelete, isOwner, onReserve }: WishItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReserving, setIsReserving] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase.from("wishes").delete().eq("id", wish.id)

    if (error) {
      toast.error("Failed to delete item")
      setIsDeleting(false)
      return
    }

    toast.success("Item deleted")
    onDelete(wish.id)
  }

  const handleReserve = async () => {
    if (onReserve) {
      onReserve()
      return
    }
    
    setIsReserving(true)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("wishes")
      .update({
        is_reserved: !wish.is_reserved,
        reserved_by: wish.is_reserved ? null : user?.id || null,
        reserved_at: wish.is_reserved ? null : new Date().toISOString(),
      })
      .eq("id", wish.id)
      .select()
      .single()

    if (error) {
      toast.error("Failed to update reservation")
      setIsReserving(false)
      return
    }

    toast.success(data.is_reserved ? "Item reserved!" : "Reservation cancelled")
    if (onUpdate) onUpdate(data)
    setIsReserving(false)
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return null
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price)
  }

  // Determine which URL to use (referral URL for visitors, original for owners)
  const displayUrl = isOwner ? wish.original_url : (wish.referral_url || wish.original_url)

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow">
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
            <Badge className="bg-green-500 text-white">Reserved</Badge>
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
            <a href={displayUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              {isOwner ? "View" : "Buy"}
            </a>
          </Button>

          {!isOwner && !wish.is_purchased && (
            <Button
              variant={wish.is_reserved ? "secondary" : "outline"}
              size="sm"
              onClick={handleReserve}
              disabled={isReserving}
            >
              <Check className="w-4 h-4 mr-1" />
              {wish.is_reserved ? "Unreserve" : "Reserve"}
            </Button>
          )}

          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{wish.title}&quot; from your wishlist.
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}
