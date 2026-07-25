import { useState, useCallback } from 'react'
import { router } from 'expo-router'
import { Platform } from 'react-native'
import {
  YStack,
  XStack,
  ScrollView,
  Button,
  Input,
  SizableText,
  H2,
  Paragraph,
  Separator,
  Spinner,
  toast,
} from '@blinkdotnew/mobile-ui'
import {
  ArrowLeft,
  Mail,
  Lock,
  Chrome,
} from '@blinkdotnew/mobile-ui'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/i18n'
import { blink } from '@/lib/blink'

type AuthMode = 'signin' | 'signup'

export default function AuthScreen() {
  const { t } = useTranslation()
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSignIn = mode === 'signin'

  const handleEmailAuth = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      toast.show(t('error'), {
        message: t('email_placeholder'),
        preset: 'error',
      })
      return
    }

    setSubmitting(true)
    try {
      const result = isSignIn
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password)

      if (result.success) {
        toast.show(isSignIn ? t('sign_in') : t('create_account'), {
          message: isSignIn ? t('login_subtitle') : t('get_started'),
          preset: 'success',
        })
        if (isSignIn) {
          router.back()
        } else {
          router.replace('/profile-setup')
        }
      } else {
        toast.show(t('error'), {
          message: result.error?.message ?? t('retry'),
          preset: 'error',
        })
      }
    } catch {
      toast.show(t('error'), {
        message: t('retry'),
        preset: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }, [email, password, isSignIn, signIn, signUp, t])

  const handleGoogleSignIn = useCallback(async () => {
    setSubmitting(true)
    try {
      const result = await signInWithGoogle()
      if (result.success) {
        // Check if user already has a display_name (existing user)
        const me = await blink.auth.me()
        if (me?.display_name) {
          router.back()
        } else {
          router.replace('/profile-setup')
        }
      } else {
        toast.show(t('error'), {
          message: result.error?.message ?? t('retry'),
          preset: 'error',
        })
      }
    } catch {
      toast.show(t('error'), { message: t('retry'), preset: 'error' })
    } finally {
      setSubmitting(false)
    }
  }, [signInWithGoogle, t])

  const handleFacebookSignIn = useCallback(async () => {
    toast.show(t('error'), {
      message: 'Facebook sign-in coming soon',
      preset: 'info',
    })
  }, [t])

  return (
    <ScrollView
      flex={1}
      backgroundColor="$color1"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
    >
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="$5"
        maxWidth={400}
        alignSelf="center"
        width="100%"
        gap="$6"
      >
        {/* Back button */}
        <XStack
          position="absolute"
          top={Platform.OS === 'web' ? '$6' : '$8'}
          left="$4"
        >
          <Button
            chromeless
            onPress={() => router.back()}
            icon={<ArrowLeft size={22} color="$color12" />}
          />
        </XStack>

        {/* Logo & branding */}
        <YStack alignItems="center" gap="$2">
          <SizableText size="$10" fontWeight="900" color="$color12">
            ✦
          </SizableText>
          <H2 color="$color12" fontWeight="800">
            {t('app_name')}
          </H2>
          <Paragraph color="$color10" textAlign="center">
            {t('login_subtitle')}
          </Paragraph>
        </YStack>

        {/* Toggle: Sign In / Create Account (custom pill buttons) */}
        <XStack
          backgroundColor="$color2"
          borderRadius="$6"
          padding="$1"
          gap="$1"
          width="100%"
        >
          <Button
            flex={1}
            size="$4"
            borderRadius="$5"
            backgroundColor={isSignIn ? '$color9' : 'transparent'}
            onPress={() => setMode('signin')}
            pressStyle={{ scale: 0.97 }}
            chromeless={!isSignIn}
            theme={isSignIn ? 'active' : undefined}
          >
            <SizableText
              color={isSignIn ? '$color1' : '$color11'}
              fontWeight="700"
              size="$4"
            >
              {t('sign_in')}
            </SizableText>
          </Button>
          <Button
            flex={1}
            size="$4"
            borderRadius="$5"
            backgroundColor={!isSignIn ? '$color9' : 'transparent'}
            onPress={() => setMode('signup')}
            pressStyle={{ scale: 0.97 }}
            chromeless={isSignIn}
            theme={!isSignIn ? 'active' : undefined}
          >
            <SizableText
              color={!isSignIn ? '$color1' : '$color11'}
              fontWeight="700"
              size="$4"
            >
              {t('create_account')}
            </SizableText>
          </Button>
        </XStack>

        {/* Email + Password form */}
        <YStack gap="$3" width="100%">
          <Input
            size="$5"
            placeholder={t('email_placeholder')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            backgroundColor="$color2"
            borderColor="$color4"
            color="$color12"
          >
            <Input.Icon>
              <Mail size={18} color="$color10" />
            </Input.Icon>
          </Input>

          <Input
            size="$5"
            placeholder={t('password_placeholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            backgroundColor="$color2"
            borderColor="$color4"
            color="$color12"
          >
            <Input.Icon>
              <Lock size={18} color="$color10" />
            </Input.Icon>
          </Input>

          <Button
            theme="active"
            width="100%"
            size="$5"
            onPress={handleEmailAuth}
            disabled={submitting}
            icon={submitting ? <Spinner size="small" color="$color1" /> : undefined}
          >
            {submitting
              ? t('loading')
              : isSignIn
                ? t('sign_in')
                : t('create_account')}
          </Button>
        </YStack>

        {/* Divider */}
        <XStack width="100%" alignItems="center" gap="$3">
          <Separator flex={1} />
          <SizableText size="$2" color="$color9">
            or continue with
          </SizableText>
          <Separator flex={1} />
        </XStack>

        {/* Social buttons */}
        <YStack gap="$3" width="100%">
          <Button
            size="$5"
            width="100%"
            backgroundColor="$color2"
            borderColor="$color4"
            borderWidth={1}
            onPress={handleGoogleSignIn}
            disabled={submitting}
            icon={<Chrome size={20} color="$color12" />}
          >
            {t('login_with_google')}
          </Button>

          <Button
            size="$5"
            width="100%"
            backgroundColor="#1877F2"
            onPress={handleFacebookSignIn}
            disabled={submitting}
            icon={
              <SizableText
                color="white"
                fontWeight="900"
                size="$6"
                marginRight="$2"
              >
                f
              </SizableText>
            }
          >
            <SizableText color="white" fontWeight="600">
              {t('login_with_facebook')}
            </SizableText>
          </Button>
        </YStack>

        {/* Footer */}
        <Paragraph color="$color9" size="$2" textAlign="center">
          By continuing, you agree to our Terms & Privacy Policy.
        </Paragraph>
      </YStack>
    </ScrollView>
  )
}
