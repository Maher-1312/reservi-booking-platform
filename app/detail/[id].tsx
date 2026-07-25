import { useCallback, useMemo, useState } from 'react'
import {
  Dimensions,
  Platform,
  Pressable,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { useLocalSearchParams, router, Link } from 'expo-router'
import {
  YStack,
  XStack,
  ScrollView,
  Card,
  Button,
  H2,
  H3,
  H4,
  Paragraph,
  SizableText,
  Separator,
  Circle,
  Spinner,
  Chip,
  Badge,
  EmptyState,
} from '@blinkdotnew/mobile-ui'
import {
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  Wifi,
  Car,
  Utensils,
  Users,
} from '@blinkdotnew/mobile-ui'

import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/i18n'
import {
  useEstablishment,
  useReviews,
  useFavorites,
  useToggleFavorite,
} from '@/hooks/useDatabase'
import { parseImages, parseFeatures, priceLevelLabel, getLocalizedField } from '@/lib/helpers'

const SCREEN_WIDTH = Dimensions.get('window').width
const HERO_HEIGHT = 280

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

// ─── Feature Icon Map ────────────────────────────────────────────────────────
const FEATURE_ICONS: Record<string, React.ReactElement> = {
  wifi: <Wifi size={14} color="$color9" />,
  parking: <Car size={14} color="$color9" />,
  restaurant: <Utensils size={14} color="$color9" />,
  delivery: <Car size={14} color="$color9" />,
  groups: <Users size={14} color="$color9" />,
}

// ─── Detail Screen ───────────────────────────────────────────────────────────
export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t, locale } = useTranslation()
  const { user, isAuthenticated } = useAuth()

  const {
    data: establishment,
    isLoading,
    isError,
  } = useEstablishment(id ?? '')
  const { data: reviews } = useReviews(id ?? '')
  const { data: favs } = useFavorites(user?.id)
  const toggleFav = useToggleFavorite()

  const [currentImageIdx, setCurrentImageIdx] = useState(0)

  const isFav = useMemo(() => {
    if (!favs || !establishment) return false
    return favs.some((f) => f.establishment_id === establishment.id)
  }, [favs, establishment])

  const handleToggleFav = useCallback(() => {
    if (!user || !establishment) return
    toggleFav.mutate({
      establishmentId: establishment.id,
      userId: user.id,
    })
  }, [user, establishment, toggleFav])

  const images = useMemo(
    () => (establishment ? parseImages(establishment.images) : []),
    [establishment],
  )
  const features = useMemo(
    () => (establishment ? parseFeatures(establishment.features) : []),
    [establishment],
  )
  const topReviews = useMemo(() => (reviews ?? []).slice(0, 3), [reviews])

  // ── Loading state ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$color1">
        <YStack height={HERO_HEIGHT} backgroundColor="$color3" />
        <YStack flex={1} padding="$4" gap="$4" alignItems="center" justifyContent="center">
          <Spinner size="large" color="$color9" />
        </YStack>
      </YStack>
    )
  }

  // ── Error / Not Found ──────────────────────────────────────────────────
  if (isError || !establishment) {
    return (
      <YStack flex={1} backgroundColor="$color1">
        <EmptyState
          icon={<Star size={48} color="$color8" />}
          title={t('error')}
          description={t('no_results')}
          action={{ label: t('back'), onPress: () => router.back() }}
        />
      </YStack>
    )
  }

  const priceStr = priceLevelLabel(establishment.price_level)

  return (
    <YStack flex={1} backgroundColor="$color1">
      {/* ── Scrollable Content ──────────────────────────────────────── */}
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Image ──────────────────────────────────────────── */}
        <YStack height={HERO_HEIGHT} width={SCREEN_WIDTH}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
              setCurrentImageIdx(idx)
            }}
            style={{ height: HERO_HEIGHT }}
          >
            {images.length > 0 ? (
              images.map((img, idx) => (
                <YStack
                  key={idx}
                  width={SCREEN_WIDTH}
                  height={HERO_HEIGHT}
                  backgroundColor="$color3"
                  alignItems="center"
                  justifyContent="center"
                >
                  <SizableText size="$8" color="$color6">
                    📷
                  </SizableText>
                  <SizableText size="$2" color="$color8" marginTop="$2">
                    {t('photos')} {idx + 1}
                  </SizableText>
                </YStack>
              ))
            ) : (
              <YStack
                width={SCREEN_WIDTH}
                height={HERO_HEIGHT}
                backgroundColor="$color3"
                alignItems="center"
                justifyContent="center"
              >
                <SizableText size="$10" color="$color6">
                  🏢
                </SizableText>
              </YStack>
            )}
          </ScrollView>

          {/* Page Dots */}
          {images.length > 1 && (
            <XStack
              position="absolute"
              bottom="$3"
              alignSelf="center"
              gap="$1.5"
            >
              {images.map((_, idx) => (
                <Circle
                  key={idx}
                  size={6}
                  backgroundColor={idx === currentImageIdx ? '$color9' : '$color1/60'}
                />
              ))}
            </XStack>
          )}

          {/* Gradient overlay at bottom of hero */}
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            height={80}
            backgroundColor="transparent"
            pointerEvents="none"
          />
        </YStack>

        {/* ── Content ─────────────────────────────────────────────── */}
        <YStack
          paddingHorizontal="$4"
          paddingTop="$4"
          gap="$4"
          backgroundColor="$color1"
        >
          {/* Name + Category + Rating */}
          <YStack gap="$2">
            <H2 color="$color12">{establishment.name}</H2>

            <XStack gap="$2" flexWrap="wrap" alignItems="center">
              <Badge variant="info">
                {t(establishment.category_id) || establishment.category_id}
              </Badge>
              {priceStr ? (
                <SizableText size="$3" color="$color9" fontWeight="600">
                  {priceStr}
                </SizableText>
              ) : null}
            </XStack>

            <XStack gap="$2" alignItems="center">
              <Stars rating={establishment.rating} size={16} />
              <SizableText size="$3" color="$color11" fontWeight="600">
                {establishment.rating.toFixed(1)}
              </SizableText>
              <SizableText size="$3" color="$color9">
                ({establishment.review_count} {t('reviews')})
              </SizableText>
            </XStack>
          </YStack>

          <Separator />

          {/* Description */}
          <YStack gap="$2">
            <H4 color="$color12">{t('description')}</H4>
            <Paragraph color="$color10" size="$4" lineHeight={22}>
              {getLocalizedField(establishment, 'description', locale)}
            </Paragraph>
          </YStack>

          {/* Features */}
          {features.length > 0 && (
            <YStack gap="$2">
              <H4 color="$color12">{t('features')}</H4>
              <XStack gap="$2" flexWrap="wrap">
                {features.map((feat) => (
                  <Chip key={feat} variant="outline" size="$3">
                    <XStack gap="$1.5" alignItems="center">
                      {FEATURE_ICONS[feat.toLowerCase()] ?? (
                        <Star size={14} color="$color9" />
                      )}
                      <SizableText size="$2" color="$color11" textTransform="capitalize">
                        {feat}
                      </SizableText>
                    </XStack>
                  </Chip>
                ))}
              </XStack>
            </YStack>
          )}

          <Separator />

          {/* Address */}
          {establishment.address ? (
            <XStack gap="$3" alignItems="flex-start">
              <Circle size={36} backgroundColor="$color3">
                <MapPin size={18} color="$color9" />
              </Circle>
              <YStack flex={1} gap="$0.5">
                <SizableText size="$3" color="$color11" fontWeight="600">
                  {t('address')}
                </SizableText>
                <Paragraph color="$color10" size="$3">
                  {establishment.address}
                  {establishment.city ? `, ${getLocalizedField(establishment, 'city', locale)}` : ''}
                </Paragraph>
              </YStack>
            </XStack>
          ) : null}

          {/* Phone */}
          {establishment.phone ? (
            <XStack gap="$3" alignItems="center">
              <Circle size={36} backgroundColor="$color3">
                <Phone size={18} color="$color9" />
              </Circle>
              <YStack flex={1} gap="$0.5">
                <SizableText size="$3" color="$color11" fontWeight="600">
                  {t('phone')}
                </SizableText>
                <SizableText size="$3" color="$color10">
                  {establishment.phone}
                </SizableText>
              </YStack>
            </XStack>
          ) : null}

          {/* Website */}
          {establishment.website ? (
            <XStack gap="$3" alignItems="center">
              <Circle size={36} backgroundColor="$color3">
                <MapPin size={18} color="$color9" />
              </Circle>
              <YStack flex={1} gap="$0.5">
                <SizableText size="$3" color="$color11" fontWeight="600">
                  {t('website')}
                </SizableText>
                <SizableText size="$3" color="$color10">
                  {establishment.website}
                </SizableText>
              </YStack>
            </XStack>
          ) : null}

          <Separator />

          {/* Hours */}
          {establishment.hours ? (
            <YStack gap="$2">
              <XStack gap="$2" alignItems="center">
                <Clock size={18} color="$color9" />
                <H4 color="$color12">{t('hours')}</H4>
              </XStack>
              <Paragraph color="$color10" size="$3" whiteSpace="pre-line">
                {establishment.hours}
              </Paragraph>
            </YStack>
          ) : null}

          <Separator />

          {/* Reviews Preview */}
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <H4 color="$color12">
                {t('reviews')} ({establishment.review_count})
              </H4>
              {topReviews.length > 0 && (
                <Link href={`/reviews/${id}`} asChild>
                  <XStack gap="$1" alignItems="center">
                    <SizableText size="$3" color="$color9" fontWeight="600">
                      {t('view_all')}
                    </SizableText>
                    <ChevronRight size={16} color="$color9" />
                  </XStack>
                </Link>
              )}
            </XStack>

            {topReviews.length === 0 ? (
              <Paragraph color="$color9" size="$3">
                {t('no_results')}
              </Paragraph>
            ) : (
              topReviews.map((review) => (
                <Card key={review.id} backgroundColor="$color2" padding="$3" borderRadius="$3">
                  <YStack gap="$2">
                    <XStack justifyContent="space-between" alignItems="center">
                      <XStack gap="$2" alignItems="center">
                        <Circle size={32} backgroundColor="$color3">
                          <SizableText size="$3" color="$color10" fontWeight="700">
                            U
                          </SizableText>
                        </Circle>
                        <SizableText size="$3" color="$color11" fontWeight="600">
                          {t('client')}
                        </SizableText>
                      </XStack>
                      <Stars rating={review.rating} size={12} />
                    </XStack>
                    {review.comment ? (
                      <Paragraph color="$color10" size="$3" lineHeight={20} numberOfLines={3}>
                        {review.comment}
                      </Paragraph>
                    ) : null}
                    <SizableText size="$2" color="$color9">
                      {new Date(review.created_at).toLocaleDateString()}
                    </SizableText>
                  </YStack>
                </Card>
              ))
            )}
          </YStack>

          {/* Bottom spacer for sticky bar */}
          <YStack height={100} />
        </YStack>
      </ScrollView>

      {/* ── Floating Back Button ────────────────────────────────────── */}
      <XStack
        position="absolute"
        top={Platform.OS === 'ios' ? 60 : 40}
        left="$4"
        gap="$3"
      >
        <Pressable onPress={() => router.back()}>
          <Circle
            size={40}
            backgroundColor="$color1/80"
            borderWidth={1}
            borderColor="$color4"
            elevation={4}
          >
            <ArrowLeft size={20} color="$color12" />
          </Circle>
        </Pressable>
      </XStack>

      {/* ── Floating Favorite Button ────────────────────────────────── */}
      <XStack
        position="absolute"
        top={Platform.OS === 'ios' ? 60 : 40}
        right="$4"
      >
        <Pressable onPress={handleToggleFav}>
          <Circle
            size={40}
            backgroundColor="$color1/80"
            borderWidth={1}
            borderColor="$color4"
            elevation={4}
          >
            <Heart
              size={20}
              color={isFav ? '$red9' : '$color12'}
              fill={isFav ? '$red9' : 'none'}
            />
          </Circle>
        </Pressable>
      </XStack>

      {/* ── Sticky Bottom Bar ──────────────────────────────────────── */}
      <YStack
        backgroundColor="$color1"
        borderTopWidth={1}
        borderTopColor="$color4"
        padding="$4"
        paddingBottom={Platform.OS === 'ios' ? '$6' : '$4'}
        gap="$3"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <YStack gap="$0.5">
            <SizableText size="$2" color="$color9">
              {t('from_price')}
            </SizableText>
            <XStack gap="$1" alignItems="baseline">
              <SizableText size="$6" color="$color12" fontWeight="700">
                {priceStr}
              </SizableText>
              <SizableText size="$3" color="$color10">
                / {t('per_person')}
              </SizableText>
            </XStack>
          </YStack>
          <Button
            theme="active"
            size="$5"
            onPress={() => router.push(`/reservation/${id}`)}
            paddingHorizontal="$6"
          >
            {t('book_now')}
          </Button>
        </XStack>
      </YStack>
    </YStack>
  )
}
