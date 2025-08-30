"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, StarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface Review {
  id: string
  technique_rating: number
  creativity_rating: number
  tone_rating: number
  overall_rating: number
  review_text: string | null
  created_at: string
  user_id: string
  profiles: {
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface ReviewSectionProps {
  clipId: string
  reviews: Review[]
  currentUser: User | null
  userReview: Review | undefined
  hasCommented: boolean
}

function StarRating({
  rating,
  onRatingChange,
  readonly = false,
}: {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
        >
          <Star className={`w-5 h-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  )
}

export function ReviewSection({ clipId, reviews, currentUser, userReview, hasCommented }: ReviewSectionProps) {
  const [isReviewing, setIsReviewing] = useState(false)
  const [techniqueRating, setTechniqueRating] = useState(userReview?.technique_rating || 0)
  const [creativityRating, setCreativityRating] = useState(userReview?.creativity_rating || 0)
  const [toneRating, setToneRating] = useState(userReview?.tone_rating || 0)
  const [overallRating, setOverallRating] = useState(userReview?.overall_rating || 0)
  const [reviewText, setReviewText] = useState(userReview?.review_text || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmitReview = async () => {
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    if (!techniqueRating || !creativityRating || !toneRating || !overallRating) {
      alert("Please provide ratings for all categories")
      return
    }

    setIsSubmitting(true)
    try {
      const reviewData = {
        clip_id: clipId,
        user_id: currentUser.id,
        technique_rating: techniqueRating,
        creativity_rating: creativityRating,
        tone_rating: toneRating,
        overall_rating: overallRating,
        review_text: reviewText.trim() || null,
      }

      if (userReview) {
        // Update existing review
        const { error } = await supabase.from("reviews").update(reviewData).eq("id", userReview.id)
        if (error) throw error
      } else {
        // Create new review
        const { error } = await supabase.from("reviews").insert(reviewData)
        if (error) throw error
      }

      setIsReviewing(false)
      router.refresh()
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate average ratings
  const avgRatings = reviews.length
    ? {
        technique: reviews.reduce((sum, r) => sum + r.technique_rating, 0) / reviews.length,
        creativity: reviews.reduce((sum, r) => sum + r.creativity_rating, 0) / reviews.length,
        tone: reviews.reduce((sum, r) => sum + r.tone_rating, 0) / reviews.length,
        overall: reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length,
      }
    : null

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StarIcon className="w-5 h-5" />
          Reviews ({reviews.length})
        </CardTitle>
        {avgRatings && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Technique</p>
              <div className="flex items-center justify-center gap-1">
                <StarRating rating={Math.round(avgRatings.technique)} readonly />
                <span className="text-sm text-gray-600">({avgRatings.technique.toFixed(1)})</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Creativity</p>
              <div className="flex items-center justify-center gap-1">
                <StarRating rating={Math.round(avgRatings.creativity)} readonly />
                <span className="text-sm text-gray-600">({avgRatings.creativity.toFixed(1)})</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Tone</p>
              <div className="flex items-center justify-center gap-1">
                <StarRating rating={Math.round(avgRatings.tone)} readonly />
                <span className="text-sm text-gray-600">({avgRatings.tone.toFixed(1)})</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Overall</p>
              <div className="flex items-center justify-center gap-1">
                <StarRating rating={Math.round(avgRatings.overall)} readonly />
                <span className="text-sm text-gray-600">({avgRatings.overall.toFixed(1)})</span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add/Edit Review */}
        {currentUser ? (
          !hasCommented ? (
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">You need to comment on this riff before you can leave a review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {!isReviewing && !userReview && (
                <Button
                  onClick={() => setIsReviewing(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Write a Review
                </Button>
              )}

              {!isReviewing && userReview && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsReviewing(true)}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Edit Your Review
                  </Button>
                </div>
              )}

              {isReviewing && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900">{userReview ? "Edit Your Review" : "Write a Review"}</h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Technique</Label>
                      <StarRating rating={techniqueRating} onRatingChange={setTechniqueRating} />
                    </div>
                    <div className="space-y-2">
                      <Label>Creativity</Label>
                      <StarRating rating={creativityRating} onRatingChange={setCreativityRating} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <StarRating rating={toneRating} onRatingChange={setToneRating} />
                    </div>
                    <div className="space-y-2">
                      <Label>Overall</Label>
                      <StarRating rating={overallRating} onRatingChange={setOverallRating} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Review (optional)</Label>
                    <Textarea
                      placeholder="Share your detailed thoughts about this riff..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {isSubmitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsReviewing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-3">Sign in to leave a review</p>
            <Button asChild variant="outline">
              <a href="/auth/login">Sign In</a>
            </Button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => {
              const profile = review.profiles
              const displayName = profile?.display_name || "Anonymous"
              const avatarUrl = profile?.avatar_url

              return (
                <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{displayName}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Technique</p>
                          <StarRating rating={review.technique_rating} readonly />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Creativity</p>
                          <StarRating rating={review.creativity_rating} readonly />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Tone</p>
                          <StarRating rating={review.tone_rating} readonly />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Overall</p>
                          <StarRating rating={review.overall_rating} readonly />
                        </div>
                      </div>

                      {review.review_text && <p className="text-gray-700">{review.review_text}</p>}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <StarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No reviews yet. Be the first to review this riff!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
