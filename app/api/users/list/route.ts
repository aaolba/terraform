import { NextResponse } from "next/server"
import { listUsers } from "@/lib/db"

export async function GET() {
  try {
    const users = await listUsers()

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error listing users:", error)
    return NextResponse.json({ message: "Error listing users", error: (error as Error).message }, { status: 500 })
  }
}
