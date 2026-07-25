import { useState, useCallback, useEffect } from 'react'
import { router } from 'expo-router'
import {
  YStack,
  XStack,
  Button,
  Input,
  SizableText,
  H2,
  Paragraph,
  Spinner,
  toast,
  ScrollView,
} from '@blinkdotnew/mobile-ui'
import { ArrowLeft, User, Store, ChevronRight } from '@blinkdotnew/mobile-ui'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/i18n'
import { blink } from '@/lib/blink'
import type { UserType } from '@/types'

export default function ProfileSetupScreen() {
  const { t } = useTranslation()
  const { setUserType, user, userType, refreshUser } = useAuth()
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [selectedType, setSelectedType] = useState<UserType | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // If user already has a profile type, skip this screen
  useEffect(() => {
    if (userType) {
      router.replace('/(tabs)')
    }
  }, [userType])

  const handleSave = useCallback(async () => {
    if (!displayName.trim()) {
      toast.show(t('error'), {
        message: t('display_name') + ' ' + t('form_required'),
        preset: 'error',
      })
      return
    }
    if (!selectedType) {
      toast.show(t('error'), {
        message: t('choose_profile'),
        preset: 'error',
      })
      return
    }

    setSubmitting(true)
    try {
      // Save display name to Blink Auth
      await blink.auth.updateMe({ displayName: displayName.trim() })
      await refreshUser()
      // Save user type
      setUserType(selectedType)
      toast.show(t('welcome'), {
        message: `${t('welcome')} ${displayName.trim()}!`,
        preset: 'success',
      })
      router.replace('/(tabs)')
    } finally {
      setSubmitting(false)
    }
  }, [displayName, selectedType, setUserType, refreshUser, t])

  if (!user) {
    router.replace('/auth')
    return null
  }

  return (
    <ScrollView flex={1} backgroundColor="$color1">
      <YStack flex={1} padding="$5" maxWidth={450} alignSelf="center" width="100%" gap="$6">
        {/* Back button */}
        <XStack paddingTop="$4">
          <Button
            chromeless
            onPress={() => router.back()}
            icon={<ArrowLeft size={22} color="$color12" />}
          />
        </XStack>

        {/* Header */}
        <YStack alignItems="center" gap="$3">
          <YStack
            width={80}
            height={80}
            borderRadius="$10"
            backgroundColor="$color4"
            alignItems="center"
            justifyContent="center"
          >
            <User size={36} color="$color10" />
          </YStack>
          <H2 color="$color12" fontWeight="800" textAlign="center">
            {t('setup_profile_title')}
          </H2>
          <Paragraph color="$color10" textAlign="center" size="$4">
            {t('setup_profile_subtitle')}
          </Paragraph>
        </YStack>

        {/* Display Name */}
        <YStack gap="$2">
          <SizableText color="$color11" fontWeight="600" size="$4">
            {t('display_name')}
          </SizableText>
          <Input
            size="$5"
            placeholder={t('display_name_placeholder')}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            backgroundColor="$color2"
            borderColor="$color4"
            color="$color12"
          />
        </YStack>

        {/* Profile type selection */}
        <YStack gap="$3">
          <SizableText color="$color11" fontWeight="600" size="$4">
            {t('choose_profile')}
          </SizableText>

          <Button
            size="$6"
            backgroundColor={selectedType === 'client' ? '$color9' : '$color2'}
            borderColor={selectedType === 'client' ? '$color9' : '$color4'}
            borderWidth={1}
            borderRadius="$5"
            onPress={() => setSelectedType('client')}
            pressStyle={{ scale: 0.98 }}
          >
            <XStack flex={1} alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" gap="$3">
                <YStack
                  width={40}
                  height={40}
                  borderRadius="$3"
                  backgroundColor={selectedType === 'client' ? '$color1' : '$color4'}
                  alignItems="center"
                  justifyContent="center"
                >
                  <User
                    size={20}
                    color={selectedType === 'client' ? '$color9' : '$color10'}
                  />
                </YStack>
                <YStack gap="$0.5">
                  <SizableText
                    color={selectedType === 'client' ? '$color1' : '$color12'}
                    fontWeight="700"
                    size="$5"
                  >
                    {t('i_am_client')}
                  </SizableText>
                  <SizableText
                    color={selectedType === 'client' ? '$color3' : '$color10'}
                    size="$3"
                  >
                    {t('client_desc')}
                  </SizableText>
                </YStack>
              </XStack>
              {selectedType === 'client' && (
                <ChevronRight size={18} color="$color1" />
              )}
            </XStack>
          </Button>

          <Button
            size="$6"
            backgroundColor={selectedType === 'owner' ? '$color9' : '$color2'}
            borderColor={selectedType === 'owner' ? '$color9' : '$color4'}
            borderWidth={1}
            borderRadius="$5"
            onPress={() => setSelectedType('owner')}
            pressStyle={{ scale: 0.98 }}
          >
            <XStack flex={1} alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" gap="$3">
                <YStack
                  width={40}
                  height={40}
                  borderRadius="$3"
                  backgroundColor={selectedType === 'owner' ? '$color1' : '$color4'}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Store
                    size={20}
                    color={selectedType === 'owner' ? '$color9' : '$color10'}
                  />
                </YStack>
                <YStack gap="$0.5">
                  <SizableText
                    color={selectedType === 'owner' ? '$color1' : '$color12'}
                    fontWeight="700"
                    size="$5"
                  >
                    {t('i_am_owner')}
                  </SizableText>
                  <SizableText
                    color={selectedType === 'owner' ? '$color3' : '$color10'}
                    size="$3"
                  >
                    {t('owner_desc')}
                  </SizableText>
                </YStack>
              </XStack>
              {selectedType === 'owner' && (
                <ChevronRight size={18} color="$color1" />
              )}
            </XStack>
          </Button>
        </YStack>

        {/* Save button */}
        <Button
          theme="active"
          size="$5"
          width="100%"
          onPress={handleSave}
          disabled={submitting || !selectedType || !displayName.trim()}
          opacity={!selectedType || !displayName.trim() ? 0.5 : 1}
          icon={submitting ? <Spinner size="small" color="$color1" /> : undefined}
          marginTop="$2"
        >
          {submitting ? t('loading') : t('get_started')}
        </Button>
      </YStack>
    </ScrollView>
  )
}
