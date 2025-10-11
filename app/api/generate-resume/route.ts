import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const userData = body || {}
  const userId: string | undefined = body?.userId

  const prompt = `Generate a professional, ATS-friendly RESUME in clean, valid HTML only (no markdown). Include sections: Header with name/contact, Summary, Skills (bullets), Education, Experience (bullets with metrics), Projects (bullets), and optionally Achievements. Keep styles minimal inline. Use semantic tags. Return ONLY HTML.\n\nUser Data: ${JSON.stringify(
    userData,
  )}`

  let content: string | null = null

  const apiKey = process.env.MISTRAL_API_KEY
  if (apiKey) {
    try {
      const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "mistral-7b",
          messages: [{ role: "user", content: prompt }],
        }),
      })
      if (!mistralRes.ok) throw new Error(`Mistral error: ${mistralRes.status}`)
      const data = await mistralRes.json()
      content = data?.choices?.[0]?.message?.content ?? null
    } catch (e) {
      // fall back to basic template if error
      content = null
    }
  }

  if (!content) {
    const name = userData?.name || "Candidate"
    const role = userData?.jobTarget || "Software Engineer"
    content = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>${name} — Resume</title><meta name="viewport" content="width=device-width, initial-scale=1"/><style>body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:2rem;color:#0f172a} h1{font-size:1.5rem;margin:0} h2{font-size:1rem;margin:.75rem 0}.sec{margin:1rem 0}.pill{display:inline-block;padding:.1rem .5rem;border-radius:9999px;background:#14b8a6;color:#fff;font-size:.75rem}</style></head><body><header><h1>${name}</h1><div class="pill">${role}</div><div>${
      userData?.email || ""
    }${userData?.phone ? ` · ${userData.phone}` : ""}</div></header><section class="sec"><h2>Summary</h2><p>Results-driven ${role} with hands-on experience and a collaborative mindset.</p></section><section class="sec"><h2>Skills</h2><ul>${
      (userData?.skills || "JavaScript, TypeScript, React, SQL")
        .split(/[,\n]/)
        .map((s: string) => s.trim())
        .filter(Boolean)
        .map((s: string) => `<li>${s}</li>`) 
        .join("")
    }</ul></section><section class="sec"><h2>Experience</h2><ul><li>${
      userData?.experience || "Company — Role — Duration — Key Achievements"
    }</li></ul></section><section class="sec"><h2>Education</h2><ul><li>${
      userData?.education || "Institution — Degree — Year"
    }</li></ul></section><section class="sec"><h2>Projects</h2><ul><li>${
      userData?.projects || "Project — Description — Tech"
    }</li></ul></section></body></html>`
  }

  // Optional: persist to Supabase using service role if configured
  if (supabaseAdmin && userId) {
    try {
      await supabaseAdmin.from("resumes").insert({
        user_id: userId,
        title: userData?.jobTarget || "Generated Resume",
        content,
        type: "resume",
      })

      await supabaseAdmin.from("api_logs").insert({
        user_id: userId,
        prompt,
        response: content,
        status: "success",
      })
    } catch (e) {
      // ignore persistence errors on server
    }
  }

  return NextResponse.json({ content })
}
