import { useCallback, useMemo } from 'react'
import { useRouter } from 'expo-router'
import {
  YStack,
  XStack,
  ScrollView,
  Card,
  Button,
  Paragraph,
  SizableText,
  H4,
  AppHeader,
  EmptyState,
  Spinner,
  Badge,
} from '@blinkdotnew/mobile-ui'
import { Calendar, Clock, Users } from '@blinkdotnew/mobile-ui'
import { useAuth } from '@/hooks/useAuth'
import { useReservations, useEstablishments } from '@/hooks/useDatabase'
import { useTranslation } from '@/i18n'
import { getLocalizedName } from '@/lib/helpers'
import type { Reservation, ReservationStatus } from '@/types'

const STATUS_COLORS: Record<ReservationStatus, { color: string; bg: string }> = {
  pending: { color: '#d97706', bg: '#78350f1a' },
  confirmed: { color: '#10b981', bg: '#064e3b1a' },
  cancelled: { color: '#ef4444', bg: '#7f1d1d1a' },
  completed: { color: '#6b7280', bg: '#3741511a' },
}

export default function BookingsScreen() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { t, locale } = useTranslation()

  const { data: reservations, isLoading: resLoading, refetch } = useReservations(user?.id)
  const { data: establishments } = useEstablishments()

  const getEstName = useCallback(
    (estId: string) => {
      const est = establishments?.find((e) => e.id === estId)
      return getLocalizedName(est, locale)
    },
    [establishments, locale],
  )

  const sortedReservations = useMemo(() => {
    if (!reservations) return []
    return [...reservations].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [reservations])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (authLoading) {
    return (
      <YStack flex={1} backgroundColor="$color1" alignItems="center" justifyContent="center" gap="$3">
        <Spinner size="large" color="$color9" />
        <Paragraph color="$color10">{t('loading')}</Paragraph>
      </YStack>
    )
  }

  if (!isAuthenticated) {
    return (
      <YStack flex={1} backgroundColor="$color1">
        <AppHeader title={t('my_reservations')} variant="default" />
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$5">
          <Calendar size={64} color="$color8" />
          <H4 color="$color10" textAlign="center">
            {t('login_subtitle')}
          </H4>
          <Paragraph color="$color10" textAlign="center">
            {locale === 'fr'
              ? 'Connectez-vous pour voir vos réservations'
              : locale === 'ar'
                ? 'سجل الدخول لعرض حجوزاتك'
                : 'Sign in to see your bookings'}
          </Paragraph>
          <Button theme="active" onPress={() => router.push('/auth')}>
            {t('sign_in')}
          </Button>
        </YStack>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$color1">
      <AppHeader title={t('my_reservations')} variant="default" />

      <ScrollView
        flex={1}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {resLoading ? (
          <YStack padding="$8" alignItems="center" gap="$3">
            <Spinner size="large" color="$color9" />
            <Paragraph color="$color10">{t('loading')}</Paragraph>
          </YStack>
        ) : sortedReservations.length === 0 ? (
          <YStack padding="$8">
            <EmptyState
              icon={<Calendar size={48} color="$color8" />}
              title={t('empty_reservations')}
            />
          </YStack>
        ) : (
          <YStack padding="$4" gap="$3">
            {sortedReservations.map((res) => {
              const status = res.status as ReservationStatus
              const statusStyle = STATUS_COLORS[status] ?? STATUS_COLORS.pending
              const estName = getEstName(res.establishment_id)

              return (
                <Card
                  key={res.id}
                  elevation={2}
                  backgroundColor="$color2"
                  borderRadius="$4"
                  onPress={() => router.push(`/reservation/${res.id}`)}
                  cursor="pointer"
                >
                  <YStack padding="$4" gap="$3">
                    <XStack justifyContent="space-between" alignItems="center">
                      <Paragraph size="$3" fontWeight="700" color="$color12" numberOfLines={1} flex={1}>
                        {estName || res.establishment_id}
                      </Paragraph>
                      <Badge variant={status === 'confirmed' ? 'success' : status === 'cancelled' ? 'error' : 'warning'}>
                        {t(status)}
                      </Badge>
                    </XStack>

                    <XStack gap="$4" flexWrap="wrap">
                      <XStack alignItems="center" gap="$1">
                        <Calendar size={14} color="$color10" />
                        <Paragraph size="$2" color="$color10">
                          {formatDate(res.date)}
                        </Paragraph>
                      </XStack>

                      <XStack alignItems="center" gap="$1">
                        <Clock size={14} color="$color10" />
                        <Paragraph size="$2" color="$color10">
                          {res.time}
                        </Paragraph>
                      </XStack>

                      <XStack alignItems="center" gap="$1">
                        <Users size={14} color="$color10" />
                        <Paragraph size="$2" color="$color10">
                          {res.guests} {locale === 'fr' ? 'pers.' : locale === 'ar' ? 'شخص' : 'guests'}
                        </Paragraph>
                      </XStack>
                    </XStack>

                    {res.service && (
                      <Paragraph size="$2" color="$color9">
                        {res.service}
                      </Paragraph>
                    )}
                  </YStack>
                </Card>
              )
            })}
          </YStack>
        )}
      </ScrollView>
    </YStack>
  )
}
