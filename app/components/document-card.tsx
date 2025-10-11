"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCallback, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

export default function DocumentCard({
  title,
  content,
  type,
}: {
  title: string
  content: string
  type: "resume" | "cover" | "portfolio"
}) {
  const [uploading, setUploading] = useState(false)
  const download = useCallback(() => {
    const blob = new Blob([content], { type: type === "portfolio" ? "text/html" : "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title}.${type === "portfolio" ? "html" : "txt"}`
    a.click()
    URL.revokeObjectURL(url)
  }, [content, title, type])

  const save = useCallback(() => {
    const raw = localStorage.getItem("cf_docs")
    const docs = raw ? JSON.parse(raw) : []
    const id = crypto.randomUUID()
    const doc = { id, title, type, createdAt: Date.now(), content }
    const next = [doc, ...docs]
    localStorage.setItem("cf_docs", JSON.stringify(next))
    toast.success("Saved to My Documents")
  }, [content, title, type])

  const uploadToSupabase = useCallback(async () => {
    try {
      setUploading(true)
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        toast.error("Please login to upload to Supabase")
        return
      }
      const ext = type === "portfolio" ? "html" : "txt"
      const filename = `${user.user.id}/${Date.now()}-${title.replace(/[^a-z0-9\-]+/gi, "_")}.${ext}`
      const blob = new Blob([content], { type: type === "portfolio" ? "text/html" : "text/plain" })
      const { error } = await supabase.storage.from("generated_files").upload(filename, blob, { upsert: false })
      if (error) throw error
      toast.success("Uploaded to Supabase Storage")
    } catch (e: any) {
      toast.error(`Upload failed: ${e?.message || "unknown error"}`)
    } finally {
      setUploading(false)
    }
  }, [content, title, type])

  return (
    <Card className="bg-card/70 backdrop-blur-md hover:shadow-sm transition">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border bg-secondary p-3 max-h-60 overflow-auto text-sm">
          {type === "portfolio" ? (
            <pre className="whitespace-pre-wrap">
              {content.slice(0, 800)}
              {content.length > 800 ? "…" : ""}
            </pre>
          ) : (
            <pre className="whitespace-pre-wrap">{content}</pre>
          )}
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary text-primary-foreground" onClick={download}>
            Download
          </Button>
          <Button variant="outline" onClick={save}>
            Save to My Documents
          </Button>
          <Button variant="outline" onClick={uploadToSupabase} disabled={uploading}>
            {uploading ? "Uploading..." : "Save to Supabase"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
