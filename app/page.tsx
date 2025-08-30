"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client" // Fixed import to use createClient instead of createBrowserClient
import type { User } from "@supabase/supabase-js"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { UploadDropzone } from "@/components/upload-dropzone"
import { LatestActivity } from "@/components/latest-activity"
import { Footer } from "@/components/footer" // Added footer import
import { Music, ArrowDown, Guitar } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient() // Fixed function call to use createClient() which has the proper arguments

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-3xl font-light text-primary">Could that be it?</h1>
        </div>

        <div className="flex-1 flex justify-center">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white font-semibold px-6 py-2 rounded-lg hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 transition-all duration-200 shadow-lg"
          >
            <Guitar className="w-4 h-4" />
            Explore
          </Link>
        </div>

        {/* Profile section - Right */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="mb-12">
          <h2 className="text-5xl font-bold leading-tight mb-4">
            Share Your{" "}
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
              Musical Magic
            </span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto leading-relaxed">
            Upload your guitar riffs, get feedback from fellow musicians, and discover amazing sounds from the
            community.
          </p>
        </div>

        <div className="bg-card rounded-2xl border p-12 shadow-lg mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Guitar className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-semibold">Upload New Riff Here</h3>
            <Music className="w-6 h-6 text-primary" />
          </div>

          <div className="flex justify-center mb-6">
            <ArrowDown className="w-8 h-8 text-primary animate-bounce" />
          </div>

          {user ? (
            <UploadDropzone />
          ) : (
            <div className="border-2 border-dashed border-border rounded-xl p-12 bg-muted/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Guitar className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold mb-2">Sign in to Upload Your Riffs</p>
                  <p className="text-muted-foreground mb-4">
                    Join our community of musicians and start sharing your music
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-block bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white font-semibold px-6 py-3 rounded-lg hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 transition-all duration-200 shadow-lg"
                  >
                    Sign In to Upload
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-12">
          <LatestActivity />
        </div>
      </main>
      <Footer />
    </div>
  )
}
