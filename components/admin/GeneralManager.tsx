
import React, { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import { UploadIcon } from '../Icons';
import type { AdminButtonConfig, SiteConfig } from '../../types';

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

const SwitchToggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string; }> = ({ enabled, onChange, label }) => (
    <div className="flex items-center">
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
        >
            <span className="sr-only">{label}</span>
            <span aria-hidden="true" className={`inline-block w-5 h-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
        <label className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    </div>
);

const GeneralManager: React.FC = () => {
    const { siteConfig, setSiteConfig } = useSite();
    const logoPreview = useObjectURL(siteConfig.logo);
    
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSiteConfig({ ...siteConfig, logo: e.target.files[0] });
        }
    };
    
    const handleInputChange = (key: keyof SiteConfig, value: string | boolean) => {
        setSiteConfig({ ...siteConfig, [key]: value });
    };
    
    const handleAdminButtonConfigChange = (key: keyof AdminButtonConfig, value: any) => {
        setSiteConfig(prev => ({
            ...prev,
            adminButtonConfig: {
                ...prev.adminButtonConfig,
                [key]: value
            }
        }));
    };

    const handleContentGatingChange = (key: 'quiz' | 'wordsearch' | 'downloads', value: boolean) => {
        setSiteConfig(prev => ({
            ...prev,
            contentGating: {
                ...prev.contentGating!,
                [key]: value
            }
        }));
    };
    
    const handleCommentsConfigChange = (key: keyof SiteConfig['commentsConfig'], value: boolean) => {
        setSiteConfig(prev => ({
            ...prev,
            commentsConfig: {
                ...prev.commentsConfig,
                [key]: value
            }
        }));
    };


    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Configurações Gerais</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                <div>
                    <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload de Logo</label>
                    <div className="mt-1 flex items-center gap-4">
                        <span className="h-24 w-48 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
                            {logoPreview ? <img src={logoPreview} alt="Preview" className="h-full w-full object-contain" /> : <UploadIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                        </span>
                        <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="site-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título do Site</label>
                    <input 
                        type="text" 
                        id="site-title" 
                        value={siteConfig.siteTitle} 
                        onChange={e => handleInputChange('siteTitle', e.target.value)} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                    />
                </div>
                 <div>
                    <label htmlFor="site-subtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subtítulo do Site (na tela inicial)</label>
                    <input 
                        type="text" 
                        id="site-subtitle" 
                        value={siteConfig.siteSubtitle} 
                        onChange={e => handleInputChange('siteSubtitle', e.target.value)}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                        <label htmlFor="downloads-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título da Seção de Downloads</label>
                        <input 
                            type="text" 
                            id="downloads-title" 
                            value={siteConfig.downloadsTitle} 
                            onChange={e => handleInputChange('downloadsTitle', e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                        />
                    </div>
                     <div className="flex items-center h-full pt-6">
                        <input 
                            type="checkbox" 
                            id="showGuestNameInHeader" 
                            checked={siteConfig.showGuestNameInHeader}
                            onChange={e => handleInputChange('showGuestNameInHeader', e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="showGuestNameInHeader" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Mostrar nome do jogador convidado</label>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4 pt-6 border-t dark:border-gray-700">Acesso Restrito (Content Gating)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Exigir que os usuários façam login para acessar certas áreas do site.</p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                    <SwitchToggle 
                        enabled={siteConfig.contentGating?.quiz ?? false} 
                        onChange={val => handleContentGatingChange('quiz', val)}
                        label="Exigir login para o Quiz"
                    />
                    <SwitchToggle 
                        enabled={siteConfig.contentGating?.wordsearch ?? false}
                        onChange={val => handleContentGatingChange('wordsearch', val)}
                        label="Exigir login para o Caça Palavras"
                    />
                    <SwitchToggle 
                        enabled={siteConfig.contentGating?.downloads ?? false}
                        onChange={val => handleContentGatingChange('downloads', val)}
                        label="Exigir login para Downloads"
                    />
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4 pt-6 border-t dark:border-gray-700">Comentários e Avaliações</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                    <SwitchToggle 
                        enabled={siteConfig.commentsConfig.enabled} 
                        onChange={val => handleCommentsConfigChange('enabled', val)}
                        label="Ativar sistema de comentários em todo o site"
                    />
                     <div className={`space-y-3 pt-3 border-t dark:border-gray-700 ${!siteConfig.commentsConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <SwitchToggle 
                            enabled={siteConfig.commentsConfig.requireApproval} 
                            onChange={val => handleCommentsConfigChange('requireApproval', val)}
                            label="Exigir aprovação do administrador para novos comentários"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ative as seções onde os comentários devem aparecer:</p>
                        <SwitchToggle 
                            enabled={siteConfig.commentsConfig.enableOnProducts} 
                            onChange={val => handleCommentsConfigChange('enableOnProducts', val)}
                            label="Ativar em Produtos"
                        />
                        <SwitchToggle 
                            enabled={siteConfig.commentsConfig.enableOnQuiz} 
                            onChange={val => handleCommentsConfigChange('enableOnQuiz', val)}
                            label="Ativar no final do Quiz"
                        />
                        <SwitchToggle 
                            enabled={siteConfig.commentsConfig.enableOnWordSearch}
                            onChange={val => handleCommentsConfigChange('enableOnWordSearch', val)}
                            label="Ativar no final do Caça-Palavras"
                        />
                         <SwitchToggle 
                           enabled={siteConfig.commentsConfig.enableOnDownloads}
                           onChange={val => handleCommentsConfigChange('enableOnDownloads', val)}
                           label="Ativar na página de Downloads"
                       />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4 pt-6 border-t dark:border-gray-700">Botão do Painel Admin</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                    <div>
                        <label htmlFor="admin-btn-bg" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor de Fundo (use <code>rgba()</code> para transparência)</label>
                        <input 
                            type="text" 
                            id="admin-btn-bg" 
                            value={siteConfig.adminButtonConfig.bgColor} 
                            onChange={e => handleAdminButtonConfigChange('bgColor', e.target.value)} 
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="admin-btn-icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor do Ícone</label>
                            <input 
                                type="color" 
                                id="admin-btn-icon" 
                                value={siteConfig.adminButtonConfig.iconColor} 
                                onChange={e => handleAdminButtonConfigChange('iconColor', e.target.value)} 
                                className="mt-1 block w-full h-10 rounded-md border-gray-300" 
                            />
                        </div>
                        <div>
                            <label htmlFor="admin-btn-opacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opacidade ({Math.round(siteConfig.adminButtonConfig.opacity * 100)}%)</label>
                             <input 
                                type="range" 
                                id="admin-btn-opacity"
                                min="0" max="1" step="0.05"
                                value={siteConfig.adminButtonConfig.opacity} 
                                onChange={e => handleAdminButtonConfigChange('opacity', parseFloat(e.target.value))} 
                                className="mt-1 block w-full" 
                            />
                        </div>
                    </div>
                     <div className="border-t dark:border-gray-700 pt-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="hide-admin-icon-mobile"
                                checked={siteConfig.adminButtonConfig.hideOnMobile}
                                onChange={e => handleAdminButtonConfigChange('hideOnMobile', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="hide-admin-icon-mobile" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                não mostrar ícone engrenagem do painel admin no site em dispositivos móveis
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralManager;
