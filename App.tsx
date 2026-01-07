
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import WelcomeScreen from './components/welcome/WelcomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import AdminPanel from './components/admin/AdminPanel';
import LoginScreen from './components/LoginScreen';
import Footer from './components/Footer';
import QuickAccessIcon from './components/QuickAccessIcon';
import Popup from './components/Popup';
import ProductDetailModal from './components/ProductDetailModal';
import CartIcon from './components/CartIcon';
import CartModal from './components/CartModal';
import CheckoutScreen from './components/CheckoutScreen';
import Navigation from './components/Navigation';
import CookieConsentBanner from './components/CookieConsentBanner';
import { CogIcon, MoonIcon, SunIcon } from './components/Icons';
import type { Question, Theme, Difficulty, GameStats, Banner, SiteConfig, GameState, Product } from './types';
import { SiteProvider, useSite } from './context/SiteContext';
import MetaHandler from './components/MetaHandler';
import { getFallbackQuestions } from './data/offlineData';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

const STORAGE_KEY = 'quiz-app-data';

const useObjectURL = (file?: File | Blob | string) => {
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (!file || typeof file === 'string') {
            setUrl(file as string);
            return;
        };
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);
    return url;
};

const getPositionClasses = (position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center') => {
    switch (position) {
        case 'top-left': return 'items-start justify-start';
        case 'top-center': return 'items-start justify-center';
        case 'top-right': return 'items-start justify-end';
        case 'bottom-left': return 'items-end justify-start';
        case 'bottom-center': return 'items-end justify-center';
        case 'bottom-right': return 'items-end justify-end';
        case 'center':
        default: return 'items-center justify-center';
    }
};

const BannerDisplay: React.FC<{ banner: Banner }> = ({ banner }) => {
    const imageUrl = useObjectURL(banner.image);

    return (
        <div className="relative rounded-lg shadow-lg overflow-hidden group">
            <a href={banner.affiliateLink} target="_blank" rel="noopener noreferrer" className={!banner.buttonText ? 'block' : 'pointer-events-none'}>
                <img src={imageUrl} alt="Banner" style={{width: banner.width, height: banner.height, objectFit: 'cover'}} />
            </a>
            {banner.buttonText && banner.affiliateLink && (
                <div className={`absolute inset-0 bg-black/30 flex p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${getPositionClasses(banner.buttonPosition)}`}>
                    <a
                        href={banner.affiliateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                        backgroundColor: banner.buttonColor || '#4f46e5',
                        color: banner.buttonTextColor || '#ffffff'
                        }}
                        className="px-5 py-2 rounded-lg font-semibold"
                    >
                        {banner.buttonText}
                    </a>
                </div>
            )}
        </div>
    );
};


const DynamicStyles: React.FC<{ siteConfig: SiteConfig }> = ({ siteConfig }) => {
    const { themeConfig, adminButtonConfig } = siteConfig;

    const css = `
    :root {
      --primary-color: ${themeConfig.primaryColor};
      --secondary-color: ${themeConfig.secondaryColor};
      --background-start: ${themeConfig.backgroundColorStart};
      --background-end: ${themeConfig.backgroundColorEnd};
      --card-background-color: ${themeConfig.cardBackgroundColor};
      --text-color: ${themeConfig.textColor};
      --secondary-text-color: ${themeConfig.secondaryTextColor};
      --success-color: ${themeConfig.successColor};
      --danger-color: ${themeConfig.dangerColor};
      
      /* Navigation specific colors */
      --nav-text-color: ${themeConfig.navigationTextColor || '#1f2937'};
      --nav-selected-text-color: ${themeConfig.navigationSelectedTextColor || '#ffffff'};

      --admin-btn-bg-color: ${adminButtonConfig.bgColor};
      --admin-btn-icon-color: ${adminButtonConfig.iconColor};
      --admin-btn-opacity: ${adminButtonConfig.opacity};
    }
    
    /* Apply Background Gradient Globally */
    body {
        background: linear-gradient(135deg, var(--background-start), var(--background-end)) !important;
        background-attachment: fixed !important;
        background-size: cover !important;
    }

    /* Apply Card Background - Ensures the glass card uses the variable configured in admin */
    .glass-card {
        background: var(--card-background-color) !important;
        /* Re-apply backdrop filter in case it was lost */
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }

    /* Apply Text Colors to Headings if needed */
    html:not(.dark) h1, html:not(.dark) h2, html:not(.dark) h3 {
        color: var(--text-color);
    }

    html.dark {
        --nav-text-color: #f3f4f6 !important; /* Force white text in dark mode for navigation if not overridden */
    }
  `;
    return <style>{css}</style>;
};

