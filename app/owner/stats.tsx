import { useMemo } from 'react'
import { router } from 'expo-router'
import {
  YStack,
  XStack,
  ScrollView,
  Card,
  SizableText,
  H3,
  H4,
  Paragraph,
  Spinner,
  Badge,
  AppHeader,
} from '@blinkdotnew/mobile-ui'
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  Store,
  ChevronRight,
} from '@blinkdotnew/mobile-ui'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/i18n'
import { useOwnerEstablishments, useReservations } from '@/hooks/useDatabase'
import type { Establishment, Reservation } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function monthLabel(month: number): string {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return labels[month] ?? ''
}

// ─── Stats Screen ────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const ownerId = user?.id

  const { data: establishments, isLoading: loadingEst } = useOwnerEstablishments(ownerId)
  const { data: reservations, isLoading: loadingRes } = useReservations(ownerId)

  // ── Monthly revenue ────────────────────────────────────────────────────────

  const monthlyRevenue = useMemo(() => {
    const resvs = reservations ?? []
    const now = new Date()
    const months: { label: string; value: number }[] = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const total = resvs
        .filter((r) => {
          if (r.status !== 'confirmed') return false
          const rd = new Date(r.date)
          const rkey = `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, '0')}`
          return rkey === key
        })
        .reduce((sum, r) => sum + (r.amount || 0), 0)
      months.push({ label: monthLabel(d.getMonth()), value: total })
    }
    return months
  }, [reservations])

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value), 1)

  // ── Reservations by day of week ────────────────────────────────────────────

  const reservationsByDay = useMemo(() => {
    const resvs = reservations ?? []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts: { label: string; value: number }[] = dayNames.map((name) => ({
      label: name,
      value: 0,
    }))

    resvs.forEach((r) => {
      const d = new Date(r.date)
      if (!isNaN(d.getTime())) {
        counts[d.getDay()].value++
      }
    })
    return counts
  }, [reservations])

  const maxDayCount = Math.max(...reservationsByDay.map((d) => d.value), 1)

  // ── Top establishments ─────────────────────────────────────────────────────

  const topEstablishments = useMemo(() => {
    const ests = establishments ?? []
    const resvs = reservations ?? []

    return [...ests]
      .map((e) => {
        const count = resvs.filter((r) => r.establishment_id === e.id).length
        return { ...e, resCount: count }
      })
      .sort((a, b) => b.resCount - a.resCount)
      .slice(0, 5)
  }, [establishments, reservations])

  // ── Overall stats ──────────────────────────────────────────────────────────

  const summaryStats = useMemo(() => {
    const resvs = reservations ?? []
    const ests = establishments ?? []
    return {
      totalReservations: resvs.length,
      totalRevenue: resvs
        .filter((r) => r.status === 'confirmed' && r.payment_status === 'paid')
        .reduce((sum, r) => sum + (r.amount || 0), 0),
      totalEstablishments: ests.length,
      avgRating:
        ests.length > 0
          ? (ests.reduce((s, e) => s + (e.rating || 0), 0) / ests.length).toFixed(1)
          : '0.0',
    }
  }, [reservations, establishments])

  const isLoading = loadingEst || loadingRes

  return (
    <YStack flex={1} backgroundColor="$color1">
      <AppHeader title={t('statistics')} variant="back" onBack={() => router.back()} />
      <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
        {isLoading ? (
          <YStack padding="$10" alignItems="center">
            <Spinner />
          </YStack>
        ) : (
          <>
            {/* ── Summary Cards ──────────────────────────────────────────── */}
            <XStack flexWrap="wrap" gap="$2">
              <Card flex={1} minWidth={140} elevation={3} bordered backgroundColor="$color2" padding="$3" borderLeftWidth={3} borderLeftColor="#3B82F6">
                <Calendar size={14} color="#3B82F6" />
                <SizableText size="$1" color="$color10" marginTop="$1">{t('total_reservations')}</SizableText>
                <SizableText size="$6" fontWeight="800" color="$color12">{summaryStats.totalReservations}</SizableText>
              </Card>
              <Card flex={1} minWidth={140} elevation={3} bordered backgroundColor="$color2" padding="$3" borderLeftWidth={3} borderLeftColor="#10B981">
                <DollarSign size={14} color="#10B981" />
                <SizableText size="$1" color="$color10" marginTop="$1">{t('revenue')}</SizableText>
                <SizableText size="$6" fontWeight="800" color="$color12">${summaryStats.totalRevenue.toLocaleString()}</SizableText>
              </Card>
              <Card flex={1} minWidth={140} elevation={3} bordered backgroundColor="$color2" padding="$3" borderLeftWidth={3} borderLeftColor="#F59E0B">
                <Store size={14} color="#F59E0B" />
                <SizableText size="$1" color="$color10" marginTop="$1">{t('my_establishments')}</SizableText>
                <SizableText size="$6" fontWeight="800" color="$color12">{summaryStats.totalEstablishments}</SizableText>
              </Card>
              <Card flex={1} minWidth={140} elevation={3} bordered backgroundColor="$color2" padding="$3" borderLeftWidth={3} borderLeftColor="#EC4899">
                <Star size={14} color="#EC4899" />
                <SizableText size="$1" color="$color10" marginTop="$1">{t('avg_rating')}</SizableText>
                <SizableText size="$6" fontWeight="800" color="$color12">{summaryStats.avgRating}</SizableText>
              </Card>
            </XStack>

            {/* ── Monthly Revenue Chart ──────────────────────────────────── */}
            <Card elevation={3} bordered backgroundColor="$color2" padding="$4">
              <H4 color="$color12" marginBottom="$3">{t('monthly_revenue')}</H4>
              <SizableText size="$7" fontWeight="800" color="$color12">
                ${monthlyRevenue.reduce((s, m) => s + m.value, 0).toLocaleString()}
              </SizableText>
              <SizableText size="$2" color="$color10" marginBottom="$4">
                {t('total')} · {t('revenue').toLowerCase()}
              </SizableText>
              <XStack gap="$2" alignItems="flex-end" height={120}>
                {monthlyRevenue.map((m) => {
                  const height = Math.max((m.value / maxRevenue) * 100, 4)
                  return (
                    <YStack key={m.label} flex={1} alignItems="center" gap="$1">
                      <SizableText size="$1" color="$color10">
                        ${m.value > 0 ? m.value.toLocaleString() : '0'}
                      </SizableText>
                      <YStack
                        flex={1}
                        width="100%"
                        backgroundColor="$color4"
                        borderRadius="$1"
                        justifyContent="flex-end"
                        overflow="hidden"
                      >
                        <YStack
                          height={`${height}%`}
                          backgroundColor="#3B82F6"
                          borderRadius="$1"
                        />
                      </YStack>
                      <SizableText size="$1" color="$color9">
                        {m.label}
                      </SizableText>
                    </YStack>
                  )
                })}
              </XStack>
            </Card>

            {/* ── Reservations by Day ────────────────────────────────────── */}
            <Card elevation={3} bordered backgroundColor="$color2" padding="$4">
              <H4 color="$color12" marginBottom="$3">{t('reservations_by_day')}</H4>
              <YStack gap="$2">
                {reservationsByDay.map((d) => (
                  <XStack key={d.label} alignItems="center" gap="$3">
                    <SizableText size="$2" color="$color10" width={32} textAlign="right">
                      {d.label}
                    </SizableText>
                    <YStack flex={1} height={20} backgroundColor="$color4" borderRadius="$2" overflow="hidden">
                      <YStack
                        height="100%"
                        width={`${Math.max((d.value / maxDayCount) * 100, 2)}%`}
                        backgroundColor="#10B981"
                        borderRadius="$2"
                      />
                    </YStack>
                    <SizableText size="$2" fontWeight="700" color="$color12" width={24}>
                      {d.value}
                    </SizableText>
                  </XStack>
                ))}
              </YStack>
            </Card>

            {/* ── Top Establishments ─────────────────────────────────────── */}
            <Card elevation={3} bordered backgroundColor="$color2" padding="$4">
              <H4 color="$color12" marginBottom="$3">{t('top_establishments')}</H4>
              {topEstablishments.length > 0 ? (
                <YStack gap="$2">
                  {topEstablishments.map((est, idx) => (
                    <XStack
                      key={est.id}
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical="$2"
                      borderBottomWidth={idx < topEstablishments.length - 1 ? 1 : 0}
                      borderBottomColor="$color4"
                    >
                      <XStack gap="$2" alignItems="center" flex={1}>
                        <SizableText size="$3" fontWeight="700" color="$color9" width={20}>
                          #{idx + 1}
                        </SizableText>
                        <YStack flex={1}>
                          <SizableText size="$3" fontWeight="600" color="$color12" numberOfLines={1}>
                            {est.name}
                          </SizableText>
                          <XStack gap="$1" alignItems="center">
                            <Star size={10} color="#F59E0B" fill="#F59E0B" />
                            <SizableText size="$1" color="$color10">
                              {est.rating}{' '}
                            </SizableText>
                          </XStack>
                        </YStack>
                      </XStack>
                      <SizableText size="$3" fontWeight="700" color="$color12">
                        {est.resCount}
                      </SizableText>
                    </XStack>
                  ))}
                </YStack>
              ) : (
                <Paragraph color="$color10">{t('no_establishments')}</Paragraph>
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </YStack>
  )
}
