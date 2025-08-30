import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "@/components/user-menu"
import { CommunityFeed } from "@/components/community-feed"
import { ThemeToggle } from "@/components/theme-toggle" // Added theme toggle import
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"
import Link from "next/link"

export default async function CommunityPage() {
  const supabase = await createClient()

  // Fetch all clips with user profiles and review stats
  const { data: clips } = await supabase
    .from("clips")
    .select(
      `
      *,
      profiles:user_id (
        display_name,
        avatar_url
      ),
      reviews (
        overall_rating
      )
    `,
    )
    .order("created_at", { ascending: false })

  // Calculate average ratings for each clip
  const clipsWithStats = clips?.map((clip) => {
    const reviews = clip.reviews || []
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length : 0
    return {
      ...clip,
      avg_rating: avgRating,
      review_count: reviews.length,
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-pink-50 dark:from-purple-950 dark:via-slate-900 dark:to-pink-950">
      {" "}
      {/* Added dark mode gradient */}
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Community Riffs
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {" "}
          {/* Added flex container for theme toggle and user menu */}
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Community Riffs</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Listen to amazing riffs and help fellow musicians improve with your feedback
          </p>
        </div>

        <CommunityFeed clips={clipsWithStats || []} />
      </main>
    </div>
  )
}
