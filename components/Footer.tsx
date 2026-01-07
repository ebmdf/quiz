
import React, { useState, useEffect } from 'react';
import { WhatsAppIcon, XIcon } from './Icons';
import { useSite } from '../context/SiteContext';
import type { SocialLink, FooterImage, FooterElement, NavigationItem, WhatsAppConfig } from '../types';

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

// --- Footer Section Components ---

const SocialLinkItem: React.FC<{ item: SocialLink }> = ({ item }) => {
    const iconUrl = useObjectURL(item.icon);
    return (
        <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-75">
            <span className="sr-only">{item.name}</span>
            <img className="h-6 w-6" src={iconUrl} alt={item.name} />
        </a>
    );
};

const NewsletterSection: React.FC<{ config: any, onSubmit: (e: React.FormEvent) => void }> = ({ config, onSubmit }) => (
    <div className="w-full">
        <h3 className="text-sm font-semibold leading-6">{config.title}</h3>
        <p className="mt-2 text-sm leading-6">{config.subtitle}</p>
        <form className="mt-6 sm:flex sm:max-w-md" onSubmit={onSubmit}>
            <label htmlFor="email-address" className="sr-only">Email</label>
            <input
                type="email"
                name="email"
                id="email-address"
                autoComplete="email"
                required
                className="w-full min-w-0 appearance-none rounded-md border-0 bg-white/5 px-3 py-1.5 text-base shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:w-64 sm:text-sm sm:leading-6"
                placeholder={config.inputPlaceholder}
            />
            <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                    {config.buttonText}
                </button>
            </div>
        </form>
    </div>
);

const SocialLinksSection: React.FC<{ links: SocialLink[] }> = ({ links }) => (
    <div className="flex space-x-6">
        {links.map((item) => <SocialLinkItem key={item.id} item={item} />)}
    </div>
);

const CopyrightSection: React.FC<{ text: string }> = ({ text }) => (
    <p className="text-xs leading-5">{text}</p>
);

