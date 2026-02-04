import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, Share2, DollarSign, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">Wishlist</span>
          </div>
          <Button asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance max-w-4xl mx-auto">
              Create Wishlists, Share with Friends, Earn Rewards
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Build beautiful wishlists with products from any store. When friends buy gifts from your list, you earn through your referral links.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-8">
                <Link href="/auth/login">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Create Wishlists</h3>
                  <p className="text-muted-foreground">
                    Add products from any online store. Just paste the URL and we will automatically fetch product details.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Share2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Share with Friends</h3>
                  <p className="text-muted-foreground">
                    Share a simple link with friends and family. They can see your wishes and reserve items they want to buy.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
                  <p className="text-muted-foreground">
                    Configure your affiliate links once. Every purchase made through your wishlist earns you referral rewards.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Create your first wishlist in minutes. Sign in with Google to get started.
            </p>
            <Button asChild size="lg">
              <Link href="/auth/login">
                <Gift className="w-4 h-4 mr-2" />
                Create Your Wishlist
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with love for gift-givers everywhere</p>
        </div>
      </footer>
    </div>
  )
}
