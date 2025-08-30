"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client" // Fixed import to use createClient instead of createBrowserClient
import type { User } from "@supabase/supabase-js"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { UploadDropzone } from "@/components/upload-dropzone"
import { LatestActivity } from "@/components/latest-activity"
import { Footer } from "@/components/footer" // Added footer import
import { Music, ArrowDown } from "lucide-react"
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="flex items-center justify-between p-6 max-w-6xl mx-auto w-full">
        {/* Logo section - Left */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Could that be it?</h1>
        </div>

        {/* Explore button - Center */}
        <div className="flex-1 flex justify-center">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
          >
            <Music className="w-4 h-4" />
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
        {/* Added flex-1 to push footer to bottom */}
        <div className="mb-12">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Share Your{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Musical Magic
            </span>
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Upload your guitar riffs, get feedback from fellow musicians, and discover amazing sounds from the
            community.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 shadow-lg mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-6 h-6 text-purple-600" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Upload New Riff Here</h3>
            <Music className="w-6 h-6 text-pink-600" />
          </div>

          <div className="flex justify-center mb-6">
            <ArrowDown className="w-8 h-8 text-purple-600 animate-bounce" />
          </div>

          {user ? (
            <UploadDropzone />
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Sign in to Upload Your Riffs
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Join our community of musicians and start sharing your music
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
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
