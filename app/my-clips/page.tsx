import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { UploadDropzone } from "@/components/upload-dropzone"
import { Footer } from "@/components/footer"
import { MyClipsList } from "@/components/my-clips-list"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"
import Link from "next/link"

export default async function MyClipsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: clips } = await supabase
    .from("clips")
    .select(`
      *,
      reviews (
        id,
        overall_rating,
        comment
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const processedClips =
    clips?.map((clip) => {
      const reviews = clip.reviews || []
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum: number, review: any) => sum + review.overall_rating, 0) / reviews.length
          : 0
      const reviewCount = reviews.length
      const commentCount = reviews.filter((review: any) => review.comment && review.comment.trim()).length

      return {
        ...clip,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount,
        commentCount,
      }
    }) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex flex-col">
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

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="space-y-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Upload New Riff</h2>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-100 dark:border-purple-800 shadow-xl">
              <CardContent className="p-6">
                <UploadDropzone />
              </CardContent>
            </Card>
          </div>

          {/* My Clips Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Riffs ({processedClips.length})</h2>
            </div>

            <MyClipsList clips={processedClips} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
