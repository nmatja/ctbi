"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Music, Upload, X, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface UploadDropzoneProps {
  onUploadComplete?: () => void
}

export function UploadDropzone({ onUploadComplete }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const validateFile = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const allowedTypes = [
        "audio/mpeg", // MP3
        "audio/wav", // WAV
        "audio/mp4", // MP4 audio
        "audio/m4a", // M4A
        "audio/ogg", // OGG
        "audio/webm", // WebM audio
        "audio/aac", // AAC
        "audio/flac", // FLAC
        "audio/x-m4a", // Alternative M4A MIME type
      ]

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg|webm|aac|flac)$/i)) {
        setError("Please upload an audio file (MP3, WAV, M4A, OGG, WebM, AAC, FLAC)")
        resolve(false)
        return
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        resolve(false)
        return
      }

      // Check duration - warn if longer than 23 seconds
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.onloadedmetadata = () => {
        if (audio.duration > 23) {
          setError(`Audio is ${Math.round(audio.duration)}s long. Please trim to 23 seconds or less for best results.`)
        }
        URL.revokeObjectURL(audio.src)
        resolve(true)
      }
      audio.onerror = () => {
        setError("Invalid audio file")
        URL.revokeObjectURL(audio.src)
        resolve(false)
      }
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      setError(null)

      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length > 0) {
        const audioFile = droppedFiles[0]
        const isValid = await validateFile(audioFile)
        if (isValid) {
          setFile(audioFile)
        }
      }
    },
    [validateFile],
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        const isValid = await validateFile(selectedFile)
        if (isValid) {
          setFile(selectedFile)
        }
      }
    },
    [validateFile],
  )

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError("Please provide a title and select an audio file")
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      console.log("[v0] Starting upload process")

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("[v0] User check:", user ? "authenticated" : "not authenticated")

      if (!user) {
        throw new Error("You must be logged in to upload")
      }

      // Get audio duration
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      await new Promise((resolve) => {
        audio.onloadedmetadata = resolve
      })

      console.log("[v0] Audio duration:", audio.duration)

      // Create unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      console.log("[v0] Uploading to storage:", fileName)

      // Upload to Supabase Storage with progress tracking
      const { data: uploadData, error: uploadError } = await supabase.storage.from("clips").upload(fileName, file, {
        onUploadProgress: (progress) => {
          const percent = (progress.loaded / progress.total) * 100
          console.log("[v0] Upload progress:", percent)
          setUploadProgress(percent)
        },
      })

      if (uploadError) {
        console.log("[v0] Upload error:", uploadError)
        throw uploadError
      }

      console.log("[v0] Upload successful, getting public URL")

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("clips").getPublicUrl(fileName)

      const finalDuration = Math.min(Math.round(audio.duration), 23)

      console.log("[v0] Saving to database")

      // Save clip metadata to database
      const { error: dbError } = await supabase.from("clips").insert({
        title: title.trim(),
        description: description.trim() || null,
        file_url: publicUrl,
        file_size: file.size,
        duration_seconds: finalDuration,
        user_id: user.id,
      })

      URL.revokeObjectURL(audio.src)

      if (dbError) {
        console.log("[v0] Database error:", dbError)
        throw dbError
      }

      console.log("[v0] Upload complete!")

      setSuccess(true)
      setFile(null)
      setTitle("")
      setDescription("")
      onUploadComplete?.()

      // Redirect to community after successful upload
      setTimeout(() => {
        router.push("/community")
      }, 2000)
    } catch (error: unknown) {
      console.log("[v0] Upload failed:", error)
      setError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (success) {
    return (
      <Card className="border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-green-800 dark:text-green-200 mb-2">Upload Successful!</h3>
          <p className="text-green-700 dark:text-green-300">Your riff has been shared with the community.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
          isDragOver
            ? "border-orange-500 bg-transparent"
            : file
              ? "border-green-300 bg-transparent"
              : "border-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-transparent hover:border-orange-600"
        }`}
        style={{
          borderImage: !isDragOver && !file ? "linear-gradient(45deg, #f97316, #ef4444, #eab308) 1" : undefined,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {file ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-2">Drop your audio file here</p>
              <p className="text-muted-foreground">Max 23 seconds • MP3, WAV, M4A, OGG, AAC, FLAC supported</p>
            </div>
            <Button className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white font-semibold">
              Choose File
            </Button>
          </div>
        )}
      </div>

      {/* Upload Form */}
      {file && (
        <Card className="bg-card/80 backdrop-blur-sm border border-border">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Give your riff a catchy title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Tell us about your riff, the gear you used, or the inspiration behind it..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                rows={3}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!title.trim() || isUploading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white font-semibold"
            >
              {isUploading ? "Uploading..." : "Share with Community"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
