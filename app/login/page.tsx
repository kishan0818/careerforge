"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { signInWithGoogle } from "@/app/utils/auth"
import Image from "next/image"
import ReCAPTCHA from "react-google-recaptcha"

export default function LoginPage() {
  const router = useRouter()
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const handleSignIn = async () => {
    try {
      if (!captchaToken) {
        alert("Please complete the reCAPTCHA.")
        return
      }
      const verify = await fetch('/api/recaptcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken })
      })
      const vjson = await verify.json()
      if (!verify.ok || !vjson?.ok) {
        alert("reCAPTCHA verification failed.")
        return
      }
      await signInWithGoogle()
      router.push("/dashboard")
    } catch (e) {
      alert("Authentication failed. Please try again.")
    }
  }

  return (
    <main className="min-h-dvh flex flex-col items-center p-6 bg-[radial-gradient(40rem_40rem_at_0%_0%,theme(colors.accent/0.25),transparent),radial-gradient(30rem_30rem_at_100%_100%,theme(colors.primary/0.25),transparent)]">
      <header className="w-full max-w-5xl flex items-center justify-between mb-6">
        <div className="text-lg font-semibold tracking-wide">CareerForge</div>
        <div className="text-sm text-muted-foreground">Welcome</div>
      </header>
      <Card className="w-full max-w-xl bg-card/70 backdrop-blur-md border border-border shadow-2xl">
        <CardHeader>
          <CardTitle className="text-balance text-3xl font-semibold">Welcome to CareerForge</CardTitle>
          <CardDescription className="text-pretty">
            Generate your resume, cover letter, and portfolio in minutes with AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-secondary">
            <Image
              src="/career-growth-illustration.png"
              alt="Career growth illustration"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>

          <Button
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:opacity-90 transition"
            onClick={handleSignIn}
            aria-label="Sign in with Google"
          >
            Sign in with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <a href="#" className="underline">
              Privacy Policy
            </a>{" "}
            ·{" "}
            <a href="#" className="underline">
              Terms of Use
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
