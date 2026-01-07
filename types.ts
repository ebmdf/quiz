

import type { RefObject } from 'react';

export interface Question {
  pergunta: string;
  opcoes: string[];
  resposta: number;
}

export type Difficulty = 'facil' | 'medio' | 'dificil';

export type Theme = 
  | 'ciencia' 
  | 'historia' 
  | 'entretenimento' 
  | 'geografia' 
  | 'matematica' 
  | 'ingles' 
  | 'conhecimentos-gerais' 
  | 'aleatorio';

export type GameState = 'welcome' | 'playing' | 'finished';

export type QuizData = {
  [key in Exclude<Theme, 'aleatorio'>]: {
    [key in Difficulty]: Question[];
  };
};

export interface GameStats {
    date: string;
    theme: Theme;
    difficulty: Difficulty;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
}

export type ButtonPosition = 
  | 'center' 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

export interface Banner {
  id: string;
  image: string | File;
  width: string;
  height: string;
  affiliateLink?: string;
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonPosition?: ButtonPosition;
  type: 'fixed' | 'floating';
  position?: 'left' | 'right';
  floatingVerticalPosition?: 'top' | 'bottom';
  floatingHorizontalPosition?: 'left' | 'center' | 'right';
}

export interface ProductButton {
  id: string;
  text: string;
  link: string;
  color?: string;
  textColor?: string;
  style?: 'solid' | 'outline';
}

export interface ProductVariantOption {
  id: string;
  value: string; // "P", "M", "Vermelho"
  image?: File | string;
  priceModifier?: number; // e.g., 10 for +R$10.00
  weight?: number; // in grams
}

export interface ProductVariant {
  id: string;
  name: string; // "Tamanho", "Cor"
  options: ProductVariantOption[];
}

export interface Product {
  id:string;
  name: string;
  description?: string;
  price?: number;
  listPrice?: number;
  priceColor?: string;
  listPriceColor?: string;
  image: File;
  buttons?: ProductButton[];
  link?: string;
  enabled: boolean;
  rating?: number;
  favoriteCount?: number;
  variants?: ProductVariant[];
  couponText?: string;
  stock?: number;
  weight?: number; // in kg
  width?: number; // in cm
  height?: number; // in cm
  length?: number; // in cm
  showDiscountPercentage?: boolean;
  shippingRule?: { 
      enabled: boolean;
      type: 'free' | 'fixed'; 
      minQuantity: number; 
      minTotal: number; 
      fixedCost?: number; 
  };
  visibility?: { type: 'all' | 'city' | 'cep_range'; cities?: string; cepRanges?: { start: string; end: string }[]; };
  installmentOptions?: {
      enabled: boolean;
      maxInstallments?: number;
      interestFreeInstallments?: number;
      interestRate?: number;
  };
}

export interface ProductShowcase {
  id: string;
  title: string;
  productIds: string[];
  displayLimit?: number;
  priceSize?: 'small' | 'medium' | 'large' | 'xl'; // New: Control price font size
  customButtonLabel?: string; // New: Override default button text
  enabled: boolean;
  order: number;
  backgroundColor?: string;
  titleColor?: string;
  icon?: File | string;
  // New fields for rating and line
  showRating?: boolean;
  showLine?: boolean;
  lineColor?: string;
  lineThickness?: number;
  linePosition?: 'top' | 'bottom';
}

export interface ContentBanner {
  id: string;
  order: number;
  enabled: boolean;
  type: 'image' | 'html';
  image?: File | string;
  link?: string;
  htmlContent?: string;
  width: string; // e.g., '100%', '800px'
  height: string; // e.g., 'auto', '250px'
  categoryId: string; // ID of the category to show this banner in
}

export interface Affiliate {
  id: string;
  link: string;
  imageUrl: string;
}

