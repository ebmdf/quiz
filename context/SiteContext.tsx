


import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import type { SiteConfig, Banner, Product, DownloadableFile, Review, SiteCategory, ProductShowcase, ContentBanner, NavigationItem, MusicTrack, AudioPlayerState, SiteContextType, GameState, AnalyticsEvent, User, CartItem, Order, ShippingDetails, Comment } from '../types';
import { dataService } from '../services/dataService';

const defaultCategories: SiteCategory[] = [
    { id: 'quiz', name: 'Quiz Interativo', type: 'quiz', enabled: true, order: 0, color: '#6366f1' },
    { id: 'wordsearch', name: 'Caça Palavras', type: 'wordsearch', enabled: true, order: 1, color: '#f59e0b' },
    { id: 'products', name: 'Nossa Loja', type: 'products', enabled: true, order: 2, color: '#8b5cf6' },
    { id: 'downloads', name: 'Downloads', type: 'downloads', enabled: true, order: 3, color: '#10b981' },
    { id: 'reviews', name: 'Avaliações', type: 'reviews', enabled: true, order: 4, color: '#ec4899' },
    { id: 'account', name: 'Cadastro de Cliente', type: 'account', enabled: true, order: 5, color: '#ef4444' },
];

const defaultNavItems: NavigationItem[] = [
    { id: 'quiz', name: 'Quiz', categoryIds: ['quiz'], enabled: true, order: 0, color: '#6366f1', isSubMenu: false, subItems: [] },
    { id: 'wordsearch', name: 'Caça Palavras', categoryIds: ['wordsearch'], enabled: true, order: 1, color: '#f59e0b', isSubMenu: false, subItems: [] },
    { id: 'products', name: 'Loja', categoryIds: ['products'], enabled: true, order: 2, color: '#8b5cf6', isSubMenu: false, subItems: [] },
    { id: 'downloads', name: 'Downloads', categoryIds: ['downloads'], enabled: true, order: 3, color: '#10b981', isSubMenu: false, subItems: [] },
    { id: 'reviews', name: 'Avaliações', categoryIds: ['reviews'], enabled: true, order: 4, color: '#ec4899', isSubMenu: false, subItems: [] },
    { id: 'account', name: 'Login / Cadastro', categoryIds: ['account'], enabled: true, order: 5, color: '#ef4444', isSubMenu: false, subItems: [] },
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
    id: 'main_config',
    siteTitle: 'Quiz Interativo',
    siteSubtitle: 'Teste seus conhecimentos e confira nossos produtos!',
    showGuestNameInHeader: true,
    downloadsTitle: 'Arquivos para Download',
    navigationItems: defaultNavItems,
    siteCategories: defaultCategories,
    initialNavItemId: 'quiz',
    defaultCategoriesAfterQuiz: ['quiz'],
    logo: undefined,
    adminCredentials: {
        email: 'ebmdfm@gmail.com',
        password: 'e22b107979',
        recoveryToken: null,
        recoveryTokenExpiry: null,
    },
    storeConfig: {
      storeName: 'Nossa Loja',
      themePrimaryColor: '#4f46e5',
      themeBgColor: '#f9fafb',
      buyButtonText: 'Comprar Agora',
      buyButtonColor: '#10b981',
      buyButtonTextColor: '#ffffff',
      productDetailConfig: {
        showReportLink: true,
        reportLinkText: 'Denunciar',
        reportEmail: '',
        showLightningDeal: true,
        lightningDealText: '⚡ OFERTAS RELÂMPAGO',
        lightningDealTimerEnabled: true,
        lightningDealHours: 4,
        lightningDealMinutes: 38,
        lightningDealSeconds: 21,
        lightningDealBgColor: '#f97316',
        lightningDealTextColor: '#ffffff',
        showCouponInfo: true,
        couponInfoLabel: 'Cupons:',
        showShippingInfo: true,
        shippingInfoText: 'Frete Grátis com cupom',
        showShareButtons: true,
        shareButtonsLabel: 'Compartilhar:',
        showFavoriteButton: true,
        favoriteCountText: 'Favoritar',
        enableFacebookShare: true,
        facebookShareLink: '',
        enableTwitterShare: true,
        twitterShareLink: '',
        enablePinterestShare: true,
        pinterestShareLink: '',
        enableWhatsAppShare: true,
        whatsAppShareNumber: '',
        enableInstagramShare: true,
        instagramShareLink: '',
        enableTikTokShare: true,
        tikTokShareLink: '',
      },
       shippingConfig: {
        baseCost: 10.00,
        freeShippingThreshold: 150.00,
        freeShippingRegions: [],
        fixedShippingRegionsEnabled: true,
        fixedShippingRegions: [],
        storePickupEnabled: false,
        storeAddress: '',
        correiosConfig: {
          enabled: true,
          originCep: '01001-000',
          pacBaseCost: 18.50,
          pacKgCost: 3.20,
          sedexBaseCost: 28.00,
          sedexKgCost: 6.50,
          defaultLength: 16,
          defaultWidth: 11,
          defaultHeight: 2,
          defaultWeight: 0.3,
        }
      },
      installmentConfig: {
        maxInstallments: 12,
        interestFreeInstallments: 3,
        interestRate: 1.99,
        specialInstallmentRule: {
            enabled: false,
            minTotal: 500,
            maxInstallments: 12,
            interestFreeInstallments: 12,
        }
      },
      paymentMethodImages: [],
      pixConfig: {
        enabled: true,
        beneficiaryName: 'Nome Completo do Beneficiário',
        beneficiaryCity: 'CIDADE',
        pixKey: 'chave-pix@email.com',
        description: 'Pagamento Pedido',
      },
      paymentGateways: {
        pagseguro: { email: '', token: '', enabled: false, environment: 'sandbox' },
        mercadopago: { publicKey: '', accessToken: '', enabled: false, environment: 'sandbox' }
      },
      cartIconConfig: {
        enabled: true,
        position: 'top-right',
        size: 'medium',
        backgroundColor: '#ffffff',
        iconColor: '#1f2937',
        badgeBackgroundColor: '#ef4444',
        badgeTextColor: '#ffffff',
        labelText: 'Carrinho',
      },
      boletoConfig: {
        enabled: true,
        beneficiaryName: 'Nome da Sua Empresa LTDA',
        beneficiaryDocument: '00.000.000/0001-00',
        bankName: 'Meu Banco S.A.',
        bankCode: '001',
        agency: '1234-5',
        account: '123456-7',
        wallet: '109',
        instructions: 'Pagar até o vencimento. Após o vencimento, pagar apenas no banco emissor.',
        dueDateDays: 5,
      },
      emailConfig: {
        adminEmails: ['admin@example.com'],
        smtpServer: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: '',
      },
      coupons: [],
    },
    carouselConfig: {
      images: [],
      width: '100%',
      height: '300px',
      autoplay: true,
      transitionSpeed: 500,
      transitionType: 'fade',
    },
    reviewsConfig: {
        enabled: true,
        title: 'O que nossos usuários dizem',
        videoModalWidth: '900px',
    },
    footerConfig: {
        text: `© ${new Date().getFullYear()} Quiz Interativo. Todos os direitos reservados.`,
        height: 'auto',
        width: '100%',
        fullWidth: true,
        bgColor: '#111827',
        defaultTextColor: '#d1d5db',
        socialLinks: [],
        footerImages: [],
        categoryLinkIds: [],
        elementOrder: ['newsletter', 'categories', 'social', 'images', 'map', 'address', 'text'],
        elementStyles: {
            newsletter: { alignment: 'center' },
            categories: { alignment: 'left' },
            social: { alignment: 'left' },
            images: { alignment: 'center' },
            text: { alignment: 'center' },
            map: { alignment: 'center' },
            address: { alignment: 'center' },
        },
        address: '',
        mapConfig: { enabled: false, embedUrl: '', height: '300px', width: '100%' }
    },
    newsletterConfig: {
        enabled: true,
        title: 'Inscreva-se na nossa newsletter',
        subtitle: 'Receba as últimas novidades e ofertas especiais diretamente no seu email.',
        inputPlaceholder: 'seu.email@exemplo.com',
        buttonText: 'Inscrever',
    },
    whatsAppConfig: {
        enabled: true,
        number: '5511999999999',
        icon: undefined,
        size: 'medium',
        opacity: 1,
        allowClose: true,
    },
    themeConfig: {
        primaryColor: '#4f46e5',
        secondaryColor: '#8b5cf6',
        backgroundColorStart: '#6366f1',
        backgroundColorEnd: '#8b5cf6',
        cardBackgroundColor: 'rgba(255, 255, 255, 0.9)',
        textColor: '#1f2937',
        secondaryTextColor: '#4b5563',
        successColor: '#10b981',
        dangerColor: '#ef4444',
        navigationTextColor: '#000000', 
        navigationSelectedTextColor: '#ffffff',
        enableDarkMode: true,
        enableStickyNav: true,
        navStyle: 'standard',
    },
    globalMusicConfig: {
        enabled: false,
        trackIds: [],
        autoplay: false,
        loop: true,
        shuffle: false,
        visualizerType: 'bars',
        visualizerColor: '#6366f1',
        backgroundColor: '#1f2937',
        primaryColor: '#6366f1',
        textColor: '#ffffff',
        showOnMobile: true,
        quickAccessIcon: {
            enabled: false,
            position: 'footer-right',
            size: 'medium',
            iconColor: '#1f2937',
            iconBgColor: 'rgba(243, 244, 246, 0.9)',
            opacity: 1,
        },
    },
    popupConfig: {
        enabled: false,
        title: 'Bem-vindo!',
        content: '<p>Confira nossas novidades e promoções especiais.</p>',
        buttonText: 'Ver Ofertas',
        buttonLink: '#',
        showOncePerSession: true,
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        buttonColor: '#4f46e5',
        buttonTextColor: '#ffffff',
    },
    adminButtonConfig: {
        bgColor: 'rgba(255, 255, 255, 0.2)',
        iconColor: '#FFFFFF',
        opacity: 1,
        hideOnMobile: false,
    },
    seoConfig: {},
    wordSearchConfig: {
        sizes: {
            facil: 10,
            medio: 12,
            dificil: 15,
        },
    },
    contentGating: {
        quiz: false,
        wordsearch: false,
        downloads: false,
    },
    commentsConfig: {
        enabled: true,
        enableOnProducts: true,
        enableOnQuiz: true,
        enableOnWordSearch: true,
        enableOnDownloads: true,
        requireApproval: true,
    },
    cookieConsentConfig: {
        enabled: true,
        message: 'Este site utiliza cookies para melhorar sua experiência e analisar o tráfego. Ao continuar navegando, você concorda com a nossa Política de Privacidade.',
        acceptButtonText: 'Aceitar',
        declineButtonText: 'Recusar',
        privacyPolicyLink: '',
    },
};


