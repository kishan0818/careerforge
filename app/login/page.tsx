"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { signInWithGoogle } from "@/app/utils/auth"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
      // Supabase will redirect; fallback in case it doesn't
      router.push("/dashboard")
    } catch (e) {
      alert("Authentication failed. Please try again.")
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-[radial-gradient(40rem_40rem_at_0%_0%,theme(colors.accent/0.25),transparent),radial-gradient(30rem_30rem_at_100%_100%,theme(colors.primary/0.25),transparent)]">
      <Card className="w-full max-w-xl bg-card/70 backdrop-blur-md border border-border">
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
