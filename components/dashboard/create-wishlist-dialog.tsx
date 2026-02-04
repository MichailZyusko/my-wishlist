"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { createClient } from "@/lib/supabase/client"
import { WishlistWithWishes } from "@/lib/types"
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
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface CreateWishlistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (wishlist: WishlistWithWishes) => void
}

interface FormData {
  title: string
  description: string
  is_public: boolean
}

export function CreateWishlistDialog({ open, onOpenChange, onSuccess }: CreateWishlistDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      is_public: true,
    },
  })

  const isPublic = watch("is_public")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error("You must be logged in to create a wishlist")
      setIsLoading(false)
      return
    }

    const { data: newWishlist, error } = await supabase
      .from("wishlists")
      .insert({
        title: data.title,
        description: data.description || null,
        is_public: data.is_public,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to create wishlist")
      setIsLoading(false)
      return
    }

    toast.success("Wishlist created!")
    reset()
    onSuccess({ ...newWishlist, wishes: [] })
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Wishlist</DialogTitle>
          <DialogDescription>
            Give your wishlist a name and description. You can add items after creating it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Birthday Wishlist"
                {...register("title", { required: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Items I would love for my birthday..."
                {...register("description")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_public">Public wishlist</Label>
                <p className="text-sm text-muted-foreground">
                  Allow anyone with the link to view
                </p>
              </div>
              <Switch
                id="is_public"
                checked={isPublic}
                onCheckedChange={(checked) => setValue("is_public", checked)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Wishlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