const FooterImageItem: React.FC<{ image: FooterImage }> = ({ image }) => {
    const imageUrl = useObjectURL(image.image);
    const content = <img src={imageUrl} alt="" style={{ width: image.width, height: image.height, objectFit: 'contain' }} />;
    
    if (image.link) {
        return <a href={image.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">{content}</a>;
    }
    return content;
};

const ImagesSection: React.FC<{ images: FooterImage[] }> = ({ images }) => (
    <div className="flex items-center gap-6 flex-wrap">
        {images.sort((a,b) => a.order - b.order).map(img => <FooterImageItem key={img.id} image={img} />)}
    </div>
);

const CategoryLinksSection: React.FC<{ 
    navItems: NavigationItem[]; 
    linkIds: string[];
    onClick: (navId: string) => void;
}> = ({ navItems, linkIds, onClick }) => {
    const visibleNavItems = navItems
        .filter(nav => linkIds.includes(nav.id) && nav.enabled)
        .sort((a, b) => a.order - b.order);

    if (visibleNavItems.length === 0) return null;

    return (
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {visibleNavItems.map(nav => (
                <button key={nav.id} onClick={() => onClick(nav.id)} className="text-sm leading-6 hover:underline">
                    {nav.name}
                </button>
            ))}
        </nav>
    );
};

const MapSection: React.FC<{ embedUrl: string, height?: string, width?: string }> = ({ embedUrl, height, width }) => (
    <div className="rounded-lg overflow-hidden shadow-md" style={{ height: height || '250px', width: width || '100%' }}>
        <iframe 
            src={embedUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps"
        ></iframe>
    </div>
);

const AddressSection: React.FC<{ address: string }> = ({ address }) => (
    <div className="whitespace-pre-line text-sm leading-6 opacity-90">
        {address}
    </div>
);

const WhatsAppButton: React.FC<{ whatsAppConfig: WhatsAppConfig, whatsAppUrl: string }> = ({ whatsAppConfig, whatsAppUrl }) => {
    const [isVisible, setIsVisible] = useState(false);
    const iconUrl = useObjectURL(whatsAppConfig.icon);
    const allowClose = whatsAppConfig.allowClose !== false; // Default to true

    useEffect(() => {
        const dismissed = sessionStorage.getItem('whatsapp-dismissed');
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsVisible(false);
        sessionStorage.setItem('whatsapp-dismissed', 'true');
    };

    if (!isVisible) return null;
    
    const sizeClasses = {
        small: 'w-12 h-12',
        medium: 'w-16 h-16',
        large: 'w-20 h-20',
    };
    const sizeClass = sizeClasses[whatsAppConfig.size || 'medium'];

     return (
        <div className="fixed bottom-6 right-6 z-50 group">
            <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-green-500 ${sizeClass} rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform`}
                style={{ opacity: whatsAppConfig.opacity ?? 1 }}
                aria-label="Contact us on WhatsApp"
            >
                {iconUrl ? (
                    <img src={iconUrl} alt="WhatsApp" className="w-full h-full object-cover rounded-full" />
                ) : (
                    <WhatsAppIcon />
                )}
            </a>
            {allowClose && (
                <button
                    onClick={handleDismiss}
                    className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    aria-label="Fechar ícone do WhatsApp"
                >
                    <XIcon className="h-3 w-3" />
                </button>
            )}
        </div>
    )
}

const Footer: React.FC = () => {
    const { siteConfig, setGameState, setActiveNavId } = useSite();
    const { footerConfig, newsletterConfig, whatsAppConfig, navigationItems } = siteConfig;
    
    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const email = (e.target as HTMLFormElement).email.value;
        alert(`Obrigado por se inscrever, ${email}! (Funcionalidade de demonstração)`);
        (e.target as HTMLFormElement).reset();
    };

    const handleCategoryClick = (navId: string) => {
        setGameState('welcome');
        setActiveNavId(navId);
        window.scrollTo(0, 0); // Scroll to top
    };

    const whatsAppUrl = `https://wa.me/${(whatsAppConfig.number || '').replace(/\D/g, '')}`;

    const componentMap: Record<FooterElement, React.ReactNode> = {
        newsletter: newsletterConfig.enabled && <NewsletterSection config={newsletterConfig} onSubmit={handleNewsletterSubmit} />,
        social: footerConfig.socialLinks.length > 0 && <SocialLinksSection links={footerConfig.socialLinks} />,
        text: footerConfig.text && <CopyrightSection text={footerConfig.text} />,
        images: footerConfig.footerImages.length > 0 && <ImagesSection images={footerConfig.footerImages} />,
        categories: footerConfig.categoryLinkIds.length > 0 && <CategoryLinksSection navItems={navigationItems} linkIds={footerConfig.categoryLinkIds} onClick={handleCategoryClick} />,
        map: footerConfig.mapConfig?.enabled && footerConfig.mapConfig.embedUrl && <MapSection embedUrl={footerConfig.mapConfig.embedUrl} height={footerConfig.mapConfig.height} width={footerConfig.mapConfig.width} />,
        address: footerConfig.address && <AddressSection address={footerConfig.address} />,
    };

    const getJustifyClass = (alignment?: 'left' | 'center' | 'right') => {
        switch (alignment) {
            case 'left': return 'justify-start';
            case 'center': return 'justify-center';
            case 'right': return 'justify-end';
            default: return 'justify-center';
        }
    };
    
    const getTextAlignClass = (alignment?: 'left' | 'center' | 'right') => {
        switch (alignment) {
            case 'left': return 'text-left';
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            default: return 'text-center';
        }
    };

    return (
        <>
            <footer
                style={{
                    backgroundColor: footerConfig.bgColor,
                    color: footerConfig.defaultTextColor,
                    height: footerConfig.height,
                    width: footerConfig.fullWidth ? '100%' : footerConfig.width,
                    margin: footerConfig.fullWidth ? '0' : '0 auto',
                }}
            >
                <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col items-stretch gap-8">
                    {(footerConfig.elementOrder || []).map(element => {
                        const content = componentMap[element];
                        if (!content) return null;

                        const styles = footerConfig.elementStyles?.[element] || {};
                        const alignment = styles.alignment || 'center';
                        const textColor = styles.textColor || footerConfig.defaultTextColor;

                        const justifyClass = getJustifyClass(alignment);
                        const textAlignClass = getTextAlignClass(alignment);

                        return (
                            <div key={element} className={`w-full flex ${justifyClass} ${textAlignClass}`} style={{ color: textColor }}>
                               {content}
                            </div>
                        )
                    })}
                </div>
            </footer>
            {whatsAppConfig.enabled && whatsAppConfig.number && (
                <WhatsAppButton whatsAppConfig={whatsAppConfig} whatsAppUrl={whatsAppUrl} />
            )}
        </>
    );
};

export default Footer;