"use client"

import Navbar from "@/app/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function ProfilePage() {
  const [about, setAbout] = useState("")
  const [theme, setTheme] = useState<"Modern" | "Minimal" | "Classic">("Modern")
  const [linkedIn, setLinkedIn] = useState("")
  const [github, setGithub] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setName((data.user.user_metadata as any)?.full_name || "")
        setEmail(data.user.email || "")
      }
    })()
  }, [])

  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto max-w-4xl p-6 space-y-6">
        <h1 className="text-2xl font-semibold">My Profile</h1>

        <Card className="bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={name} readOnly className="bg-card" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={email} readOnly className="bg-card" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">About Me</label>
              <Input value={about} onChange={(e) => setAbout(e.target.value)} className="bg-card" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Default Theme</label>
                <select
                  className="w-full h-10 rounded-md border border-border bg-card px-3"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                >
                  <option>Modern</option>
                  <option>Minimal</option>
                  <option>Classic</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">LinkedIn</label>
                <Input
                  placeholder="https://linkedin.com/in/you"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  className="bg-card"
                />
              </div>
              <div>
                <label className="text-sm font-medium">GitHub</label>
                <Input
                  placeholder="https://github.com/you"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="bg-card"
                />
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground">Update Profile</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
