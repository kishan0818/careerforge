import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'service-role-not-configured' }, { status: 400 })
  try {
    const { userId, fileName, content, contentType } = await req.json()
    if (!userId || !fileName || typeof content !== 'string') {
      return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 })
    }
    const path = `${userId}/${fileName}`
    const bytes = Buffer.from(content, 'utf-8')
    const { error } = await supabaseAdmin.storage
      .from('generated_files')
      .upload(path, bytes, { contentType: contentType || 'text/plain', upsert: true })
    if (error) throw error
    return NextResponse.json({ ok: true, path })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'server-error' }, { status: 500 })
  }
}
