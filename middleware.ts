import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const isMyClipsRoute = request.nextUrl.pathname.startsWith("/my-clips")

  if (isMyClipsRoute) {
    // Check for Supabase auth cookies instead of making API calls
    const authToken =
      request.cookies.get("sb-access-token") ||
      request.cookies.get("supabase-auth-token") ||
      request.cookies.get("sb-evchwthsvmforddzdkef-auth-token")

    if (!authToken) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
