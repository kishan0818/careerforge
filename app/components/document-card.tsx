"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCallback, useMemo, useState } from "react"
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
  const isHtml = useMemo(() => content.trim().startsWith("<"), [content])
  const download = useCallback(() => {
    const isHtmlType = isHtml || type === "portfolio" || type === "resume"
    const blob = new Blob([content], { type: isHtmlType ? "text/html" : "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title}.${isHtmlType ? "html" : "txt"}`
    a.click()
    URL.revokeObjectURL(url)
  }, [content, title, type, isHtml])

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
      const isHtmlType = isHtml || type === "portfolio" || type === "resume"
      const ext = isHtmlType ? "html" : "txt"
      const safeTitle = title.replace(/[^a-z0-9\-]+/gi, "_")
      const fileName = `${Date.now()}-${safeTitle}.${ext}`
      const res = await fetch('/api/upload-generated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.user.id,
          fileName,
          content,
          contentType: isHtmlType ? 'text/html' : 'text/plain',
        }),
      })
      if (!res.ok) throw new Error('Upload failed')
      toast.success("Uploaded to Supabase Storage")
    } catch (e: any) {
      toast.error(`Upload failed: ${e?.message || "unknown error"}`)
    } finally {
      setUploading(false)
    }
  }, [content, title, type, isHtml])

  const downloadWord = useCallback(() => {
    const html = isHtml ? content : `<html><body><pre>${content.replace(/</g, '&lt;')}</pre></body></html>`
    const blob = new Blob([html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }, [content, isHtml, title])

  const generatePdfServer = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        toast.error("Please login")
        return
      }
      const safeTitle = title.replace(/[^a-z0-9\-]+/gi, "_")
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.user.id, htmlContent: isHtml ? content : `<html><body><pre style="white-space:pre-wrap;">${content.replace(/</g, '&lt;')}</pre></body></html>`, fileName: `${Date.now()}-${safeTitle}.pdf` }),
      })
      const json = await res.json()
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'PDF failed')
      toast.success('PDF ready')
      if (json.url) {
        window.open(json.url, '_blank')
      }
    } catch (e: any) {
      toast.error(e?.message || 'PDF generation failed')
    }
  }, [content, isHtml, title])

  return (
    <Card className="bg-card/70 backdrop-blur-md hover:shadow-sm transition">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border bg-secondary p-3 max-h-80 overflow-auto text-sm">
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <pre className="whitespace-pre-wrap">{content}</pre>
          )}
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary text-primary-foreground" onClick={download}>
            Download
          </Button>
          <Button variant="outline" onClick={downloadWord}>
            Download Word
          </Button>
          <Button variant="outline" onClick={generatePdfServer}>
            Generate PDF
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
