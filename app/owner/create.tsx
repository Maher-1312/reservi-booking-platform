import { useState, useMemo, useCallback, useEffect } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import {
  YStack,
  XStack,
  ScrollView,
  Card,
  Button,
  Input,
  SizableText,
  H3,
  H4,
  Label,
  Chip,
  Spinner,
  AppHeader,
  toast,
} from '@blinkdotnew/mobile-ui'
import { Save, ArrowLeft } from '@blinkdotnew/mobile-ui'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/i18n'
import {
  useCategories,
  useOwnerEstablishments,
  useCreateEstablishment,
  useUpdateEstablishment,
  useEstablishment,
} from '@/hooks/useDatabase'
import type { Category, Establishment } from '@/types'

// ─── Predefined feature list ──────────────────────────────────────────────────

const AVAILABLE_FEATURES = [
  'WiFi',
  'Parking',
  'Terrace',
  'AC',
  'Delivery',
  'Takeaway',
  'Pets Allowed',
  'Kids Friendly',
  'Music',
  'Outdoor Seating',
  'Wheelchair Access',
  'Free Wi-Fi',
  'TV',
  'Private Room',
  'Smoking Area',
]

const PRICE_LEVELS = [1, 2, 3, 4]

// ─── Create / Edit Form ──────────────────────────────────────────────────────

