import { type NextRequest, NextResponse } from "next/server"
import { deleteUser } from "@/lib/db"

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ message: "No user ID provided" }, { status: 400 })
    }

    await deleteUser(id)

    return NextResponse.json({
      message: "User deleted successfully",
      id,
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Error deleting user", error: (error as Error).message }, { status: 500 })
  }
}
