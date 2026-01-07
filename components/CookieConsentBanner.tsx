
import React, { useState, useEffect } from 'react';
import { useSite } from '../context/SiteContext';

const CookieConsentBanner: React.FC = () => {
    const { siteConfig } = useSite();
    const { cookieConsentConfig, themeConfig } = siteConfig;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if the consent flag exists in localStorage
        const consent = localStorage.getItem('cookie_consent');
        
        // If the feature is enabled and no choice has been made yet, show the banner
        if (cookieConsentConfig.enabled && consent === null) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [cookieConsentConfig.enabled]);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible || !cookieConsentConfig.enabled) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white dark:bg-gray-900 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t dark:border-gray-800 animate-slide-in-up">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 text-center md:text-left">
                    <p>
                        {cookieConsentConfig.message}
                        {cookieConsentConfig.privacyPolicyLink && (
                            <a 
                                href={cookieConsentConfig.privacyPolicyLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-1 underline hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                Saiba mais
                            </a>
                        )}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        {cookieConsentConfig.declineButtonText}
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors shadow-sm"
                        style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                        {cookieConsentConfig.acceptButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsentBanner;
