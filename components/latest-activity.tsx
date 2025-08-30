"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Music, MessageCircle, Star, Play, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"

interface ActivityItem {
  id: string
  type: "clip" | "review" | "comment"
  title: string
  user_display_name: string
  user_avatar: string | null
  created_at: string
  clip_id?: string
  rating?: number
  preview_text?: string
}

export function LatestActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getCurrentUser()

    const fetchLatestActivity = async () => {
      try {
        // Fetch latest clips
        const { data: clips } = await supabase
          .from("clips")
          .select("id, title, created_at, user_id")
          .order("created_at", { ascending: false })
          .limit(3)

        // Fetch latest reviews
        const { data: reviews } = await supabase
          .from("reviews")
          .select("id, clip_id, user_id, overall_rating, created_at, clips(title)")
          .order("created_at", { ascending: false })
          .limit(2)

        // Get all user IDs
        const allUserIds = [...(clips?.map((c) => c.user_id) || []), ...(reviews?.map((r) => r.user_id) || [])]

        // Fetch user profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", allUserIds)

        // Create activity items
        const activityItems: ActivityItem[] = []

        // Add clips
        clips?.forEach((clip) => {
          const profile = profiles?.find((p) => p.id === clip.user_id)
          activityItems.push({
            id: clip.id,
            type: "clip",
            title: clip.title,
            user_display_name: profile?.display_name || "Anonymous",
            user_avatar: profile?.avatar_url || null,
            created_at: clip.created_at,
            clip_id: clip.id,
          })
        })

        // Add reviews
        reviews?.forEach((review) => {
          const profile = profiles?.find((p) => p.id === review.user_id)
          activityItems.push({
            id: review.id,
            type: "review",
            title: (review.clips as any)?.title || "Unknown Clip",
            user_display_name: profile?.display_name || "Anonymous",
            user_avatar: profile?.avatar_url || null,
            created_at: review.created_at,
            clip_id: review.clip_id,
            rating: review.overall_rating,
          })
        })

        // Sort by created_at and take top 5
        activityItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setActivities(activityItems.slice(0, 5))
      } catch (error) {
        console.error("Error fetching latest activity:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestActivity()
  }, [supabase])

  const getProtectedDisplayName = (userId: string) => {
    if (currentUser) {
      const profile = activities.find((a) => a.user_display_name)?.user_display_name
      return profile || "Anonymous"
    }
    return "Protected User"
  }

  const getDisplayName = (activity: ActivityItem) => {
    if (currentUser) {
      return activity.user_display_name
    }
    return "Protected User"
  }

  const getAvatar = (activity: ActivityItem) => {
    if (currentUser && activity.user_avatar) {
      return (
        <Avatar className="w-10 h-10">
          <img
            src={activity.user_avatar || "/placeholder.svg"}
            alt={activity.user_display_name}
            className="w-full h-full object-cover rounded-full"
          />
        </Avatar>
      )
    }
    return (
      <Avatar className="w-10 h-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
      </Avatar>
    )
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-orange-50/80 via-yellow-50/80 to-red-50/80 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-900/95 rounded-2xl border-2 border-orange-200/50 dark:border-orange-800/30 shadow-xl backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-yellow-400/10 to-red-400/10 dark:from-orange-500/5 dark:via-yellow-500/5 dark:to-red-500/5 rounded-2xl"></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-orange-600 via-yellow-600 to-red-600 dark:from-orange-400 dark:via-yellow-400 dark:to-red-400 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
              <Music className="w-5 h-5 text-white" />
            </div>
            Latest Activity
          </h3>
          <Badge
            variant="secondary"
            className="text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-500 text-white border-0 shadow-md px-3 py-1"
          >
            Live Feed
          </Badge>
        </div>

        <div className="space-y-3 mb-6">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <Card
                key={activity.id}
                className="group hover:shadow-lg transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-orange-200/60 dark:border-orange-700/40 hover:border-orange-300 dark:hover:border-orange-600 rounded-xl overflow-hidden"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">{getAvatar(activity)}</div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {activity.type === "clip" && (
                            <div className="p-1 rounded-full bg-orange-100 dark:bg-orange-900/30">
                              <Music className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                            </div>
                          )}
                          {activity.type === "review" && (
                            <div className="p-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                              <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                            </div>
                          )}
                          {activity.type === "comment" && (
                            <div className="p-1 rounded-full bg-red-100 dark:bg-red-900/30">
                              <MessageCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                            </div>
                          )}

                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {getDisplayName(activity)}
                          </span>
                        </div>

                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-full">
                          {activity.type === "clip" && "uploaded a new riff"}
                          {activity.type === "review" && `rated ${activity.rating}/5 stars`}
                          {activity.type === "comment" && "left a comment"}
                        </span>
                      </div>

                      <h4 className="text-base font-medium text-gray-900 dark:text-white line-clamp-1">
                        {activity.title}
                      </h4>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>

                        <div className="flex items-center gap-2">
                          <Button
                            asChild
                            variant="link"
                            className="p-0 h-auto text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                          >
                            <Link href={"/community"}>Click to listen</Link>
                          </Button>

                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-white dark:text-orange-400 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 dark:hover:from-orange-400 dark:hover:to-red-400 transition-all duration-300 rounded-full w-8 h-8 p-0"
                          >
                            <Link href={currentUser ? "/community" : "/auth/login"}>
                              <Play className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">No recent activity yet</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Be the first to share your music!</p>
            </div>
          )}
        </div>

        <div className="text-center space-y-4 pt-4 border-t border-orange-200/50 dark:border-orange-700/30">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Join our community of musicians sharing their passion for music
          </p>

          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 hover:from-orange-600 hover:via-yellow-600 hover:to-red-600 dark:from-orange-400 dark:via-yellow-400 dark:to-red-400 dark:hover:from-orange-500 dark:hover:via-yellow-500 dark:hover:to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3 rounded-full"
          >
            <Link href="/community" className="flex items-center gap-2">
              Explore All Riffs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
