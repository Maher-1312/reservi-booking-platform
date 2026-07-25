import { useState, useCallback, useMemo } from 'react'
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
  Badge,
  BlinkDialog,
  Separator,
} from '@blinkdotnew/mobile-ui'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  DollarSign,
  ChevronDown,
  ChevronUp,
  X,
} from '@blinkdotnew/mobile-ui'
import { useAuth } from '@/hooks/useAuth'
import { useReservations, useUpdateReservation, useEstablishment } from '@/hooks/useDatabase'
import { useTranslation } from '@/i18n'
import { getLocalizedName, parseImages } from '@/lib/helpers'
import type { Reservation } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function isUpcoming(reservation: Reservation): boolean {
  return reservation.status === 'pending' || reservation.status === 'confirmed'
}

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

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function MyReservationsScreen() {
  const { t, locale } = useTranslation()
  const { user } = useAuth()

  const { data: reservations, isLoading, isError } = useReservations(user?.id)

  const { upcoming, past } = useMemo(() => {
    if (!reservations) return { upcoming: [], past: [] }
    return {
      upcoming: reservations.filter(isUpcoming),
      past: reservations.filter((r) => !isUpcoming(r)),
    }
  }, [reservations])

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
        <Spinner size="large" color="$color9" />
      </YStack>
    )
  }

  const isEmpty = !reservations || reservations.length === 0

  return (
    <YStack flex={1} backgroundColor="$color1">
      <AppHeader
        title={t('my_reservations')}
        variant="back"
        onBack={() => router.back()}
      />

      {isError || isEmpty ? (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
          <EmptyState
            title={t('empty_reservations')}
            description={
              isEmpty
                ? 'You haven\'t made any reservations yet. Start exploring!'
                : t('retry')
            }
            icon={<Calendar size={48} color="$color9" />}
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
        <ScrollView flex={1} contentContainerStyle={{ padding: '$4', gap: '$4' }}>
          {/* Upcoming section */}
          {upcoming.length > 0 && (
            <YStack gap="$3">
              <SizableText size="$4" fontWeight="700" color="$color12">
                {t('confirmed')}
              </SizableText>
              {upcoming.map((reservation) => (
                <ReservationRow
                  key={reservation.id}
                  reservation={reservation}
                  locale={locale}
                  t={t}
                />
              ))}
            </YStack>
          )}

          {/* Past section */}
          {past.length > 0 && (
            <YStack gap="$3">
              <SizableText size="$4" fontWeight="700" color="$color10">
                {t('completed')}
              </SizableText>
              {past.map((reservation) => (
                <ReservationRow
                  key={reservation.id}
                  reservation={reservation}
                  locale={locale}
                  t={t}
                />
              ))}
            </YStack>
          )}
        </ScrollView>
      )}
    </YStack>
  )
}

// ─── ReservationRow ──────────────────────────────────────────────────────────

