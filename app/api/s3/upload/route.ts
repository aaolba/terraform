import { type NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from "uuid"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Generate a unique file name
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to S3
    const bucketName = process.env.AWS_S3_BUCKET_NAME!
    const key = `uploads/${fileName}`

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    // Generate a signed URL for the uploaded file
    const getObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 })

    return NextResponse.json({
      message: "File uploaded successfully",
      fileName: fileName,
      key: key,
      url: url,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ message: "Error uploading file", error: (error as Error).message }, { status: 500 })
  }
}

// Increase the limit for the API route to handle larger files
export const config = {
  api: {
    bodyParser: false,
  },
}
