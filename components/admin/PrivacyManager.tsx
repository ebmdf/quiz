
import React from 'react';
import { useSite } from '../../context/SiteContext';
import type { CookieConsentConfig } from '../../types';

const PrivacyManager: React.FC = () => {
    const { siteConfig, setSiteConfig } = useSite();
    const { cookieConsentConfig } = siteConfig;

    const handleConfigChange = (key: keyof CookieConsentConfig, value: any) => {
        setSiteConfig(prev => ({
            ...prev,
            cookieConsentConfig: {
                ...prev.cookieConsentConfig,
                [key]: value,
            },
        }));
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Privacidade e Cookies (LGPD/GDPR)</h3>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-6">
                
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="cookie-enabled"
                        checked={cookieConsentConfig.enabled}
                        onChange={e => handleConfigChange('enabled', e.target.checked)}
                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="cookie-enabled" className="ml-3 block text-sm font-medium text-gray-900 dark:text-white">
                        Ativar Banner de Consentimento de Cookies
                    </label>
                </div>

                <div className={`space-y-4 ${!cookieConsentConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mensagem do Banner
                        </label>
                        <textarea
                            rows={3}
                            value={cookieConsentConfig.message}
                            onChange={e => handleConfigChange('message', e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                            placeholder="Este site utiliza cookies..."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Informe ao usuário sobre o uso de cookies e dados.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Texto Botão Aceitar
                            </label>
                            <input
                                type="text"
                                value={cookieConsentConfig.acceptButtonText}
                                onChange={e => handleConfigChange('acceptButtonText', e.target.value)}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Texto Botão Recusar
                            </label>
                            <input
                                type="text"
                                value={cookieConsentConfig.declineButtonText}
                                onChange={e => handleConfigChange('declineButtonText', e.target.value)}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Link da Política de Privacidade (Opcional)
                        </label>
                        <input
                            type="url"
                            value={cookieConsentConfig.privacyPolicyLink || ''}
                            onChange={e => handleConfigChange('privacyPolicyLink', e.target.value)}
                            placeholder="https://seusite.com/politica-privacidade"
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Se preenchido, aparecerá um link "Saiba mais" no banner.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyManager;
