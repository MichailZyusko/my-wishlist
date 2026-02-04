"use client"

import { useState } from "react"
import { User } from "@supabase/supabase-js"
import { Profile, WishlistWithWishes } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Gift, Settings, LogOut, Share2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { CreateWishlistDialog } from "./create-wishlist-dialog"
import { WishlistCard } from "./wishlist-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface DashboardContentProps {
  user: User
  profile: Profile | null
  wishlists: WishlistWithWishes[]
}

export function DashboardContent({ user, profile, wishlists: initialWishlists }: DashboardContentProps) {
  const [wishlists, setWishlists] = useState(initialWishlists)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleWishlistCreated = (newWishlist: WishlistWithWishes) => {
    setWishlists([newWishlist, ...wishlists])
    setIsCreateOpen(false)
  }

  const handleWishlistDeleted = (wishlistId: string) => {
    setWishlists(wishlists.filter(w => w.id !== wishlistId))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">Wishlist</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {profile?.full_name && (
                      <p className="font-medium">{profile.full_name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Wishlists</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your wishlists to share with friends
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Wishlist
          </Button>
        </div>

        {wishlists.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="mb-2">No wishlists yet</CardTitle>
              <CardDescription className="text-center mb-4">
                Create your first wishlist to start adding items and sharing with friends
              </CardDescription>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Wishlist
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist) => (
              <WishlistCard 
                key={wishlist.id} 
                wishlist={wishlist}
                onDelete={handleWishlistDeleted}
              />
            ))}
          </div>
        )}
      </main>

      <CreateWishlistDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onSuccess={handleWishlistCreated}
      />
    </div>
  )
}
