import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { UploadDropzone } from "@/components/upload-dropzone"
import { Footer } from "@/components/footer" // Added footer import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Clock, Calendar } from "lucide-react"
import Link from "next/link"

export default async function MyClipsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's clips
  const { data: clips } = await supabase
    .from("clips")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex flex-col">
      {" "}
      {/* Added flex flex-col for footer positioning */}
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
            My Clips
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8">
        {" "}
        {/* Added flex-1 to push footer to bottom */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload New Riff</h2>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-purple-100 dark:border-purple-800 p-6 shadow-xl">
              <UploadDropzone />
            </div>
          </div>

          {/* My Clips List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Riffs ({clips?.length || 0})</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {clips && clips.length > 0 ? (
                clips.map((clip) => (
                  <Card
                    key={clip.id}
                    className="hover:shadow-md transition-shadow bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{clip.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {clip.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{clip.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {clip.duration_seconds}s
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(clip.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <audio
                        controls
                        className="w-full [&::-webkit-media-controls-panel]:bg-gray-100 dark:[&::-webkit-media-controls-panel]:bg-gray-700"
                      >
                        <source src={clip.file_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <Music className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">No riffs uploaded yet. Share your first one!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer /> {/* Added footer component */}
    </div>
  )
}
