"use client"

import { useEffect, useMemo, useState } from "react"
import Navbar from "@/app/components/navbar"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Doc = {
  id: string
  title: string
  type: "resume" | "cover_letter" | "portfolio"
  content: string
  created_at?: string
}

export default function MyDocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "resume" | "cover_letter" | "portfolio">("all")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) {
          toast.error("Please login")
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
        toast.error(e?.message || "Failed to load documents")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    if (filter === "all") return docs
    return docs.filter((d) => d.type === filter)
  }, [docs, filter])

  const download = (doc: Doc) => {
    const ext = doc.type === "portfolio" ? "html" : "txt"
    const mime = doc.type === "portfolio" ? "text/html" : "text/plain"
    const blob = new Blob([doc.content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${doc.title}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onUpload = async (file: File) => {
    try {
      setUploading(true)
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        toast.error("Please login")
        return
      }
      const filename = `${user.user.id}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from("uploads").upload(filename, file, { upsert: false })
      if (error) throw error
      toast.success("File uploaded to uploads bucket")
    } catch (e: any) {
      toast.error(e?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
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
      toast.success("Deleted")
    } catch (e: any) {
      toast.error(e?.message || "Delete failed")
    }
  }

  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto max-w-5xl p-6 space-y-6">
        <h1 className="text-2xl font-semibold">My Documents</h1>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Filter:</span>
            <select
              className="h-9 rounded-md border border-border bg-card px-3"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="resume">Resume</option>
              <option value="cover_letter">Cover Letter</option>
              <option value="portfolio">Portfolio</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mr-2">Upload file</label>
            <input
              type="file"
              onChange={(e) => e.target.files && e.target.files[0] && onUpload(e.target.files[0])}
              disabled={uploading}
            />
          </div>
        </div>
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
