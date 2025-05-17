import { NextResponse } from "next/server"
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function GET() {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME!

    // List objects in the bucket
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: "uploads/", // Only list files in the uploads directory
    })

    const response = await s3Client.send(command)

    // Generate signed URLs for each object
    const files = await Promise.all(
      (response.Contents || []).map(async (item) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: item.Key!,
        })

        const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 })

        return {
          key: item.Key,
          size: item.Size,
          lastModified: item.LastModified,
          url: url,
        }
      }),
    )

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error listing files:", error)
    return NextResponse.json({ message: "Error listing files", error: (error as Error).message }, { status: 500 })
  }
}
