import { useCallback } from 'react'
import { useRouter } from 'expo-router'
import {
  YStack,
  XStack,
  ScrollView,
  Card,
  Button,
  H2,
  H4,
  Paragraph,
  SizableText,
  Input,
  Spinner,
  AppHeader,
  Chip,
} from '@blinkdotnew/mobile-ui'
import { Image } from 'expo-image'
import { Home, Star, MapPin, Globe } from '@blinkdotnew/mobile-ui'
import { useCategories, useEstablishments } from '@/hooks/useDatabase'
import { useTranslation } from '@/i18n'
import { getLocalizedName, parseImages } from '@/lib/helpers'
import type { Category, Establishment } from '@/types'

export default function HomeScreen() {
  const router = useRouter()
  const { t, locale, setLocale } = useTranslation()

  const { data: categories, isLoading: catLoading } = useCategories()
  const { data: establishments, isLoading: estLoading } = useEstablishments()

  const cycleLocale = useCallback(() => {
    const next: Record<string, 'fr' | 'en' | 'ar'> = { fr: 'en', en: 'ar', ar: 'fr' }
    setLocale(next[locale])
  }, [locale, setLocale])

  const popular = establishments?.slice(0, 10) ?? []
  const nearYou = establishments ?? []

  const navigateToDetail = (id: string) => {
    router.push(`/detail/${id}`)
  }

  const getCategoryById = (id: string): Category | undefined =>
    categories?.find((c) => c.id === id)

  return (
    <YStack flex={1} backgroundColor="$color1">
      <AppHeader
        title={t('app_name')}
        variant="default"
        right={<Button chromeless onPress={cycleLocale}><Globe size={20} color="$color9" /></Button>}
      />

      <ScrollView
        flex={1}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Search Bar ─── */}
        <XStack paddingHorizontal="$4" paddingTop="$2" paddingBottom="$3">
          <Input
            flex={1}
            placeholder={t('search_placeholder')}
            size="$4"
            backgroundColor="$color2"
            borderWidth={0}
            borderRadius="$4"
            onPress={() => router.push('/(tabs)/search')}
            readOnly
          />
        </XStack>

        {/* ─── Categories ─── */}
        <YStack gap="$3" paddingBottom="$4">
          <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center">
            <H4 color="$color12">{t('categories')}</H4>
          </XStack>

          {catLoading ? (
            <XStack paddingHorizontal="$4" gap="$3">
              {Array.from({ length: 6 }).map((_, i) => (
                <YStack
                  key={i}
                  width={80}
                  height={88}
                  backgroundColor="$color2"
                  borderRadius="$4"
                />
              ))}
            </XStack>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {categories?.map((cat) => (
                <YStack
                  key={cat.id}
                  alignItems="center"
                  gap="$2"
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/search',
                      params: { categoryId: cat.id },
                    })
                  }
                  cursor="pointer"
                >
                  <YStack
                    width={56}
                    height={56}
                    borderRadius="$4"
                    backgroundColor={cat.color}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <SizableText size="$7">{cat.icon}</SizableText>
                  </YStack>
                  <Paragraph
                    size="$1"
                    color="$color10"
                    textAlign="center"
                    maxWidth={72}
                    numberOfLines={2}
                  >
                    {getLocalizedName(cat, locale)}
                  </Paragraph>
                </YStack>
              ))}
            </ScrollView>
          )}
        </YStack>

        {/* ─── Popular ─── */}
        <YStack gap="$3" paddingBottom="$4">
          <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center">
            <H4 color="$color12">{t('popular')}</H4>
            <Button chromeless onPress={() => router.push('/(tabs)/search')}>
              <Paragraph color="$color9" size="$2">{t('view_all')}</Paragraph>
            </Button>
          </XStack>

          {estLoading ? (
            <XStack paddingHorizontal="$4" gap="$3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} width={220} height={200} backgroundColor="$color2" elevation={2} />
              ))}
            </XStack>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {popular.map((est) => {
                const images = parseImages(est.images)
                const cat = getCategoryById(est.category_id)
                return (
                  <EstablishmentCard
                    key={est.id}
                    establishment={est}
                    category={cat}
                    locale={locale}
                    horizontal
                    onPress={() => navigateToDetail(est.id)}
                  />
                )
              })}
            </ScrollView>
          )}
        </YStack>

        {/* ─── Near You ─── */}
        <YStack gap="$3">
          <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center">
            <H4 color="$color12">{t('near_you')}</H4>
          </XStack>

          {estLoading ? (
            <YStack paddingHorizontal="$4" gap="$3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} height={100} backgroundColor="$color2" elevation={2} />
              ))}
            </YStack>
          ) : (
            <YStack paddingHorizontal="$4" gap="$3">
              {nearYou.map((est) => {
                const images = parseImages(est.images)
                const cat = getCategoryById(est.category_id)
                return (
                  <EstablishmentCard
                    key={est.id}
                    establishment={est}
                    category={cat}
                    locale={locale}
                    horizontal={false}
                    onPress={() => navigateToDetail(est.id)}
                  />
                )
              })}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}

