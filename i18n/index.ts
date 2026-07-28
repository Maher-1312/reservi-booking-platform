import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Language } from '@/types'

// ---------------------------------------------------------------------------
// Translation map — every key has fr / en / ar
// ---------------------------------------------------------------------------

type TranslationKey = keyof typeof translations

const translations = {
  // ---- Common ----------------------------------------------------------
  app_name: {
    fr: 'Reservi',
    en: 'Reservi',
    ar: 'Reservi',
  },
  welcome: {
    fr: 'Bienvenue',
    en: 'Welcome',
    ar: 'مرحباً',
  },
  get_started: {
    fr: 'Commencer',
    en: 'Get Started',
    ar: 'ابدأ الآن',
  },
  sign_in: {
    fr: 'Se connecter',
    en: 'Sign In',
    ar: 'تسجيل الدخول',
  },
  sign_up: {
    fr: "S'inscrire",
    en: 'Sign Up',
    ar: 'إنشاء حساب',
  },
  sign_out: {
    fr: 'Se déconnecter',
    en: 'Sign Out',
    ar: 'تسجيل الخروج',
  },
  email: {
    fr: 'Email',
    en: 'Email',
    ar: 'البريد الإلكتروني',
  },
  password: {
    fr: 'Mot de passe',
    en: 'Password',
    ar: 'كلمة المرور',
  },
  phone: {
    fr: 'Téléphone',
    en: 'Phone',
    ar: 'الهاتف',
  },
  confirm: {
    fr: 'Confirmer',
    en: 'Confirm',
    ar: 'تأكيد',
  },
  cancel: {
    fr: 'Annuler',
    en: 'Cancel',
    ar: 'إلغاء',
  },
  save: {
    fr: 'Enregistrer',
    en: 'Save',
    ar: 'حفظ',
  },
  delete: {
    fr: 'Supprimer',
    en: 'Delete',
    ar: 'حذف',
  },
  edit: {
    fr: 'Modifier',
    en: 'Edit',
    ar: 'تعديل',
  },
  back: {
    fr: 'Retour',
    en: 'Back',
    ar: 'رجوع',
  },
  next: {
    fr: 'Suivant',
    en: 'Next',
    ar: 'التالي',
  },
  skip: {
    fr: 'Passer',
    en: 'Skip',
    ar: 'تخطي',
  },
  search: {
    fr: 'Rechercher',
    en: 'Search',
    ar: 'بحث',
  },
  filter: {
    fr: 'Filtrer',
    en: 'Filter',
    ar: 'تصفية',
  },
  loading: {
    fr: 'Chargement...',
    en: 'Loading...',
    ar: 'جارٍ التحميل...',
  },
  error: {
    fr: 'Erreur',
    en: 'Error',
    ar: 'خطأ',
  },
  retry: {
    fr: 'Réessayer',
    en: 'Retry',
    ar: 'إعادة المحاولة',
  },
  no_results: {
    fr: 'Aucun résultat',
    en: 'No results',
    ar: 'لا توجد نتائج',
  },
  empty_favorites: {
    fr: 'Aucun favori',
    en: 'No favorites',
    ar: 'لا توجد مفضلات',
  },
  empty_reservations: {
    fr: 'Aucune réservation',
    en: 'No reservations',
    ar: 'لا توجد حجوزات',
  },
  confirm_logout: {
    fr: 'Voulez-vous vraiment vous déconnecter ?',
    en: 'Are you sure you want to log out?',
    ar: 'هل أنت متأكد من تسجيل الخروج؟',
  },

  // ---- Auth ------------------------------------------------------------
  login_title: {
    fr: 'Connexion',
    en: 'Login',
    ar: 'تسجيل الدخول',
  },
  login_subtitle: {
    fr: 'Connectez-vous pour continuer',
    en: 'Sign in to continue',
    ar: 'سجل الدخول للمتابعة',
  },
  create_account: {
    fr: 'Créer un compte',
    en: 'Create Account',
    ar: 'إنشاء حساب',
  },
  already_have_account: {
    fr: 'Vous avez déjà un compte ?',
    en: 'Already have an account?',
    ar: 'لديك حساب بالفعل؟',
  },
  forgot_password: {
    fr: 'Mot de passe oublié ?',
    en: 'Forgot Password?',
    ar: 'نسيت كلمة المرور؟',
  },
  choose_profile: {
    fr: 'Choisissez votre profil',
    en: 'Choose your profile',
    ar: 'اختر ملفك الشخصي',
  },
  client: {
    fr: 'Client',
    en: 'Client',
    ar: 'عميل',
  },
  owner: {
    fr: 'Propriétaire',
    en: 'Owner',
    ar: 'مالك',
  },
  i_am_client: {
    fr: 'Je suis client',
    en: 'I am a client',
    ar: 'أنا عميل',
  },
  i_am_owner: {
    fr: 'Je suis propriétaire',
    en: 'I am an owner',
    ar: 'أنا مالك',
  },
  login_with_email: {
    fr: 'Se connecter avec email',
    en: 'Login with Email',
    ar: 'تسجيل الدخول بالبريد الإلكتروني',
  },
  login_with_google: {
    fr: 'Continuer avec Google',
    en: 'Continue with Google',
    ar: 'المتابعة مع جوجل',
  },
  login_with_apple: {
    fr: 'Continuer avec Apple',
    en: 'Continue with Apple',
    ar: 'المتابعة مع آبل',
  },
  email_placeholder: {
    fr: 'votre@email.com',
    en: 'your@email.com',
    ar: 'بريدك@example.com',
  },
  password_placeholder: {
    fr: 'Votre mot de passe',
    en: 'Your password',
    ar: 'كلمة المرور الخاصة بك',
  },

  // ---- Home ------------------------------------------------------------
  home_title: {
    fr: 'Accueil',
    en: 'Home',
    ar: 'الرئيسية',
  },
  discover: {
    fr: 'Découvrir',
    en: 'Discover',
    ar: 'اكتشف',
  },
  popular: {
    fr: 'Populaires',
    en: 'Popular',
    ar: 'الأكثر شعبية',
  },
  near_you: {
    fr: 'Près de chez vous',
    en: 'Near You',
    ar: 'بالقرب منك',
  },
  promotions: {
    fr: 'Promotions',
    en: 'Promotions',
    ar: 'العروض',
  },
  new_arrivals: {
    fr: 'Nouveautés',
    en: 'New Arrivals',
    ar: 'وصل حديثاً',
  },
  view_all: {
    fr: 'Voir tout',
    en: 'View All',
    ar: 'عرض الكل',
  },
  search_placeholder: {
    fr: 'Rechercher un établissement...',
    en: 'Search for a place...',
    ar: 'ابحث عن مكان...',
  },
  categories: {
    fr: 'Catégories',
    en: 'Categories',
    ar: 'الفئات',
  },

  // ---- Categories ------------------------------------------------------
  restaurant: {
    fr: 'Restaurant',
    en: 'Restaurant',
    ar: 'مطعم',
  },
  cafe: {
    fr: 'Café',
    en: 'Café',
    ar: 'مقهى',
  },
  doctor: {
    fr: 'Médecin',
    en: 'Doctor',
    ar: 'طبيب',
  },
  sports_field: {
    fr: 'Terrain de sport',
    en: 'Sports Field',
    ar: 'ملعب رياضي',
  },
  salon: {
    fr: 'Salon de coiffure',
    en: 'Salon',
    ar: 'صالون',
  },
  gym: {
    fr: 'Salle de sport',
    en: 'Gym',
    ar: 'نادي رياضي',
  },
  hotel: {
    fr: 'Hôtel',
    en: 'Hotel',
    ar: 'فندق',
  },
  spa: {
    fr: 'Spa',
    en: 'Spa',
    ar: 'منتجع صحي',
  },
  other: {
    fr: 'Autre',
    en: 'Other',
    ar: 'أخرى',
  },

  // ---- Establishment Detail --------------------------------------------
  photos: {
    fr: 'Photos',
    en: 'Photos',
    ar: 'صور',
  },
  description: {
    fr: 'Description',
    en: 'Description',
    ar: 'الوصف',
  },
  address: {
    fr: 'Adresse',
    en: 'Address',
    ar: 'العنوان',
  },
  website: {
    fr: 'Site web',
    en: 'Website',
    ar: 'الموقع الإلكتروني',
  },
  hours: {
    fr: 'Horaires',
    en: 'Hours',
    ar: 'ساعات العمل',
  },
  reviews: {
    fr: 'Avis',
    en: 'Reviews',
    ar: 'التقييمات',
  },
  services: {
    fr: 'Services',
    en: 'Services',
    ar: 'الخدمات',
  },
  prices: {
    fr: 'Tarifs',
    en: 'Prices',
    ar: 'الأسعار',
  },
  availability: {
    fr: 'Disponibilité',
    en: 'Availability',
    ar: 'التوفر',
  },
  book_now: {
    fr: 'Réserver',
    en: 'Book Now',
    ar: 'احجز الآن',
  },
  add_to_favorites: {
    fr: 'Ajouter aux favoris',
    en: 'Add to Favorites',
    ar: 'أضف إلى المفضلة',
  },
  remove_from_favorites: {
    fr: 'Retirer des favoris',
    en: 'Remove from Favorites',
    ar: 'إزالة من المفضلة',
  },
  write_review: {
    fr: 'Écrire un avis',
    en: 'Write a Review',
    ar: 'اكتب تقييماً',
  },
  owner_reply: {
    fr: 'Réponse du propriétaire',
    en: 'Owner Reply',
    ar: 'رد المالك',
  },
  price_level: {
    fr: 'Niveau de prix',
    en: 'Price Level',
    ar: 'مستوى السعر',
  },
  per_person: {
    fr: 'par personne',
    en: 'per person',
    ar: 'للشخص',
  },
  from_price: {
    fr: 'À partir de',
    en: 'From',
    ar: 'من',
  },
  open_now: {
    fr: 'Ouvert',
    en: 'Open Now',
    ar: 'مفتوح الآن',
  },
  closed_now: {
    fr: 'Fermé',
    en: 'Closed',
    ar: 'مغلق',
  },

  // ---- Reservation -----------------------------------------------------
  select_date: {
    fr: 'Sélectionner une date',
    en: 'Select Date',
    ar: 'اختر التاريخ',
  },
  select_time: {
    fr: 'Sélectionner une heure',
    en: 'Select Time',
    ar: 'اختر الوقت',
  },
  number_of_guests: {
    fr: "Nombre d'invités",
    en: 'Number of Guests',
    ar: 'عدد الضيوف',
  },
  select_service: {
    fr: 'Sélectionner un service',
    en: 'Select Service',
    ar: 'اختر الخدمة',
  },
  notes: {
    fr: 'Notes',
    en: 'Notes',
    ar: 'ملاحظات',
  },
  confirm_reservation: {
    fr: 'Confirmer la réservation',
    en: 'Confirm Reservation',
    ar: 'تأكيد الحجز',
  },
  reservation_confirmed: {
    fr: 'Réservation confirmée',
    en: 'Reservation Confirmed',
    ar: 'تم تأكيد الحجز',
  },
  reservation_cancelled: {
    fr: 'Réservation annulée',
    en: 'Reservation Cancelled',
    ar: 'تم إلغاء الحجز',
  },
  reservation_pending: {
    fr: 'Réservation en attente',
    en: 'Reservation Pending',
    ar: 'الحجز قيد الانتظار',
  },
  modify_reservation: {
    fr: 'Modifier la réservation',
    en: 'Modify Reservation',
    ar: 'تعديل الحجز',
  },
  cancel_reservation: {
    fr: 'Annuler la réservation',
    en: 'Cancel Reservation',
    ar: 'إلغاء الحجز',
  },
  payment_method: {
    fr: 'Moyen de paiement',
    en: 'Payment Method',
    ar: 'طريقة الدفع',
  },

  // ---- Profile ---------------------------------------------------------
  my_profile: {
    fr: 'Mon profil',
    en: 'My Profile',
    ar: 'ملفي الشخصي',
  },
  my_reservations: {
    fr: 'Mes réservations',
    en: 'My Reservations',
    ar: 'حجوزاتي',
  },
  favorites: {
    fr: 'Favoris',
    en: 'Favorites',
    ar: 'المفضلة',
  },
  payment_methods: {
    fr: 'Moyens de paiement',
    en: 'Payment Methods',
    ar: 'طرق الدفع',
  },
  settings: {
    fr: 'Paramètres',
    en: 'Settings',
    ar: 'الإعدادات',
  },
  language: {
    fr: 'Langue',
    en: 'Language',
    ar: 'اللغة',
  },
  dark_mode: {
    fr: 'Mode sombre',
    en: 'Dark Mode',
    ar: 'الوضع الداكن',
  },
  about: {
    fr: 'À propos',
    en: 'About',
    ar: 'حول',
  },
  privacy_policy: {
    fr: 'Politique de confidentialité',
    en: 'Privacy Policy',
    ar: 'سياسة الخصوصية',
  },
  terms_of_service: {
    fr: "Conditions d'utilisation",
    en: 'Terms of Service',
    ar: 'شروط الخدمة',
  },
  contact_us: {
    fr: 'Nous contacter',
    en: 'Contact Us',
    ar: 'اتصل بنا',
  },
  edit_profile: {
    fr: 'Modifier le profil',
    en: 'Edit Profile',
    ar: 'تعديل الملف الشخصي',
  },
  display_name: {
    fr: 'Nom affiché',
    en: 'Display Name',
    ar: 'الاسم المعروض',
  },

  // ---- Owner Dashboard -------------------------------------------------
  dashboard: {
    fr: 'Tableau de bord',
    en: 'Dashboard',
    ar: 'لوحة التحكم',
  },
  total_reservations: {
    fr: 'Total des réservations',
    en: 'Total Reservations',
    ar: 'إجمالي الحجوزات',
  },
  revenue: {
    fr: 'Revenus',
    en: 'Revenue',
    ar: 'الإيرادات',
  },
  occupancy_rate: {
    fr: "Taux d'occupation",
    en: 'Occupancy Rate',
    ar: 'معدل الإشغال',
  },
  calendar: {
    fr: 'Calendrier',
    en: 'Calendar',
    ar: 'التقويم',
  },
  my_establishments: {
    fr: 'Mes établissements',
    en: 'My Establishments',
    ar: 'منشآتي',
  },
  add_establishment: {
    fr: 'Ajouter un établissement',
    en: 'Add Establishment',
    ar: 'إضافة منشأة',
  },
  manage_establishment: {
    fr: 'Gérer',
    en: 'Manage',
    ar: 'إدارة',
  },
  statistics: {
    fr: 'Statistiques',
    en: 'Statistics',
    ar: 'إحصائيات',
  },
  clients: {
    fr: 'Clients',
    en: 'Clients',
    ar: 'العملاء',
  },
  respond_to_review: {
    fr: "Répondre à l'avis",
    en: 'Respond to Review',
    ar: 'الرد على التقييم',
  },
  accept: {
    fr: 'Accepter',
    en: 'Accept',
    ar: 'قبول',
  },
  reject: {
    fr: 'Refuser',
    en: 'Reject',
    ar: 'رفض',
  },
  pending_requests: {
    fr: 'Demandes en attente',
    en: 'Pending Requests',
    ar: 'طلبات معلقة',
  },
  confirmed: {
    fr: 'Confirmé',
    en: 'Confirmed',
    ar: 'مؤكد',
  },
  cancelled: {
    fr: 'Annulé',
    en: 'Cancelled',
    ar: 'ملغي',
  },
  completed: {
    fr: 'Terminé',
    en: 'Completed',
    ar: 'مكتمل',
  },

  // ---- Establishment Form ----------------------------------------------
  establishment_name: {
    fr: "Nom de l'établissement",
    en: 'Establishment Name',
    ar: 'اسم المنشأة',
  },
  establishment_description: {
    fr: 'Description',
    en: 'Description',
    ar: 'الوصف',
  },
  category: {
    fr: 'Catégorie',
    en: 'Category',
    ar: 'الفئة',
  },
  city: {
    fr: 'Ville',
    en: 'City',
    ar: 'المدينة',
  },
  phone_number: {
    fr: 'Numéro de téléphone',
    en: 'Phone Number',
    ar: 'رقم الهاتف',
  },
  website_url: {
    fr: 'Site web',
    en: 'Website URL',
    ar: 'رابط الموقع',
  },
  opening_hours: {
    fr: "Heures d'ouverture",
    en: 'Opening Hours',
    ar: 'ساعات العمل',
  },
  add_photos: {
    fr: 'Ajouter des photos',
    en: 'Add Photos',
    ar: 'إضافة صور',
  },
  logo: {
    fr: 'Logo',
    en: 'Logo',
    ar: 'شعار',
  },
  choose_category: {
    fr: 'Choisir une catégorie',
    en: 'Choose Category',
    ar: 'اختر الفئة',
  },
  features: {
    fr: 'Caractéristiques',
    en: 'Features',
    ar: 'المميزات',
  },
  save_establishment: {
    fr: 'Enregistrer',
    en: 'Save Establishment',
    ar: 'حفظ المنشأة',
  },
  create_establishment: {
    fr: 'Créer',
    en: 'Create Establishment',
    ar: 'إنشاء منشأة',
  },
  edit_establishment: {
    fr: 'Modifier',
    en: 'Edit Establishment',
    ar: 'تعديل المنشأة',
  },

  // ---- Owner extras -----------------------------------------------------
  switch_to_owner_mode: {
    fr: 'Passer en mode propriétaire',
    en: 'Switch to Owner Mode',
    ar: 'التبديل إلى وضع المالك',
  },
  switch_to_client_mode: {
    fr: 'Passer en mode client',
    en: 'Switch to Client Mode',
    ar: 'التبديل إلى وضع العميل',
  },
  owner_dashboard_link: {
    fr: 'Tableau de bord propriétaire',
    en: 'Owner Dashboard',
    ar: 'لوحة تحكم المالك',
  },
  avg_rating: {
    fr: 'Note moyenne',
    en: 'Avg Rating',
    ar: 'متوسط التقييم',
  },
  recent_reservations: {
    fr: 'Réservations récentes',
    en: 'Recent Reservations',
    ar: 'الحجوزات الأخيرة',
  },
  all_filter: {
    fr: 'Tous',
    en: 'All',
    ar: 'الكل',
  },
  reply: {
    fr: 'Répondre',
    en: 'Reply',
    ar: 'رد',
  },
  your_reply: {
    fr: 'Votre réponse',
    en: 'Your Reply',
    ar: 'ردك',
  },
  no_establishments: {
    fr: 'Aucun établissement',
    en: 'No establishments',
    ar: 'لا توجد منشآت',
  },
  establishment_created: {
    fr: 'Établissement créé avec succès',
    en: 'Establishment created successfully',
    ar: 'تم إنشاء المنشأة بنجاح',
  },
  establishment_updated: {
    fr: 'Établissement mis à jour',
    en: 'Establishment updated',
    ar: 'تم تحديث المنشأة',
  },
  reservation_accepted: {
    fr: 'Réservation acceptée',
    en: 'Reservation accepted',
    ar: 'تم قبول الحجز',
  },
  reservation_rejected: {
    fr: 'Réservation refusée',
    en: 'Reservation rejected',
    ar: 'تم رفض الحجز',
  },
  status: {
    fr: 'Statut',
    en: 'Status',
    ar: 'الحالة',
  },
  date: {
    fr: 'Date',
    en: 'Date',
    ar: 'التاريخ',
  },
  time: {
    fr: 'Heure',
    en: 'Time',
    ar: 'الوقت',
  },
  guests: {
    fr: 'Invités',
    en: 'Guests',
    ar: 'ضيوف',
  },
  amount: {
    fr: 'Montant',
    en: 'Amount',
    ar: 'المبلغ',
  },
  top_establishments: {
    fr: 'Meilleurs établissements',
    en: 'Top Establishments',
    ar: 'أفضل المنشآت',
  },
  reservations_by_day: {
    fr: 'Réservations par jour',
    en: 'Reservations by Day',
    ar: 'الحجوزات حسب اليوم',
  },
  monthly_revenue: {
    fr: 'Revenus mensuels',
    en: 'Monthly Revenue',
    ar: 'الإيرادات الشهرية',
  },
  total: {
    fr: 'Total',
    en: 'Total',
    ar: 'المجموع',
  },
  no_reservations_yet: {
    fr: 'Aucune réservation pour le moment',
    en: 'No reservations yet',
    ar: 'لا توجد حجوزات بعد',
  },
  no_reviews_yet: {
    fr: 'Aucun avis pour le moment',
    en: 'No reviews yet',
    ar: 'لا توجد تقييمات بعد',
  },
  view_stats: {
    fr: 'Voir les statistiques',
    en: 'View Statistics',
    ar: 'عرض الإحصائيات',
  },
  form_required: {
    fr: 'Ce champ est requis',
    en: 'This field is required',
    ar: 'هذا الحقل مطلوب',
  },
  select_features: {
    fr: 'Sélectionnez les caractéristiques',
    en: 'Select features',
    ar: 'اختر المميزات',
  },
  reply_sent: {
    fr: 'Réponse envoyée',
    en: 'Reply sent',
    ar: 'تم إرسال الرد',
  },

  // ---- Profile Setup ----------------------------------------------------
  setup_profile_title: {
    fr: 'Configurez votre profil',
    en: 'Set Up Your Profile',
    ar: 'إعداد ملفك الشخصي',
  },
  setup_profile_subtitle: {
    fr: 'Choisissez votre nom et votre type de compte',
    en: 'Choose your name and account type',
    ar: 'اختر اسمك ونوع حسابك',
  },
  display_name_placeholder: {
    fr: 'Votre nom complet',
    en: 'Your full name',
    ar: 'اسمك الكامل',
  },
  client_desc: {
    fr: 'Réserver des services',
    en: 'Book services',
    ar: 'حجز الخدمات',
  },
  owner_desc: {
    fr: 'Gérer mes établissements',
    en: 'Manage my establishments',
    ar: 'إدارة منشآتي',
  },
} as const

