import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { UploadDropzone } from "@/components/upload-dropzone"
import { Footer } from "@/components/footer"
import { MyClipsList } from "@/components/my-clips-list"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Waves, Music2, TreePine } from "lucide-react"
import Link from "next/link"

export default async function MyClipsPage() {
  const supabase = createClient()

  let user = null
  let clips = null

  try {
    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("[v0] Auth check result:", { user: !!authUser, error: userError?.message })

    if (userError || !authUser) {
      console.log("[v0] Authentication failed, redirecting to login")
      redirect("/auth/login")
    }

    user = authUser
    console.log("[v0] Authenticated user:", user.id)

    const { data: clipsData, error: clipsError } = await supabase
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

    if (clipsError) {
      console.log("[v0] Clips query error:", clipsError.message)
      clips = []
    } else {
      clips = clipsData || []
      console.log("[v0] Found clips:", clips.length)
    }
  } catch (error) {
    console.log("[v0] My Clips page error:", error)
    redirect("/auth/login")
  }

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        {/* Logo Section - Left */}
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/">
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <div className="relative">
                  <TreePine className="w-4 h-4 text-primary-foreground absolute -top-1 -left-1" />
                  <Waves className="w-4 h-4 text-primary-foreground absolute top-1 left-1" />
                </div>
              </div>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Could that be it?
          </h1>
        </div>

        {/* Explore Section - Center */}
        <div className="flex items-center">
          <Button
            asChild
            variant="ghost"
            className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 hover:from-primary/20 hover:via-accent/20 hover:to-secondary/20 text-foreground font-medium px-6 py-2 rounded-full border border-border/50"
          >
            <Link href="/community" className="flex items-center gap-2">
              <Music2 className="w-4 h-4" />
              Explore
            </Link>
          </Button>
        </div>

        {/* Profile Section - Right */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section - Smaller */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Upload New Riff</h2>
            <Card className="bg-card/80 backdrop-blur-sm border-2 border-border shadow-xl">
              <CardContent className="p-4">
                <UploadDropzone />
              </CardContent>
            </Card>

            {processedClips.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Your Top Rated</h3>
                {(() => {
                  const topClip = processedClips.reduce((prev, current) =>
                    current.avgRating > prev.avgRating ? current : prev,
                  )
                  return topClip.avgRating > 0 ? (
                    <Card className="bg-card/60 backdrop-blur-sm border border-border">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-card-foreground mb-2">{topClip.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">⭐ {topClip.avgRating}</span>
                          <span>•</span>
                          <span>{topClip.reviewCount} reviews</span>
                        </div>
                        <audio controls className="w-full h-8">
                          <source src={topClip.file_url} type="audio/mpeg" />
                        </audio>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-card/60 backdrop-blur-sm border border-border">
                      <CardContent className="p-4 text-center">
                        <p className="text-muted-foreground text-sm">Upload more riffs to see your top rated!</p>
                      </CardContent>
                    </Card>
                  )
                })()}
              </div>
            )}
          </div>

          {/* My Clips Section - Larger */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Your Riffs ({processedClips.length})</h2>
            </div>

            <MyClipsList clips={processedClips} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
