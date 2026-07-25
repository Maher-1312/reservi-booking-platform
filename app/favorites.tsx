import { useCallback } from 'react'
import { router } from 'expo-router'
import { Image } from 'react-native'
import {
  YStack,
  XStack,
  ScrollView,
  Button,
  Card,
  SizableText,
  H3,
  Paragraph,
  Spinner,
  toast,
  EmptyState,
  AppHeader,
} from '@blinkdotnew/mobile-ui'
import { ArrowLeft, Heart, Star } from '@blinkdotnew/mobile-ui'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites, useToggleFavorite, useEstablishment } from '@/hooks/useDatabase'
import { useTranslation } from '@/i18n'
import { getLocalizedName, parseImages } from '@/lib/helpers'
import type { Favorite } from '@/types'

export default function FavoritesScreen() {
  const { t, locale } = useTranslation()
  const { user } = useAuth()

  const {
    data: favorites,
    isLoading,
    isError,
  } = useFavorites(user?.id)

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
        <Spinner size="large" color="$color9" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$color1">
      <AppHeader
        title={t('favorites')}
        variant="back"
        onBack={() => router.back()}
      />

      {isError || !favorites || favorites.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
          <EmptyState
            title={t('empty_favorites')}
            description={
              favorites?.length === 0
                ? 'Start exploring and save your favorite places!'
                : t('retry')
            }
            icon={<Heart size={48} color="$color9" />}
            action={
              <Button
                theme="active"
                size="$5"
                onPress={() => router.back()}
                marginTop="$4"
              >
                {t('discover')}
              </Button>
            }
          />
        </YStack>
      ) : (
        <ScrollView flex={1} contentContainerStyle={{ padding: '$4' }}>
          <YStack gap="$3">
            {favorites.map((fav) => (
              <FavoriteRow
                key={fav.id}
                favorite={fav}
                userId={user!.id}
                locale={locale}
                t={t}
              />
            ))}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  )
}

// ─── FavoriteRow (fetches establishment data per row) ────────────────────────

function FavoriteRow({
  favorite,
  userId,
  locale,
  t,
}: {
  favorite: Favorite
  userId: string
  locale: string
  t: (key: string) => string
}) {
  const { data: establishment, isLoading } = useEstablishment(favorite.establishment_id)
  const toggleFavorite = useToggleFavorite()

  const handleUnfavorite = useCallback(() => {
    toggleFavorite.mutate(
      { establishmentId: favorite.establishment_id, userId },
      {
        onSuccess: (result) => {
          if (result.action === 'removed') {
            toast(t('remove_from_favorites'), {
              variant: 'success',
            })
          }
        },
      },
    )
  }, [favorite.establishment_id, userId, toggleFavorite, t])

  const handlePress = useCallback(() => {
    router.push(`/detail/${favorite.establishment_id}`)
  }, [favorite.establishment_id])

  if (isLoading || !establishment) {
    return (
      <Card backgroundColor="$color2" borderRadius="$4" padding="$4">
        <XStack alignItems="center" justifyContent="center" height={60}>
          <Spinner size="small" color="$color9" />
        </XStack>
      </Card>
    )
  }

  const images = parseImages(establishment.images)
  const imageUri = images.length > 0 ? images[0] : undefined
  const name = getLocalizedName(establishment, locale)
  const city = getLocalizedName(
    { name: establishment.city, name_fr: establishment.city_fr, name_ar: establishment.city_ar },
    locale,
  )

  return (
    <Card
      backgroundColor="$color2"
      borderRadius="$4"
      bordered
      pressStyle={{ scale: 0.98 }}
      onPress={handlePress}
    >
      <XStack padding="$3" gap="$3" alignItems="center">
        {/* Thumbnail */}
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              backgroundColor: '$color4',
            }}
            resizeMode="cover"
          />
        ) : (
          <YStack
            width={64}
            height={64}
            borderRadius={12}
            backgroundColor="$color4"
            alignItems="center"
            justifyContent="center"
          >
            <SizableText size="$6" color="$color9">
              🏢
            </SizableText>
          </YStack>
        )}

        {/* Info */}
        <YStack flex={1} gap="$1">
          <SizableText size="$4" fontWeight="700" color="$color12" numberOfLines={1}>
            {name}
          </SizableText>
          <SizableText size="$2" color="$color10" numberOfLines={1}>
            {city}
          </SizableText>
          <XStack alignItems="center" gap="$1">
            <Star size={12} color="$color9" fill="$color9" />
            <SizableText size="$2" color="$color9" fontWeight="600">
              {establishment.rating.toFixed(1)}
            </SizableText>
            <SizableText size="$2" color="$color10">
              ({establishment.review_count})
            </SizableText>
          </XStack>
        </YStack>

        {/* Unfavorite button */}
        <Button
          chromeless
          size="$3"
          onPress={handleUnfavorite}
          icon={<Heart size={20} color="$red9" fill="$red9" />}
          pressStyle={{ scale: 1.2 }}
        />
      </XStack>
    </Card>
  )
}
