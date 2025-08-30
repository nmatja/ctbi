"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Music, Clock, Calendar, Star, MessageCircle, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Clip {
  id: string
  title: string
  description?: string
  file_url: string
  duration_seconds: number
  created_at: string
  avgRating: number
  reviewCount: number
  commentCount: number
}

interface MyClipsListProps {
  clips: Clip[]
}

export function MyClipsList({ clips }: MyClipsListProps) {
  const [deletingClipId, setDeletingClipId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDeleteClip = async (clipId: string) => {
    setDeletingClipId(clipId)

    try {
      // Delete associated reviews first
      await supabase.from("reviews").delete().eq("clip_id", clipId)

      // Delete associated comments
      await supabase.from("comments").delete().eq("clip_id", clipId)

      // Delete the clip
      const { error } = await supabase.from("clips").delete().eq("id", clipId)

      if (error) {
        console.error("Error deleting clip:", error)
        alert("Failed to delete clip. Please try again.")
      } else {
        // Refresh the page to show updated list
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting clip:", error)
      alert("Failed to delete clip. Please try again.")
    } finally {
      setDeletingClipId(null)
    }
  }

  if (!clips || clips.length === 0) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Music className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No riffs uploaded yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Share your first musical creation with the community!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clips.map((clip) => (
        <Card
          key={clip.id}
          className="hover:shadow-lg transition-all duration-200 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg text-gray-900 dark:text-white line-clamp-2 flex-1">{clip.title}</CardTitle>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                    disabled={deletingClipId === clip.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-gray-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Riff</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                      Are you sure you want to delete "{clip.title}"? This action cannot be undone and will also remove
                      all associated reviews and comments.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-gray-700 dark:text-gray-300">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteClip(clip.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={deletingClipId === clip.id}
                    >
                      {deletingClipId === clip.id ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {clip.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">{clip.description}</p>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {clip.avgRating > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                >
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {clip.avgRating}
                </Badge>
              )}
              {clip.reviewCount > 0 && (
                <Badge variant="outline" className="text-purple-600 dark:text-purple-400">
                  {clip.reviewCount} review{clip.reviewCount !== 1 ? "s" : ""}
                </Badge>
              )}
              {clip.commentCount > 0 && (
                <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {clip.commentCount}
                </Badge>
              )}
            </div>

            {/* Metadata Row */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {clip.duration_seconds}s
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(clip.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Audio Player */}
            <audio
              controls
              className="w-full h-8 [&::-webkit-media-controls-panel]:bg-gray-100 dark:[&::-webkit-media-controls-panel]:bg-gray-700"
            >
              <source src={clip.file_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
