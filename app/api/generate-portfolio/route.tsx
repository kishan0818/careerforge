import { NextResponse } from "next/server"

export async function POST() {
  return new NextResponse("Portfolio generation has been removed.", { status: 410 })
}
