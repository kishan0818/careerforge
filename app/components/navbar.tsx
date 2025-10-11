"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getCurrentUser, signOut, type CFUser } from "@/app/utils/auth"
import { useEffect, useState } from "react"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<CFUser | null>(null)

  useEffect(() => {
    ;(async () => {
      const u = await getCurrentUser()
      setUser(u)
    })()
  }, [pathname])

  return (
    <header className="border-b border-border bg-secondary/60 backdrop-blur-md">
      <nav className="mx-auto max-w-6xl flex items-center justify-between p-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold">
            CareerForge
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link className="hover:underline" href="/dashboard">
              Dashboard
            </Link>
            <Link className="hover:underline" href="/dashboard/profile">
              My Profile
            </Link>
            <Link className="hover:underline" href="/dashboard/my-documents">
              My Documents
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:block text-sm text-muted-foreground">{user.full_name || user.email}</div>
              <Avatar>
                <AvatarFallback>{(user.full_name || user.email || "U").slice(0,1)}</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                onClick={() => {
                  signOut().finally(() => router.replace("/login"))
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button className="bg-primary text-primary-foreground" onClick={() => router.push("/login")}>
              Login
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
