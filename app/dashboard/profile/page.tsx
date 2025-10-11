"use client"

import Navbar from "@/app/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

export default function ProfilePrefsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [tone, setTone] = useState<string>("Professional")
  const [templateStyle, setTemplateStyle] = useState<string>("Modern")
  const [jobTarget, setJobTarget] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        toast.error("Please login")
        return
      }
      setUserId(data.user.id)
      setFullName((data.user.user_metadata as any)?.full_name || "")
      setEmail(data.user.email || "")

      try {
        const res = await fetch("/api/preferences/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: data.user.id }),
        })
        const json = await res.json()
        if (json?.prefs) {
          setTone(json.prefs.tone || "Professional")
          setTemplateStyle(json.prefs.template_style || "Modern")
          setJobTarget(json.prefs.job_target || "")
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const savePrefs = async () => {
    if (!userId) return
    try {
      const res = await fetch("/api/preferences/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, tone, template_style: templateStyle, job_target: jobTarget }),
      })
      if (!res.ok) throw new Error("Save failed")
      toast.success("Preferences updated")
    } catch (e: any) {
      toast.error(e?.message || "Save failed")
    }
  }

  const saveProfile = async () => {
    if (!userId) return
    try {
      // Update user row (if using service role you could use a server route; here we update auth metadata for demo)
      const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } })
      if (error) throw error
      toast.success("Profile updated")
    } catch (e: any) {
      toast.error(e?.message || "Update failed")
    }
  }

  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto max-w-4xl p-6 space-y-6">
        <h1 className="text-2xl font-semibold">My Profile & Preferences</h1>

        <Card className="bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-card" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={email} readOnly className="bg-card" />
              </div>
            </div>
            <div>
              <Button className="bg-primary text-primary-foreground" onClick={saveProfile} disabled={loading}>
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Resume Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Tone</label>
                <select
                  className="w-full h-10 rounded-md border border-border bg-card px-3"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option>Professional</option>
                  <option>Creative</option>
                  <option>Academic</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Template Style</label>
                <select
                  className="w-full h-10 rounded-md border border-border bg-card px-3"
                  value={templateStyle}
                  onChange={(e) => setTemplateStyle(e.target.value)}
                >
                  <option>Modern</option>
                  <option>Minimal</option>
                  <option>Classic</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Job Target</label>
                <Input value={jobTarget} onChange={(e) => setJobTarget(e.target.value)} className="bg-card" />
              </div>
            </div>
            <div>
              <Button className="bg-primary text-primary-foreground" onClick={savePrefs} disabled={loading}>
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
