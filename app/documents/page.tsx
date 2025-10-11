"use client"

import Navbar from "@/app/components/navbar"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Doc = { id: string; title: string; type: "resume" | "cover" | "portfolio"; createdAt: number; content: string }

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([])

  useEffect(() => {
    const raw = localStorage.getItem("cf_docs")
    if (raw) setDocs(JSON.parse(raw))
  }, [])

  const remove = (id: string) => {
    const next = docs.filter((d) => d.id !== id)
    setDocs(next)
    localStorage.setItem("cf_docs", JSON.stringify(next))
  }

  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <h1 className="text-2xl font-semibold">My Documents</h1>
        <section className="grid md:grid-cols-3 gap-6">
          {docs.length === 0 && (
            <p className="text-muted-foreground">No documents yet. Generate some from the dashboard.</p>
          )}
          {docs.map((d) => (
            <Card key={d.id} className="bg-card/70 backdrop-blur-md hover:shadow-sm transition">
              <CardHeader>
                <CardTitle className="text-base">{d.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {d.type.toUpperCase()} • {new Date(d.createdAt).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    className="bg-primary text-primary-foreground"
                    onClick={() => {
                      const blob = new Blob([d.content], { type: "text/plain" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `${d.title}.txt`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    View / Download
                  </Button>
                  <Button variant="destructive" onClick={() => remove(d.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  )
}