export interface ProductDetailConfig {
  showReportLink: boolean;
  reportLinkText: string;
  reportEmail?: string; 
  showLightningDeal: boolean;
  lightningDealText: string;
  lightningDealTimerEnabled: boolean;
  lightningDealHours: number;
  lightningDealMinutes: number;
  lightningDealSeconds: number;
  lightningDealBgColor?: string;
  lightningDealTextColor?: string;
  showCouponInfo: boolean;
  couponInfoLabel: string;
  showShippingInfo: boolean;
  shippingInfoText: string;
  showShareButtons: boolean;
  shareButtonsLabel: string;
  showFavoriteButton: boolean;
  favoriteCountText: string;
  
  // Social Share Toggles & Configs
  enableFacebookShare?: boolean;
  facebookShareLink?: string;
  customIconFacebook?: File | string;

  enableTwitterShare?: boolean;
  twitterShareLink?: string;
  customIconTwitter?: File | string;

  enablePinterestShare?: boolean;
  pinterestShareLink?: string;
  customIconPinterest?: File | string;

  enableWhatsAppShare?: boolean;
  whatsAppShareNumber?: string; // If set, shares TO this number
  customIconWhatsApp?: File | string;

  enableInstagramShare?: boolean;
  instagramShareLink?: string;
  customIconInstagram?: File | string;

  enableTikTokShare?: boolean;
  tikTokShareLink?: string;
  customIconTikTok?: File | string;
}

export interface PaymentMethodImage {
    id: string;
    image: File | string;
    name: string;
}

export interface PixConfig {
    enabled: boolean;
    beneficiaryName: string;
    beneficiaryCity: string;
    pixKey: string;
    description?: string;
}

export interface FreeShippingRegion {
  id: string;
  name: string;
  startCep?: string;
  endCep?: string;
  states?: string; // Comma-separated list of state UFs, e.g., "SP,RJ,MG"
  cities?: string; // Comma-separated list of cities, e.g., "São Paulo,Campinas"
}

export interface FixedShippingRegion {
  id: string;
  name: string;
  startCep: string;
  endCep: string;
  cost: number;
}

export interface CorreiosConfig {
  enabled: boolean;
  originCep: string;
  pacBaseCost: number;
  pacKgCost: number;
  sedexBaseCost: number;
  sedexKgCost: number;
  defaultLength: number; // in cm
  defaultWidth: number; // in cm
  defaultHeight: number; // in cm
  defaultWeight: number; // in kg
}

export interface ShippingConfig {
  baseCost: number;
  freeShippingThreshold?: number;
  freeShippingRegions: FreeShippingRegion[];
  fixedShippingRegionsEnabled: boolean;
  fixedShippingRegions: FixedShippingRegion[];
  storePickupEnabled: boolean;
  storeAddress: string;
  correiosConfig: CorreiosConfig;
}

export interface CartIconConfig {
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'small' | 'medium' | 'large';
  backgroundColor: string;
  iconColor: string;
  badgeBackgroundColor: string;
  badgeTextColor: string;
  labelText?: string;
}

export interface BoletoConfig {
    enabled: boolean;
    beneficiaryName: string;
    beneficiaryDocument: string;
    bankName: string;
    bankCode: string;
    agency: string;
    account: string;
    wallet: string;
    instructions: string;
    dueDateDays: number;
}

export interface PagSeguroConfig {
  email: string;
  token: string;
  enabled: boolean;
  environment: 'sandbox' | 'production';
}

export interface MercadoPagoConfig {
  publicKey: string;
  accessToken: string;
  enabled: boolean;
  environment: 'sandbox' | 'production';
}

export interface PaymentGateways {
    pagseguro: PagSeguroConfig;
    mercadopago: MercadoPagoConfig;
}

export interface InstallmentConfig {
    maxInstallments: number;
    interestFreeInstallments: number;
    interestRate: number; // monthly interest rate in percent, e.g. 1.99
    specialInstallmentRule?: { 
        enabled: boolean; 
        minTotal: number; 
        maxInstallments: number; 
        interestFreeInstallments: number; 
    };
}

export interface EmailConfig {
    adminEmails: string[]; 
    smtpServer?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail?: string;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    maxUses?: number; // Total global uses allowed
    currentUses?: number; // Current global uses
    enabled: boolean;
    firstPurchaseOnly?: boolean; // Valid only for first purchase
    productIds?: string[]; // Valid for specific products only
}

