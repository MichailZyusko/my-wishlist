"use client"

import { useState } from "react"
import { User } from "@supabase/supabase-js"
import { Profile, ReferralSetting } from "@/lib/types"
import { COMMON_REFERRAL_PATTERNS } from "@/lib/referral"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Gift, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form"

interface SettingsContentProps {
  user: User
  profile: Profile | null
  referralSettings: ReferralSetting[]
}

interface ReferralFormData {
  store_domain: string
  referral_param: string
  referral_value: string
}

export function SettingsContent({ user, profile, referralSettings: initialSettings }: SettingsContentProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, reset, setValue, watch } = useForm<ReferralFormData>({
    defaultValues: {
      store_domain: "",
      referral_param: "",
      referral_value: "",
    },
  })

  const storeDomain = watch("store_domain")

  // Auto-fill param when domain matches known patterns
  const handleDomainChange = (domain: string) => {
    const pattern = Object.entries(COMMON_REFERRAL_PATTERNS).find(([key]) => 
      domain.includes(key)
    )
    if (pattern) {
      setValue("referral_param", pattern[1].param)
    }
  }

  const onSubmit = async (data: ReferralFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: newSetting, error } = await supabase
      .from("referral_settings")
      .upsert({
        user_id: user.id,
        store_domain: data.store_domain.toLowerCase().replace("www.", ""),
        referral_param: data.referral_param,
        referral_value: data.referral_value,
      }, {
        onConflict: "user_id,store_domain",
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to save referral settings")
      setIsLoading(false)
      return
    }

    toast.success("Referral settings saved!")
    setSettings([...settings.filter(s => s.store_domain !== newSetting.store_domain), newSetting])
    reset()
    setIsAddOpen(false)
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("referral_settings")
      .delete()
      .eq("id", id)

    if (error) {
      toast.error("Failed to delete referral setting")
      return
    }

    toast.success("Referral setting deleted")
    setSettings(settings.filter(s => s.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your referral links and preferences</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={user.email || ""} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={profile?.full_name || ""} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Referral Settings Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Referral Links
                  </CardTitle>
                  <CardDescription>
                    Configure your affiliate/referral codes for different stores. When friends click items in your wishlists, your referral code will be automatically added.
                  </CardDescription>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Store
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Referral Setting</DialogTitle>
                      <DialogDescription>
                        Configure your referral code for a specific store. Common stores are auto-detected.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="store_domain">Store Domain</Label>
                          <Input
                            id="store_domain"
                            placeholder="amazon.com"
                            {...register("store_domain", { required: true })}
                            onChange={(e) => {
                              register("store_domain").onChange(e)
                              handleDomainChange(e.target.value)
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter the domain without https:// or www.
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="referral_param">Parameter Name</Label>
                          <Input
                            id="referral_param"
                            placeholder="tag"
                            {...register("referral_param", { required: true })}
                          />
                          <p className="text-xs text-muted-foreground">
                            The URL parameter name (e.g., &quot;tag&quot; for Amazon)
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="referral_value">Your Referral Code</Label>
                          <Input
                            id="referral_value"
                            placeholder="your-affiliate-id"
                            {...register("referral_value", { required: true })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {settings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No referral links configured yet.</p>
                  <p className="text-sm">Add a store to start earning from your wishlists.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {settings.map((setting) => (
                    <div
                      key={setting.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div>
                        <p className="font-medium">{setting.store_domain}</p>
                        <p className="text-sm text-muted-foreground">
                          {setting.referral_param}={setting.referral_value}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(setting.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Common Stores Info */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Stores</CardTitle>
              <CardDescription>
                These stores have known referral parameter patterns. We auto-fill the parameter name when you add them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(COMMON_REFERRAL_PATTERNS).map(([domain, { param }]) => (
                  <div key={domain} className="text-sm p-2 rounded bg-muted">
                    <span className="font-medium">{domain}</span>
                    <span className="text-muted-foreground ml-1">({param})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
