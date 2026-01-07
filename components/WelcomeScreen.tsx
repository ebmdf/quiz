
import React, { useState, useEffect } from 'react';
import type { Theme, Difficulty, SiteCategory, ContentBanner, Product, NavigationItem } from '../../types';
import { useSite } from '../../context/SiteContext';

import Carousel from '../Carousel';
import QuizSetup from './QuizSetup';
import ProductShowcase from './ProductShowcase';
import DownloadsList from './DownloadsList';
import ReviewsSection from './ReviewsSection';
import CustomPage from './CustomPage';
import MusicPlayer from './MusicPlayer';
import RegistrationScreen from '../RegistrationScreen';
import WordSearch from '../WordSearch';
import WordSearchSetup from './WordSearchSetup';

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

// Helper to recursively find the active nav item
const findActiveNavItem = (items: NavigationItem[], targetId: string): NavigationItem | undefined => {
    for (const item of items) {
        if (item.id === targetId) return item;
        if (item.subItems && item.subItems.length > 0) {
            const found = findActiveNavItem(item.subItems, targetId);
            if (found) return found;
        }
    }
    return undefined;
};

const ContentBannerDisplay: React.FC<{ banner: ContentBanner }> = ({ banner }) => {
    const imageUrl = useObjectURL(banner.image);

    const bannerContent = banner.type === 'image' && imageUrl ? (
        <img src={imageUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : (
        <div dangerouslySetInnerHTML={{ __html: banner.htmlContent || '' }} />
    );

    const Wrapper = banner.link ? 'a' : 'div';
    const props = banner.link ? { href: banner.link, target: '_blank', rel: 'noopener noreferrer' } : {};

    return (
        <div className="my-4 sm:my-8" style={{ width: banner.width, height: banner.height, margin: '16px auto' }}>
            <Wrapper {...props}>
                {bannerContent}
            </Wrapper>
        </div>
    );
};

const LoginPrompt: React.FC<{ onNavigateToLogin: () => void; contentType: string }> = ({ onNavigateToLogin, contentType }) => (
    <div className="mt-6 sm:mt-10 p-6 rounded-2xl text-center bg-amber-50 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800">
        <h3 className="text-lg sm:text-xl font-bold text-amber-800 dark:text-amber-200">Acesso Restrito</h3>
        <p className="text-amber-700 dark:text-amber-300 mt-2 mb-4 text-sm sm:text-base">Você precisa fazer login para acessar {contentType}.</p>
        <button
            onClick={onNavigateToLogin}
            className="px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors text-sm sm:text-base"
        >
            Fazer Login ou Cadastrar
        </button>
    </div>
);


interface WelcomeScreenProps {
  onStartQuiz: (playerName: string, theme: Theme, difficulty: Difficulty) => void;
  initialPlayerName: string;
  setPlayerName: (name: string) => void;
  isLoading: boolean;
  onProductSelect: (product: Product) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
    onStartQuiz, 
    initialPlayerName, 
    setPlayerName,
    isLoading, 
    onProductSelect,
}) => {
    const { siteConfig, products, downloads, reviews, productShowcases, contentBanners, activeNavId, setActiveNavId, currentUser } = useSite();
    const logoUrl = useObjectURL(siteConfig.logo);

    const [wordSearchState, setWordSearchState] = useState<'setup' | 'playing'>('setup');
    const [wordSearchConfig, setWordSearchConfig] = useState<any | null>(null);

    // Always show all enabled nav items. The account page will correctly show login or user details.
    const visibleNavItems = siteConfig.navigationItems
        ?.filter(c => c.enabled)
        .sort((a,b) => a.order - b.order) || [];

    useEffect(() => {
        // Check if the active item (or any parent) is a wordsearch type
        const findWordSearchInCategories = (navId: string): boolean => {
            const navItem = findActiveNavItem(visibleNavItems, navId);
            if (!navItem) return false;
            return navItem.categoryIds.some(id => siteConfig.siteCategories.find(c => c.id === id)?.type === 'wordsearch');
        };

        const isWordSearchActive = findWordSearchInCategories(activeNavId);

        if (!isWordSearchActive) {
            setWordSearchState('setup');
            setWordSearchConfig(null);
        }
    }, [activeNavId, siteConfig, visibleNavItems]);
        
    const handleAuthSuccess = () => {
        setActiveNavId(siteConfig.initialNavItemId);
    };

    const handleNavigateToLogin = () => {
        const accountCategory = siteConfig.siteCategories.find(c => c.type === 'account');
        
        // Helper to find nav item containing a category
        const findNavWithCategory = (items: NavigationItem[], catId: string): NavigationItem | undefined => {
            for (const item of items) {
                if (item.categoryIds.includes(catId)) return item;
                if (item.subItems) {
                    const found = findNavWithCategory(item.subItems, catId);
                    if (found) return found;
                }
            }
            return undefined;
        };

        const accountNavItem = accountCategory ? findNavWithCategory(visibleNavItems, accountCategory.id) : null;
    
        if (accountNavItem) {
            setActiveNavId(accountNavItem.id);
        } else {
            alert("Página de login/cadastro não está acessível. Por favor, contate o administrador.");
        }
    };
    
    
    const renderCategoryComponent = (category: SiteCategory) => {
        const BannersForCategory: React.FC<{ categoryId: string }> = ({ categoryId }) => {
            const banners = contentBanners
                .filter(b => b.enabled && b.categoryId === categoryId)
                .sort((a, b) => a.order - b.order);
            if (banners.length === 0) return null;
            return <>{banners.map(banner => <ContentBannerDisplay key={banner.id} banner={banner} />)}</>;
        };
        const categoryBanners = <BannersForCategory categoryId={category.id} />;

        const isGated = siteConfig.contentGating?.[category.type as 'quiz' | 'wordsearch' | 'downloads'];
        if (isGated && !currentUser) {
            let contentTypeName = '';
            switch(category.type) {
                case 'quiz': contentTypeName = 'o Quiz'; break;
                case 'wordsearch': contentTypeName = 'o Caça-Palavras'; break;
                case 'downloads': contentTypeName = 'os Downloads'; break;
            }
            return <LoginPrompt key={`${category.id}-gated`} onNavigateToLogin={handleNavigateToLogin} contentType={contentTypeName} />;
        }

        switch (category.type) {
            case 'quiz':
                return <QuizSetup 
                            key={category.id}
                            onStartQuiz={onStartQuiz} 
                            initialPlayerName={initialPlayerName} 
                            setPlayerName={setPlayerName}
                            isLoading={isLoading} 
                        />;
            case 'wordsearch':
                if (wordSearchState === 'setup') {
                    return <WordSearchSetup
                        key={`${category.id}-setup`}
                        initialPlayerName={initialPlayerName}
                        setPlayerName={setPlayerName}
                        onStartGame={(config) => {
                            setWordSearchConfig(config);
                            setWordSearchState('playing');
                        }}
                    />;
                }
                return <WordSearch
                    key={`${category.id}-playing`}
                    config={wordSearchConfig!}
                    onExit={() => {
                        setWordSearchState('setup');
                        setWordSearchConfig(null);
                    }}
                />;
            case 'products':
                const enabledShowcases = productShowcases
                    .filter(s => s.enabled)
                    .map(s => ({ ...s, itemType: 'showcase' as const }));
                
                const enabledBanners = contentBanners
                    .filter(b => b.enabled && b.categoryId === category.id)
                    .map(b => ({ ...b, itemType: 'banner' as const }));

                const contentItems = [...enabledShowcases, ...enabledBanners]
                    .sort((a, b) => a.order - b.order);
                
                if (contentItems.length === 0) {
                     return (
                         <div key={category.id} className="mt-6 sm:mt-10 p-6 rounded-2xl text-center dark:!bg-gray-900" style={{ backgroundColor: siteConfig.storeConfig.themeBgColor }}>
                            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6" style={{ color: siteConfig.storeConfig.themePrimaryColor }}>
                                Nossa Loja
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Nenhum produto disponível no momento.</p>
                        </div>
                    );
                }

                return (
                    <div key={category.id} className="space-y-6 sm:space-y-8">
                        {contentItems.map(item => {
                            if (item.itemType === 'showcase') {
                                return <ProductShowcase key={item.id} showcase={item} allProducts={products} onProductSelect={onProductSelect} />;
                            } else { // 'banner'
                                return <ContentBannerDisplay key={item.id} banner={item} />;
                            }
                        })}
                    </div>
                );
            case 'downloads':
                return <div key={category.id}>
                    {categoryBanners}
                    <DownloadsList downloads={downloads} />
                </div>;
            case 'reviews':
                return <div key={category.id}>
                    {categoryBanners}
                    <ReviewsSection reviews={reviews} />
                </div>;
            case 'custom':
                 return <div key={category.id}>
                    {categoryBanners}
                    <CustomPage category={category} />
                </div>;
            case 'music':
                return (
                    <div key={category.id}>
                        {categoryBanners}
                        <MusicPlayer category={category} />
                    </div>
                );
            case 'account':
                return <RegistrationScreen key={category.id} onLoginSuccess={handleAuthSuccess} />;
            default:
                return null;
        }
    }

    const renderActiveContent = () => {
        // Recursively find the active item to support sub-menus
        const activeNavItem = findActiveNavItem(visibleNavItems, activeNavId);

        if (!activeNavItem) {
            // Fallback: If nothing found (unlikely unless config is broken), show default quiz setup or message
            return <QuizSetup onStartQuiz={onStartQuiz} initialPlayerName={initialPlayerName} setPlayerName={setPlayerName} isLoading={isLoading} />;
        }

        const categoriesToRender = activeNavItem.categoryIds
            .map(catId => siteConfig.siteCategories.find(c => c.id === catId))
            .filter((c): c is SiteCategory => !!c && c.enabled);

        if (categoriesToRender.length === 0) {
             return (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>Nenhum conteúdo configurado para esta seção.</p>
                </div>
            );
        }
        
        return (
            <div className="space-y-8">
                {categoriesToRender.map((category) => (
                    <React.Fragment key={category.id}>
                        {renderCategoryComponent(category)}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-8 fade-in">
            {siteConfig.carouselConfig.images.length > 0 && (
                <div className="mb-6 sm:mb-8 rounded-xl overflow-hidden shadow-lg">
                    <Carousel config={siteConfig.carouselConfig} />
                </div>
            )}
            
            <div className="text-center mb-6 sm:mb-8">
                {logoUrl ? (
                    <img src={logoUrl} alt="Site Logo" className="max-w-[180px] sm:max-w-xs max-h-16 sm:max-h-24 mx-auto mb-3 sm:mb-4 object-contain" />
                ) : (
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 dark:text-white" style={{ color: siteConfig.themeConfig.primaryColor }}>{siteConfig.siteTitle}</h1>
                )}
                {siteConfig.showGuestNameInHeader && !currentUser && initialPlayerName && (
                    <p className="text-base sm:text-lg font-medium mt-1 dark:text-gray-300" style={{ color: siteConfig.themeConfig.secondaryTextColor }}>
                        Olá, <span className="font-bold">{initialPlayerName}</span>!
                    </p>
                )}
                <p className="text-sm sm:text-base dark:text-gray-400" style={{ color: siteConfig.themeConfig.secondaryTextColor }}>{siteConfig.siteSubtitle}</p>
            </div>

            {renderActiveContent()}

        </div>
    );
};

export default WelcomeScreen;
