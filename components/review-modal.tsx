"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Play, Pause, ArrowLeft, MessageCircle } from "lucide-react"
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
  const [profiles, setProfiles] = useState<any[]>([])
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
  const [showValidationError, setShowValidationError] = useState(false)
  const [showComments, setShowComments] = useState(false)

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

    const { data: commentsData } = await supabase
      .from("comments")
      .select("*")
      .eq("clip_id", clip.id)
      .order("created_at", { ascending: true })

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*")
      .eq("clip_id", clip.id)
      .order("created_at", { ascending: false })

    const userIds = [...(commentsData?.map((c) => c.user_id) || []), ...(reviewsData?.map((r) => r.user_id) || [])]
    const uniqueUserIds = [...new Set(userIds)]

    if (uniqueUserIds.length > 0) {
      const { data: profilesData } = await supabase.from("profiles").select("id, display_name").in("id", uniqueUserIds)

      setProfiles(profilesData || [])
    }

    setComments(commentsData || [])
    setReviews(reviewsData || [])
    setHasCommented(commentsData?.some((comment) => comment.user_id === currentUser?.id) || false)
    setUserReview(reviewsData?.find((review) => review.user_id === currentUser?.id))
  }

  const getUserDisplayName = (userId: string) => {
    const profile = profiles.find((p) => p.id === userId)
    return profile?.display_name || "Anonymous User"
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
    if (!newComment.trim() || newComment.trim().length < 4 || !currentUser) {
      setShowValidationError(true)
      return
    }

    const userCommentCount = comments.filter((comment) => comment.user_id === currentUser.id).length
    if (userCommentCount >= 10) {
      setShowValidationError(true)
      return
    }

    setIsSubmitting(true)
    setShowValidationError(false)
    const { error } = await supabase.from("comments").insert({
      clip_id: clip.id,
      user_id: currentUser.id,
      content: newComment.trim(),
    })

    if (!error) {
      setNewComment("")
      fetchCommentsAndReviews()
      setShowComments(true)
    }
    setIsSubmitting(false)
  }

  const submitReview = async () => {
    const allRatingsFilled = Object.values(ratings).every((rating) => rating > 0)
    if (!currentUser || !hasCommented || !allRatingsFilled) {
      setShowValidationError(true)
      return
    }

    setIsSubmitting(true)
    setShowValidationError(false)
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
      setShowComments(true)
    }
    setIsSubmitting(false)
  }

  const renderStars = (rating: number, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600 hover:text-yellow-200"
            }`}
            onClick={() => onRate?.(star)}
          />
        ))}
      </div>
    )
  }

  if (!clip) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            {clip.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Clip Player */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${clip.user_id}`} />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  U
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{clip.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {clip.duration}s</p>
              </div>
            </div>

            <Button onClick={togglePlay} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? "Pause" : "Play"} Riff
            </Button>
          </div>

          {/* Comments Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Comments ({comments.length})
            </h3>

            {currentUser && !hasCommented && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Add a comment before you can rate this riff:
                </p>
                <Textarea
                  placeholder="Share your thoughts about this riff... (minimum 4 characters)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
                {showValidationError && newComment.trim().length < 4 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                    Comment must be at least 4 characters long.
                  </p>
                )}
                {showValidationError && comments.filter((c) => c.user_id === currentUser?.id).length >= 10 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                    You can only add up to 10 comments per clip.
                  </p>
                )}
                <Button
                  onClick={submitComment}
                  disabled={
                    isSubmitting ||
                    !newComment.trim() ||
                    comments.filter((c) => c.user_id === currentUser?.id).length >= 10
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            )}

            {(showComments || hasCommented) && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`} />
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {getUserDisplayName(comment.user_id)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          disabled
                          title="Contact feature coming soon"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{comment.content}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          {currentUser && hasCommented && !userReview && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Rate This Riff</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Technique</label>
                  {renderStars(ratings.technique, (rating) => setRatings((prev) => ({ ...prev, technique: rating })))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Creativity</label>
                  {renderStars(ratings.creativity, (rating) => setRatings((prev) => ({ ...prev, creativity: rating })))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tone</label>
                  {renderStars(ratings.tone, (rating) => setRatings((prev) => ({ ...prev, tone: rating })))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Overall</label>
                  {renderStars(ratings.overall, (rating) => setRatings((prev) => ({ ...prev, overall: rating })))}
                </div>
              </div>

              {showValidationError && Object.values(ratings).some((r) => r === 0) && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  Please rate all categories before submitting.
                </p>
              )}

              <Button
                onClick={submitReview}
                disabled={isSubmitting || Object.values(ratings).some((r) => r === 0)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          )}

          {/* Existing Reviews */}
          {reviews.length > 0 && (showComments || hasCommented) && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Reviews ({reviews.length})
              </h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id}`} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          U
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getUserDisplayName(review.user_id)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            disabled
                            title="Contact feature coming soon"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex gap-2 mb-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          >
                            Technique: {review.technique_rating}/5
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          >
                            Creativity: {review.creativity_rating}/5
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          >
                            Tone: {review.tone_rating}/5
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          >
                            Overall: {review.overall_rating}/5
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
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
