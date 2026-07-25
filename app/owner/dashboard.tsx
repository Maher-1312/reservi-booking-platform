import { useCallback, useMemo, useState } from 'react'
import { RefreshControl } from 'react-native'
import { router } from 'expo-router'
import {
  YStack,
  XStack,
  ScrollView,
  Card,
  Button,
  Paragraph,
  H3,
  H4,
  SizableText,
  FloatingActionButton,
  Spinner,
  Badge,
  EmptyState,
  AppHeader,
  Divider,
  Separator,
  toast,
} from '@blinkdotnew/mobile-ui'
import {
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Star,
  Store,
  BarChart3,
  ChevronRight,
} from '@blinkdotnew/mobile-ui'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/i18n'
import {
  useOwnerEstablishments,
  useReservations,
} from '@/hooks/useDatabase'
import { parseImages } from '@/lib/helpers'
import type { Establishment } from '@/types'

// ─── Stat card helper ─────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: string
}) {
  return (
    <Card
      flex={1}
      elevation={3}
      bordered
      borderLeftWidth={3}
      borderLeftColor={accent}
      padding="$3"
      backgroundColor="$color2"
      minWidth={140}
    >
      <XStack gap="$2" alignItems="center">
        {icon}
        <SizableText size="$1" color="$color10" textTransform="uppercase">
          {label}
        </SizableText>
      </XStack>
      <SizableText size="$7" fontWeight="800" color="$color12" marginTop="$1">
        {value}
      </SizableText>
    </Card>
  )
}

// ─── Feature chip colors ─────────────────────────────────────────────────────

const FEATURE_COLORS: Record<string, string> = {
  WiFi: '#3B82F6',
  Parking: '#10B981',
  Terrace: '#F59E0B',
  AC: '#8B5CF6',
  Delivery: '#EF4444',
  Takeaway: '#EC4899',
  Pets: '#6366F1',
  Kids: '#14B8A6',
  Music: '#F97316',
  Outdoor: '#22C55E',
}

// ─── Status variant map ──────────────────────────────────────────────────────

function statusVariant(status: string): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'error'
    case 'completed':
      return 'info'
    default:
      return 'info'
  }
}