const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [banners, setBannersState] = useState<Banner[]>([]);
    const [contentBanners, setContentBannersState] = useState<ContentBanner[]>([]);
    const [products, setProductsState] = useState<Product[]>([]);
    const [downloads, setDownloadsState] = useState<DownloadableFile[]>([]);
    const [reviews, setReviewsState] = useState<Review[]>([]);
    const [musicTracks, setMusicTracksState] = useState<MusicTrack[]>([]);
    const [users, setUsersState] = useState<User[]>([]);
    const [cart, setCartState] = useState<CartItem[]>([]);
    const [orders, setOrdersState] = useState<Order[]>([]);
    const [comments, setCommentsState] = useState<Comment[]>([]);
    const [currentUser, setCurrentUserState] = useState<User | null>(null);
    const [siteConfig, setSiteConfigState] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
    const [productShowcases, setProductShowcasesState] = useState<ProductShowcase[]>([]);
    const [gameState, setGameState] = useState<GameState>('welcome');
    const [activeNavId, setActiveNavId] = useState<string>(DEFAULT_SITE_CONFIG.initialNavItemId);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [audioPlayerState, setAudioPlayerState] = useState<AudioPlayerState | null>(null);
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);
    const [selectedInstallmentCount, setSelectedInstallmentCount] = useState(1);
    const audioElementRef = useRef<HTMLAudioElement>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
    const audioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);


    useEffect(() => {
        const loadData = async () => {
            try {
                await dataService.init(); // Initialize Local DB or check remote
                
                const [dbBanners, dbProducts, dbDownloads, dbReviews, dbConfigs, dbProductShowcases, dbContentBanners, dbMusicTracks, dbUsers, dbCart, dbOrders, dbComments] = await Promise.all([
                    dataService.getAll<Banner>('banners'),
                    dataService.getAll<Product>('products'),
                    dataService.getAll<DownloadableFile>('downloads'),
                    dataService.getAll<Review>('reviews'),
                    dataService.getAll<SiteConfig>('siteConfig'),
                    dataService.getAll<ProductShowcase>('productShowcases'),
                    dataService.getAll<ContentBanner>('contentBanners'),
                    dataService.getAll<MusicTrack>('musicTracks'),
                    dataService.getAll<User>('users'),
                    dataService.getAll<CartItem>('cart'),
                    dataService.getAll<Order>('orders'),
                    dataService.getAll<Comment>('comments'),
                ]);

                setBannersState(dbBanners);
                setProductsState(dbProducts);
                setDownloadsState(dbDownloads);
                setReviewsState(dbReviews);
                setProductShowcasesState(dbProductShowcases);
                setContentBannersState(dbContentBanners);
                setMusicTracksState(dbMusicTracks);
                setUsersState(dbUsers);
                setCartState(dbCart);
                setOrdersState(dbOrders);
                setCommentsState(dbComments);

                const loggedInUserEmail = sessionStorage.getItem('loggedInUser');
                if (loggedInUserEmail) {
                    const user = dbUsers.find(u => u.email === loggedInUserEmail);
                    setCurrentUserState(user || null);
                }
                
                const loadedConfig = dbConfigs[0] as any;
                if (loadedConfig) {
                    // Migration logic
                    let adminEmails = loadedConfig.storeConfig?.emailConfig?.adminEmails;
                    if (!adminEmails && loadedConfig.storeConfig?.emailConfig?.adminEmail) {
                        adminEmails = [loadedConfig.storeConfig.emailConfig.adminEmail];
                    } else if (!adminEmails) {
                        adminEmails = ['admin@example.com'];
                    }
                    
                    // Coupon Migration
                    const coupons = (loadedConfig.storeConfig?.coupons || []).map((c: any) => ({
                        ...c,
                        enabled: c.enabled !== undefined ? c.enabled : true, 
                        firstPurchaseOnly: c.firstPurchaseOnly !== undefined ? c.firstPurchaseOnly : false
                    }));


                    const mergedConfig: SiteConfig = {
                        ...DEFAULT_SITE_CONFIG,
                        ...loadedConfig,
                        id: 'main_config',
                        showGuestNameInHeader: loadedConfig.showGuestNameInHeader ?? true,
                        storeConfig: { 
                            ...DEFAULT_SITE_CONFIG.storeConfig, 
                            ...(loadedConfig.storeConfig || {}),
                            coupons: coupons,
                            productDetailConfig: {
                                ...DEFAULT_SITE_CONFIG.storeConfig.productDetailConfig,
                                ...((loadedConfig.storeConfig || {}).productDetailConfig || {}),
                                reportEmail: (loadedConfig.storeConfig?.productDetailConfig?.reportEmail) || '',
                                whatsAppShareNumber: (loadedConfig.storeConfig?.productDetailConfig?.whatsAppShareNumber) || '',
                                enableInstagramShare: (loadedConfig.storeConfig?.productDetailConfig?.enableInstagramShare) ?? true,
                                instagramShareLink: (loadedConfig.storeConfig?.productDetailConfig?.instagramShareLink) || '',
                                enableTikTokShare: (loadedConfig.storeConfig?.productDetailConfig?.enableTikTokShare) ?? true,
                                tikTokShareLink: (loadedConfig.storeConfig?.productDetailConfig?.tikTokShareLink) || '',
                            },
                             shippingConfig: { 
                                ...DEFAULT_SITE_CONFIG.storeConfig.shippingConfig, 
                                ...(loadedConfig.storeConfig?.shippingConfig || {}),
                                fixedShippingRegionsEnabled: loadedConfig.storeConfig?.shippingConfig?.fixedShippingRegionsEnabled ?? true,
                                correiosConfig: {
                                  ...DEFAULT_SITE_CONFIG.storeConfig.shippingConfig.correiosConfig,
                                  ...(loadedConfig.storeConfig?.shippingConfig?.correiosConfig || {})
                                }
                             },
                            installmentConfig: { ...DEFAULT_SITE_CONFIG.storeConfig.installmentConfig, ...(loadedConfig.storeConfig?.installmentConfig || {}) },
                            paymentMethodImages: loadedConfig.storeConfig?.paymentMethodImages || [],
                            pixConfig: { ...DEFAULT_SITE_CONFIG.storeConfig.pixConfig, ...(loadedConfig.storeConfig?.pixConfig || {}) },
                            paymentGateways: {
                                pagseguro: { ...DEFAULT_SITE_CONFIG.storeConfig.paymentGateways.pagseguro, ...(loadedConfig.storeConfig?.paymentGateways?.pagseguro || {}) },
                                mercadopago: { ...DEFAULT_SITE_CONFIG.storeConfig.paymentGateways.mercadopago, ...(loadedConfig.storeConfig?.paymentGateways?.mercadopago || {}) }
                            },
                            cartIconConfig: { ...DEFAULT_SITE_CONFIG.storeConfig.cartIconConfig, ...(loadedConfig.storeConfig?.cartIconConfig || {}) },
                            boletoConfig: { ...DEFAULT_SITE_CONFIG.storeConfig.boletoConfig, ...(loadedConfig.storeConfig?.boletoConfig || {}) },
                            emailConfig: { 
                                ...DEFAULT_SITE_CONFIG.storeConfig.emailConfig, 
                                ...(loadedConfig.storeConfig?.emailConfig || {}),
                                adminEmails: adminEmails 
                            },
                        },
                        carouselConfig: { ...DEFAULT_SITE_CONFIG.carouselConfig, ...(loadedConfig.carouselConfig || {}) },
                        reviewsConfig: { ...DEFAULT_SITE_CONFIG.reviewsConfig, ...(loadedConfig.reviewsConfig || {}) },
                        footerConfig: { 
                            ...DEFAULT_SITE_CONFIG.footerConfig, 
                            ...(loadedConfig.footerConfig || {}),
                             mapConfig: { ...DEFAULT_SITE_CONFIG.footerConfig.mapConfig, ...(loadedConfig.footerConfig?.mapConfig || {}) },
                        },
                        newsletterConfig: { ...DEFAULT_SITE_CONFIG.newsletterConfig, ...(loadedConfig.newsletterConfig || {}) },
                        whatsAppConfig: { ...DEFAULT_SITE_CONFIG.whatsAppConfig, ...(loadedConfig.whatsAppConfig || {}) },
                        themeConfig: { ...DEFAULT_SITE_CONFIG.themeConfig, ...(loadedConfig.themeConfig || {}) },
                        popupConfig: { ...DEFAULT_SITE_CONFIG.popupConfig, ...(loadedConfig.popupConfig || {}) },
                        adminButtonConfig: { ...DEFAULT_SITE_CONFIG.adminButtonConfig, ...(loadedConfig.adminButtonConfig || {}) },
                        seoConfig: { ...DEFAULT_SITE_CONFIG.seoConfig, ...(loadedConfig.seoConfig || {}) },
                        wordSearchConfig: { ...DEFAULT_SITE_CONFIG.wordSearchConfig, ...(loadedConfig.wordSearchConfig || {}) },
                        contentGating: { ...DEFAULT_SITE_CONFIG.contentGating, ...(loadedConfig.contentGating || {}) },
                        adminCredentials: { ...DEFAULT_SITE_CONFIG.adminCredentials, ...(loadedConfig.adminCredentials || {}) },
                        commentsConfig: { ...DEFAULT_SITE_CONFIG.commentsConfig, ...(loadedConfig.commentsConfig || {}) },
                        cookieConsentConfig: { ...DEFAULT_SITE_CONFIG.cookieConsentConfig, ...(loadedConfig.cookieConsentConfig || {}) },
                    };
                    // Cleanup deprecated
                    delete (mergedConfig.storeConfig as any).pixKeys;
                    if ('darkThemeConfig' in mergedConfig) delete (mergedConfig as any).darkThemeConfig;
                    if ((mergedConfig.storeConfig.emailConfig as any).adminEmail) delete (mergedConfig.storeConfig.emailConfig as any).adminEmail;

                    setSiteConfigState(mergedConfig);
                } else {
                    await dataService.save('siteConfig', DEFAULT_SITE_CONFIG);
                }
                setIsInitialLoad(false);

            } catch (error) {
                console.error('Failed to load data from Data Service:', error);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const audioEl = audioElementRef.current;
        if (!audioEl || audioContextRef.current) return;

        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;

        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        setAnalyserNode(analyser);

        if (!audioSourceNodeRef.current) {
             audioSourceNodeRef.current = context.createMediaElementSource(audioEl);
        }
        
        audioSourceNodeRef.current.connect(analyser);
        analyser.connect(context.destination);

        const resumeContext = () => {
            if (context.state === 'suspended') {
                context.resume();
            }
            window.removeEventListener('click', resumeContext);
            window.removeEventListener('touchstart', resumeContext);
        };

        window.addEventListener('click', resumeContext);
        window.addEventListener('touchstart', resumeContext);

        return () => {
            window.removeEventListener('click', resumeContext);
            window.removeEventListener('touchstart', resumeContext);
        }
    }, [audioElementRef]);

    useEffect(() => {
        if (!isInitialLoad) {
            setActiveNavId(siteConfig.initialNavItemId);
        }
    }, [siteConfig.initialNavItemId, isInitialLoad]);

    // Generic setter creator that syncs with Data Service
    const createSetter = <T extends {id: string}>(stateSetter: React.Dispatch<React.SetStateAction<T[]>>, collectionName: any) => 
      async (items: T[] | ((prev: T[]) => T[])) => {
          stateSetter(items); // Optimistic update
          
          const currentDbItems = await dataService.getAll<T>(collectionName);
          
          let finalItems: T[];
          if (typeof items === 'function') {
              console.warn("Functional state update used in createSetter. DB Sync might be inaccurate if not handled carefully.");
              return; 
          } else {
              finalItems = items;
          }

          const itemIds = new Set(finalItems.map(i => i.id));
          
          // Remove items not in new list
          for (const currentItem of currentDbItems) {
              if (!itemIds.has(currentItem.id)) {
                  await dataService.remove(collectionName, currentItem.id);
              }
          }
          // Add/Update items from new list
          for (const item of finalItems) {
              await dataService.save(collectionName, item);
          }
      };

    const setSiteConfig = async (config: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => {
        setSiteConfigState(prev => {
            const newConfig = typeof config === 'function' ? config(prev) : config;
            dataService.save('siteConfig', newConfig);
            return newConfig;
        });
    };
    
    const consumeCoupon = async (code: string) => {
        setSiteConfigState(prev => {
            const newCoupons = prev.storeConfig.coupons.map(c => {
                if (c.code === code) {
                    const newUses = (c.currentUses || 0) + 1;
                    const shouldDisable = c.maxUses && c.maxUses > 0 && newUses >= c.maxUses;
                    return { ...c, currentUses: newUses, enabled: shouldDisable ? false : c.enabled };
                }
                return c;
            });
            
            const newConfig = {
                ...prev,
                storeConfig: {
                    ...prev.storeConfig,
                    coupons: newCoupons
                }
            };
            
            dataService.save('siteConfig', newConfig);
            return newConfig;
        });
    };
    
    const addToCart = async (product: Product, quantity: number, selectedOptions: Record<string, string>, couponCode?: string) => {
        const optionKeys = Object.keys(selectedOptions).sort();
        const optionIdentifier = optionKeys.map(key => `${key}:${selectedOptions[key]}`).join('|');
        const couponIdentifier = couponCode ? `|${couponCode}` : '';
        const cartItemId = `${product.id}|${optionIdentifier}${couponIdentifier}`;
    
        setCartState(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.id === cartItemId);
            let newCart: CartItem[];
            if (existingItemIndex > -1) {
                newCart = [...prevCart];
                const existingItem = newCart[existingItemIndex];
                const newQuantity = Math.min(existingItem.quantity + quantity, product.stock ?? Number.MAX_SAFE_INTEGER);
                newCart[existingItemIndex] = { ...existingItem, quantity: newQuantity };
            } else {
                newCart = [...prevCart, { id: cartItemId, productId: product.id, quantity, selectedOptions, couponCode }];
            }
            
            newCart.forEach(item => dataService.save('cart', item));
            
            return newCart;
        });
    };
    
    const setCurrentUser = (user: User | null) => {
        setCurrentUserState(user);
        if (user) {
            sessionStorage.setItem('loggedInUser', user.email);
        } else {
            sessionStorage.removeItem('loggedInUser');
        }
    };
    
    const logAnalyticsEvent = async (type: string, data?: any) => {
        // Check for cookie consent before logging
        const consent = localStorage.getItem('cookie_consent');
        
        // If the banner is enabled AND the user explicitly declined, DO NOT log.
        // If there is no decision yet, we typically still log (implied consent) or wait (strict).
        // For this implementation: If enabled and 'declined', stop.
        if (siteConfig.cookieConsentConfig?.enabled && consent === 'declined') {
            return;
        }

        const event: Omit<AnalyticsEvent, 'id'> = { type, data, timestamp: Date.now() };
        try {
            // Service handles auto-increment ID for analytics if using IndexedDB
            await dataService.save('analyticsEvents', event as AnalyticsEvent); 
        } catch (error) {
            console.error("Failed to log analytics event:", error);
        }
    };

    const getAnalyticsEvents = () => dataService.getAll<AnalyticsEvent>('analyticsEvents');

    const value: SiteContextType = {
        siteConfig,
        setSiteConfig,
        banners,
        setBanners: createSetter(setBannersState, 'banners'),
        contentBanners,
        setContentBanners: createSetter(setContentBannersState, 'contentBanners'),
        products,
        setProducts: createSetter(setProductsState, 'products'),
        productShowcases,
        setProductShowcases: createSetter(setProductShowcasesState, 'productShowcases'),
        downloads,
        setDownloads: createSetter(setDownloadsState, 'downloads'),
        reviews,
        setReviews: createSetter(setReviewsState, 'reviews'),
        musicTracks,
        setMusicTracks: createSetter(setMusicTracksState, 'musicTracks'),
        users,
        setUsers: createSetter(setUsersState, 'users') as any,
        cart,
        setCart: createSetter(setCartState, 'cart') as any,
        orders,
        setOrders: createSetter(setOrdersState, 'orders') as any,
        comments,
        setComments: createSetter(setCommentsState, 'comments') as any,
        addToCart,
        consumeCoupon,
        gameState,
        setGameState,
        activeNavId,
        setActiveNavId,
        DEFAULT_SITE_CONFIG,
        audioPlayerState,
        setAudioPlayerState,
        audioElementRef,
        analyserNode,
        audioContext: audioContextRef.current,
        logAnalyticsEvent,
        getAnalyticsEvents,
        currentUser,
        setCurrentUser,
        shippingDetails,
        setShippingDetails,
        isInitialLoad,
        selectedInstallmentCount,
        setSelectedInstallmentCount,
    };

    return (
        <SiteContext.Provider value={value}>
            {children}
        </SiteContext.Provider>
    );
};

export const useSite = (): SiteContextType => {
    const context = useContext(SiteContext);
    if (context === undefined) {
        throw new Error('useSite must be used within a SiteProvider');
    }
    return context;
};
