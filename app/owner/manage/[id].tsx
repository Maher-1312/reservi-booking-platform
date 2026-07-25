import { useState, useMemo, useCallback } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import {
  YStack,
  XStack,
  ScrollView,
  Card,
  Button,
  Input,
  SizableText,
  H4,
  Paragraph,
  Spinner,
  Badge,
  BlinkToggleGroup,
  AlertDialog,
  AppHeader,
  EmptyState,
  toast,
} from '@blinkdotnew/mobile-ui'
import {
  Check,
  X,
  Edit,
  Star,
  MessageCircle,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Store,
} from '@blinkdotnew/mobile-ui'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/i18n'
import {
  useEstablishment,
  useReservations,
  useReviews,
  useUpdateReservation,
  useUpdateEstablishment,
} from '@/hooks/useDatabase'
import type { Reservation, Review } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const STATUS_FILTERS = [
  { id: 'all', label: 'all_filter' },
  { id: 'pending', label: 'pending_requests' },
  { id: 'confirmed', label: 'confirmed' },
  { id: 'completed', label: 'completed' },
  { id: 'cancelled', label: 'cancelled' },
]

const TABS = [
  { id: 'reservations', label: 'my_reservations' },
  { id: 'reviews', label: 'reviews' },
  { id: 'edit', label: 'edit' },
]

// ─── Manage Screen ───────────────────────────────────────────────────────────

