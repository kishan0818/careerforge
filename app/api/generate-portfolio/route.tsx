import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const userData = body || {}
  const userId: string | undefined = body?.userId

  const prompt = `Create a minimal, semantic, responsive HTML portfolio for the following student. Include a header, about section, skills, and projects. Keep styles inline and accessible.\n\nUser Data: ${JSON.stringify(
    userData,
  )}`

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
    const projects = (userData?.projects as string) || "Project A — Description — Tech"
    content = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>${name} — Portfolio</title><meta name="viewport" content="width=device-width, initial-scale=1"/><style>body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:2rem;color:#0f172a} .pill{display:inline-block;padding:.25rem .5rem;border-radius:9999px;background:#14b8a6;color:white} .card{border:1px solid #e5e7eb;padding:1rem;border-radius:.75rem}</style></head><body><h1>${name}</h1><p class="pill">Student · Early Career</p><h2>Projects</h2><div class="card"><pre>${projects}</pre></div></body></html>`
  }

  if (supabaseAdmin && userId) {
    try {
      await supabaseAdmin.from("resumes").insert({
        user_id: userId,
        title: userData?.jobTarget || "Generated Portfolio",
        content,
        type: "portfolio",
      })
      await supabaseAdmin.from("api_logs").insert({ user_id: userId, prompt, response: content, status: "success" })
    } catch {}
  }

  return NextResponse.json({ content })
}
