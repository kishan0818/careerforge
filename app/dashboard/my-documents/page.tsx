"use client"

import { useEffect, useMemo, useState } from "react"
import Navbar from "@/app/components/navbar"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

type Doc = {
  id: string
  title: string
  type: "resume"
  content: string
  created_at?: string
  pdf_url?: string | null
}

export default function MyDocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) {
          toast({ title: "Please login", variant: "destructive" })
          return
        }
        const { data, error } = await supabase
          .from("resumes")
          .select("id,title,type,content,created_at")
          .eq("user_id", user.user.id)
          .order("created_at", { ascending: false })
        if (error) throw error
        setDocs((data as any) || [])
      } catch (e: any) {
        toast({ title: "Failed to load documents", description: e?.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => docs.filter((d) => d.type === 'resume'), [docs])

  const download = (doc: Doc) => {
    const blob = new Blob([doc.content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${doc.title}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch("/api/documents/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error("Delete failed")
      setDocs((d) => d.filter((x) => x.id !== id))
      toast({ title: "Deleted" })
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message, variant: "destructive" })
    }
  }

  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto max-w-5xl p-6 space-y-6">
        <h1 className="text-2xl font-semibold">My Documents</h1>
        <div className="text-sm text-muted-foreground">Only AI-generated resumes are shown here.</div>
        {loading ? (
          <div>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-muted-foreground">No documents yet.</div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((d) => (
              <Card key={d.id} className="bg-card/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>
                      {d.title} <span className="text-xs text-muted-foreground">({d.type})</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(d.created_at || '').toLocaleString()}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button size="sm" onClick={() => download(d)}>
                    Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(d.id)}>
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
