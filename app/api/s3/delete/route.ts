import { type NextRequest, NextResponse } from "next/server"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function DELETE(request: NextRequest) {
  try {
    const { key } = await request.json()

    if (!key) {
      return NextResponse.json({ message: "No file key provided" }, { status: 400 })
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME!

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    await s3Client.send(command)

    return NextResponse.json({
      message: "File deleted successfully",
      key: key,
    })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json({ message: "Error deleting file", error: (error as Error).message }, { status: 500 })
  }
}
