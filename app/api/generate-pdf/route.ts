import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'service-role-not-configured' }, { status: 400 })
  try {
    const { userId, htmlContent, fileName } = await req.json()
    if (!userId || !htmlContent || !fileName) {
      return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 })
    }

    // Dynamic import so dev server doesn't crash if dependency isn't installed yet
    let puppeteer: typeof import('puppeteer') | null = null
    try {
      puppeteer = (await import('puppeteer')).default as any
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'puppeteer-not-installed' }, { status: 500 })
    }

    const browser = await (puppeteer as any).launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    try {
      const page = await browser.newPage()
      await page.setContent(String(htmlContent), { waitUntil: 'networkidle0' })
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })

      const baseName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
      const path = `${userId}/${baseName}`

      const { error } = await supabaseAdmin.storage
        .from('generated_files')
        .upload(path, pdfBuffer, { contentType: 'application/pdf', upsert: true })
      if (error) throw error

      // Create a signed URL for easy download (1 hour)
      const { data: signed, error: signedErr } = await supabaseAdmin.storage
        .from('generated_files')
        .createSignedUrl(path, 60 * 60)
      if (signedErr) throw signedErr

      return NextResponse.json({ ok: true, path, url: signed?.signedUrl })
    } finally {
      await (browser as any).close()
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'server-error' }, { status: 500 })
  }
}
