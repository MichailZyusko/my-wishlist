"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { createClient } from "@/lib/supabase/client"
import { Wish, ReferralSetting } from "@/lib/types"
import { applyReferralToUrl } from "@/lib/referral"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Link as LinkIcon } from "lucide-react"

interface AddWishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wishlistId: string
  referralSettings: ReferralSetting[]
  onSuccess: (wish: Wish) => void
}

interface FormData {
  title: string
  description: string
  original_url: string
  image_url: string
  price: string
  currency: string
}

export function AddWishDialog({
  open,
  onOpenChange,
  wishlistId,
  referralSettings,
  onSuccess,
}: AddWishDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      original_url: "",
      image_url: "",
      price: "",
      currency: "USD",
    },
  })

  const originalUrl = watch("original_url")

  const fetchUrlMetadata = async () => {
    if (!originalUrl) {
      toast.error("Please enter a URL first")
      return
    }

    setIsFetching(true)
    try {
      const response = await fetch("/api/fetch-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: originalUrl }),
      })

      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      
      if (data.title) setValue("title", data.title)
      if (data.description) setValue("description", data.description)
      if (data.image) setValue("image_url", data.image)
      if (data.price) setValue("price", data.price.toString())
      
      toast.success("Product info fetched!")
    } catch {
      toast.error("Could not fetch product info. Please fill in manually.")
    } finally {
      setIsFetching(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("You must be logged in")
      setIsLoading(false)
      return
    }

    // Apply referral link if settings exist for this domain
    const referralUrl = applyReferralToUrl(data.original_url, referralSettings)

    const { data: newWish, error } = await supabase
      .from("wishes")
      .insert({
        wishlist_id: wishlistId,
        user_id: user.id,
        title: data.title,
        description: data.description || null,
        original_url: data.original_url,
        referral_url: referralUrl !== data.original_url ? referralUrl : null,
        image_url: data.image_url || null,
        price: data.price ? parseFloat(data.price) : null,
        currency: data.currency,
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to add item")
      setIsLoading(false)
      return
    }

    toast.success("Item added to wishlist!")
    reset()
    onSuccess(newWish)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Item to Wishlist</DialogTitle>
          <DialogDescription>
            Paste a product URL to automatically fetch details, or fill in manually.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="original_url">Product URL</Label>
              <div className="flex gap-2">
                <Input
                  id="original_url"
                  placeholder="https://amazon.com/product/..."
                  {...register("original_url", { required: true })}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchUrlMetadata}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Product name"
                {...register("title", { required: true })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Any notes about this item..."
                {...register("description")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                placeholder="https://example.com/image.jpg"
                {...register("image_url")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (optional)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="29.99"
                  {...register("price")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="USD"
                  {...register("currency")}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