export interface StoreConfig {
  storeName: string;
  themePrimaryColor: string;
  themeBgColor: string;
  buyButtonText: string;
  buyButtonColor: string;
  buyButtonTextColor: string;
  productDetailConfig: ProductDetailConfig;
  shippingConfig: ShippingConfig;
  installmentConfig: InstallmentConfig;
  paymentMethodImages: PaymentMethodImage[];
  pixConfig: PixConfig;
  paymentGateways: PaymentGateways;
  cartIconConfig: CartIconConfig;
  boletoConfig: BoletoConfig;
  emailConfig: EmailConfig;
  coupons: Coupon[];
}

export interface CarouselImage {
  id: string;
  image: File;
  link?: string;
  showButton?: boolean;
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonPosition?: ButtonPosition;
}

export interface CarouselConfig {
  images: CarouselImage[];
  width: string;
  height: string;
  autoplay: boolean;
  transitionSpeed: number;
  transitionType?: 'fade' | 'slide' | 'zoom';
}

export interface DownloadableFile {
  id: string;
  name: string;
  description: string;
  downloadUrl: string;
  icon?: File;
  fileName?: string;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: File;
}

export interface FooterImage {
    id: string;
    image: File | string;
    link?: string;
    width: string;
    height: string;
    order: number;
}

export type FooterElement = 'newsletter' | 'social' | 'text' | 'images' | 'categories' | 'map' | 'address';

export interface FooterElementStyle {
  alignment: 'left' | 'center' | 'right';
  textColor?: string;
}

export interface FooterConfig {
  text: string;
  height: string;
  width: string;
  fullWidth: boolean;
  bgColor: string;
  defaultTextColor: string;
  socialLinks: SocialLink[];
  footerImages: FooterImage[];
  categoryLinkIds: string[];
  elementOrder: FooterElement[];
  elementStyles: {
    [key in FooterElement]?: Partial<FooterElementStyle>;
  };
  address?: string;
  mapConfig?: {
    enabled: boolean;
    embedUrl: string;
    height?: string; // Map height
    width?: string; // Map width
  };
}

export interface NewsletterConfig {
    enabled: boolean;
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    buttonText: string;
}

export interface WhatsAppConfig {
    enabled: boolean;
    number: string;
    icon?: File;
    size?: 'small' | 'medium' | 'large';
    opacity?: number;
    allowClose: boolean;
}

export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    backgroundColorStart: string;
    backgroundColorEnd: string;
    cardBackgroundColor: string;
    textColor: string;
    secondaryTextColor: string;
    successColor: string;
    dangerColor: string;
    navigationTextColor?: string;
    navigationSelectedTextColor?: string;
    enableDarkMode: boolean;
    enableStickyNav?: boolean;
    navStyle?: 'standard' | 'floating';
}

export interface MusicTrack {
  id: string;
  name: string;
  artist?: string;
  file: File;
}

export interface MusicPlayerConfig {
    trackIds: string[];
    autoplay: boolean;
    loop: boolean;
    showPlaylist: boolean;
    sizePreset?: 'small' | 'medium' | 'large' | 'custom';
    customWidth?: string;
    customHeight?: string;
    playerStyle?: 'standard' | 'compact' | 'full-art';
    visualizerType?: 'none' | 'bars' | 'circle' | 'wave';
    visualizerColor?: string;
    backgroundColor?: string;
    primaryColor?: string;
    textColor?: string;
    playAcrossPages?: boolean;
}

export type VisualizerType = 'none' | 'bars' | 'circle' | 'wave';

export interface QuickAccessIconConfig {
    enabled: boolean;
    position: 'header-left' | 'header-right' | 'footer-left' | 'footer-right';
    size: 'small' | 'medium' | 'large';
    iconColor?: string;
    iconBgColor?: string;
    opacity?: number;
}