// ─── Establishment Card ──────────────────────────────────────────────────────

function EstablishmentCard({
  establishment,
  category,
  locale,
  horizontal,
  onPress,
}: {
  establishment: Establishment
  category: Category | undefined
  locale: string
  horizontal: boolean
  onPress: () => void
}) {
  const images = parseImages(establishment.images)
  const imageUrl = images[0] ?? ''

  const cityName = getLocalizedName(
    { name: establishment.city, name_fr: establishment.city_fr, name_ar: establishment.city_ar },
    locale,
  )

  if (horizontal) {
    return (
      <Card
        elevation={3}
        width={220}
        backgroundColor="$color2"
        borderRadius="$4"
        overflow="hidden"
        onPress={onPress}
        cursor="pointer"
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: 120 }}
            contentFit="cover"
          />
        ) : (
          <YStack height={120} backgroundColor="$color3" alignItems="center" justifyContent="center">
            <Home size={32} color="$color8" />
          </YStack>
        )}
        <YStack padding="$3" gap="$1">
          <Paragraph size="$2" fontWeight="700" color="$color12" numberOfLines={1}>
            {getLocalizedName(establishment, locale)}
          </Paragraph>
          {category && (
            <Paragraph size="$1" color="$color9" numberOfLines={1}>
              {getLocalizedName(category, locale)}
            </Paragraph>
          )}
          <XStack alignItems="center" gap="$1">
            <Star size={12} color="#f59e0b" />
            <Paragraph size="$1" color="$color10">
              {establishment.rating.toFixed(1)} ({establishment.review_count})
            </Paragraph>
          </XStack>
        </YStack>
      </Card>
    )
  }

  return (
    <Card
      elevation={2}
      backgroundColor="$color2"
      borderRadius="$4"
      overflow="hidden"
      onPress={onPress}
      cursor="pointer"
    >
      <XStack>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 100, height: 100 }}
            contentFit="cover"
          />
        ) : (
          <YStack width={100} height={100} backgroundColor="$color3" alignItems="center" justifyContent="center">
            <Home size={24} color="$color8" />
          </YStack>
        )}
        <YStack flex={1} padding="$3" justifyContent="center" gap="$1">
          <Paragraph size="$3" fontWeight="700" color="$color12" numberOfLines={1}>
            {getLocalizedName(establishment, locale)}
          </Paragraph>
          {category && (
            <Paragraph size="$1" color="$color9">
              {getLocalizedName(category, locale)}
            </Paragraph>
          )}
          <XStack alignItems="center" gap="$2">
            <XStack alignItems="center" gap="$1">
              <Star size={12} color="#f59e0b" />
              <Paragraph size="$1" color="$color10">
                {establishment.rating.toFixed(1)}
              </Paragraph>
            </XStack>
            <XStack alignItems="center" gap="$1">
              <MapPin size={10} color="$color10" />
              <Paragraph size="$1" color="$color10" numberOfLines={1}>
                {cityName}
              </Paragraph>
            </XStack>
          </XStack>
        </YStack>
      </XStack>
    </Card>
  )
}
