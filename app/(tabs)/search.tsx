import { useState, useCallback } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import {
  YStack,
  XStack,
  ScrollView,
  Card,
  Input,
  Paragraph,
  SizableText,
  EmptyState,
  Spinner,
  AppHeader,
} from '@blinkdotnew/mobile-ui'
import { Image } from 'expo-image'
import { X, Star, MapPin, Search } from '@blinkdotnew/mobile-ui'
import { useSearchEstablishments, useCategories } from '@/hooks/useDatabase'
import { useTranslation } from '@/i18n'
import { getLocalizedName, parseImages } from '@/lib/helpers'
import type { Category } from '@/types'

export default function SearchScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ categoryId?: string }>()
  const { t, locale } = useTranslation()

  const [query, setQuery] = useState('')
  const categoryId = params.categoryId

  const { data: results, isLoading } = useSearchEstablishments(query, categoryId)
  const { data: categories } = useCategories()

  const getCategoryById = useCallback(
    (id: string): Category | undefined => categories?.find((c) => c.id === id),
    [categories],
  )

  const handleClear = () => setQuery('')

  const hasQuery = query.length > 0
  const showResults = hasQuery && results !== undefined
  const showEmpty = hasQuery && !isLoading && results?.length === 0
  const showInitial = !hasQuery

  return (
    <YStack flex={1} backgroundColor="$color1">
      <AppHeader
        title={t('search')}
        variant="default"
        right={
          hasQuery ? (
            <XStack onPress={handleClear} cursor="pointer">
              <X size={18} color="$color10" />
            </XStack>
          ) : undefined
        }
      />

      <YStack paddingHorizontal="$4" paddingBottom="$3">
        <Input
          placeholder={t('search_placeholder')}
          value={query}
          onChangeText={setQuery}
          size="$4"
          backgroundColor="$color2"
          borderWidth={0}
          borderRadius="$4"
          autoFocus
        />
      </YStack>

      <ScrollView
        flex={1}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading */}
        {isLoading && (
          <YStack padding="$8" alignItems="center" gap="$3">
            <Spinner size="large" color="$color9" />
            <Paragraph color="$color10">{t('loading')}</Paragraph>
          </YStack>
        )}

        {/* Empty state */}
        {showEmpty && (
          <YStack padding="$8">
            <EmptyState
              icon={<Search size={48} color="$color8" />}
              title={getLocalizedName(
                { name: t('no_results'), name_fr: t('no_results'), name_ar: t('no_results') },
                locale,
              )}
            />
          </YStack>
        )}

        {/* Initial — show categories maybe */}
        {showInitial && (
          <YStack paddingHorizontal="$4" paddingTop="$4" gap="$3">
            {categories?.map((cat) => (
              <Card
                key={cat.id}
                elevation={2}
                backgroundColor="$color2"
                borderRadius="$4"
                onPress={() => router.setParams({ categoryId: cat.id })}
                cursor="pointer"
              >
                <XStack padding="$3" alignItems="center" gap="$3">
                  <YStack
                    width={44}
                    height={44}
                    borderRadius="$3"
                    backgroundColor={cat.color}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <SizableText size="$6">{cat.icon}</SizableText>
                  </YStack>
                  <Paragraph color="$color12" size="$3" fontWeight="600">
                    {getLocalizedName(cat, locale)}
                  </Paragraph>
                </XStack>
              </Card>
            ))}
          </YStack>
        )}

        {/* Results */}
        {showResults && (
          <YStack paddingHorizontal="$4" paddingTop="$4" gap="$3">
            <Paragraph size="$2" color="$color10">
              {results.length} {locale === 'fr' ? 'résultats' : locale === 'ar' ? 'نتائج' : 'results'}
            </Paragraph>
            {results.map((est) => {
              const images = parseImages(est.images)
              const cat = getCategoryById(est.category_id)
              const cityName = getLocalizedName(
                {
                  name: est.city,
                  name_fr: est.city_fr,
                  name_ar: est.city_ar,
                },
                locale,
              )
              return (
                <Card
                  key={est.id}
                  elevation={2}
                  backgroundColor="$color2"
                  borderRadius="$4"
                  overflow="hidden"
                  onPress={() => router.push(`/detail/${est.id}`)}
                  cursor="pointer"
                >
                  <XStack>
                    {images[0] ? (
                      <Image
                        source={{ uri: images[0] }}
                        style={{ width: 80, height: 80 }}
                        contentFit="cover"
                      />
                    ) : (
                      <YStack
                        width={80}
                        height={80}
                        backgroundColor="$color3"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Search size={20} color="$color8" />
                      </YStack>
                    )}
                    <YStack flex={1} padding="$3" justifyContent="center" gap="$1">
                      <Paragraph size="$3" fontWeight="700" color="$color12" numberOfLines={1}>
                        {getLocalizedName(est, locale)}
                      </Paragraph>
                      {cat && (
                        <Paragraph size="$1" color="$color9">
                          {getLocalizedName(cat, locale)}
                        </Paragraph>
                      )}
                      <XStack alignItems="center" gap="$2">
                        <XStack alignItems="center" gap="$1">
                          <Star size={12} color="#f59e0b" />
                          <Paragraph size="$1" color="$color10">
                            {est.rating.toFixed(1)}
                          </Paragraph>
                        </XStack>
                        {cityName && (
                          <XStack alignItems="center" gap="$1">
                            <MapPin size={10} color="$color10" />
                            <Paragraph size="$1" color="$color10" numberOfLines={1}>
                              {cityName}
                            </Paragraph>
                          </XStack>
                        )}
                      </XStack>
                    </YStack>
                  </XStack>
                </Card>
              )
            })}
          </YStack>
        )}
      </ScrollView>
    </YStack>
  )
}