function ReservationRow({
  reservation,
  locale,
  t,
}: {
  reservation: Reservation
  locale: string
  t: (key: string) => string
}) {
  const { data: establishment, isLoading: estLoading } = useEstablishment(
    reservation.establishment_id,
  )
  const updateReservation = useUpdateReservation()

  const [expanded, setExpanded] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleCancel = useCallback(() => {
    updateReservation.mutate(
      { id: reservation.id, updates: { status: 'cancelled' } },
      {
        onSuccess: () => {
          toast(t('reservation_cancelled'), { variant: 'success' })
          setShowCancelDialog(false)
        },
        onError: () => {
          toast(t('error'), { message: t('retry'), variant: 'error' })
        },
      },
    )
  }, [reservation.id, updateReservation, t])

  const upcoming = isUpcoming(reservation)
  const images = establishment ? parseImages(establishment.images) : []
  const imageUri = images.length > 0 ? images[0] : undefined
  const estName = establishment
    ? getLocalizedName(establishment, locale)
    : reservation.service || 'Establishment'

  return (
    <>
      <Card
        backgroundColor="$color2"
        borderRadius="$4"
        bordered
        pressStyle={{ scale: 0.98 }}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <YStack padding="$3" gap="$3">
          {/* Top row: image + name + status badge */}
          <XStack gap="$3" alignItems="center">
            {estLoading ? (
              <YStack
                width={56}
                height={56}
                borderRadius={12}
                backgroundColor="$color4"
                alignItems="center"
                justifyContent="center"
              >
                <Spinner size="small" color="$color9" />
              </YStack>
            ) : imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: '$color4',
                }}
                resizeMode="cover"
              />
            ) : (
              <YStack
                width={56}
                height={56}
                borderRadius={12}
                backgroundColor="$color4"
                alignItems="center"
                justifyContent="center"
              >
                <SizableText size="$6">🏢</SizableText>
              </YStack>
            )}

            <YStack flex={1} gap="$1">
              <SizableText size="$4" fontWeight="700" color="$color12" numberOfLines={1}>
                {estName}
              </SizableText>
              <XStack alignItems="center" gap="$2">
                <Badge variant={statusVariant(reservation.status)}>
                  {t(reservation.status)}
                </Badge>
                {reservation.amount > 0 && (
                  <SizableText size="$3" fontWeight="600" color="$color9">
                    ${reservation.amount.toFixed(2)}
                  </SizableText>
                )}
              </XStack>
            </YStack>

            {/* Expand chevron */}
            <Button chromeless size="$2" onPress={() => setExpanded((p) => !p)}>
              {expanded ? (
                <ChevronUp size={18} color="$color10" />
              ) : (
                <ChevronDown size={18} color="$color10" />
              )}
            </Button>
          </XStack>

          {/* Info row: date, time, guests */}
          <XStack gap="$4" flexWrap="wrap">
            <XStack gap="$1" alignItems="center">
              <Calendar size={14} color="$color10" />
              <SizableText size="$2" color="$color10">
                {formatDate(reservation.date)}
              </SizableText>
            </XStack>
            <XStack gap="$1" alignItems="center">
              <Clock size={14} color="$color10" />
              <SizableText size="$2" color="$color10">
                {reservation.time}
              </SizableText>
            </XStack>
            <XStack gap="$1" alignItems="center">
              <Users size={14} color="$color10" />
              <SizableText size="$2" color="$color10">
                {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
              </SizableText>
            </XStack>
            {reservation.amount > 0 && (
              <XStack gap="$1" alignItems="center">
                <DollarSign size={14} color="$color10" />
                <SizableText size="$2" color="$color10">
                  {reservation.payment_status}
                </SizableText>
              </XStack>
            )}
          </XStack>

          {/* Expanded details */}
          {expanded && (
            <YStack gap="$3">
              <Separator />

              {/* Service */}
              {reservation.service ? (
                <YStack gap="$1">
                  <SizableText size="$2" fontWeight="600" color="$color10">
                    {t('select_service')}
                  </SizableText>
                  <SizableText size="$3" color="$color12">
                    {reservation.service}
                  </SizableText>
                </YStack>
              ) : null}

              {/* Notes */}
              {reservation.notes ? (
                <YStack gap="$1">
                  <SizableText size="$2" fontWeight="600" color="$color10">
                    {t('notes')}
                  </SizableText>
                  <SizableText size="$3" color="$color12">
                    {reservation.notes}
                  </SizableText>
                </YStack>
              ) : null}

              {/* Actions: Cancel (only for upcoming) */}
              {upcoming && (
                <XStack gap="$2" marginTop="$1">
                  <Button
                    size="$4"
                    theme="red"
                    onPress={() => setShowCancelDialog(true)}
                    icon={<X size={16} color="$color1" />}
                  >
                    {t('cancel_reservation')}
                  </Button>
                </XStack>
              )}
            </YStack>
          )}
        </YStack>
      </Card>

      {/* Cancel confirmation dialog */}
      <BlinkDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title={t('cancel_reservation')}
        description="Are you sure you want to cancel this reservation? This action cannot be undone."
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
    </>
  )
}
