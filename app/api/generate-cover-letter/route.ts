import { NextResponse } from "next/server"

export async function POST() {
  return new NextResponse("Cover letter generation has been removed.", { status: 410 })
}
