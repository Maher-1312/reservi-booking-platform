import { useRouter } from 'expo-router'
import {
  YStack,
  XStack,
  ScrollView,
  Card,
  Button,
  Avatar,
  Paragraph,
  SizableText,
  H3,
  AppHeader,
  Badge,
  Separator,
  toast,
  ListItem,
  Switch,
} from '@blinkdotnew/mobile-ui'
import {
  User,
  Calendar,
  Heart,
  Settings,
  Globe,
  Info,
  LogOut,
  Store,
  LayoutDashboard,
} from '@blinkdotnew/mobile-ui'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/i18n'
import type { Language } from '@/types'

export default function ProfileScreen() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, userType, setUserType, signOut } = useAuth()
  const { t, locale, setLocale } = useTranslation()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.show(t('sign_out'), {
        message:
          locale === 'fr'
            ? 'Vous êtes déconnecté'
            : locale === 'ar'
              ? 'تم تسجيل الخروج'
              : 'You have been signed out',
        preset: 'success',
      })
    } catch {
      // signOut handles its own errors
    }
  }

  const languageOptions: { label: string; value: Language }[] = [
    { label: 'FR', value: 'fr' },
    { label: 'EN', value: 'en' },
    { label: 'AR', value: 'ar' },
  ]

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$color1" alignItems="center" justifyContent="center">
        <Paragraph color="$color10">{t('loading')}</Paragraph>
      </YStack>
    )
  }

  if (!isAuthenticated) {
    return (
      <YStack flex={1} backgroundColor="$color1">
        <AppHeader title={t('my_profile')} variant="default" />
        <ScrollView
          flex={1}
          contentContainerStyle={{ padding: 24, alignItems: 'center', flex: 1, justifyContent: 'center' }}
        >
          <YStack alignItems="center" gap="$5" width="100%">
            <User size={64} color="$color8" />
            <YStack alignItems="center" gap="$2">
              <H3 color="$color12">{t('login_title')}</H3>
              <Paragraph color="$color10" textAlign="center">
                {locale === 'fr'
                  ? 'Connectez-vous pour accéder à votre profil'
                  : locale === 'ar'
                    ? 'سجل الدخول للوصول إلى ملفك الشخصي'
                    : 'Sign in to access your profile'}
              </Paragraph>
            </YStack>
            <YStack gap="$3" width="100%">
              <Button theme="active" onPress={() => router.push('/auth')}>
                {t('sign_in')}
              </Button>
              <Button variant="outlined" onPress={() => router.push('/auth')}>
                {t('create_account')}
              </Button>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$color1">
      <AppHeader title={t('my_profile')} variant="default" />

      <ScrollView
        flex={1}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Profile Card ─── */}
        <YStack padding="$4" alignItems="center" gap="$3">
          <Avatar circular size="$8">
            <Avatar.Image source={{ uri: user?.avatar_url ?? '' }} />
            <Avatar.Fallback>
              <User size={32} color="$color10" />
            </Avatar.Fallback>
          </Avatar>

          <YStack alignItems="center" gap="$1">
            <SizableText size="$5" fontWeight="700" color="$color12">
              {user?.display_name || user?.email?.split('@')[0] || t('client')}
            </SizableText>
            <Paragraph size="$2" color="$color10">
              {user?.email}
            </Paragraph>
            {userType && (
              <Badge variant={userType === 'owner' ? 'success' : 'info'}>
                {t(userType)}
              </Badge>
            )}
          </YStack>
        </YStack>

        <Separator />

        {/* ─── Menu Items ─── */}
        <YStack padding="$2" gap="$1">
          <ListItem
            title={t('my_reservations')}
            icon={<Calendar size={18} color="$color9" />}
            onPress={() => router.push('/(tabs)/bookings')}
          />
          <ListItem
            title={t('favorites')}
            icon={<Heart size={18} color="$color9" />}
            onPress={() => router.push('/favorites')}
          />
          <ListItem
            title={t('settings')}
            icon={<Settings size={18} color="$color9" />}
            onPress={() => router.push('/settings')}
          />
          <ListItem
            title={t('language')}
            icon={<Globe size={18} color="$color9" />}
            onPress={() => {}}
          />
          <ListItem
            title={t('about')}
            icon={<Info size={18} color="$color9" />}
            onPress={() => router.push('/about')}
          />
        </YStack>

        <Separator />

        {/* ─── Owner Mode ─── */}
        <YStack padding="$4" gap="$3">
          <Paragraph size="$2" fontWeight="600" color="$color10">
            {t('switch_to_owner_mode')}
          </Paragraph>
          <ListItem
            title={
              userType === 'owner'
                ? t('switch_to_client_mode')
                : t('switch_to_owner_mode')
            }
            icon={
              <Switch
                checked={userType === 'owner'}
                onCheckedChange={(checked) => {
                  setUserType(checked ? 'owner' : 'client')
                  toast.show(
                    checked ? t('switch_to_owner_mode') : t('switch_to_client_mode'),
                    { preset: 'success' },
                  )
                }}
              >
                <Switch.Thumb />
              </Switch>
            }
            onPress={() => {
              const next = userType === 'owner' ? 'client' : 'owner'
              setUserType(next)
              toast.show(
                next === 'owner'
                  ? t('switch_to_owner_mode')
                  : t('switch_to_client_mode'),
                { preset: 'success' },
              )
            }}
          />
        </YStack>

        {userType === 'owner' && (
          <YStack paddingHorizontal="$4" paddingBottom="$3">
            <ListItem
              title={t('owner_dashboard_link')}
              icon={<LayoutDashboard size={18} color="$color9" />}
              onPress={() => router.push('/owner/dashboard')}
            />
          </YStack>
        )}

        <Separator />

        {/* ─── Language Switcher ─── */}
        <YStack padding="$4" gap="$3">
          <Paragraph size="$2" fontWeight="600" color="$color10">
            {t('language')}
          </Paragraph>
          <XStack gap="$3">
            {languageOptions.map((lang) => (
              <Button
                key={lang.value}
                size="$3"
                theme={locale === lang.value ? 'active' : undefined}
                variant={locale === lang.value ? undefined : 'outlined'}
                onPress={() => setLocale(lang.value)}
              >
                {lang.label}
              </Button>
            ))}
          </XStack>
        </YStack>

        <Separator />

        {/* ─── Sign Out ─── */}
        <YStack padding="$4">
          <Button
            variant="outlined"
            theme="red"
            onPress={handleSignOut}
          >
            <XStack gap="$2">
              <LogOut size={16} color="$red9" />
              <Paragraph>{t('sign_out')}</Paragraph>
            </XStack>
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
