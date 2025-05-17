"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormData {
  name: string
  email: string
  profileImage: File | null
}

export default function UserForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    profileImage: null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData((prev) => ({ ...prev, profileImage: file }))

      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      setError("Name and email are required")
      return
    }

    setSubmitting(true)
    setSuccess(false)
    setError(null)

    try {
      // Create a FormData object to send the form data and file
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("email", formData.email)

      if (formData.profileImage) {
        submitData.append("profileImage", formData.profileImage)
      }

      const response = await fetch("/api/users/create", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create user")
      }

      setSuccess(true)

      // Reset form
      setFormData({
        name: "",
        email: "",
        profileImage: null,
      })
      setImagePreview(null)

      // Reset file input
      const fileInput = document.getElementById("profile-image") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter name"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              disabled={submitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-image">Profile Image</Label>
          <div className="flex items-start gap-4">
            <Input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={submitting}
              className="flex-1"
            />

            {imagePreview && (
              <div className="w-16 h-16 rounded-md overflow-hidden border flex-shrink-0">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? (
          "Creating User..."
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Create User
          </>
        )}
      </Button>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">User created successfully!</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}
    </form>
  )
}
