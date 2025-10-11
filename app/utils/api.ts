// Swap these to your FastAPI endpoints when ready.
export async function generateResume(payload: any): Promise<string> {
  const res = await fetch("/api/generate-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  return json.content as string
}

export async function generateCoverLetter(payload: any): Promise<string> {
  const res = await fetch("/api/generate-cover-letter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  return json.content as string
}

export async function generatePortfolio(payload: any): Promise<string> {
  const res = await fetch("/api/generate-portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  return json.content as string
}
