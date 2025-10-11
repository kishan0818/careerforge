import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const userData = body || {}
  const userId: string | undefined = body?.userId

  const prompt = `Write a concise, compelling cover letter for the following candidate and target role. Keep it ATS-friendly, professional, and tailored.
\nUser Data: ${JSON.stringify(userData)}`

  let content: string | null = null
  const apiKey = process.env.MISTRAL_API_KEY
  if (apiKey) {
    try {
      const resp = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "mistral-7b", messages: [{ role: "user", content: prompt }] }),
      })
      if (!resp.ok) throw new Error(String(resp.status))
      const data = await resp.json()
      content = data?.choices?.[0]?.message?.content ?? null
    } catch {
      content = null
    }
  }

  if (!content) {
    const name = userData?.name || "Candidate"
    const role = userData?.jobTarget || "Software Engineer"
    content = `Dear Hiring Manager,\n\nI’m excited to apply for the ${role} position. My background includes: ${userData?.skills ||
      "JavaScript/TypeScript, React, SQL"}. I’m eager to bring impact to your team.\n\nSincerely,\n${name}`
  }

  if (supabaseAdmin && userId) {
    try {
      await supabaseAdmin.from("resumes").insert({
        user_id: userId,
        title: userData?.jobTarget || "Generated Cover Letter",
        content,
        type: "cover_letter",
      })
      await supabaseAdmin.from("api_logs").insert({ user_id: userId, prompt, response: content, status: "success" })
    } catch {}
  }

  return NextResponse.json({ content })
}
