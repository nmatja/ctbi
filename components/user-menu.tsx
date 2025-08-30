"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Music, Edit3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  display_name: string | null
  avatar_url: string | null
}

export function UserMenu() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [newNickname, setNewNickname] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", userId)
        .single()
      setProfile(profile)
    },
    [supabase],
  )

  const getUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.log("[v0] Auth error:", error.message)
        // Retry once after a short delay
        setTimeout(async () => {
          const {
            data: { user: retryUser },
          } = await supabase.auth.getUser()
          setUser(retryUser)
          if (retryUser) {
            await fetchProfile(retryUser.id)
          }
          setLoading(false)
        }, 1000)
        return
      }

      setUser(user)
      if (user) {
        await fetchProfile(user.id)
      }
      setLoading(false)
    } catch (error) {
      console.log("[v0] Session fetch error:", error)
      setLoading(false)
    }
  }, [supabase, fetchProfile])

  useEffect(() => {
    let mounted = true

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("[v0] Auth state change:", event)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile, getUser])

  const validateNickname = async (nickname: string) => {
    if (!nickname.trim()) {
      setValidationError("Nickname is required")
      return false
    }

    if (nickname.trim().length < 2) {
      setValidationError("Nickname must be at least 2 characters")
      return false
    }

    if (nickname.trim().length > 50) {
      setValidationError("Nickname must be less than 50 characters")
      return false
    }

    // Check if nickname is already taken (excluding current user)
    setIsValidating(true)
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("display_name", nickname.trim())
        .neq("id", user?.id || "")
        .single()

      if (existingProfile) {
        setValidationError("This nickname is already taken")
        return false
      }

      setValidationError("")
      return true
    } catch (error) {
      // No existing profile found, nickname is available
      setValidationError("")
      return true
    } finally {
      setIsValidating(false)
    }
  }

  const handleUpdateNickname = async () => {
    if (!user || !newNickname.trim()) return

    const isValid = await validateNickname(newNickname)
    if (!isValid) return

    setIsUpdating(true)
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: newNickname.trim(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error updating nickname:", error)
        setValidationError("Failed to update nickname. Please try again.")
      } else {
        setProfile((prev) => (prev ? { ...prev, display_name: newNickname.trim() } : null))
        setIsEditingNickname(false)
        setNewNickname("")
        setValidationError("")
      }
    } catch (error) {
      console.error("Error updating nickname:", error)
      setValidationError("Failed to update nickname. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
  }

  if (!user) {
    return (
      <Button onClick={() => router.push("/auth/login")} variant="outline">
        Sign In
      </Button>
    )
  }

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User"
  const gravatarUrl = user.email
    ? `https://www.gravatar.com/avatar/${btoa(user.email.toLowerCase().trim())}?d=identicon&s=32`
    : null
  const avatarUrl = profile?.avatar_url || gravatarUrl

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-between gap-2 p-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-sm">{displayName}</p>
              <p className="w-[140px] truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Dialog open={isEditingNickname} onOpenChange={setIsEditingNickname}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                onClick={() => {
                  setNewNickname(displayName)
                  setIsEditingNickname(true)
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Nickname</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={newNickname}
                    onChange={(e) => {
                      setNewNickname(e.target.value)
                      if (validationError) setValidationError("")
                    }}
                    placeholder="Enter your nickname"
                    maxLength={50}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                  {validationError && <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>}
                  {isValidating && <p className="text-sm text-blue-600 dark:text-blue-400">Checking availability...</p>}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingNickname(false)
                      setValidationError("")
                      setNewNickname("")
                    }}
                    disabled={isUpdating || isValidating}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateNickname}
                    disabled={
                      isUpdating ||
                      isValidating ||
                      !newNickname.trim() ||
                      newNickname.trim().length < 2 ||
                      !!validationError
                    }
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {isUpdating ? "Updating..." : isValidating ? "Checking..." : "Update"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/my-clips")}>
          <Music className="mr-2 h-4 w-4" />
          My Clips
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
