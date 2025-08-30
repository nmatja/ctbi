"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, Star, MessageCircle, TrendingUp, User } from "lucide-react"
import Link from "next/link"

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

  const sortedClips = useMemo(() => {
    const clipsCopy = [...clips]

    switch (sortBy) {
      case "newest":
        return clipsCopy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "oldest":
        return clipsCopy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case "popular":
        return clipsCopy.sort((a, b) => {
          // Sort by average rating first, then by review count
          if (b.avg_rating !== a.avg_rating) {
            return b.avg_rating - a.avg_rating
          }
          return b.review_count - a.review_count
        })
      default:
        return clipsCopy
    }
  }, [clips, sortBy])

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
      {/* Sorting Controls */}
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

      {/* Clips Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedClips.map((clip) => {
          const profile = clip.profiles
          const displayName = profile?.display_name || "Anonymous"
          const avatarUrl = profile?.avatar_url

          return (
            <Card key={clip.id} className="hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{clip.title}</h3>
                      <p className="text-sm text-gray-600 truncate">by {displayName}</p>
                    </div>
                  </div>
                  {clip.avg_rating > 0 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {clip.avg_rating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {clip.description && <p className="text-sm text-gray-600 line-clamp-2">{clip.description}</p>}

                <audio controls className="w-full">
                  <source src={clip.file_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>

                <div className="flex items-center justify-between text-sm text-gray-500">
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
                    asChild
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Link href={`/clip/${clip.id}`}>
                      <Star className="w-4 h-4 mr-2" />
                      Rate this Riff
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
