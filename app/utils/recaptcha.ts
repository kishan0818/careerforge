// Verify reCAPTCHA v2 token via backend API
export async function verifyRecaptcha(token: string) {
  if (!token) return false
  const res = await fetch('/api/verify-recaptcha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  const data = await res.json().catch(() => ({ success: false }))
  return !!data.success
}
