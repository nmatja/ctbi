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
    <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-black rounded-2xl border-2 border-transparent bg-clip-padding shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 rounded-2xl opacity-20"></div>
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-light text-orange-600 dark:text-orange-400 flex items-center gap-2">
            <Music className="w-6 h-6 text-orange-500" />
            Latest Activity
          </h3>
          <Badge
            variant="secondary"
            className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
          >
            Live Feed
          </Badge>
        </div>

        <div className="space-y-4 mb-6">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <Card
                key={activity.id}
                className="hover:shadow-md transition-shadow bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-orange-200 dark:border-orange-700"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getAvatar(activity)}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {activity.title}
                        </h4>

                        <div className="flex items-center gap-2 mb-1">
                          {activity.type === "clip" && <Music className="w-4 h-4 text-orange-600" />}
                          {activity.type === "review" && <Star className="w-4 h-4 text-yellow-600" />}
                          {activity.type === "comment" && <MessageCircle className="w-4 h-4 text-red-600" />}

                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getDisplayName(activity)}
                          </span>

                          {activity.rating && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-0.5">
                              {activity.rating}/5 ⭐
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {activity.type === "clip" && "uploaded a new riff"}
                          {activity.type === "review" && "left a review"}
                          {activity.type === "comment" && "left a comment"}
                          {" • "}
                          {new Date(activity.created_at).toLocaleDateString()}
                          {" • "}
                          <Button
                            asChild
                            variant="link"
                            className="p-0 h-auto text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                          >
                            <Link href={"/community"}>Click to listen</Link>
                          </Button>
                        </p>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                    >
                      <Link href={currentUser ? "/community" : "/auth/login"}>
                        <Play className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-orange-400 dark:text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No recent activity yet. Be the first to share!</p>
            </div>
          )}
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Join our community of musicians sharing their passion for music
          </p>

          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 text-white hover:from-orange-600 hover:via-yellow-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
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