// ---------------------------------------------------------------------------
// Zustand store — locale persisted to AsyncStorage
// ---------------------------------------------------------------------------

interface I18nState {
  locale: Language
  setLocale: (locale: Language) => void
}

const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'fr' as Language,
      setLocale: (locale: Language) => set({ locale }),
    }),
    {
      name: 'reservi-i18n',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

// ---------------------------------------------------------------------------
// Translation helper
// ---------------------------------------------------------------------------

function translate(locale: Language, key: string): string {
  if (key in translations) {
    return translations[key as TranslationKey][locale]
  }
  // Fallback: return key itself so devs see missing keys immediately
  console.warn(`[i18n] Missing translation key: "${key}"`)
  return key
}

// ---------------------------------------------------------------------------
// useTranslation hook
// ---------------------------------------------------------------------------

export function useTranslation() {
  const locale = useI18nStore((s) => s.locale)
  const setLocale = useI18nStore((s) => s.setLocale)

  return {
    /** Translate a key to the current locale. */
    t: (key: string) => translate(locale, key),
    /** Current locale ('fr' | 'en' | 'ar'). */
    locale,
    /** Change the active language. */
    setLocale,
    /** True when the current locale is Arabic (RTL). */
    isRTL: locale === 'ar',
  } as const
}

// Re-export the Language type for convenience
export type { Language }
