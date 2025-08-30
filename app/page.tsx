"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { UploadDropzone } from "@/components/upload-dropzone"
import Link from "next/link"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

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
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-orange-100 to-pink-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-orange-100 to-pink-100">
      <header className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white text-xl">
            🎵
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Could that be it?
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="mb-12">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Share Your{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Musical Magic
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Upload your guitar riffs, get feedback from fellow musicians, and discover amazing sounds from the
            community.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-12 shadow-2xl mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">✨</span>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Upload New Riff Here</h3>
            <span className="text-2xl">✨</span>
          </div>

          <div className="flex justify-center mb-6">
            <div className="text-3xl animate-bounce">⬇️</div>
          </div>

          {user ? (
            <UploadDropzone />
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  🎸
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Sign in to Upload Your Riffs
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
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

        <div>
          <Link
            href="/community"
            className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-8 py-3 text-lg rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
          >
            🎵 Explore Community Riffs
          </Link>
        </div>
      </main>
    </div>
  )
}
