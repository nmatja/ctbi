import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { UserMenu } from "@/components/user-menu"
import { ClipPlayer } from "@/components/clip-player"
import { CommentSection } from "@/components/comment-section"
import { ReviewSection } from "@/components/review-section"
import { Button } from "@/components/ui/button"
import { Music, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ClipPageProps {
  params: Promise<{ id: string }>
}

export default async function ClipPage({ params }: ClipPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch clip with user profile
  const { data: clip } = await supabase
    .from("clips")
    .select(
      `
      *,
      profiles:user_id (
        display_name,
        avatar_url
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!clip) {
    notFound()
  }

  // Fetch comments with user profiles
  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles:user_id (
        display_name,
        avatar_url
      )
    `,
    )
    .eq("clip_id", id)
    .order("created_at", { ascending: true })

  // Fetch reviews with user profiles
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles:user_id (
        display_name,
        avatar_url
      )
    `,
    )
    .eq("clip_id", id)
    .order("created_at", { ascending: false })

  // Check if current user has already reviewed this clip
  const userReview = reviews?.find((review) => review.user_id === user?.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-pink-50">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/community">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Community
            </Link>
          </Button>
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
        </div>
        <UserMenu />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Clip Player */}
          <ClipPlayer clip={clip} />

          {/* Comments Section */}
          <CommentSection clipId={id} comments={comments || []} currentUser={user} />

          {/* Reviews Section */}
          <ReviewSection
            clipId={id}
            reviews={reviews || []}
            currentUser={user}
            userReview={userReview}
            hasCommented={comments?.some((comment) => comment.user_id === user?.id) || false}
          />
        </div>
      </main>
    </div>
  )
}
