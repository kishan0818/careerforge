"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/app/components/navbar"
import DocumentCard from "@/app/components/document-card"
import LoadingAnimation from "@/app/components/loading-animation"
import { getCurrentUser, getCurrentUserId } from "@/app/utils/auth"
import { verifyRecaptcha } from "@/app/utils/recaptcha"
import { generateCoverLetter, generatePortfolio, generateResume } from "@/app/utils/api"
import StepForm from "@/app/components/step-form"
import Recaptcha from "@/app/components/recaptcha"
import { toast } from "sonner"

type FormData = {
  name: string
  email: string
  phone: string
  summary: string
  education: string
  skills: string
  projects: string
  experience: string
  jobTarget: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [recaptchaToken, setRecaptchaToken] = useState<string>("")
  const [loading, setLoading] = useState<"resume" | "cover" | "portfolio" | null>(null)
  const [results, setResults] = useState<{ resume?: string; cover?: string; portfolio?: string }>({})
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    summary: "",
    education: "",
    skills: "",
    projects: "",
    experience: "",
    jobTarget: "",
  })

  useEffect(() => {
    ;(async () => {
      const u = await getCurrentUser()
      if (!u) {
        router.replace("/login")
        return
      }
      setForm((prev) => ({ ...prev, name: u.full_name || "", email: u.email || "" }))
      // upsert user record
      try {
        await fetch("/api/user-upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auth_id: u.id, full_name: u.full_name, email: u.email }),
        })
      } catch {}
    })()
  }, [router])

  const disabled = useMemo(() => loading !== null, [loading])

  const onGenerate = async (type: "resume" | "cover" | "portfolio") => {
    if (disabled) return
    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA")
      return
    }
    const ok = await verifyRecaptcha(recaptchaToken)
    if (!ok) {
      toast.error("reCAPTCHA verification failed")
      return
    }
    try {
      setLoading(type)
      const userId = await getCurrentUserId()
      if (type === "resume") {
        const res = await generateResume({ ...form, userId })
        setResults((r) => ({ ...r, resume: res }))
        toast.success("Resume generated")
        try {
          if (userId) {
            const safeTitle = (form.jobTarget || 'resume').replace(/[^a-z0-9\-]+/gi, '_')
            const fileName = `${Date.now()}-${safeTitle}.html`
            const up = await fetch('/api/upload-generated', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, fileName, content: res, contentType: 'text/html' }),
            })
            if (!up.ok) throw new Error('upload-failed')
            toast.success('Resume uploaded')
          }
        } catch {
          toast.error('Upload failed (server)')
        }
      } else if (type === "cover") {
        const res = await generateCoverLetter({ ...form, userId })
        setResults((r) => ({ ...r, cover: res }))
        toast.success("Cover letter generated")
        try {
          if (userId) {
            const safeTitle = (form.jobTarget || 'cover-letter').replace(/[^a-z0-9\-]+/gi, '_')
            const fileName = `${Date.now()}-${safeTitle}.txt`
            const up = await fetch('/api/upload-generated', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, fileName, content: res, contentType: 'text/plain' }),
            })
            if (!up.ok) throw new Error('upload-failed')
            toast.success('Cover letter uploaded')
          }
        } catch {
          toast.error('Upload failed (server)')
        }
      } else {
        const res = await generatePortfolio({ ...form, userId })
        setResults((r) => ({ ...r, portfolio: res }))
        toast.success("Portfolio generated")
        try {
          if (userId) {
            const safeTitle = (form.jobTarget || 'portfolio').replace(/[^a-z0-9\-]+/gi, '_')
            const fileName = `${Date.now()}-${safeTitle}.html`
            const up = await fetch('/api/upload-generated', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, fileName, content: res, contentType: 'text/html' }),
            })
            if (!up.ok) throw new Error('upload-failed')
            toast.success('Portfolio uploaded')
          }
        } catch {
          toast.error('Upload failed (server)')
        }
      }
    } catch (e: any) {
      toast.error(e?.message || "Generation failed")
    } finally {
      setLoading(null)
    }
  }

  const heroName = (form.name?.split(" ")[0] || "there")

  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <section className="rounded-xl border border-border bg-card/70 backdrop-blur-md p-6">
          <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr] items-center">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-semibold text-balance">
                Hi {heroName}! Let’s build your career documents.
              </h1>
              <p className="text-muted-foreground">
                Enter your details once and generate an AI-optimized resume, cover letter, and portfolio with a click.
              </p>
            </div>
            <div className="justify-self-end hidden md:block">
              <img
                src="/career-growth-illustration.png"
                alt="Career growth illustration"
                className="max-h-28 rounded-md"
              />
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StepForm form={form} setForm={setForm} />
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Generate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Recaptcha
                  siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                  onChange={(token) => setRecaptchaToken(token)}
                />
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={() => onGenerate("resume")}
                disabled={disabled}
              >
                {loading === "resume" ? <LoadingAnimation label="Generating Resume..." /> : "🪄 Generate Resume"}
              </Button>
              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={() => onGenerate("cover")}
                disabled={disabled}
              >
                {loading === "cover" ? (
                  <LoadingAnimation label="Generating Cover Letter..." />
                ) : (
                  "💌 Generate Cover Letter"
                )}
              </Button>
              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={() => onGenerate("portfolio")}
                disabled={disabled}
              >
                {loading === "portfolio" ? (
                  <LoadingAnimation label="Generating Portfolio..." />
                ) : (
                  "🌐 Generate Portfolio"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Results are mocked locally. Replace with your FastAPI URLs in utils/api.ts when ready.
              </p>
              <div className="text-sm">
                <Link href="/documents" className="underline">
                  Go to My Documents
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {(results.resume || results.cover || results.portfolio) && (
          <section className="grid md:grid-cols-3 gap-6">
            {results.resume && <DocumentCard title="Resume" content={results.resume} type="resume" />}
            {results.cover && <DocumentCard title="Cover Letter" content={results.cover} type="cover" />}
            {results.portfolio && (
              <DocumentCard title="Portfolio (HTML)" content={results.portfolio} type="portfolio" />
            )}
          </section>
        )}
      </main>
    </div>
  )
}