const AppContent: React.FC = () => {
    const {
        siteConfig,
        banners,
        gameState,
        setGameState,
        setActiveNavId,
        audioPlayerState,
        setAudioPlayerState,
        audioElementRef,
        logAnalyticsEvent,
        addToCart,
        isInitialLoad
    } = useSite();

    const [view, setView] = useState<'welcome' | 'checkout'>('welcome');
    const [playerName, setPlayerName] = useState('');
    const [theme, setTheme] = useState<Theme | null>(null);
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [score, setScore] = useState(0);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const currentAudioUrl = useRef<string | null>(null);
    const currentTrackIdRef = useRef<string | null>(null);
    
    // Dark Mode State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    // Apply Dark Mode Class
    useEffect(() => {
        if (siteConfig.themeConfig.enableDarkMode) {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.removeItem('theme');
        }
    }, [isDarkMode, siteConfig.themeConfig.enableDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    
    
    useEffect(() => {
        try {
            const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (storedData.playerName) setPlayerName(storedData.playerName);
        } catch (error) {
            console.error('Failed to load player name from localStorage:', error);
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        const registerServiceWorker = () => {
            if ('serviceWorker' in navigator) {
                const swCode = `
                    const CACHE_NAME = 'quiz-app-cache-v2';
                    const OFFLINE_URL = 'index.html';

                    self.addEventListener('install', (event) => {
                        event.waitUntil(
                            caches.open(CACHE_NAME).then((cache) => {
                                return cache.add(OFFLINE_URL);
                            })
                        );
                        self.skipWaiting();
                    });

                    self.addEventListener('activate', (event) => {
                        event.waitUntil(
                            caches.keys().then(cacheNames => {
                                return Promise.all(
                                    cacheNames.map(cacheName => {
                                        if (cacheName !== CACHE_NAME) {
                                            return caches.delete(cacheName);
                                        }
                                    })
                                );
                            }).then(() => self.clients.claim())
                        );
                    });

                    self.addEventListener('fetch', (event) => {
                        if (event.request.mode === 'navigate') {
                            event.respondWith(
                                (async () => {
                                    try {
                                        const preloadResponse = await event.preloadResponse;
                                        if (preloadResponse) {
                                            return preloadResponse;
                                        }
                                        return await fetch(event.request);
                                    } catch (error) {
                                        console.log('Fetch failed; returning offline page instead.', error);
                                        const cache = await caches.open(CACHE_NAME);
                                        return await cache.match(OFFLINE_URL);
                                    }
                                })()
                            );
                        }
                    });
                `;
                const blob = new Blob([swCode], { type: 'application/javascript' });
                const swUrl = URL.createObjectURL(blob);

                window.addEventListener('load', () => {
                     navigator.serviceWorker.register(swUrl).then(registration => {
                        console.log('SW registered from blob: ', registration);
                    }).catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
                });
            }
        };

        registerServiceWorker();
        
        logAnalyticsEvent('site_visit');

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [logAnalyticsEvent]);
    
    useEffect(() => {
        const audio = audioElementRef.current;
        if (!audio) return;

        let isCancelled = false;

        const setupAndPlay = async () => {
            if (!audioPlayerState) {
                audio.pause();
                if (currentAudioUrl.current) {
                    URL.revokeObjectURL(currentAudioUrl.current);
                    currentAudioUrl.current = null;
                }
                audio.src = '';
                currentTrackIdRef.current = null;
                return;
            }

            const currentTrack = audioPlayerState.playlist[audioPlayerState.currentTrackIndex];
            if (!currentTrack) return;

            if (currentTrack.id !== currentTrackIdRef.current) {
                const objectUrl = URL.createObjectURL(currentTrack.file);
                if (currentAudioUrl.current) URL.revokeObjectURL(currentAudioUrl.current);
                audio.src = objectUrl;
                currentAudioUrl.current = objectUrl;
                currentTrackIdRef.current = currentTrack.id;
            }
            
            audio.volume = audioPlayerState.volume;

            if (audioPlayerState.isPlaying) {
                try {
                    if (audio.paused) {
                      await audio.play();
                    }
                    if (isCancelled) audio.pause();
                } catch (error: any) {
                    if (!isCancelled && error.name !== 'AbortError') {
                        console.error("Global play failed", error);
                    }
                }
            } else {
                audio.pause();
            }
        };

        setupAndPlay();

        return () => {
            isCancelled = true;
        }
    }, [audioPlayerState, audioElementRef]);


    const saveToLocalStorage = useCallback((key: string, data: any) => {
        try {
            const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            storage[key] = data;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }, []);
    
    const saveGameStats = useCallback((stats: Omit<GameStats, 'date' | 'percentage'>) => {
         try {
            const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const allStats: GameStats[] = storage.gameStats || [];
            const newStat: GameStats = {
                ...stats,
                date: new Date().toISOString(),
                percentage: Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
            };
            allStats.push(newStat);
            if (allStats.length > 50) {
                allStats.splice(0, allStats.length - 50);
            }
            saveToLocalStorage('gameStats', allStats);
        } catch (error) {
            console.error("Failed to save game stats:", error);
        }
    }, [saveToLocalStorage]);

    const generateQuestions = async (theme: Theme, difficulty: Difficulty): Promise<Question[]> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const themeMap: Record<Theme, string> = {
                'ciencia': 'Ciência',
                'historia': 'História',
                'entretenimento': 'Entretenimento',
                'geografia': 'Geografia',
                'matematica': 'Matemática',
                'ingles': 'Inglês',
                'conhecimentos-gerais': 'Conhecimentos Gerais',
                'aleatorio': 'Conhecimentos Gerais (tópicos variados)'
            };

            // Optimized prompt for speed
            const prompt = `Gere 10 perguntas de quiz (${difficulty}) sobre ${themeMap[theme]}. JSON apenas.
            Formato: [{"pergunta":"...","opcoes":["..."],"resposta":0}]
            Sem markdown.`;
        
            const fetchPromise = ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                pergunta: { type: Type.STRING },
                                opcoes: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                },
                                resposta: { type: Type.INTEGER }
                            },
                            required: ["pergunta", "opcoes", "resposta"]
                        }
                    }
                }
            });

            // Race condition: If API takes longer than 2.5s, reject to use fallback immediately
            const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error("Timeout")), 2500)
            );

            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            // @ts-ignore - we know response structure from successful race
            const textResponse = response.text.trim();
            const parsedQuestions: Question[] = JSON.parse(textResponse);
            
            if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
                throw new Error("API returned invalid data format.");
            }
            return parsedQuestions;

        } catch (error) {
            console.warn("API timed out or error, using fallback for speed.", error);
            // Use fallback immediately if API is slow or fails
            return getFallbackQuestions(theme, difficulty);
        }
    };

    const handleStartQuiz = async (pName: string, th: Theme, diff: Difficulty) => {
        setIsLoadingQuestions(true);
        try {
            // The generatedQuestions function now has internal timeout handling
            let preparedQuestions = await generateQuestions(th, diff);
            
            setPlayerName(pName);
            setTheme(th);
            setDifficulty(diff);
            saveToLocalStorage('playerName', pName);
            setQuestions(preparedQuestions);
            setGameState('playing');
        } catch (error) {
            console.error("Critical error starting quiz, enforcing fallback", error);
            const fallbackQuestions = getFallbackQuestions(th, diff);
            setPlayerName(pName);
            setTheme(th);
            setDifficulty(diff);
            saveToLocalStorage('playerName', pName);
            setQuestions(fallbackQuestions);
            setGameState('playing');
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const handleQuizFinish = (finalScore: number, correctCount: number) => {
        setScore(finalScore);
        setCorrectAnswersCount(correctCount);
        if(theme && difficulty) {
            saveGameStats({
                theme,
                difficulty,
                score: finalScore,
                correctAnswers: correctCount,
                totalQuestions: questions.length
            });
        }
        setGameState('finished');
    };

    const handleRestart = () => {
        setScore(0);
        setCorrectAnswersCount(0);
        if (theme && difficulty) {
            handleStartQuiz(playerName, theme, difficulty);
        } else {
            setGameState('welcome');
            setActiveNavId('quiz');
        }
    };

    const handleNextLevel = () => {
        if (theme && difficulty) {
            let nextDifficulty: Difficulty | null = null;
            if (difficulty === 'facil') {
                nextDifficulty = 'medio';
            } else if (difficulty === 'medio') {
                nextDifficulty = 'dificil';
            }

            if (nextDifficulty) {
                setScore(0);
                setCorrectAnswersCount(0);
                handleStartQuiz(playerName, theme, nextDifficulty);
            }
        }
    };

    const handleChangeTheme = () => {
        setGameState('welcome');
        setTheme(null);
        setDifficulty(null);
        setQuestions([]);
        setScore(0);
        setCorrectAnswersCount(0);
        setActiveNavId('quiz');
    };
    
    const handleExitQuiz = () => {
        setGameState('welcome');
        setTheme(null);
        setDifficulty(null);
        setQuestions([]);
        setScore(0);
        setCorrectAnswersCount(0);
        setActiveNavId(siteConfig.initialNavItemId);
    };
    
    const handleAddToCartAndOpenCart = () => {
        setSelectedProduct(null);
        setIsCartOpen(true);
    };
    
    const handleBuyNow = (product: Product, quantity: number, selectedOptions: Record<string, string>) => {
        addToCart(product, quantity, selectedOptions);
        setSelectedProduct(null);
        setView('checkout');
    };

    const renderWelcomeContent = () => {
        switch (gameState) {
            case 'playing':
                return theme && difficulty && questions.length > 0 && (
                    <QuizScreen
                        playerName={playerName}
                        theme={theme}
                        themeTitle={theme === 'conhecimentos-gerais' ? 'Gerais' : theme.charAt(0).toUpperCase() + theme.slice(1)}
                        difficulty={difficulty}
                        questions={questions}
                        pointsPerQuestion={difficulty === 'facil' ? 1 : difficulty === 'medio' ? 2 : 3}
                        onQuizFinish={handleQuizFinish}
                        onQuit={handleChangeTheme}
                        onExit={handleExitQuiz}
                        siteConfig={siteConfig}
                    />
                );
            case 'finished':
                return (
                    <ResultScreen
                        playerName={playerName}
                        score={score}
                        correctAnswersCount={correctAnswersCount}
                        totalQuestions={questions.length}
                        onRestart={handleRestart}
                        onChangeTheme={handleChangeTheme}
                        onExit={handleExitQuiz}
                        siteConfig={siteConfig}
                        difficulty={difficulty}
                        theme={theme}
                        onNextLevel={handleNextLevel}
                    />
                );
            case 'welcome':
            default:
                return <WelcomeScreen 
                    onStartQuiz={handleStartQuiz} 
                    initialPlayerName={playerName} 
                    setPlayerName={setPlayerName}
                    isLoading={isLoadingQuestions}
                    onProductSelect={setSelectedProduct}
                />;
        }
    };
    
    const handleInstallClick = async () => {
        if (!installPrompt) return;
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
    };

    const handleTrackEnded = () => {
        if (!audioPlayerState) return;
        const { playlist, currentTrackIndex, config } = audioPlayerState;
        if (playlist.length <= 1 && !config.loop) {
            setAudioPlayerState({ ...audioPlayerState, isPlaying: false });
            return;
        }
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        if (nextIndex === 0 && !config.loop) {
            setAudioPlayerState({ ...audioPlayerState, isPlaying: false });
        } else {
            setAudioPlayerState({ ...audioPlayerState, currentTrackIndex: nextIndex });
        }
    };

    const renderContent = () => {
        if (view === 'checkout') {
            return <CheckoutScreen onBackToStore={() => setView('welcome')} />;
        }

        // NOTE: 'overflow-hidden' removed from container to allow position:sticky to work on Navigation.
        return (
            <div className="quiz-container glass-card rounded-2xl my-auto z-10 relative">
                 {installPrompt && (
                    <button onClick={handleInstallClick} className="install-prompt bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4 4m4 4V4" />
                        </svg>
                        Instalar App
                    </button>
                )}
                <Navigation />
                {renderWelcomeContent()}
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen">
            <MetaHandler />
            <audio ref={audioElementRef} onEnded={handleTrackEnded} />
            <DynamicStyles siteConfig={siteConfig} />
            <Popup />
            <CookieConsentBanner />
            <QuickAccessIcon />
            {selectedProduct && <ProductDetailModal 
                product={selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
                onBuyNow={handleBuyNow}
                onAddToCartSuccess={handleAddToCartAndOpenCart}
            />}
            <CartIcon onOpen={() => setIsCartOpen(true)} />
            {isCartOpen && <CartModal onClose={() => setIsCartOpen(false)} onCheckout={() => { setIsCartOpen(false); setView('checkout'); }} />}
            
            {/* Admin Button - Top Left */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50 flex scale-90 sm:scale-100 origin-top-left">
                <button 
                    onClick={() => setIsAdminOpen(true)} 
                    className={`admin-cog-button ${siteConfig.adminButtonConfig.hideOnMobile ? 'hidden sm:block' : ''}`}
                    aria-label="Open Admin Panel"
                >
                    <CogIcon className="h-6 w-6" />
                </button>
            </div>
            
            {/* Theme Toggle - Top Right (Above Cart) */}
            {siteConfig.themeConfig.enableDarkMode && (
                 <button 
                    onClick={toggleDarkMode}
                    className={`fixed top-2 right-2 z-[60] admin-cog-button ${!isDarkMode ? '!text-gray-800' : ''}`}
                    style={{ padding: '0.25rem', opacity: 1 }} // Force opacity to 1
                    aria-label="Toggle Dark Mode"
                >
                    {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                </button>
            )}
            
            <main className="relative w-full flex-grow flex items-center justify-center p-0 sm:p-4">
                {banners.filter(b => b.type === 'floating').map(banner => {
                    let positionClasses = '';
                    if (banner.floatingVerticalPosition === 'top') positionClasses += ' top-4';
                    if (banner.floatingVerticalPosition === 'bottom') positionClasses += ' bottom-4';

                    if (banner.floatingHorizontalPosition === 'left') positionClasses += ' left-4';
                    else if (banner.floatingHorizontalPosition === 'right') positionClasses += ' right-4';
                    else positionClasses += ' left-1/2 -translate-x-1/2';

                    return (
                        <div key={banner.id} className={`fixed z-40 ${positionClasses}`}>
                            <BannerDisplay banner={banner} />
                        </div>
                    );
                })}

                <aside className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-0">
                    {banners.filter(b => b.type === 'fixed' && b.position === 'left').map(banner => <BannerDisplay key={banner.id} banner={banner} />)}
                </aside>
                
                {renderContent()}
                
                <aside className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-0">
                    {banners.filter(b => b.type === 'fixed' && b.position === 'right').map(banner => <BannerDisplay key={banner.id} banner={banner} />)}
                </aside>

                {isAdminOpen && !isAdminAuthenticated && <LoginScreen 
                    onLoginSuccess={() => setIsAdminAuthenticated(true)} 
                    onClose={() => setIsAdminOpen(false)}
                />}

                {isAdminOpen && isAdminAuthenticated && <AdminPanel 
                    onClose={() => setIsAdminOpen(false)} 
                    onLogout={() => {
                        setIsAdminAuthenticated(false);
                        setIsAdminOpen(false);
                    }}
                />}
            </main>
            <Footer />
        </div>
    );
}

const App: React.FC = () => {
    return (
        <SiteProvider>
            <AppContent />
        </SiteProvider>
    );
};

export default App;
