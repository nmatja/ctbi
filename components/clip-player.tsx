import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"

interface ClipPlayerProps {
  clip: {
    id: string
    title: string
    description: string | null
    file_url: string
    duration_seconds: number
    created_at: string
    profiles: {
      display_name: string | null
      avatar_url: string | null
    } | null
  }
}

export function ClipPlayer({ clip }: ClipPlayerProps) {
  const profile = clip.profiles
  const displayName = profile?.display_name || "Anonymous"
  const avatarUrl = profile?.avatar_url

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 shadow-xl">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{clip.title}</h1>
            <p className="text-lg text-gray-600 mb-3">by {displayName}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {clip.duration_seconds} seconds
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(clip.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {clip.description && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{clip.description}</p>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Audio</h3>
          <audio controls className="w-full">
            <source src={clip.file_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </CardContent>
    </Card>
  )
}
