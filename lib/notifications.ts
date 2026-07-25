import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import type { Reservation } from '@/types'

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[Notifications] Physical device required for push notifications')
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission not granted')
    return null
  }

  const tokenData = await Notifications.getExpoPushTokenAsync()
  return tokenData.data
}

export async function scheduleReservationReminder(reservation: Reservation, establishmentName: string) {
  const resDate = new Date(`${reservation.date}T${reservation.time}`)
  const reminderDate = new Date(resDate.getTime() - 60 * 60 * 1000) // 1h before

  // Don't schedule if the reminder time is in the past
  if (reminderDate.getTime() <= Date.now()) return null

  if (Platform.OS !== 'web') {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rappel de réservation',
        body: `Votre réservation à ${establishmentName} est dans 1 heure à ${reservation.time}`,
        data: { reservationId: reservation.id, type: 'reminder' },
      },
      trigger: reminderDate,
    })
  }
  return null
}

export async function scheduleReservationConfirmation(reservation: Reservation, establishmentName: string) {
  if (Platform.OS !== 'web') {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: 'Réservation confirmée',
        body: `Votre réservation à ${establishmentName} le ${reservation.date} à ${reservation.time} est confirmée.`,
        data: { reservationId: reservation.id, type: 'confirmation' },
      },
      trigger: null, // Show immediately
    })
  }
  return null
}

export async function scheduleReservationCancellation(reservation: Reservation, establishmentName: string) {
  if (Platform.OS !== 'web') {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: 'Réservation annulée',
        body: `Votre réservation à ${establishmentName} le ${reservation.date} a été annulée.`,
        data: { reservationId: reservation.id, type: 'cancellation' },
      },
      trigger: null,
    })
  }
  return null
}

export function setupNotificationListeners(onNotificationResponse: (reservationId: string) => void) {
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data
      if (data?.reservationId) {
        onNotificationResponse(data.reservationId as string)
      }
    },
  )

  return () => {
    responseSubscription.remove()
  }
}
