import { useCallback, useState } from 'react'
import { Platform, Pressable } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import {
  YStack,
  XStack,
  ScrollView,
  Card,
  Button,
  H4,
  Paragraph,
  SizableText,
  Circle,
  Input,
  Spinner,
  EmptyState,
  Sheet,
  toast,
} from '@blinkdotnew/mobile-ui'
import {
  ArrowLeft,
  Star,
  MessageCircle,
  X,
} from '@blinkdotnew/mobile-ui'

import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/i18n'
import {
  useEstablishment,
  useReviews,
  useCreateReview,
} from '@/hooks/useDatabase'

// ─── Stars Component ─────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const stars = []
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <Star key={i} size={size} color="$color8" fill="$color8" />,
      )
    } else if (i === full && hasHalf) {
      stars.push(
        <Star key={i} size={size} color="$color8" fill="$color6" />,
      )
    } else {
      stars.push(
        <Star key={i} size={size} color="$color6" />,
      )
    }
  }

  return <XStack gap={2}>{stars}</XStack>
}

// ─── Tappable Star Selector ──────────────────────────────────────────────────
function StarSelector({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <XStack gap="$1" justifyContent="center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable key={i} onPress={() => onChange(i)}>
          <Star
            size={32}
            color={i <= value ? '$color8' : '$color6'}
            fill={i <= value ? '$color8' : 'none'}
          />
        </Pressable>
      ))}
    </XStack>
  )
}

