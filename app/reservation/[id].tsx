import { useCallback, useMemo, useState } from 'react'
import { Platform, Pressable } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated'
import {
  YStack,
  XStack,
  ScrollView,
  Card,
  Button,
  H3,
  H4,
  Paragraph,
  SizableText,
  Circle,
  Input,
  Spinner,
  Separator,
  EmptyState,
} from '@blinkdotnew/mobile-ui'
import {
  ArrowLeft,
  Minus,
  Plus,
  Check,
  Clock,
  Users,
  Calendar,
  MessageCircle,
} from '@blinkdotnew/mobile-ui'

import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/i18n'
import { useEstablishment, useCreateReservation } from '@/hooks/useDatabase'
import {
  nextDays,
  generateTimeSlots,
  getLocalizedField,
} from '@/lib/helpers'
import {
  scheduleReservationConfirmation,
  scheduleReservationReminder,
} from '@/lib/notifications'

// ─── Reservation Screen ──────────────────────────────────────────────────────
export default function ReservationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t, locale } = useTranslation()
  const { user, isAuthenticated } = useAuth()

  const { data: establishment, isLoading } = useEstablishment(id ?? '')
  const createReservation = useCreateReservation()

  // ── Form state ─────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [guests, setGuests] = useState(2)
  const [service, setService] = useState('')
  const [notes, setNotes] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const days = useMemo(() => nextDays(7), [])
  const timeSlots = useMemo(() => generateTimeSlots('09:00', '18:00', 30), [])

  // ── Auto-select first date ─────────────────────────────────────────────
  useMemo(() => {
    if (!selectedDate && days.length > 0) {
      setSelectedDate(days[0].value)
    }
  }, [days, selectedDate])

  // ── Confirm handler ────────────────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    if (!user || !establishment) return
    setErrorMessage('')

    if (!selectedDate) {
      setErrorMessage(t('select_date'))
      return
    }
    if (!selectedTime) {
      setErrorMessage(t('select_time'))
      return
    }

    try {
      await createReservation.mutateAsync({
        establishment_id: establishment.id,
        user_id: user.id,
        date: selectedDate,
        time: selectedTime,
        guests,
        service: service.trim() || 'standard',
        notes: notes.trim(),
        status: 'pending',
        payment_status: 'unpaid',
        amount: 0,
      })

      // Schedule notifications
      const reservationData = {
        id: `temp-${Date.now()}`,
        establishment_id: establishment.id,
        user_id: user.id,
        date: selectedDate,
        time: selectedTime,
        guests,
        service: service.trim() || 'standard',
        notes: notes.trim(),
        status: 'pending',
        payment_status: 'unpaid',
        amount: 0,
        created_at: new Date().toISOString(),
      }
      scheduleReservationConfirmation(reservationData, establishment.name)
      scheduleReservationReminder(reservationData, establishment.name)

      setIsSuccess(true)
    } catch {
      setErrorMessage(t('error'))
    }
  }, [
    user,
    establishment,
    selectedDate,
    selectedTime,
    guests,
    service,
    notes,
    createReservation,
    t,
  ])

  // ── Success animation values ───────────────────────────────────────────
  const checkScale = useSharedValue(0)
  const checkOpacity = useSharedValue(0)

  useMemo(() => {
    if (isSuccess) {
      checkScale.value = withSpring(1, { damping: 10, stiffness: 150 })
      checkOpacity.value = withDelay(100, withSpring(1))
    }
  }, [isSuccess, checkScale, checkOpacity])

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }))

  // ── Auth guard ─────────────────────────────────────────────────────────
  if (!isAuthenticated) {
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
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
          <EmptyState
            icon={<Users size={48} color="$color8" />}
            title={t('sign_in')}
            description={t('login_title')}
          />
          <Button theme="active" onPress={() => router.push('/login')}>
            {t('sign_in')}
          </Button>
        </YStack>
      </YStack>
    )
  }

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
          icon={<Clock size={48} color="$color8" />}
          title={t('error')}
          description={t('no_results')}
          action={{ label: t('back'), onPress: () => router.back() }}
        />
      </YStack>
    )
  }

  // ── Success State ─────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <YStack flex={1} backgroundColor="$color1" alignItems="center" justifyContent="center" padding="$6" gap="$6">
        <Animated.View style={checkAnimatedStyle}>
          <Circle size={80} backgroundColor="$green9">
            <Check size={40} color="white" />
          </Circle>
        </Animated.View>
        <YStack alignItems="center" gap="$2">
          <H3 color="$color12" textAlign="center">
            {t('reservation_confirmed')}
          </H3>
          <Paragraph color="$color10" textAlign="center">
            {establishment.name}
          </Paragraph>
          <Paragraph color="$color9" textAlign="center">
            {selectedDate} • {selectedTime} • {guests} {t('number_of_guests')}
          </Paragraph>
        </YStack>
        <YStack gap="$3" width="100%" maxWidth={320}>
          <Button theme="active" onPress={() => router.push('/')}>
            {t('home_title')}
          </Button>
          <Button onPress={() => router.back()}>
            {t('back')}
          </Button>
        </YStack>
      </YStack>
    )
  }

  // ── Main Form ─────────────────────────────────────────────────────────
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
        gap="$3"
      >
        <Pressable onPress={() => router.back()}>
          <Circle size={36} backgroundColor="$color2">
            <ArrowLeft size={20} color="$color12" />
          </Circle>
        </Pressable>
        <H4 color="$color12">{t('book_now')}</H4>
      </XStack>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$5">
          {/* Establishment Info */}
          <Card backgroundColor="$color2" padding="$4" borderRadius="$4">
            <XStack gap="$3" alignItems="center">
              <Circle size={48} backgroundColor="$color3">
                <SizableText size="$6">🏢</SizableText>
              </Circle>
              <YStack flex={1} gap="$0.5">
                <SizableText size="$4" color="$color12" fontWeight="700">
                  {establishment.name}
                </SizableText>
                <SizableText size="$2" color="$color10">
                  {getLocalizedField(establishment, 'city', locale)}
                </SizableText>
              </YStack>
            </XStack>
          </Card>

          {/* Date Selection */}
          <YStack gap="$3">
            <XStack gap="$2" alignItems="center">
              <Calendar size={18} color="$color9" />
              <SizableText size="$4" color="$color12" fontWeight="600">
                {t('select_date')}
              </SizableText>
            </XStack>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2">
                {days.map((day) => {
                  const isSelected = selectedDate === day.value
                  return (
                    <Pressable
                      key={day.value}
                      onPress={() => setSelectedDate(day.value)}
                    >
                      <YStack
                        backgroundColor={isSelected ? '$color9' : '$color2'}
                        borderRadius="$3"
                        paddingHorizontal="$3.5"
                        paddingVertical="$2.5"
                        alignItems="center"
                        minWidth={64}
                        borderWidth={1}
                        borderColor={isSelected ? '$color9' : '$color4'}
                      >
                        <SizableText
                          size="$2"
                          color={isSelected ? 'white' : '$color10'}
                          fontWeight="500"
                        >
                          {day.dayName}
                        </SizableText>
                        <SizableText
                          size="$5"
                          color={isSelected ? 'white' : '$color12'}
                          fontWeight="700"
                        >
                          {day.dayNum}
                        </SizableText>
                      </YStack>
                    </Pressable>
                  )
                })}
              </XStack>
            </ScrollView>
          </YStack>

          {/* Time Selection */}
          <YStack gap="$3">
            <XStack gap="$2" alignItems="center">
              <Clock size={18} color="$color9" />
              <SizableText size="$4" color="$color12" fontWeight="600">
                {t('select_time')}
              </SizableText>
            </XStack>
            <XStack gap="$2" flexWrap="wrap">
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot
                return (
                  <Pressable key={slot} onPress={() => setSelectedTime(slot)}>
                    <YStack
                      backgroundColor={isSelected ? '$color9' : '$color2'}
                      borderRadius="$3"
                      paddingHorizontal="$3.5"
                      paddingVertical="$2"
                      borderWidth={1}
                      borderColor={isSelected ? '$color9' : '$color4'}
                    >
                      <SizableText
                        size="$3"
                        color={isSelected ? 'white' : '$color11'}
                        fontWeight={isSelected ? '700' : '500'}
                      >
                        {slot}
                      </SizableText>
                    </YStack>
                  </Pressable>
                )
              })}
            </XStack>
          </YStack>

          <Separator />

          {/* Guests */}
          <YStack gap="$3">
            <XStack gap="$2" alignItems="center">
              <Users size={18} color="$color9" />
              <SizableText size="$4" color="$color12" fontWeight="600">
                {t('number_of_guests')}
              </SizableText>
            </XStack>
            <XStack alignItems="center" justifyContent="center" gap="$4">
              <Pressable
                onPress={() => setGuests((g) => Math.max(1, g - 1))}
              >
                <Circle size={40} backgroundColor="$color2" borderWidth={1} borderColor="$color4">
                  <Minus size={18} color="$color12" />
                </Circle>
              </Pressable>
              <SizableText size="$8" color="$color12" fontWeight="700" width={40} textAlign="center">
                {guests}
              </SizableText>
              <Pressable
                onPress={() => setGuests((g) => Math.min(20, g + 1))}
              >
                <Circle size={40} backgroundColor="$color2" borderWidth={1} borderColor="$color4">
                  <Plus size={18} color="$color12" />
                </Circle>
              </Pressable>
            </XStack>
          </YStack>

          {/* Service */}
          <YStack gap="$2">
            <SizableText size="$4" color="$color12" fontWeight="600">
              {t('select_service')}
            </SizableText>
            <Input
              value={service}
              onChangeText={setService}
              placeholder={t('select_service')}
              size="$4"
              backgroundColor="$color2"
              borderColor="$color4"
            />
          </YStack>

          {/* Notes */}
          <YStack gap="$2">
            <XStack gap="$2" alignItems="center">
              <MessageCircle size={18} color="$color9" />
              <SizableText size="$4" color="$color12" fontWeight="600">
                {t('notes')}
              </SizableText>
            </XStack>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder={t('notes')}
              multiline
              numberOfLines={3}
              size="$4"
              backgroundColor="$color2"
              borderColor="$color4"
              minHeight={80}
              textAlignVertical="top"
            />
          </YStack>

          {/* Summary */}
          <Card backgroundColor="$color2" padding="$4" borderRadius="$4">
            <YStack gap="$3">
              <SizableText size="$4" color="$color12" fontWeight="700">
                {t('confirm_reservation')}
              </SizableText>
              <YStack gap="$2">
                <XStack justifyContent="space-between">
                  <SizableText size="$3" color="$color10">
                    {t('select_date')}
                  </SizableText>
                  <SizableText size="$3" color="$color12" fontWeight="600">
                    {selectedDate || '—'}
                  </SizableText>
                </XStack>
                <XStack justifyContent="space-between">
                  <SizableText size="$3" color="$color10">
                    {t('select_time')}
                  </SizableText>
                  <SizableText size="$3" color="$color12" fontWeight="600">
                    {selectedTime || '—'}
                  </SizableText>
                </XStack>
                <XStack justifyContent="space-between">
                  <SizableText size="$3" color="$color10">
                    {t('number_of_guests')}
                  </SizableText>
                  <SizableText size="$3" color="$color12" fontWeight="600">
                    {guests}
                  </SizableText>
                </XStack>
              </YStack>
            </YStack>
          </Card>

          {/* Error */}
          {errorMessage ? (
            <Card backgroundColor="$red2" padding="$3" borderRadius="$3">
              <SizableText size="$3" color="$red9" textAlign="center">
                {errorMessage}
              </SizableText>
            </Card>
          ) : null}

          {/* Confirm Button */}
          <Button
            theme="active"
            size="$5"
            onPress={handleConfirm}
            disabled={createReservation.isPending}
            width="100%"
          >
            {createReservation.isPending ? t('loading') : t('confirm_reservation')}
          </Button>

          <YStack height={Platform.OS === 'ios' ? 40 : 20} />
        </YStack>
      </ScrollView>
    </YStack>
  )
}
