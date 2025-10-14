"use client"

import { supabase } from "@/lib/supabaseClient"

export type CFUser = {
  id: string
  full_name: string | null
  email: string | null
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<CFUser | null> {
  const { data } = await supabase.auth.getUser()
  const u = data.user
  if (!u) return null
  return {
    id: u.id,
    full_name: (u.user_metadata as any)?.full_name ?? null,
    email: u.email ?? null,
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const u = await getCurrentUser()
  return u?.id ?? null
}
