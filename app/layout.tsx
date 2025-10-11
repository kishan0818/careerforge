import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "CareerForge",
  description: "AI Resume, Cover Letter, and Portfolio Generator",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${GeistMono.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground min-h-dvh">
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
