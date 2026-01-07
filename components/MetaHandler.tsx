import React, { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';

// Helper to create or update meta tags
const setMetaTag = (attr: 'name' | 'property', value: string, content: string) => {
    if (!content) return;
    let element = document.querySelector(`meta[${attr}='${value}']`);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, value);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

// Hook for using object URL
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

const MetaHandler: React.FC = () => {
    const { siteConfig } = useSite();
    const { seoConfig, siteTitle, siteSubtitle } = siteConfig;
    const ogImageUrl = useObjectURL(seoConfig?.ogImage);

    useEffect(() => {
        const title = seoConfig?.metaTitle || siteTitle;
        const description = seoConfig?.metaDescription || siteSubtitle;
        const keywords = seoConfig?.metaKeywords || 'quiz, caça palavras, jogo, interativo';
        
        document.title = title;
        
        setMetaTag('name', 'description', description);
        setMetaTag('name', 'keywords', keywords);

        // Open Graph / Facebook
        setMetaTag('property', 'og:title', title);
        setMetaTag('property', 'og:description', description);
        setMetaTag('property', 'og:type', 'website');
        if (ogImageUrl) {
            const absoluteUrl = new URL(ogImageUrl, window.location.href).href;
            setMetaTag('property', 'og:image', absoluteUrl);
        }

        // Twitter
        setMetaTag('name', 'twitter:card', 'summary_large_image');
        setMetaTag('name', 'twitter:title', title);
        setMetaTag('name', 'twitter:description', description);
        if (ogImageUrl) {
            const absoluteUrl = new URL(ogImageUrl, window.location.href).href;
            setMetaTag('name', 'twitter:image', absoluteUrl);
        }

    }, [seoConfig, siteTitle, siteSubtitle, ogImageUrl]);

    return null; // This component does not render anything
};

export default MetaHandler;
