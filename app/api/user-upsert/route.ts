import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'service-role-not-configured' }, { status: 400 })
  try {
    const { auth_id, full_name, email } = await req.json()
    if (!auth_id || !email) {
      return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 })
    }
    const { error } = await supabaseAdmin.from('users').upsert({ auth_id, full_name, email })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'server-error' }, { status: 500 })
  }
}