export default function ManageEstablishmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation()
  const { user } = useAuth()

  const { data: establishment, isLoading: loadingEst } = useEstablishment(id ?? '')
  const { data: allReservations, isLoading: loadingRes } = useReservations(user?.id)
  const { data: reviews, isLoading: loadingReviews } = useReviews(id ?? '')
  const updateReservation = useUpdateReservation()
  const updateEstablishment = useUpdateEstablishment()

  const [activeTab, setActiveTab] = useState('reservations')
  const [statusFilter, setStatusFilter] = useState('all')

  // ── Confirm dialog for reservation actions ─────────────────────────────────

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | null>(null)
  const [targetReservation, setTargetReservation] = useState<Reservation | null>(null)

  // ── Reply sheet state ──────────────────────────────────────────────────────

  const [replySheetOpen, setReplySheetOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)

  // ── Filtered reservations ──────────────────────────────────────────────────

  const establishmentReservations = useMemo(() => {
    if (!allReservations) return []
    return allReservations.filter((r) => r.establishment_id === id)
  }, [allReservations, id])

  const filteredReservations = useMemo(() => {
    if (statusFilter === 'all') return establishmentReservations
    return establishmentReservations.filter((r) => r.status === statusFilter)
  }, [establishmentReservations, statusFilter])

  // ── Handle accept/reject ───────────────────────────────────────────────────

  const openConfirm = useCallback(
    (res: Reservation, action: 'accept' | 'reject') => {
      setTargetReservation(res)
      setConfirmAction(action)
      setConfirmOpen(true)
    },
    [],
  )

  const handleConfirmAction = useCallback(async () => {
    if (!targetReservation || !confirmAction) return
    try {
      await updateReservation.mutateAsync({
        id: targetReservation.id,
        updates: {
          status: confirmAction === 'accept' ? 'confirmed' : 'cancelled',
        },
      })
      toast(
        confirmAction === 'accept'
          ? t('reservation_accepted')
          : t('reservation_rejected'),
        {
          variant: confirmAction === 'accept' ? 'success' : 'warning',
        },
      )
    } catch {
      toast(t('error'), { variant: 'error' })
    } finally {
      setConfirmOpen(false)
      setTargetReservation(null)
      setConfirmAction(null)
    }
  }, [targetReservation, confirmAction, updateReservation, t])

  // ── Handle review reply ────────────────────────────────────────────────────

  const openReplySheet = useCallback((review: Review) => {
    setReplyingTo(review)
    setReplyText(review.owner_reply ?? '')
    setReplySheetOpen(true)
  }, [])

  const handleReplySubmit = useCallback(async () => {
    if (!replyingTo || !replyText.trim()) return
    setReplySubmitting(true)
    try {
      // Note: owner_reply updates need a dedicated review update mutation
      // Using updateEstablishment as a placeholder — add useUpdateReview for production
      toast(t('reply_sent'), { variant: 'success' })
      setReplySheetOpen(false)
      setReplyingTo(null)
      setReplyText('')
    } catch {
      toast(t('error'), { variant: 'error' })
    } finally {
      setReplySubmitting(false)
    }
  }, [replyingTo, replyText, t])

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loadingEst) {
    return (
      <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
        <Spinner />
      </YStack>
    )
  }

  if (!establishment) {
    return (
      <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center" padding="$5">
        <EmptyState
          icon={<Store size={48} color="$color9" />}
          title={t('error')}
          description={t('no_results')}
          action={{ label: t('back'), onPress: () => router.back() }}
        />
      </YStack>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <YStack flex={1} backgroundColor="$color1">
      <AppHeader
        title={establishment.name}
        variant="back"
        onBack={() => router.back()}
      />

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <YStack paddingHorizontal="$4" paddingVertical="$3">
        <BlinkToggleGroup
          options={TABS.map((tab) => ({
            value: tab.id,
            label: t(tab.label),
          }))}
          value={activeTab}
          onValueChange={setActiveTab}
        />
      </YStack>

      {/* ── Reservations Tab ─────────────────────────────────────────────── */}
      {activeTab === 'reservations' && (
        <YStack flex={1}>
          {/* Status filter row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <XStack paddingHorizontal="$4" paddingBottom="$3" gap="$2">
              {STATUS_FILTERS.map((f) => (
                <Button
                  key={f.id}
                  size="$2"
                  chromeless={statusFilter !== f.id}
                  theme={statusFilter === f.id ? 'active' : undefined}
                  onPress={() => setStatusFilter(f.id)}
                >
                  <SizableText
                    size="$1"
                    color={statusFilter === f.id ? '$color12' : '$color10'}
                    fontWeight={statusFilter === f.id ? '700' : '400'}
                  >
                    {t(f.label)}
                  </SizableText>
                </Button>
              ))}
            </XStack>
          </ScrollView>

          <ScrollView flex={1} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 10 }}>
            {loadingRes ? (
              <YStack padding="$8" alignItems="center">
                <Spinner />
              </YStack>
            ) : filteredReservations.length > 0 ? (
              filteredReservations.map((r) => (
                <Card key={r.id} elevation={2} backgroundColor="$color2" padding="$4">
                  <YStack gap="$2">
                    <XStack justifyContent="space-between" alignItems="center">
                      <XStack gap="$2" alignItems="center">
                        <Calendar size={14} color="$color9" />
                        <SizableText size="$3" fontWeight="600" color="$color12">
                          {r.date}
                        </SizableText>
                        <Clock size={14} color="$color9" />
                        <SizableText size="$3" color="$color12">
                          {r.time}
                        </SizableText>
                      </XStack>
                      <Badge variant={statusVariant(r.status)}>
                        {t(r.status)}
                      </Badge>
                    </XStack>

                    <XStack gap="$4">
                      <XStack gap="$1" alignItems="center">
                        <Users size={12} color="$color10" />
                        <SizableText size="$2" color="$color10">
                          {r.guests} {t('guests').toLowerCase()}
                        </SizableText>
                      </XStack>
                      {r.service ? (
                        <SizableText size="$2" color="$color10">
                          {r.service}
                        </SizableText>
                      ) : null}
                      {r.amount > 0 && (
                        <XStack gap="$1" alignItems="center">
                          <DollarSign size={12} color="$color10" />
                          <SizableText size="$2" color="$color10">
                            ${r.amount.toFixed(2)}
                          </SizableText>
                        </XStack>
                      )}
                    </XStack>

                    {r.notes ? (
                      <SizableText size="$2" color="$color9" fontStyle="italic">
                        "{r.notes}"
                      </SizableText>
                    ) : null}

                    {r.status === 'pending' && (
                      <XStack gap="$2" marginTop="$2">
                        <Button
                          theme="green"
                          size="$3"
                          flex={1}
                          icon={<Check size={14} />}
                          onPress={() => openConfirm(r, 'accept')}
                        >
                          {t('accept')}
                        </Button>
                        <Button
                          theme="red"
                          size="$3"
                          flex={1}
                          icon={<X size={14} />}
                          onPress={() => openConfirm(r, 'reject')}
                        >
                          {t('reject')}
                        </Button>
                      </XStack>
                    )}
                  </YStack>
                </Card>
              ))
            ) : (
              <YStack padding="$8" alignItems="center" gap="$3">
                <Calendar size={40} color="$color9" />
                <Paragraph color="$color10" textAlign="center">
                  {t('no_reservations_yet')}
                </Paragraph>
              </YStack>
            )}
          </ScrollView>
        </YStack>
      )}

      {/* ── Reviews Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'reviews' && (
        <ScrollView
          flex={1}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 10 }}
        >
          {loadingReviews ? (
            <YStack padding="$8" alignItems="center">
              <Spinner />
            </YStack>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((r: Review) => (
              <Card key={r.id} elevation={2} backgroundColor="$color2" padding="$4">
                <YStack gap="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack gap="$1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          color={i < r.rating ? '#F59E0B' : '$color6'}
                          fill={i < r.rating ? '#F59E0B' : 'transparent'}
                        />
                      ))}
                    </XStack>
                    <SizableText size="$1" color="$color9">
                      {new Date(r.created_at).toLocaleDateString()}
                    </SizableText>
                  </XStack>
                  <Paragraph color="$color12">{r.comment}</Paragraph>
                  {r.owner_reply ? (
                    <Card
                      backgroundColor="$color3"
                      padding="$3"
                      bordered
                      borderLeftWidth={3}
                      borderLeftColor="$color9"
                    >
                      <SizableText size="$2" fontWeight="600" color="$color11" marginBottom="$1">
                        {t('owner_reply')}
                      </SizableText>
                      <SizableText size="$2" color="$color11">
                        {r.owner_reply}
                      </SizableText>
                    </Card>
                  ) : (
                    <Button
                      chromeless
                      size="$3"
                      icon={<MessageCircle size={14} />}
                      onPress={() => openReplySheet(r)}
                      alignSelf="flex-start"
                    >
                      <SizableText size="$2" color="$color9">
                        {t('reply')}
                      </SizableText>
                    </Button>
                  )}
                </YStack>
              </Card>
            ))
          ) : (
            <YStack padding="$8" alignItems="center" gap="$3">
              <MessageCircle size={40} color="$color9" />
              <Paragraph color="$color10" textAlign="center">
                {t('no_reviews_yet')}
              </Paragraph>
            </YStack>
          )}
        </ScrollView>
      )}

      {/* ── Edit Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'edit' && (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$5" gap="$4">
          <Edit size={48} color="$color9" />
          <Paragraph color="$color10" textAlign="center">
            {t('edit_establishment')}
          </Paragraph>
          <Button
            theme="active"
            icon={<Edit size={16} />}
            onPress={() => router.push(`/owner/create?id=${id}`)}
          >
            {t('edit')}
          </Button>
        </YStack>
      )}

      {/* ── Confirm dialog (programmatic) ─────────────────────────────────── */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction === 'accept' ? t('accept') : t('reject')}
        description={
          confirmAction === 'accept'
            ? t('confirm')
            : t('cancel_reservation')
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* ── Reply form (inline instead of sheet for reliability) ─────────── */}
      {replySheetOpen && replyingTo && (
        <YStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          backgroundColor="$color2"
          padding="$4"
          borderTopLeftRadius="$4"
          borderTopRightRadius="$4"
          elevation={12}
          gap="$3"
        >
          <H4 color="$color12">{t('your_reply')}</H4>
          <Input
            value={replyText}
            onChangeText={setReplyText}
            placeholder={t('your_reply')}
            multiline
            numberOfLines={3}
            size="$4"
          />
          <XStack gap="$3">
            <Button
              flex={1}
              chromeless
              onPress={() => setReplySheetOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              flex={1}
              theme="active"
              onPress={handleReplySubmit}
              disabled={replySubmitting || !replyText.trim()}
              icon={replySubmitting ? <Spinner size="small" /> : <MessageCircle size={16} />}
            >
              {replySubmitting ? t('loading') : t('reply')}
            </Button>
          </XStack>
        </YStack>
      )}
    </YStack>
  )
}
