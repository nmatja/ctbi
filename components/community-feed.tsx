"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, Star, MessageCircle, TrendingUp, User, Share2, Copy, Check } from "lucide-react"
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
  const [selectedClip, setSelectedClip] = useState<ClipWithStats | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null) // Added state for copy feedback
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

  const sortedClips = useMemo(() => {
    const clipsCopy = [...clips]

    switch (sortBy) {
      case "newest":
        return clipsCopy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "oldest":
        return clipsCopy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case "popular":
        return clipsCopy.sort((a, b) => {
          if (b.avg_rating !== a.avg_rating) {
            return b.avg_rating - a.avg_rating
          }
          return b.review_count - a.review_count
        })
      default:
        return clipsCopy
    }
  }, [clips, sortBy])

  const handleShare = (clip: ClipWithStats, platform: "twitter" | "facebook" | "discord" | "copy") => {
    const clipUrl = `${window.location.origin}/clip/${clip.id}`
    const shareText = `Check out this amazing riff: "${clip.title}" by ${clip.profiles?.display_name || "Anonymous"}`

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(clipUrl)}`,
          "_blank",
        )
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(clipUrl)}`, "_blank")
        break
      case "discord":
        navigator.clipboard.writeText(`${shareText} ${clipUrl}`)
        setCopiedClipId(clip.id)
        setTimeout(() => setCopiedClipId(null), 2000)
        break
      case "copy":
        navigator.clipboard.writeText(clipUrl)
        setCopiedClipId(clip.id)
        setTimeout(() => setCopiedClipId(null), 2000)
        break
    }
  }

  if (clips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No riffs yet</h3>
        <p className="text-gray-600 mb-6">Be the first to share a riff with the community!</p>
        <Button
          asChild
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Link href="/">Upload Your First Riff</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {clips.length} riff{clips.length !== 1 ? "s" : ""} in the community
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedClips.map((clip) => {
          const profile = clip.profiles
          const displayName = profile?.display_name || "Anonymous"
          const avatarUrl = profile?.avatar_url

          return (
            <Card
              key={clip.id}
              className="hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{clip.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">by {displayName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {clip.avg_rating > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
                      >
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {clip.avg_rating.toFixed(1)}
                      </Badge>
                    )}
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[140px]">
                        <div className="p-1">
                          <button
                            onClick={() => handleShare(clip, "twitter")}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                          >
                            <span className="text-blue-500">𝕏</span> Share on X
                          </button>
                          <button
                            onClick={() => handleShare(clip, "facebook")}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                          >
                            <span className="text-blue-600">f</span> Facebook
                          </button>
                          <button
                            onClick={() => handleShare(clip, "discord")}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                          >
                            <span className="text-indigo-500">#</span> Discord
                          </button>
                          <button
                            onClick={() => handleShare(clip, "copy")}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                          >
                            {copiedClipId === clip.id ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" /> Copy Link
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {clip.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{clip.description}</p>
                )}

                <audio controls className="w-full">
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
                      {new Date(clip.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-medium">{clip.review_count}</span>
                    <span className="text-xs">review{clip.review_count !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedClip(clip)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    disabled={!currentUser}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {currentUser ? "Rate this Riff" : "Login to Rate"}
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