// ─── Reviews Screen ──────────────────────────────────────────────────────────
export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t, locale } = useTranslation()
  const { user, isAuthenticated } = useAuth()

  const { data: establishment, isLoading: estLoading } = useEstablishment(id ?? '')
  const { data: reviews, isLoading: revLoading } = useReviews(id ?? '')
  const createReview = useCreateReview()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')

  // ── Submit review ──────────────────────────────────────────────────────
  const handleSubmitReview = useCallback(async () => {
    if (!user || !establishment || newRating === 0) return

    try {
      await createReview.mutateAsync({
        establishment_id: establishment.id,
        user_id: user.id,
        rating: newRating,
        comment: newComment.trim(),
      })
      toast(t('confirmed'), {
        message: establishment.name,
        variant: 'success',
      })
      setSheetOpen(false)
      setNewRating(0)
      setNewComment('')
    } catch {
      toast(t('error'), { message: t('retry'), variant: 'error' })
    }
  }, [user, establishment, newRating, newComment, createReview, t])

  // ── Open review sheet (auth gate) ──────────────────────────────────────
  const handleOpenSheet = useCallback(() => {
    if (!isAuthenticated) {
      toast(t('sign_in'), { message: t('login_title'), variant: 'info' })
      return
    }
    setSheetOpen(true)
  }, [isAuthenticated, t])

  const isLoading = estLoading || revLoading

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$color1" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$color9" />
      </YStack>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────
  if (!establishment) {
    return (
      <YStack flex={1} backgroundColor="$color1">
        <XStack
          paddingTop={Platform.OS === 'ios' ? 60 : 44}
          paddingHorizontal="$4"
          paddingBottom="$3"
          alignItems="center"
          gap="$3"
        >
          <Pressable onPress={() => router.back()}>
            <Circle size={36} backgroundColor="$color2">
              <ArrowLeft size={20} color="$color12" />
            </Circle>
          </Pressable>
        </XStack>
        <EmptyState
          icon={<MessageCircle size={48} color="$color8" />}
          title={t('error')}
          description={t('no_results')}
          action={{ label: t('back'), onPress: () => router.back() }}
        />
      </YStack>
    )
  }

  // ── Main ───────────────────────────────────────────────────────────────
  return (
    <YStack flex={1} backgroundColor="$color1">
      {/* Header */}
      <XStack
        paddingTop={Platform.OS === 'ios' ? 60 : 44}
        paddingHorizontal="$4"
        paddingBottom="$3"
        borderBottomWidth={1}
        borderBottomColor="$color4"
        alignItems="center"
        justifyContent="space-between"
      >
        <XStack gap="$3" alignItems="center">
          <Pressable onPress={() => router.back()}>
            <Circle size={36} backgroundColor="$color2">
              <ArrowLeft size={20} color="$color12" />
            </Circle>
          </Pressable>
          <YStack gap="$0.5">
            <H4 color="$color12">
              {t('reviews')}
            </H4>
            <SizableText size="$2" color="$color10">
              {establishment.name}
            </SizableText>
          </YStack>
        </XStack>

        <Button size="$3" theme="active" onPress={handleOpenSheet}>
          {t('write_review')}
        </Button>
      </XStack>

      {/* Rating Summary */}
      <YStack
        paddingHorizontal="$4"
        paddingVertical="$4"
        borderBottomWidth={1}
        borderBottomColor="$color4"
        alignItems="center"
        gap="$2"
      >
        <SizableText size="$9" color="$color12" fontWeight="800">
          {establishment.rating.toFixed(1)}
        </SizableText>
        <Stars rating={establishment.rating} size={18} />
        <SizableText size="$3" color="$color10">
          {establishment.review_count} {t('reviews')}
        </SizableText>
      </YStack>

      {/* Reviews List */}
      {!reviews || reviews.length === 0 ? (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
          <EmptyState
            icon={<MessageCircle size={48} color="$color8" />}
            title={t('no_results')}
            description={t('write_review')}
            action={{ label: t('write_review'), onPress: handleOpenSheet }}
          />
        </YStack>
      ) : (
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <YStack padding="$4" gap="$3">
            {reviews.map((review) => (
              <Card key={review.id} backgroundColor="$color2" padding="$4" borderRadius="$4">
                <YStack gap="$3">
                  {/* User Info + Rating */}
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack gap="$2" alignItems="center">
                      <Circle size={36} backgroundColor="$color3">
                        <SizableText size="$4" color="$color10" fontWeight="700">
                          U
                        </SizableText>
                      </Circle>
                      <YStack gap="$0.5">
                        <SizableText size="$3" color="$color11" fontWeight="600">
                          {t('client')}
                        </SizableText>
                        <SizableText size="$2" color="$color9">
                          {new Date(review.created_at).toLocaleDateString(
                            locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-SA' : 'en-US',
                          )}
                        </SizableText>
                      </YStack>
                    </XStack>
                    <Stars rating={review.rating} size={14} />
                  </XStack>

                  {/* Comment */}
                  {review.comment ? (
                    <Paragraph color="$color10" size="$3" lineHeight={22}>
                      {review.comment}
                    </Paragraph>
                  ) : null}

                  {/* Owner Reply */}
                  {review.owner_reply && review.owner_reply.trim().length > 0 ? (
                    <YStack
                      backgroundColor="$color3"
                      padding="$3"
                      borderRadius="$3"
                      borderLeftWidth={3}
                      borderLeftColor="$color9"
                      gap="$1"
                    >
                      <SizableText size="$2" color="$color9" fontWeight="700">
                        {t('owner_reply')}
                      </SizableText>
                      <Paragraph color="$color10" size="$2" lineHeight={18}>
                        {review.owner_reply}
                      </Paragraph>
                    </YStack>
                  ) : null}
                </YStack>
              </Card>
            ))}
          </YStack>
        </ScrollView>
      )}

      {/* ── Write Review Bottom Sheet ────────────────────────────────── */}
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        modal
        snapPoints={[60]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame backgroundColor="$color1" padding="$4">
          <YStack gap="$4">
            {/* Sheet Handle */}
            <XStack justifyContent="space-between" alignItems="center">
              <H4 color="$color12">{t('write_review')}</H4>
              <Pressable onPress={() => setSheetOpen(false)}>
                <Circle size={32} backgroundColor="$color2">
                  <X size={18} color="$color10" />
                </Circle>
              </Pressable>
            </XStack>

            {/* Star Selector */}
            <YStack gap="$2" alignItems="center">
              <StarSelector value={newRating} onChange={setNewRating} />
              {newRating === 0 ? (
                <SizableText size="$2" color="$color9">
                  {t('write_review')}
                </SizableText>
              ) : (
                <SizableText size="$3" color="$color8" fontWeight="600">
                  {newRating}/5
                </SizableText>
              )}
            </YStack>

            {/* Comment Input */}
            <Input
              value={newComment}
              onChangeText={setNewComment}
              placeholder={t('write_review')}
              multiline
              numberOfLines={4}
              size="$4"
              backgroundColor="$color2"
              borderColor="$color4"
              minHeight={100}
              textAlignVertical="top"
            />

            {/* Submit */}
            <Button
              theme="active"
              size="$5"
              onPress={handleSubmitReview}
              disabled={newRating === 0 || createReview.isPending}
              width="100%"
            >
              {createReview.isPending ? t('loading') : t('confirm')}
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  )
}
