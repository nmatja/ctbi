import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "@/components/user-menu"
import { CommunityFeed } from "@/components/community-feed"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer" // Added footer import
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams

  const page = Number.parseInt(resolvedSearchParams.page || "1")
  const itemsPerPage = 6 // Changed items per page from 12 to 6 as requested
  const offset = (page - 1) * itemsPerPage

  const {
    data: clips,
    error,
    count,
  } = await supabase
    .from("clips")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + itemsPerPage - 1)

  if (error) {
    console.log("[v0] Community feed query error:", error)
  }

  let clipsWithProfiles = clips || []
  if (clips && clips.length > 0) {
    const userIds = clips.map((clip) => clip.user_id)
    const { data: profiles } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds)

    clipsWithProfiles = clips.map((clip) => {
      const profile = profiles?.find((p) => p.id === clip.user_id)
      return {
        ...clip,
        profiles: profile
          ? {
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
            }
          : null,
      }
    })
  }

  let clipsWithStats = clipsWithProfiles
  if (clips && clips.length > 0) {
    const clipIds = clips.map((clip) => clip.id)
    const { data: reviews } = await supabase.from("reviews").select("clip_id, overall_rating").in("clip_id", clipIds)

    clipsWithStats = clipsWithProfiles.map((clip) => {
      const clipReviews = reviews?.filter((r) => r.clip_id === clip.id) || []
      const avgRating =
        clipReviews.length > 0 ? clipReviews.reduce((sum, r) => sum + r.overall_rating, 0) / clipReviews.length : 0
      return {
        ...clip,
        avg_rating: avgRating,
        review_count: clipReviews.length,
      }
    })
  }

  console.log("[v0] Fetched clips count:", clips?.length || 0)
  console.log("[v0] Total clips in database:", count)

  const totalPages = Math.ceil((count || 0) / itemsPerPage)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-pink-50 dark:from-purple-950 dark:via-slate-900 dark:to-pink-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        {/* Logo Section - Left */}
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Could that be it?
          </h1>
        </div>

        {/* Explore Section - Center */}
        <div className="flex items-center">
          <Button
            asChild
            variant="ghost"
            className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          >
            <Link href="/community">Explore</Link>
          </Button>
        </div>

        {/* Profile Section - Right */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8">
        {/* Added flex-1 to push footer to bottom */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Community Riffs</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Listen to amazing riffs and help fellow musicians improve with your feedback
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Showing {clipsWithStats?.length || 0} of {count || 0} total riffs (Page {page} of {totalPages})
          </p>
        </div>
        <CommunityFeed clips={clipsWithStats || []} />
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <Button
              asChild
              variant="outline"
              disabled={!hasPrevPage}
              className={!hasPrevPage ? "opacity-50 cursor-not-allowed" : ""}
            >
              <Link href={`/community?page=${page - 1}`}>Previous</Link>
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                if (pageNum > totalPages) return null

                return (
                  <Button
                    key={pageNum}
                    asChild
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    className={pageNum === page ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
                  >
                    <Link href={`/community?page=${pageNum}`}>{pageNum}</Link>
                  </Button>
                )
              })}
            </div>

            <Button
              asChild
              variant="outline"
              disabled={!hasNextPage}
              className={!hasNextPage ? "opacity-50 cursor-not-allowed" : ""}
            >
              <Link href={`/community?page=${page + 1}`}>Next</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer /> {/* Added footer component */}
    </div>
  )
}
