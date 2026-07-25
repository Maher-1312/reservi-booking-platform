import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '@/lib/blink'
import type {
  Category,
  Establishment,
  Reservation,
  Review,
  Favorite,
} from '@/types'

// ─── Table accessors (typed) ────────────────────────────────────────────────

const categories = blink.db.table<Category>('categories')
const establishments = blink.db.table<Establishment>('establishments')
const reservations = blink.db.table<Reservation>('reservations')
const reviews = blink.db.table<Review>('reviews')
const favorites = blink.db.table<Favorite>('favorites')

// ─── Categories ─────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      return categories.list({ orderBy: { name: 'asc' } })
    },
  })
}

// ─── Establishments ─────────────────────────────────────────────────────────

export function useEstablishments(categoryId?: string) {
  return useQuery({
    queryKey: ['establishments', { categoryId }],
    queryFn: async () => {
      const where: Record<string, string> = { status: 'active' }
      if (categoryId) where.category_id = categoryId
      return establishments.list({ where, orderBy: { rating: 'desc' } })
    },
  })
}

export function useEstablishment(id: string) {
  return useQuery({
    queryKey: ['establishments', id],
    queryFn: async () => {
      return establishments.get(id)
    },
    enabled: !!id,
  })
}

export function useSearchEstablishments(query: string, categoryId?: string) {
  return useQuery({
    queryKey: ['establishments', 'search', { query, categoryId }],
    queryFn: async () => {
      const where: Record<string, string> = { status: 'active' }
      if (categoryId) where.category_id = categoryId
      const results = await establishments.list({
        where,
        orderBy: { rating: 'desc' },
      })
      const lowerQuery = query.toLowerCase()
      return results.filter((e) =>
        e.name.toLowerCase().includes(lowerQuery),
      )
    },
    enabled: query.length > 0,
  })
}

export function useOwnerEstablishments(ownerId?: string) {
  return useQuery({
    queryKey: ['establishments', 'owner', { ownerId }],
    queryFn: async () => {
      return establishments.list({
        where: { owner_id: ownerId! },
        orderBy: { created_at: 'desc' },
      })
    },
    enabled: !!ownerId,
  })
}

// ─── Reservation Mutations ──────────────────────────────────────────────────

type CreateReservationInput = Omit<Reservation, 'id' | 'created_at'>

export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateReservationInput) => {
      return reservations.create(data)
    },
    onMutate: async (newReservation) => {
      const queryKey = ['reservations', { userId: newReservation.user_id }]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Reservation[]>(queryKey)
      if (previous) {
        const optimistic: Reservation = {
          ...newReservation,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
        }
        queryClient.setQueryData(queryKey, [optimistic, ...previous])
      }
      return { previous }
    },
    onError: (_err, newReservation, context) => {
      const queryKey = ['reservations', { userId: newReservation.user_id }]
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: (_data, _err, newReservation) => {
      queryClient.invalidateQueries({
        queryKey: ['reservations', { userId: newReservation.user_id }],
      })
    },
  })
}

export function useUpdateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Pick<Reservation, 'status' | 'payment_status' | 'date' | 'time' | 'guests' | 'notes'>>
    }) => {
      return reservations.update(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}

// ─── Reservations Queries ───────────────────────────────────────────────────

export function useReservations(userId?: string) {
  return useQuery({
    queryKey: ['reservations', { userId }],
    queryFn: async () => {
      return reservations.list({
        where: { user_id: userId! },
        orderBy: { date: 'desc' },
      })
    },
    enabled: !!userId,
  })
}

// ─── Reviews ────────────────────────────────────────────────────────────────

export function useReviews(establishmentId: string) {
  return useQuery({
    queryKey: ['reviews', { establishmentId }],
    queryFn: async () => {
      return reviews.list({
        where: { establishment_id: establishmentId },
        orderBy: { created_at: 'desc' },
      })
    },
    enabled: !!establishmentId,
  })
}

type CreateReviewInput = Omit<Review, 'id' | 'created_at' | 'owner_reply'>

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateReviewInput) => {
      return reviews.create({ ...data, owner_reply: '' })
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['reviews', { establishmentId: variables.establishment_id }],
      })
      // Also invalidate the establishment to refresh rating/review_count
      queryClient.invalidateQueries({
        queryKey: ['establishments', variables.establishment_id],
      })
    },
  })
}

// ─── Favorites ──────────────────────────────────────────────────────────────

export function useFavorites(userId?: string) {
  return useQuery({
    queryKey: ['favorites', { userId }],
    queryFn: async () => {
      return favorites.list({
        where: { user_id: userId! },
        orderBy: { created_at: 'desc' },
      })
    },
    enabled: !!userId,
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      establishmentId,
      userId,
    }: {
      establishmentId: string
      userId: string
    }) => {
      const existing = await favorites.list({
        where: {
          establishment_id: establishmentId,
          user_id: userId,
        },
      })

      if (existing.length > 0) {
        await favorites.delete(existing[0].id)
        return { action: 'removed' as const, id: existing[0].id }
      } else {
        const fav = await favorites.create({
          establishment_id: establishmentId,
          user_id: userId,
        })
        return { action: 'added' as const, id: fav.id }
      }
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['favorites', { userId: variables.userId }],
      })
    },
  })
}

// ─── Establishment Mutations ────────────────────────────────────────────────

type CreateEstablishmentInput = Omit<Establishment, 'id' | 'created_at'>

export function useCreateEstablishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateEstablishmentInput) => {
      return establishments.create(data)
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['establishments'] })
      queryClient.invalidateQueries({
        queryKey: ['establishments', 'owner', { ownerId: variables.owner_id }],
      })
    },
  })
}

type UpdateEstablishmentInput = Partial<
  Omit<Establishment, 'id' | 'created_at'>
>

export function useUpdateEstablishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateEstablishmentInput
    }) => {
      return establishments.update(id, updates)
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['establishments', variables.id],
      })
      queryClient.invalidateQueries({ queryKey: ['establishments'] })
    },
  })
}
