import React, { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import { UploadIcon } from '../Icons';

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

const SeoManager: React.FC = () => {
    const { siteConfig, setSiteConfig } = useSite();
    const { seoConfig } = siteConfig;

    const ogImagePreview = useObjectURL(seoConfig?.ogImage);

    const handleChange = (key: 'metaTitle' | 'metaDescription' | 'metaKeywords', value: string) => {
        setSiteConfig(prev => ({
            ...prev,
            seoConfig: {
                ...prev.seoConfig,
                [key]: value,
            },
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSiteConfig(prev => ({
                ...prev,
                seoConfig: {
                    ...prev.seoConfig,
                    ogImage: e.target.files[0],
                },
            }));
        }
    };
    
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">SEO & Otimização de Compartilhamento</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                <div>
                    <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</label>
                    <input 
                        type="text" 
                        id="metaTitle" 
                        value={seoConfig?.metaTitle || ''} 
                        onChange={e => handleChange('metaTitle', e.target.value)} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                        placeholder={siteConfig.siteTitle}
                    />
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">O título que aparece na aba do navegador e nos resultados de busca. Ideal: 50-60 caracteres.</p>
                </div>
                <div>
                    <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</label>
                    <textarea 
                        id="metaDescription" 
                        rows={3}
                        value={seoConfig?.metaDescription || ''} 
                        onChange={e => handleChange('metaDescription', e.target.value)} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        placeholder={siteConfig.siteSubtitle}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">A descrição que aparece nos resultados de busca. Ideal: 150-160 caracteres.</p>
                </div>
                 <div>
                    <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Palavras-chave (separadas por vírgula)</label>
                    <input 
                        type="text" 
                        id="metaKeywords" 
                        value={seoConfig?.metaKeywords || ''} 
                        onChange={e => handleChange('metaKeywords', e.target.value)} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        placeholder="quiz, jogo, caça palavras, entretenimento"
                    />
                </div>
                <div>
                    <label htmlFor="ogImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imagem de Compartilhamento (Open Graph)</label>
                    <div className="mt-1 flex items-center gap-4">
                        <span className="h-24 w-48 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
                            {ogImagePreview ? <img src={ogImagePreview} alt="Preview" className="h-full w-full object-cover" /> : <UploadIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                        </span>
                        <input id="ogImage" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Imagem que aparece ao compartilhar o link em redes sociais. Tamanho recomendado: 1200x630 pixels.</p>
                </div>
            </div>
        </div>
    );
};

export default SeoManager;