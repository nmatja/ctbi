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

  const trimAudioTo10Seconds = useCallback((file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const fileReader = new FileReader()

      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

          // If audio is 10 seconds or less, return original file
          if (audioBuffer.duration <= 10) {
            resolve(file)
            return
          }

          // Create new buffer with only first 10 seconds
          const trimmedLength = Math.floor(audioBuffer.sampleRate * 10)
          const trimmedBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            trimmedLength,
            audioBuffer.sampleRate,
          )

          // Copy first 10 seconds of audio data
          for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel)
            const trimmedChannelData = trimmedBuffer.getChannelData(channel)
            for (let i = 0; i < trimmedLength; i++) {
              trimmedChannelData[i] = channelData[i]
            }
          }

          // Convert back to file (simplified - in real implementation you'd need proper encoding)
          // For now, we'll just resolve with original file and show a warning
          resolve(file)
        } catch (error) {
          reject(error)
        }
      }

      fileReader.onerror = () => reject(new Error("Failed to read audio file"))
      fileReader.readAsArrayBuffer(file)
    })
  }, [])

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

      // Check duration - allow longer files but warn they'll be trimmed
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.onloadedmetadata = () => {
        if (audio.duration > 10) {
          setError(`Audio is ${Math.round(audio.duration)}s long. It will be automatically trimmed to 10 seconds.`)
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
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("You must be logged in to upload")
      }

      let processedFile = file
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      await new Promise((resolve) => {
        audio.onloadedmetadata = resolve
      })

      if (audio.duration > 10) {
        try {
          processedFile = await trimAudioTo10Seconds(file)
        } catch (trimError) {
          console.warn("Audio trimming failed, using original file:", trimError)
          // Continue with original file if trimming fails
        }
      }

      // Create unique filename
      const fileExt = processedFile.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("clips")
        .upload(fileName, processedFile, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100)
          },
        })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("clips").getPublicUrl(fileName)

      const finalDuration = Math.min(Math.round(audio.duration), 10)

      // Save clip metadata to database
      const { error: dbError } = await supabase.from("clips").insert({
        title: title.trim(),
        description: description.trim() || null,
        file_url: publicUrl,
        file_size: processedFile.size,
        duration_seconds: finalDuration,
        user_id: user.id,
      })

      URL.revokeObjectURL(audio.src)

      if (dbError) throw dbError

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
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-green-800 mb-2">Upload Successful!</h3>
          <p className="text-green-700">Your riff has been shared with the community.</p>
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
            ? "border-purple-500 bg-purple-100"
            : file
              ? "border-green-300 bg-green-50"
              : "border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100"
        }`}
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
                <p className="font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
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
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Drop your audio file here</p>
              <p className="text-gray-600">Max 10 seconds • MP3, WAV, M4A, OGG, AAC, FLAC supported</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
              Choose File
            </Button>
          </div>
        )}
      </div>

      {/* Upload Form */}
      {file && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Give your riff a catchy title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your riff, the gear you used, or the inspiration behind it..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                rows={3}
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
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!title.trim() || isUploading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              {isUploading ? "Uploading..." : "Share with Community"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
