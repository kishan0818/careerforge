import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'service-role-not-configured' }, { status: 400 })
  try {
    const { user_id, tone, template_style, job_target } = await req.json()
    if (!user_id) return NextResponse.json({ ok: false, error: 'missing-user' }, { status: 400 })
    const { error } = await supabaseAdmin
      .from('resume_preferences')
      .upsert({ user_id, tone, template_style, job_target })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'server-error' }, { status: 500 })
  }
}