export interface GlobalMusicConfig {
    enabled: boolean;
    trackIds: string[];
    autoplay: boolean;
    loop: boolean;
    shuffle?: boolean;
    visualizerType: VisualizerType;
    visualizerColor: string;
    backgroundColor: string;
    primaryColor: string;
    textColor: string;
    showOnMobile?: boolean;
    quickAccessIcon: QuickAccessIconConfig;
}

export interface SiteCategory {
  id: string;
  name: string;
  type: 'quiz' | 'wordsearch' | 'products' | 'downloads' | 'reviews' | 'custom' | 'music' | 'account';
  enabled: boolean;
  order: number;
  color?: string;
  content?: string;
  musicPlayerConfig?: MusicPlayerConfig;
}

export interface NavigationItem {
  id: string;
  name: string;
  categoryIds: string[];
  enabled: boolean;
  order: number;
  color?: string;
  isSubMenu?: boolean;
  subItems?: NavigationItem[];
}

export interface Review {
    id: string;
    name: string;
    rating: number; // 1-5
    type: 'text' | 'video';
    content: string; // text or youtube URL
    image: File;
    enabled: boolean;
}

export interface ReviewsConfig {
    enabled: boolean;
    title: string;
    videoModalWidth: string;
}

export interface PopupConfig {
  enabled: boolean;
  title: string;
  content: string;
  image?: File | string;
  buttonText?: string;
  buttonLink?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  backgroundColor?: string;
  textColor?: string;
  showOncePerSession: boolean;
}

export interface AnalyticsEvent {
    id?: number;
    type: string;
    timestamp: number;
    data?: any;
}

export interface AdminButtonConfig {
    bgColor: string;
    iconColor: string;
    opacity: number;
    hideOnMobile: boolean;
}

export interface SeoConfig {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImage?: File | string;
}

export interface WordSearchConfig {
    sizes: {
        facil: number;
        medio: number;
        dificil: number;
    };
}

export interface AdminReply {
    text: string;
    timestamp: number;
}

export interface Comment {
    id: string;
    userId: string; // email of the user
    userName: string;
    targetId: string; // e.g., product.id, quiz-historia-facil
    targetType: 'product' | 'quiz' | 'wordsearch' | 'download';
    text: string;
    rating: number; // 1-5
    timestamp: number;
    adminReply?: AdminReply;
    isApproved: boolean;
}

export interface CommentsConfig {
    enabled: boolean;
    enableOnProducts: boolean;
    enableOnQuiz: boolean;
    enableOnWordSearch: boolean;
    enableOnDownloads: boolean;
    requireApproval: boolean;
}

export interface CookieConsentConfig {
    enabled: boolean;
    message: string;
    acceptButtonText: string;
    declineButtonText: string;
    privacyPolicyLink?: string;
}

export interface SiteConfig {
    id: string; // Added for IndexedDB
    logo?: string | File;
    siteTitle: string;
    siteSubtitle: string;
    showGuestNameInHeader: boolean;
    downloadsTitle: string;
    navigationItems: NavigationItem[];
    siteCategories: SiteCategory[];
    initialNavItemId: string;
    defaultCategoriesAfterQuiz: string[];
    storeConfig: StoreConfig;
    carouselConfig: CarouselConfig;
    reviewsConfig: ReviewsConfig;
    footerConfig: FooterConfig;
    newsletterConfig: NewsletterConfig;
    whatsAppConfig: WhatsAppConfig;
    themeConfig: ThemeConfig;
    globalMusicConfig: GlobalMusicConfig;
    popupConfig: PopupConfig;
    adminButtonConfig: AdminButtonConfig;
    seoConfig: SeoConfig;
    wordSearchConfig: WordSearchConfig;
    contentGating?: {
        quiz: boolean;
        wordsearch: boolean;
        downloads: boolean;
    };
    adminCredentials: {
        email: string;
        password: string;
        recoveryToken?: string | null;
        recoveryTokenExpiry?: number | null;
    };
    commentsConfig: CommentsConfig;
    cookieConsentConfig: CookieConsentConfig;
}

