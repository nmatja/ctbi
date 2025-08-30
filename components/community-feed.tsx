"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, Star, TrendingUp, User, Copy, Check, Grid3X3, List, Shuffle, Cloud } from "lucide-react"
import Link from "next/link"
import { ReviewModal } from "@/components/review-modal"
import { createClient } from "@/lib/supabase/client"

interface ClipWithStats {
  id: string
  title: string
  description: string | null
  file_url: string
  duration_seconds: number
  created_at: string
  user_id: string
  avg_rating: number
  review_count: number
  comment_count: number
  profiles: {
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface CommunityFeedProps {
  clips: ClipWithStats[]
}

export function CommunityFeed({ clips }: CommunityFeedProps) {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedClip, setSelectedClip] = useState<ClipWithStats | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getCurrentUser()
  }, [])

  const timeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  }

  const sortedClips = useMemo(() => {
    const clipsCopy = [...clips]

    switch (sortBy) {
      case "newest":
        return clipsCopy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "oldest":
        return clipsCopy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case "popular":
        return clipsCopy.sort((a, b) => {
          const aPopularity = a.review_count * 2 + a.comment_count + a.avg_rating * 3
          const bPopularity = b.review_count * 2 + b.comment_count + b.avg_rating * 3
          return bPopularity - aPopularity
        })
      default:
        return clipsCopy
    }
  }, [clips, sortBy])

  const handleRandomClip = () => {
    if (clips.length > 0) {
      const randomIndex = Math.floor(Math.random() * clips.length)
      setSelectedClip(clips[randomIndex])
    }
  }

  const handleRatingClick = (clip: ClipWithStats) => {
    setSelectedClip(clip)
  }

  const handleCopyLink = (clip: ClipWithStats) => {
    const clipUrl = `${window.location.origin}/clip/${clip.id}`
    navigator.clipboard.writeText(clipUrl)
    setCopiedClipId(clip.id)
    setTimeout(() => setCopiedClipId(null), 2000)
  }

  if (clips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No riffs yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to share a riff with the community!</p>
        <Button
          asChild
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
        >
          <Link href="/">Upload Your First Riff</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-gray-600 dark:text-gray-400">
          {clips.length} riff{clips.length !== 1 ? "s" : ""} in the community
        </p>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleRandomClip}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
            disabled={!currentUser}
          >
            <Shuffle className="w-4 h-4" />
            {currentUser ? "Random Riff" : "Login for Random"}
          </Button>

          <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: "newest" | "oldest" | "popular") => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Newest First
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Oldest First
                  </div>
                </SelectItem>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Most Popular
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {sortedClips.map((clip) => {
          const profile = clip.profiles
          const displayName = profile?.display_name || "Anonymous"
          const avatarUrl = profile?.avatar_url

          return (
            <Card
              key={clip.id}
              className={`hover:shadow-lg transition-all duration-200 bg-white/95 backdrop-blur-sm border-gray-200 hover:bg-white dark:bg-gray-800/95 dark:border-gray-700 dark:hover:bg-gray-800 hover:shadow-orange-200/20 dark:hover:shadow-gray-900/50 ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              <CardHeader className={`pb-4 ${viewMode === "list" ? "flex-shrink-0 w-64" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 ring-2 ring-orange-200 dark:ring-orange-500/30">
                      <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{clip.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">by {displayName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {clip.avg_rating > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700 cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800/70 transition-colors"
                        onClick={() => handleRatingClick(clip)}
                      >
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {clip.avg_rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className={`space-y-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                {clip.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{clip.description}</p>
                )}

                <audio
                  controls
                  className="w-full h-10 bg-gray-100 dark:bg-gray-700 rounded-lg [&::-webkit-media-controls-panel]:bg-gray-100 [&::-webkit-media-controls-panel]:dark:bg-gray-700"
                >
                  <source src={clip.file_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {clip.duration_seconds}s
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {timeAgo(clip.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium">{clip.review_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Cloud className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium">{clip.comment_count || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => setSelectedClip(clip)}
                    className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white border-0"
                    disabled={!currentUser}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {currentUser ? "Rate this Riff" : "Login to Rate"}
                  </Button>

                  <Button
                    onClick={() => handleCopyLink(clip)}
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {copiedClipId === clip.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ReviewModal
        isOpen={!!selectedClip}
        onClose={() => setSelectedClip(null)}
        clip={selectedClip}
        currentUser={currentUser}
      />
    </div>
  )
}
