// This route is deprecated in favor of direct Supabase client interactions
// See app/settings/profile/page.tsx and hooks/use-profile.ts for the new implementation

import { NextResponse } from "next/server"

export async function GET() {
  return new NextResponse("This API route is deprecated", { status: 410 })
}

export async function POST() {
  return new NextResponse("This API route is deprecated", { status: 410 })
}

export async function PATCH() {
  return new NextResponse("This API route is deprecated", { status: 410 })
}
