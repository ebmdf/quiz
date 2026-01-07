import React, { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import { UploadIcon } from '../Icons';
import type { PopupConfig } from '../../types';

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

const PopupManager: React.FC = () => {
    const { siteConfig, setSiteConfig } = useSite();
    const { popupConfig } = siteConfig;
    const imagePreview = useObjectURL(popupConfig.image);

    const handleConfigChange = (key: keyof PopupConfig, value: any) => {
        setSiteConfig(prev => ({
            ...prev,
            popupConfig: {
                ...prev.popupConfig,
                [key]: value,
            },
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleConfigChange('image', e.target.files[0]);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Gerenciar Popup de Boas-Vindas</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                <div className="flex items-center p-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600">
                    <input
                        type="checkbox"
                        id="popup-enabled"
                        checked={popupConfig.enabled}
                        onChange={e => handleConfigChange('enabled', e.target.checked)}
                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="popup-enabled" className="ml-3 block text-sm font-medium text-gray-900 dark:text-white">
                        Ativar Popup
                    </label>
                </div>

                <div className={`space-y-4 ${!popupConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <label htmlFor="popup-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                        <input
                            type="text"
                            id="popup-title"
                            value={popupConfig.title}
                            onChange={e => handleConfigChange('title', e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="popup-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo</label>
                        <textarea
                            id="popup-content"
                            rows={4}
                            value={popupConfig.content}
                            onChange={e => handleConfigChange('content', e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                            placeholder="Você pode usar HTML básico como <p>, <strong>, <a>."
                        />
                    </div>
                     <div>
                        <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imagem (Opcional)</label>
                        <div className="mt-1 flex items-center gap-4">
                            <span className="h-24 w-48 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
                                {imagePreview ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" /> : <UploadIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                            </span>
                            <input id="logo-upload" type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                        </div>
                    </div>

                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 pt-4 border-t dark:border-gray-700">Botão (Opcional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Texto do Botão"
                            value={popupConfig.buttonText || ''}
                            onChange={e => handleConfigChange('buttonText', e.target.value)}
                            className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                        <input
                            type="url"
                            placeholder="Link do Botão"
                            value={popupConfig.buttonLink || ''}
                            onChange={e => handleConfigChange('buttonLink', e.target.value)}
                            className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 pt-4 border-t dark:border-gray-700">Aparência</h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fundo</label><input type="color" value={popupConfig.backgroundColor} onChange={e => handleConfigChange('backgroundColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Texto</label><input type="color" value={popupConfig.textColor} onChange={e => handleConfigChange('textColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fundo Botão</label><input type="color" value={popupConfig.buttonColor} onChange={e => handleConfigChange('buttonColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Texto Botão</label><input type="color" value={popupConfig.buttonTextColor} onChange={e => handleConfigChange('buttonTextColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" /></div>
                    </div>

                    <div className="border-t dark:border-gray-700 pt-4">
                         <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="popup-show-once"
                                checked={popupConfig.showOncePerSession}
                                onChange={e => handleConfigChange('showOncePerSession', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="popup-show-once" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                                Mostrar apenas uma vez por sessão do navegador
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupManager;