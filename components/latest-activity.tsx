"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client" // Fixed import to use createClient instead of createBrowserClient
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
  const [currentUser, setCurrentUser] = useState<any>(null) // Added current user state
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

  const getProtectedDisplayName = () => "Protected User"

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
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Music className="w-6 h-6 text-purple-600" />
          Latest Activity
        </h3>
        <Badge variant="secondary" className="text-xs">
          Live Feed
        </Badge>
      </div>

      <div className="space-y-4 mb-6">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-10 h-10 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {activity.type === "clip" && <Music className="w-4 h-4 text-green-600" />}
                        {activity.type === "review" && <Star className="w-4 h-4 text-yellow-600" />}
                        {activity.type === "comment" && <MessageCircle className="w-4 h-4 text-blue-600" />}

                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getProtectedDisplayName()}
                        </span>

                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.type === "clip" && "uploaded a new riff"}
                          {activity.type === "review" && `rated ${activity.rating}/5 stars`}
                          {activity.type === "comment" && "left a comment"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{activity.title}</p>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(activity.created_at).toLocaleDateString()} •
                        {activity.type === "clip" && " Click to listen"}
                        {activity.type === "review" && " Click to see review"}
                      </p>
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    <Link href={currentUser ? `/clip/${activity.clip_id}` : "/auth/login"}>
                      <Play className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <Music className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
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
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
        >
          <Link href="/community" className="flex items-center gap-2">
            Explore All Riffs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
