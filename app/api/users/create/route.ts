import { type NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from "uuid"
import { createUser } from "@/lib/db"

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

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const profileImage = formData.get("profileImage") as File | null

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 })
    }

    let profileImageUrl = null

    // Upload profile image to S3 if provided
    if (profileImage) {
      // Generate a unique file name
      const fileExtension = profileImage.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExtension}`

      // Convert file to buffer
      const buffer = Buffer.from(await profileImage.arrayBuffer())

      // Upload to S3
      const bucketName = process.env.AWS_S3_BUCKET_NAME!
      const key = `profile-images/${fileName}`

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: profileImage.type,
      })

      await s3Client.send(command)

      // Generate a signed URL for the uploaded file
      const getObjectCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
      })

      profileImageUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 })
    }

    // Create user in the database
    const user = await createUser({
      name,
      email,
      profileImageUrl,
    })

    return NextResponse.json({
      message: "User created successfully",
      user,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Error creating user", error: (error as Error).message }, { status: 500 })
  }
}

// Increase the limit for the API route to handle larger files
export const config = {
  api: {
    bodyParser: false,
  },
}
