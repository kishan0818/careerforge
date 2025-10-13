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
    // Structured fallback using FormData shape
    const personal = (userData?.personal as any) || {}
    const name = personal?.name || "Candidate"
    const role = (userData?.jobTarget as string) || "Software Engineer"
    const summary = (userData?.summary as string) || `Results-driven ${role} with hands-on experience and a collaborative mindset.`
    const skillsArr: any[] = Array.isArray(userData?.skills) ? userData.skills : []
    const expArr: any[] = Array.isArray(userData?.experience) ? userData.experience : []
    const eduArr: any[] = Array.isArray(userData?.education) ? userData.education : []
    const projArr: any[] = Array.isArray(userData?.projects) ? userData.projects : []

    const skillsHtml = skillsArr
      .map((s: any) => s?.name)
      .filter(Boolean)
      .map((s: string) => `<li>${s}</li>`) 
      .join("") || `<li>JavaScript</li><li>TypeScript</li><li>React</li><li>SQL</li>`

    const expHtml = expArr
      .map((e: any) => {
        const bullets = (Array.isArray(e?.description) ? e.description : []).filter(Boolean).map((d: string) => `<li>${d}</li>`).join("")
        const duration = [e?.startDate, e?.endDate].filter(Boolean).join(" – ")
        return `<li><strong>${e?.position || ''}</strong> — ${e?.company || ''} <em>${duration}</em><ul>${bullets}</ul></li>`
      })
      .join("") || `<li>Company — Role — Duration<ul><li>Key achievement with metrics</li></ul></li>`

    const eduHtml = eduArr
      .map((e: any) => `<li><strong>${e?.institution || ''}</strong> — ${e?.degree || ''}${e?.fieldOfStudy ? `, ${e.fieldOfStudy}` : ''}${e?.gpa ? ` — GPA ${e.gpa}` : ''} ${e?.startDate ? `(${e.startDate}${e?.endDate ? `–${e.endDate}` : ''})` : ''}</li>`)
      .join("") || `<li>Institution — Degree — Year</li>`

    const projHtml = projArr
      .map((p: any) => {
        const tech = Array.isArray(p?.technologies) ? p.technologies.filter(Boolean).join(', ') : ''
        return `<li><strong>${p?.title || ''}</strong>${tech ? ` — ${tech}` : ''}<div>${p?.description || ''}</div></li>`
      })
      .join("") || `<li>Project — Description — Tech</li>`

    content = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>${name} — Resume</title><meta name="viewport" content="width=device-width, initial-scale=1"/><style>body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:2rem;color:#0f172a} h1{font-size:1.5rem;margin:0} h2{font-size:1rem;margin:.75rem 0}.sec{margin:1rem 0}.pill{display:inline-block;padding:.1rem .5rem;border-radius:9999px;background:#14b8a6;color:#fff;font-size:.75rem} ul{padding-left:1.2rem}</style></head><body><header><h1>${name}</h1><div class="pill">${role}</div><div>${
      personal?.email || ""
    }${personal?.phone ? ` · ${personal.phone}` : ""}</div></header><section class="sec"><h2>Summary</h2><p>${summary}</p></section><section class="sec"><h2>Skills</h2><ul>${skillsHtml}</ul></section><section class="sec"><h2>Experience</h2><ul>${expHtml}</ul></section><section class="sec"><h2>Education</h2><ul>${eduHtml}</ul></section><section class="sec"><h2>Projects</h2><ul>${projHtml}</ul></section></body></html>`
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