// ─── Dashboard Screen ────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  const { user, isAuthenticated, userType, setUserType } = useAuth()
  const { t } = useTranslation()
  const ownerId = user?.id

  const {
    data: establishments,
    isLoading: loadingEst,
    refetch: refetchEst,
  } = useOwnerEstablishments(ownerId)

  const {
    data: reservations,
    isLoading: loadingRes,
    refetch: refetchRes,
  } = useReservations(ownerId)

  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetchEst(), refetchRes()])
    setRefreshing(false)
  }, [refetchEst, refetchRes])

  // ── Computed stats ─────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const ests = establishments ?? []
    const resvs = reservations ?? []

    const totalReservations = resvs.length
    const revenue = resvs
      .filter((r) => r.status === 'confirmed' && r.payment_status === 'paid')
      .reduce((sum, r) => sum + (r.amount || 0), 0)
    const confirmed = resvs.filter((r) => r.status === 'confirmed').length
    const occupancy =
      resvs.length > 0 ? Math.round((confirmed / resvs.length) * 100) : 0
    const avgRating =
      ests.length > 0
        ? (
            ests.reduce((sum, e) => sum + (e.rating || 0), 0) / ests.length
          ).toFixed(1)
        : '0.0'

    return { totalReservations, revenue, occupancy, avgRating }
  }, [establishments, reservations])

  const recentReservations = useMemo(() => {
    return (reservations ?? []).slice(0, 5)
  }, [reservations])

  // ── Not owner prompt ───────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center" padding="$5">
        <EmptyState
          icon={<Store size={48} color="$color9" />}
          title={t('dashboard')}
          description={t('sign_in')}
          action={{
            label: t('sign_in'),
            onPress: () => router.replace('/'),
          }}
        />
      </YStack>
    )
  }

  if (userType !== 'owner') {
    return (
      <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center" padding="$5" gap="$4">
        <Store size={64} color="$color9" />
        <H3 textAlign="center" color="$color12">
          {t('dashboard')}
        </H3>
        <Paragraph textAlign="center" color="$color10">
          {t('switch_to_owner_mode')}
        </Paragraph>
        <Button
          theme="active"
          onPress={() => {
            setUserType('owner')
            toast(t('dashboard'), { message: t('switch_to_owner_mode'), variant: 'success' })
          }}
        >
          {t('switch_to_owner_mode')}
        </Button>
      </YStack>
    )
  }

  // ── Main dashboard ─────────────────────────────────────────────────────────

  return (
    <YStack flex={1} backgroundColor="$color1">
      <AppHeader title={t('dashboard')} />
      <ScrollView
        flex={1}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {/* ── Stats Row ─────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
            gap: 10,
          }}
        >
          <StatCard
            icon={<Calendar size={14} color="#3B82F6" />}
            label={t('total_reservations')}
            value={String(stats.totalReservations)}
            accent="#3B82F6"
          />
          <StatCard
            icon={<DollarSign size={14} color="#10B981" />}
            label={t('revenue')}
            value={`$${stats.revenue.toLocaleString()}`}
            accent="#10B981"
          />
          <StatCard
            icon={<TrendingUp size={14} color="#F59E0B" />}
            label={t('occupancy_rate')}
            value={`${stats.occupancy}%`}
            accent="#F59E0B"
          />
          <StatCard
            icon={<Star size={14} color="#EC4899" />}
            label={t('avg_rating')}
            value={stats.avgRating}
            accent="#EC4899"
          />
        </ScrollView>

        {/* ── My Establishments ─────────────────────────────────────────── */}
        <YStack paddingHorizontal="$4" paddingTop="$4" gap="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <H4 color="$color12">{t('my_establishments')}</H4>
            <Button
              chromeless
              size="$3"
              iconAfter={<BarChart3 size={14} />}
              onPress={() => router.push('/owner/stats')}
            >
              <SizableText size="$2" color="$color9">
                {t('view_stats')}
              </SizableText>
            </Button>
          </XStack>

          {loadingEst ? (
            <YStack padding="$8" alignItems="center">
              <Spinner />
            </YStack>
          ) : establishments && establishments.length > 0 ? (
            establishments.map((est: Establishment) => {
              const imgs = parseImages(est.images)
              const features = (() => {
                try {
                  return JSON.parse(est.features ?? '[]') as string[]
                } catch {
                  return []
                }
              })()
              return (
                <Card
                  key={est.id}
                  elevation={3}
                  bordered
                  backgroundColor="$color2"
                  pressTheme
                  onPress={() => router.push(`/owner/manage/${est.id}`)}
                >
                  <XStack gap="$3" padding="$3">
                    {/* Image placeholder */}
                    <YStack
                      width={72}
                      height={72}
                      borderRadius="$3"
                      backgroundColor="$color4"
                      justifyContent="center"
                      alignItems="center"
                      overflow="hidden"
                    >
                      {imgs.length > 0 ? (
                        <SizableText size="$5">🏢</SizableText>
                      ) : (
                        <Store size={28} color="$color9" />
                      )}
                    </YStack>

                    <YStack flex={1} gap="$1">
                      <SizableText size="$4" fontWeight="700" color="$color12" numberOfLines={1}>
                        {est.name}
                      </SizableText>
                      <Badge variant={est.status === 'active' ? 'success' : 'warning'}>
                        {est.status}
                      </Badge>
                      {features.length > 0 && (
                        <XStack gap="$1" flexWrap="wrap" marginTop="$1">
                          {features.slice(0, 3).map((feat) => (
                            <Badge key={feat} variant="info">
                              {feat}
                            </Badge>
                          ))}
                          {features.length > 3 && (
                            <SizableText size="$1" color="$color9">
                              +{features.length - 3}
                            </SizableText>
                          )}
                        </XStack>
                      )}
                    </YStack>
                    <ChevronRight size={18} color="$color9" alignSelf="center" />
                  </XStack>
                </Card>
              )
            })
          ) : (
            <Card elevation={2} backgroundColor="$color2" padding="$6" alignItems="center" gap="$3">
              <Store size={40} color="$color9" />
              <Paragraph color="$color10" textAlign="center">
                {t('no_establishments')}
              </Paragraph>
            </Card>
          )}
        </YStack>

        <Separator marginVertical="$4" />

        {/* ── Recent Reservations ───────────────────────────────────────── */}
        <YStack paddingHorizontal="$4" paddingBottom="$8" gap="$3">
          <H4 color="$color12">{t('recent_reservations')}</H4>
          {loadingRes ? (
            <YStack padding="$8" alignItems="center">
              <Spinner />
            </YStack>
          ) : recentReservations.length > 0 ? (
            recentReservations.map((r) => (
              <Card
                key={r.id}
                elevation={2}
                backgroundColor="$color2"
                padding="$3"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack gap="$1" flex={1}>
                    <SizableText size="$3" fontWeight="600" color="$color12">
                      {r.date} · {r.time}
                    </SizableText>
                    <SizableText size="$2" color="$color10">
                      {r.guests} {t('guests').toLowerCase()} {r.service ? `· ${r.service}` : ''}
                    </SizableText>
                  </YStack>
                  <YStack alignItems="flex-end" gap="$1">
                    <Badge variant={statusVariant(r.status)}>
                      {r.status}
                    </Badge>
                    {r.amount > 0 && (
                      <SizableText size="$2" color="$color10">
                        ${r.amount.toFixed(2)}
                      </SizableText>
                    )}
                  </YStack>
                </XStack>
              </Card>
            ))
          ) : (
            <Paragraph color="$color10">{t('no_reservations_yet')}</Paragraph>
          )}
        </YStack>
      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      <FloatingActionButton
        icon={<Plus size={24} color="white" />}
        onPress={() => router.push('/owner/create')}
      />
    </YStack>
  )
}
