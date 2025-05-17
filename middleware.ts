import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Initialize database connection on first request
  // This is a good place to run database migrations or setup
  return NextResponse.next()
}
