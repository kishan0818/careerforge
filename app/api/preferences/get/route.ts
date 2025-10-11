import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'service-role-not-configured' }, { status: 400 })
  try {
    const { user_id } = await req.json()
    if (!user_id) return NextResponse.json({ ok: false, error: 'missing-user' }, { status: 400 })
    const { data, error } = await supabaseAdmin
      .from('resume_preferences')
      .select('tone, template_style, job_target')
      .eq('user_id', user_id)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return NextResponse.json({ ok: true, prefs: data || null })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'server-error' }, { status: 500 })
  }
}
