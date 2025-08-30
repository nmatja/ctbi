import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    "https://evchwthsvmforddzdkef.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y2h3dGhzdm1mb3JkZHpka2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NjM3OTQsImV4cCI6MjA3MjEzOTc5NH0.Dqe7D82NYZBlpSZX2b5TScMJzcyfQzZoXfsTZSO0De8",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  let user = null
  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.log("[v0] Middleware auth error:", error.message)
    } else {
      user = authUser
    }
  } catch (error) {
    console.log("[v0] Middleware session error:", error)
  }

  const protectedRoutes = ["/my-clips", "/community"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
