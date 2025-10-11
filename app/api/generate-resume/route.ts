import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const userData = body || {}
  const userId: string | undefined = body?.userId

  const prompt = `Generate a clean, ATS-friendly resume based on the following user data. Focus on clarity, measurable achievements, and modern formatting.\n\n${JSON.stringify(
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
    content = `ATS-Optimized Resume\nName: ${name}\nTarget Role: ${role}\n\nSummary:\nResults-driven ${role} with hands-on experience in projects, strong problem-solving skills, and collaborative mindset.\n\nSkills:\n${userData?.skills || "JavaScript, TypeScript, React, SQL"}\n\nExperience:\n${userData?.experience || "Company — Role — Duration — Key Achievements"}\n\nEducation:\n${userData?.education || "Institution — Degree — Year — GPA"}\n\nProjects:\n${userData?.projects || "Project — Description — Tech"}\n`
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
