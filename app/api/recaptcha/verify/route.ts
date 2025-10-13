import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ ok: false, error: 'missing-token' }, { status: 400 })

    const secret = process.env.RECAPTCHA_SECRET_KEY
    if (!secret) return NextResponse.json({ ok: false, error: 'server-misconfigured' }, { status: 500 })

    const params = new URLSearchParams()
    params.append('secret', secret)
    params.append('response', token)

    const google = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    const json = await google.json()
    if (!json?.success) {
      return NextResponse.json({ ok: false, error: 'invalid-captcha' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'server-error' }, { status: 500 })
  }
}
