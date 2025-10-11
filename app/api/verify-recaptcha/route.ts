import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ success: false, error: 'missing-token' }, { status: 400 })

    const params = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY || '',
      response: token,
    })

    const googleRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const data = await googleRes.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ success: false, error: 'server-error' }, { status: 500 })
  }
}
