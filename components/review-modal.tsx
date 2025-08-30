"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Play, Pause, ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  clip: any
  currentUser: any
}

export function ReviewModal({ isOpen, onClose, clip, currentUser }: ReviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [ratings, setRatings] = useState({
    technique: 0,
    creativity: 0,
    tone: 0,
    overall: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasCommented, setHasCommented] = useState(false)
  const [userReview, setUserReview] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen && clip) {
      fetchCommentsAndReviews()
      if (clip.file_url) {
        const audioElement = new Audio(clip.file_url)
        setAudio(audioElement)
        return () => {
          audioElement.pause()
          audioElement.src = ""
        }
      }
    }
  }, [isOpen, clip])

  const fetchCommentsAndReviews = async () => {
    if (!clip) return

    // Fetch comments
    const { data: commentsData } = await supabase
      .from("comments")
      .select("*")
      .eq("clip_id", clip.id)
      .order("created_at", { ascending: true })

    // Fetch reviews
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*")
      .eq("clip_id", clip.id)
      .order("created_at", { ascending: false })

    setComments(commentsData || [])
    setReviews(reviewsData || [])
    setHasCommented(commentsData?.some((comment) => comment.user_id === currentUser?.id) || false)
    setUserReview(reviewsData?.find((review) => review.user_id === currentUser?.id))
  }

  const togglePlay = () => {
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const submitComment = async () => {
    if (!newComment.trim() || !currentUser) return

    setIsSubmitting(true)
    const { error } = await supabase.from("comments").insert({
      clip_id: clip.id,
      user_id: currentUser.id,
      content: newComment.trim(),
    })

    if (!error) {
      setNewComment("")
      fetchCommentsAndReviews()
    }
    setIsSubmitting(false)
  }

  const submitReview = async () => {
    if (!currentUser || !hasCommented) return

    setIsSubmitting(true)
    const { error } = await supabase.from("reviews").insert({
      clip_id: clip.id,
      user_id: currentUser.id,
      technique_rating: ratings.technique,
      creativity_rating: ratings.creativity,
      tone_rating: ratings.tone,
      overall_rating: ratings.overall,
    })

    if (!error) {
      fetchCommentsAndReviews()
    }
    setIsSubmitting(false)
  }

  const renderStars = (rating: number, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            onClick={() => onRate?.(star)}
          />
        ))}
      </div>
    )
  }

  if (!clip) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            {clip.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Clip Player */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${clip.user_id}`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{clip.title}</h3>
                <p className="text-sm text-gray-600">Duration: {clip.duration}s</p>
              </div>
            </div>

            <Button onClick={togglePlay} className="w-full">
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? "Pause" : "Play"} Riff
            </Button>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>

            {currentUser && !hasCommented && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-3">Add a comment before you can rate this riff:</p>
                <Textarea
                  placeholder="Share your thoughts about this riff..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3"
                />
                <Button onClick={submitComment} disabled={isSubmitting || !newComment.trim()}>
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(comment.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          {currentUser && hasCommented && !userReview && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Rate This Riff</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Technique</label>
                  {renderStars(ratings.technique, (rating) => setRatings((prev) => ({ ...prev, technique: rating })))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Creativity</label>
                  {renderStars(ratings.creativity, (rating) => setRatings((prev) => ({ ...prev, creativity: rating })))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tone</label>
                  {renderStars(ratings.tone, (rating) => setRatings((prev) => ({ ...prev, tone: rating })))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Overall</label>
                  {renderStars(ratings.overall, (rating) => setRatings((prev) => ({ ...prev, overall: rating })))}
                </div>
              </div>

              <Button
                onClick={submitReview}
                disabled={isSubmitting || Object.values(ratings).some((r) => r === 0)}
                className="w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          )}

          {/* Existing Reviews */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Reviews ({reviews.length})</h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id}`} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <Badge variant="outline">Technique: {review.technique_rating}/5</Badge>
                          <Badge variant="outline">Creativity: {review.creativity_rating}/5</Badge>
                          <Badge variant="outline">Tone: {review.tone_rating}/5</Badge>
                          <Badge variant="outline">Overall: {review.overall_rating}/5</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