export default function CreateEstablishmentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const isEdit = !!id
  const { user } = useAuth()
  const { t } = useTranslation()

  const { data: categories } = useCategories()
  const { data: existing } = useEstablishment(id ?? '')
  const createMutation = useCreateEstablishment()
  const updateMutation = useUpdateEstablishment()
  const { refetch } = useOwnerEstablishments(user?.id)

  // ── Form state ─────────────────────────────────────────────────────────────

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [hours, setHours] = useState('')
  const [priceLevel, setPriceLevel] = useState(1)
  const [features, setFeatures] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // ── Pre-fill on edit ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!isEdit || !existing) return
    const e = existing as Establishment
    setName(e.name ?? '')
    setDescription(e.description ?? '')
    setCategoryId(e.category_id ?? '')
    setAddress(e.address ?? '')
    setCity(e.city ?? '')
    setPhone(e.phone ?? '')
    setWebsite(e.website ?? '')
    setHours(e.hours ?? '')
    setPriceLevel(e.price_level ?? 1)
    try {
      setFeatures(JSON.parse(e.features ?? '[]'))
    } catch {
      setFeatures([])
    }
  }, [isEdit, existing])

  // ── Toggle feature ─────────────────────────────────────────────────────────

  const toggleFeature = useCallback((feat: string) => {
    setFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat],
    )
  }, [])

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !categoryId) {
      toast(t('error'), { message: t('form_required'), variant: 'error' })
      return
    }
    if (!user?.id) return

    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        description_fr: description.trim(),
        description_ar: description.trim(),
        category_id: categoryId,
        address: address.trim(),
        city: city.trim(),
        city_fr: city.trim(),
        city_ar: city.trim(),
        phone: phone.trim(),
        website: website.trim(),
        hours: hours.trim(),
        price_level: priceLevel,
        images: '[]',
        features: JSON.stringify(features),
        owner_id: user.id,
        status: 'active',
        rating: 0,
        review_count: 0,
        latitude: 0,
        longitude: 0,
      }

      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, updates: payload })
        toast(t('edit_establishment'), { message: t('establishment_updated'), variant: 'success' })
      } else {
        await createMutation.mutateAsync(payload)
        toast(t('create_establishment'), { message: t('establishment_created'), variant: 'success' })
      }
      refetch()
      router.back()
    } catch {
      toast(t('error'), { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }, [
    name, description, categoryId, address, city, phone, website,
    hours, priceLevel, features, user, isEdit, id,
    createMutation, updateMutation, refetch, t,
  ])

  const isLoading = isEdit && !existing

  return (
    <YStack flex={1} backgroundColor="$color1">
      <AppHeader
        title={isEdit ? t('edit_establishment') : t('create_establishment')}
        variant="back"
        onBack={() => router.back()}
      />
      <ScrollView
        flex={1}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$10">
            <Spinner />
          </YStack>
        ) : (
          <YStack gap="$4">
            {/* ── Name ──────────────────────────────────────────────────── */}
            <YStack gap="$2">
              <Label color="$color12">{t('establishment_name')}</Label>
              <Input
                value={name}
                onChangeText={setName}
                placeholder={t('establishment_name')}
                size="$4"
              />
            </YStack>

            {/* ── Description ───────────────────────────────────────────── */}
            <YStack gap="$2">
              <Label color="$color12">{t('establishment_description')}</Label>
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder={t('establishment_description')}
                multiline
                numberOfLines={4}
                size="$4"
              />
            </YStack>

            {/* ── Category Chips ────────────────────────────────────────── */}
            <YStack gap="$2">
              <Label color="$color12">{t('category')}</Label>
              <XStack flexWrap="wrap" gap="$2">
                {categories?.map((cat: Category) => (
                  <Chip
                    key={cat.id}
                    selected={categoryId === cat.id}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    {cat.name}
                  </Chip>
                ))}
              </XStack>
            </YStack>

            {/* ── Address & City ────────────────────────────────────────── */}
            <XStack gap="$3">
              <YStack flex={1} gap="$2">
                <Label color="$color12">{t('address')}</Label>
                <Input
                  value={address}
                  onChangeText={setAddress}
                  placeholder={t('address')}
                  size="$4"
                />
              </YStack>
              <YStack flex={1} gap="$2">
                <Label color="$color12">{t('city')}</Label>
                <Input
                  value={city}
                  onChangeText={setCity}
                  placeholder={t('city')}
                  size="$4"
                />
              </YStack>
            </XStack>

            {/* ── Phone & Website ───────────────────────────────────────── */}
            <XStack gap="$3">
              <YStack flex={1} gap="$2">
                <Label color="$color12">{t('phone_number')}</Label>
                <Input
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('phone_number')}
                  keyboardType="phone-pad"
                  size="$4"
                />
              </YStack>
              <YStack flex={1} gap="$2">
                <Label color="$color12">{t('website_url')}</Label>
                <Input
                  value={website}
                  onChangeText={setWebsite}
                  placeholder={t('website_url')}
                  keyboardType="url"
                  autoCapitalize="none"
                  size="$4"
                />
              </YStack>
            </XStack>

            {/* ── Hours ─────────────────────────────────────────────────── */}
            <YStack gap="$2">
              <Label color="$color12">{t('opening_hours')}</Label>
              <Input
                value={hours}
                onChangeText={setHours}
                placeholder="e.g. Mon-Fri 9:00-22:00"
                size="$4"
              />
            </YStack>

            {/* ── Price Level ───────────────────────────────────────────── */}
            <YStack gap="$2">
              <Label color="$color12">{t('price_level')}</Label>
              <XStack gap="$2">
                {PRICE_LEVELS.map((lvl) => (
                  <Card
                    key={lvl}
                    flex={1}
                    elevation={priceLevel === lvl ? 4 : 1}
                    backgroundColor={priceLevel === lvl ? '$color5' : '$color2'}
                    borderColor={priceLevel === lvl ? '$color9' : '$color4'}
                    bordered
                    padding="$3"
                    alignItems="center"
                    pressTheme
                    onPress={() => setPriceLevel(lvl)}
                  >
                    <SizableText
                      size="$6"
                      fontWeight="700"
                      color={priceLevel === lvl ? '$color12' : '$color10'}
                    >
                      {'$'.repeat(lvl)}
                    </SizableText>
                  </Card>
                ))}
              </XStack>
            </YStack>

            {/* ── Features ──────────────────────────────────────────────── */}
            <YStack gap="$2">
              <Label color="$color12">{t('features')}</Label>
              <SizableText size="$2" color="$color10" marginBottom="$1">
                {t('select_features')}
              </SizableText>
              <XStack flexWrap="wrap" gap="$2">
                {AVAILABLE_FEATURES.map((feat) => (
                  <Chip
                    key={feat}
                    selected={features.includes(feat)}
                    onPress={() => toggleFeature(feat)}
                  >
                    {feat}
                  </Chip>
                ))}
              </XStack>
            </YStack>

            {/* ── Submit Button ─────────────────────────────────────────── */}
            <Button
              theme="active"
              size="$5"
              marginTop="$4"
              onPress={handleSubmit}
              disabled={submitting || !name.trim() || !categoryId}
              icon={submitting ? <Spinner size="small" /> : <Save size={18} />}
            >
              {submitting
                ? t('loading')
                : isEdit
                  ? t('save')
                  : t('save_establishment')}
            </Button>
          </YStack>
        )}
      </ScrollView>
    </YStack>
  )
}