export interface AudioPlayerState {
  playlist: MusicTrack[];
  originalPlaylist: MusicTrack[];
  config: MusicPlayerConfig | GlobalMusicConfig;
  currentTrackIndex: number;
  isPlaying: boolean;
  shuffle: boolean;
  volume: number;
}

export interface Address {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    localidade: string;
    uf: string;
}

export interface User {
    id: string; // use email as id
    name: string;
    dob: string; // date of birth
    cpf: string;
    phone: string;
    email: string;
    password: string;
    address: Address;
    recoveryToken?: string | null;
    recoveryTokenExpiry?: number | null; // Timestamp
}

export interface CartItem {
  id: string; // Combination of productId and variant options
  productId: string;
  quantity: number;
  selectedOptions: Record<string, string>; // { [variantId]: optionId }
  couponCode?: string; // Stored coupon code for persistence
}

export interface Order {
    id: string;
    userId: string;
    items: (CartItem & { productSnapshot: Product })[];
    shippingAddress: Address;
    shippingCost: number;
    subtotal: number;
    total: number;
    installments: { count: number; value: number; total: number };
    paymentMethod: 'credit-card' | 'boleto' | 'pix' | 'pix_mercadopago' | 'pix_pagseguro';
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    date: string; // ISO string
    trackingCode?: string;
}

export interface ShippingDetails {
    cep: string;
    cost: number;
    deliveryTime: string;
    address: string;
    method: 'standard' | 'free' | 'pickup' | 'PAC' | 'SEDEX' | 'fixed' | 'special_free' | 'special_fixed';
    label?: string;
}

export interface SiteContextType {
    siteConfig: SiteConfig;
    setSiteConfig: (config: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => Promise<void>;
    banners: Banner[];
    setBanners: (banners: Banner[]) => Promise<void>;
    contentBanners: ContentBanner[];
    setContentBanners: (banners: ContentBanner[]) => Promise<void>;
    products: Product[];
    setProducts: (products: Product[] | ((prev: Product[]) => Product[])) => Promise<void>;
    productShowcases: ProductShowcase[];
    setProductShowcases: (showcases: ProductShowcase[]) => Promise<void>;
    downloads: DownloadableFile[];
    setDownloads: (downloads: DownloadableFile[]) => Promise<void>;
    reviews: Review[];
    setReviews: (reviews: Review[]) => Promise<void>;
    musicTracks: MusicTrack[];
    setMusicTracks: (tracks: MusicTrack[]) => Promise<void>;
    users: User[];
    setUsers: (users: User[] | ((prev: User[]) => User[])) => Promise<void>;
    cart: CartItem[];
    setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => Promise<void>;
    orders: Order[];
    setOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => Promise<void>;
    comments: Comment[];
    setComments: (comments: Comment[] | ((prev: Comment[]) => Comment[])) => Promise<void>;
    addToCart: (product: Product, quantity: number, selectedOptions: Record<string, string>, couponCode?: string) => void;
    consumeCoupon: (code: string) => Promise<void>;
    gameState: GameState;
    setGameState: (state: GameState) => void;
    activeNavId: string;
    setActiveNavId: (id: string) => void;
    DEFAULT_SITE_CONFIG: SiteConfig;
    audioPlayerState: AudioPlayerState | null;
    setAudioPlayerState: (state: AudioPlayerState | null | ((prevState: AudioPlayerState | null) => AudioPlayerState | null)) => void;
    audioElementRef: RefObject<HTMLAudioElement>;
    analyserNode: AnalyserNode | null;
    audioContext: AudioContext | null;
    logAnalyticsEvent: (type: string, data?: any) => void;
    getAnalyticsEvents: () => Promise<AnalyticsEvent[]>;
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    shippingDetails: ShippingDetails | null;
    setShippingDetails: (details: ShippingDetails | null) => void;
    isInitialLoad: boolean;
    
    // New: State for persisting installment choice
    selectedInstallmentCount: number;
    setSelectedInstallmentCount: (count: number) => void;
}
