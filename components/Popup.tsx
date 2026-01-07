import React, { useState, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import { XIcon } from './Icons';

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

const POPUP_SESSION_KEY = 'popup-dismissed';

const Popup: React.FC = () => {
    const { siteConfig } = useSite();
    const { popupConfig } = siteConfig;
    const [isVisible, setIsVisible] = useState(false);
    const imageUrl = useObjectURL(popupConfig.image);

    useEffect(() => {
        if (!popupConfig.enabled) {
            setIsVisible(false);
            return;
        }

        if (popupConfig.showOncePerSession) {
            try {
                const dismissed = sessionStorage.getItem(POPUP_SESSION_KEY);
                if (dismissed) {
                    setIsVisible(false);
                    return;
                }
            } catch (e) {
                console.error("Could not access session storage:", e);
            }
        }
        // Add a small delay to ensure page is settled
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);

    }, [popupConfig.enabled, popupConfig.showOncePerSession]);

    const handleClose = () => {
        setIsVisible(false);
        if (popupConfig.showOncePerSession) {
             try {
                sessionStorage.setItem(POPUP_SESSION_KEY, 'true');
            } catch (e) {
                console.error("Could not access session storage:", e);
            }
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
            onClick={handleClose}
        >
            <div
                className="relative w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
                style={{ 
                    backgroundColor: popupConfig.backgroundColor || '#ffffff',
                    color: popupConfig.textColor || '#1f2937',
                    animation: 'slideInUp 0.4s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={handleClose} 
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                    aria-label="Fechar Popup"
                    style={{ color: popupConfig.textColor || '#1f2937' }}
                >
                    <XIcon className="h-5 w-5" />
                </button>

                {imageUrl && (
                    <img src={imageUrl} alt={popupConfig.title} className="w-full h-48 object-cover" />
                )}

                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold mb-2">{popupConfig.title}</h2>
                    <div 
                        className="prose prose-sm max-w-none mx-auto"
                        dangerouslySetInnerHTML={{ __html: popupConfig.content }}
                        style={{ color: 'inherit' }}
                    />
                    
                    {popupConfig.buttonText && popupConfig.buttonLink && (
                        <a
                            href={popupConfig.buttonLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-6 px-6 py-3 rounded-lg font-semibold text-white transition-transform hover:scale-105"
                            style={{
                                backgroundColor: popupConfig.buttonColor || '#4f46e5',
                                color: popupConfig.buttonTextColor || '#ffffff',
                            }}
                        >
                            {popupConfig.buttonText}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Popup;