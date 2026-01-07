
import React, { useState } from 'react';
import type { SiteConfig, StoreConfig, Coupon } from '../../types';
import { useSite } from '../../context/SiteContext';
import { TrashIcon, PlusIcon, XIcon, UploadIcon } from '../Icons';

const useObjectURL = (file?: File | Blob | string) => {
    const [url, setUrl] = useState<string | undefined>();
    React.useEffect(() => {
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

const StoreSettingsManager: React.FC = () => {
    const { siteConfig, setSiteConfig, products } = useSite();
    const { storeConfig } = siteConfig;
    
    const [newCoupon, setNewCoupon] = useState<Omit<Coupon, 'id' | 'enabled'>>({ code: '', type: 'percentage', value: 0, maxUses: 0, firstPurchaseOnly: false, productIds: [] });
    const [isSingleUse, setIsSingleUse] = useState(false); // Local state for the checkbox
    const [isProductSpecific, setIsProductSpecific] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    const setStoreConfig = (cb: (prev: StoreConfig) => StoreConfig) => {
        setSiteConfig(prev => ({...prev, storeConfig: cb(prev.storeConfig)}));
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStoreConfig(prev => ({...prev, [name as keyof StoreConfig]: value}));
    }

    const handleDetailConfigChange = (key: string, value: any) => {
        setStoreConfig(prev => ({
            ...prev,
            productDetailConfig: {
                ...prev.productDetailConfig,
                [key]: value
            }
        }));
    };
    
    const handleNestedConfigChange = (configName: 'cartIconConfig' | 'emailConfig', key: string, value: any) => {
        setStoreConfig(prev => ({
            ...prev,
            [configName]: {
                ...(prev[configName as keyof SiteConfig['storeConfig']] as object),
                [key]: value,
            },
        }));
    };
    
    const handleSocialIconUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (e.target.files && e.target.files[0]) {
            handleDetailConfigChange(key, e.target.files[0]);
        }
    };

    const handleAddCoupon = () => {
        if (!newCoupon.code || newCoupon.value <= 0) {
            alert('Código e valor são obrigatórios.');
            return;
        }
        if (isProductSpecific && (!newCoupon.productIds || newCoupon.productIds.length === 0)) {
            alert('Selecione pelo menos um produto para o cupom específico.');
            return;
        }

        const coupon: Coupon = {
            id: Date.now().toString(),
            ...newCoupon,
            code: newCoupon.code.toUpperCase(),
            currentUses: 0,
            enabled: true,
            maxUses: isSingleUse ? 1 : newCoupon.maxUses, // Override if single use is checked
            firstPurchaseOnly: newCoupon.firstPurchaseOnly,
            productIds: isProductSpecific ? newCoupon.productIds : undefined
        };
        setStoreConfig(prev => ({ ...prev, coupons: [...prev.coupons, coupon] }));
        setNewCoupon({ code: '', type: 'percentage', value: 0, maxUses: 0, firstPurchaseOnly: false, productIds: [] });
        setIsSingleUse(false);
        setIsProductSpecific(false);
    };

    const handleRemoveCoupon = (id: string) => {
        setStoreConfig(prev => ({ ...prev, coupons: prev.coupons.filter(c => c.id !== id) }));
    };

    const handleToggleCoupon = (id: string) => {
        setStoreConfig(prev => ({ 
            ...prev, 
            coupons: prev.coupons.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c) 
        }));
    };
    
    const handleProductToggleForCoupon = (productId: string) => {
        setNewCoupon(prev => {
            const currentIds = prev.productIds || [];
            if (currentIds.includes(productId)) {
                return { ...prev, productIds: currentIds.filter(id => id !== productId) };
            } else {
                return { ...prev, productIds: [...currentIds, productId] };
            }
        });
    };

    const handleAddEmail = () => {
        if (!newEmail || !newEmail.includes('@')) {
            alert('Por favor, insira e-mail válido.');
            return;
        }
        const currentEmails = storeConfig.emailConfig.adminEmails || [];
        if (currentEmails.includes(newEmail)) {
            alert('Este e-mail já foi adicionado.');
            return;
        }
        handleNestedConfigChange('emailConfig', 'adminEmails', [...currentEmails, newEmail]);
        setNewEmail('');
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        const currentEmails = storeConfig.emailConfig.adminEmails || [];
        handleNestedConfigChange('emailConfig', 'adminEmails', currentEmails.filter(email => email !== emailToRemove));
    };
    
    const renderSocialIconInput = (label: string, linkKey: string, iconKey: string, toggleKey?: string) => {
        const iconPreview = useObjectURL(storeConfig.productDetailConfig[iconKey as keyof typeof storeConfig.productDetailConfig] as any);
        
        return (
            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border dark:border-gray-600">
                <div className="flex items-center justify-between">
                     <div className="flex items-center">
                        {toggleKey && (
                             <input type="checkbox" checked={storeConfig.productDetailConfig[toggleKey as keyof typeof storeConfig.productDetailConfig] !== false} onChange={e => handleDetailConfigChange(toggleKey, e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2" />
                        )}
                        <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">{label}</label>
                    </div>
                    {iconPreview && <img src={iconPreview} alt="icon" className="w-6 h-6 object-contain" />}
                </div>
                
                <input 
                    type="text" 
                    placeholder="Link personalizado (opcional)" 
                    value={storeConfig.productDetailConfig[linkKey as keyof typeof storeConfig.productDetailConfig] as string || ''} 
                    onChange={e => handleDetailConfigChange(linkKey, e.target.value)} 
                    className="w-full text-xs p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white" 
                />
                
                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Ícone Personalizado:</label>
                    <input type="file" accept="image/*" onChange={(e) => handleSocialIconUpload(e, iconKey)} className="text-xs" />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Configurações Gerais da Loja</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                    <div>
                        <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Loja</label>
                        <input type="text" name="storeName" id="storeName" value={storeConfig.storeName} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="themePrimaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor Principal do Tema</label>
                            <input type="color" name="themePrimaryColor" id="themePrimaryColor" value={storeConfig.themePrimaryColor} onChange={handleChange} className="mt-1 block w-full h-10 rounded-md border-gray-300" />
                        </div>
                        <div>
                            <label htmlFor="themeBgColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor de Fundo do Tema</label>
                            <input type="color" name="themeBgColor" id="themeBgColor" value={storeConfig.themeBgColor} onChange={handleChange} className="mt-1 block w-full h-10 rounded-md border-gray-300" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="buyButtonText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Texto Padrão do Botão de Compra</label>
                        <input type="text" name="buyButtonText" id="buyButtonText" value={storeConfig.buyButtonText} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="buyButtonColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor Padrão do Botão de Compra</label>
                            <input type="color" name="buyButtonColor" id="buyButtonColor" value={storeConfig.buyButtonColor} onChange={handleChange} className="mt-1 block w-full h-10 rounded-md border-gray-300" />
                        </div>
                        <div>
                            <label htmlFor="buyButtonTextColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor Padrão do Texto do Botão</label>
                            <input type="color" name="buyButtonTextColor" id="buyButtonTextColor" value={storeConfig.buyButtonTextColor} onChange={handleChange} className="mt-1 block w-full h-10 rounded-md border-gray-300" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t dark:border-gray-700">
                 <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Configuração da Página do Produto</h3>
                 <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                     <h4 className="font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2">Oferta Relâmpago</h4>
                     <div className="space-y-4">
                        <div className="flex items-center">
                            <input type="checkbox" checked={storeConfig.productDetailConfig.showLightningDeal} onChange={e => handleDetailConfigChange('showLightningDeal', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <label className="ml-2 text-sm text-gray-900 dark:text-gray-200">Ativar Banner de Oferta Relâmpago</label>
                        </div>
                        
                        {storeConfig.productDetailConfig.showLightningDeal && (
                            <div className="pl-4 border-l-2 border-indigo-100 dark:border-gray-600 space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Texto do Banner</label>
                                    <input type="text" value={storeConfig.productDetailConfig.lightningDealText} onChange={e => handleDetailConfigChange('lightningDealText', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor de Fundo</label>
                                        <input type="color" value={storeConfig.productDetailConfig.lightningDealBgColor || '#f97316'} onChange={e => handleDetailConfigChange('lightningDealBgColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor do Texto</label>
                                        <input type="color" value={storeConfig.productDetailConfig.lightningDealTextColor || '#ffffff'} onChange={e => handleDetailConfigChange('lightningDealTextColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center mb-2">
                                        <input type="checkbox" checked={storeConfig.productDetailConfig.lightningDealTimerEnabled} onChange={e => handleDetailConfigChange('lightningDealTimerEnabled', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                        <label className="ml-2 text-sm text-gray-900 dark:text-gray-200">Ativar Contador Regressivo</label>
                                    </div>
                                    {storeConfig.productDetailConfig.lightningDealTimerEnabled && (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Horas</label>
                                                <input type="number" value={storeConfig.productDetailConfig.lightningDealHours} onChange={e => handleDetailConfigChange('lightningDealHours', Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Minutos</label>
                                                <input type="number" value={storeConfig.productDetailConfig.lightningDealMinutes} onChange={e => handleDetailConfigChange('lightningDealMinutes', Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Segundos</label>
                                                <input type="number" value={storeConfig.productDetailConfig.lightningDealSeconds} onChange={e => handleDetailConfigChange('lightningDealSeconds', Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                     </div>

                     <h4 className="font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2 mt-4">Denúncias</h4>
                     <div className="flex flex-col gap-3">
                         <div className="flex items-center">
                            <input type="checkbox" checked={storeConfig.productDetailConfig.showReportLink} onChange={e => handleDetailConfigChange('showReportLink', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <label className="ml-2 text-sm text-gray-900 dark:text-gray-200">Habilitar opção "Denunciar Produto"</label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail para Recebimento de Denúncias</label>
                            <input 
                                type="email" 
                                value={storeConfig.productDetailConfig.reportEmail || ''} 
                                onChange={e => handleDetailConfigChange('reportEmail', e.target.value)} 
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                placeholder={storeConfig.emailConfig.adminEmails?.[0] || "admin@exemplo.com"}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Se deixado em branco, usará o primeiro e-mail de administrador.</p>
                        </div>
                     </div>

                     <h4 className="font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2 mt-4">Compartilhamento</h4>
                     <div className="flex items-center">
                        <input type="checkbox" checked={storeConfig.productDetailConfig.showShareButtons} onChange={e => handleDetailConfigChange('showShareButtons', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                        <label className="ml-2 text-sm text-gray-900 dark:text-gray-200">Mostrar botões de compartilhamento</label>
                    </div>
                    {storeConfig.productDetailConfig.showShareButtons && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-indigo-100 dark:border-gray-600">
                             {renderSocialIconInput("Facebook", "facebookShareLink", "customIconFacebook", "enableFacebookShare")}
                             {renderSocialIconInput("X (Twitter)", "twitterShareLink", "customIconTwitter", "enableTwitterShare")}
                             {renderSocialIconInput("Pinterest", "pinterestShareLink", "customIconPinterest", "enablePinterestShare")}
                             {renderSocialIconInput("Instagram", "instagramShareLink", "customIconInstagram", "enableInstagramShare")}
                             {renderSocialIconInput("TikTok", "tikTokShareLink", "customIconTikTok", "enableTikTokShare")}
                             
                             <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border dark:border-gray-600">
                                <div className="flex items-center justify-between">
                                     <div className="flex items-center">
                                         <input type="checkbox" checked={storeConfig.productDetailConfig.enableWhatsAppShare !== false} onChange={e => handleDetailConfigChange('enableWhatsAppShare', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2" />
                                        <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">WhatsApp</label>
                                    </div>
                                    {useObjectURL(storeConfig.productDetailConfig.customIconWhatsApp as any) && <img src={useObjectURL(storeConfig.productDetailConfig.customIconWhatsApp as any)} alt="icon" className="w-6 h-6 object-contain" />}
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Número para contato (ex: 5511999999999)" 
                                    value={storeConfig.productDetailConfig.whatsAppShareNumber || ''} 
                                    onChange={e => handleDetailConfigChange('whatsAppShareNumber', e.target.value)} 
                                    className="w-full text-xs p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white" 
                                />
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Se preenchido, o botão enviará o produto para este número (como um pedido/dúvida). Se vazio, abre a lista de contatos para compartilhar.</p>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Ícone Personalizado:</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleSocialIconUpload(e, 'customIconWhatsApp')} className="text-xs" />
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
            </div>

            <div className="pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Cupons de Desconto</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                    <div className="flex items-center mb-4 p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600">
                        <input type="checkbox" checked={storeConfig.productDetailConfig.showCouponInfo} onChange={e => handleDetailConfigChange('showCouponInfo', e.target.checked)} className="h-5 w-5 text-indigo-600 border-gray-300 rounded" />
                        <label className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-200">Ativar Sistema de Cupons Globalmente</label>
                    </div>
                    
                    <div className={!storeConfig.productDetailConfig.showCouponInfo ? 'opacity-50 pointer-events-none' : ''}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código</label>
                                <input 
                                    type="text" 
                                    value={newCoupon.code} 
                                    onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md uppercase"
                                    placeholder="EX: DESCONTO10"
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                                <select 
                                    value={newCoupon.type} 
                                    onChange={e => setNewCoupon({...newCoupon, type: e.target.value as 'percentage' | 'fixed'})} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                >
                                    <option value="percentage">Porcentagem (%)</option>
                                    <option value="fixed">Valor Fixo (R$)</option>
                                </select>
                            </div>
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
                                <input 
                                    type="number" 
                                    value={newCoupon.value} 
                                    onChange={e => setNewCoupon({...newCoupon, value: Number(e.target.value)})} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                             <div className="lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Limite de Usos</label>
                                <input 
                                    type="number" 
                                    value={isSingleUse ? 1 : newCoupon.maxUses || 0} 
                                    onChange={e => setNewCoupon({...newCoupon, maxUses: Number(e.target.value)})} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:opacity-50 disabled:bg-gray-100"
                                    min="0"
                                    placeholder="0 = Infinito"
                                    disabled={isSingleUse}
                                />
                            </div>
                            <button 
                                onClick={handleAddCoupon}
                                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2 lg:col-span-1"
                            >
                                <PlusIcon className="h-5 w-5"/> Adicionar
                            </button>
                        </div>
                         
                         <div className="mt-4 space-y-2 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                             <div className="flex flex-wrap gap-4">
                                 <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="isSingleUse"
                                        checked={isSingleUse} 
                                        onChange={e => setIsSingleUse(e.target.checked)} 
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isSingleUse" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Cupom de Uso Único</label>
                                 </div>
                                 <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="firstPurchaseOnly"
                                        checked={newCoupon.firstPurchaseOnly} 
                                        onChange={e => setNewCoupon({...newCoupon, firstPurchaseOnly: e.target.checked})} 
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor="firstPurchaseOnly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Apenas 1ª compra</label>
                                 </div>
                                 <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="isProductSpecific"
                                        checked={isProductSpecific} 
                                        onChange={e => setIsProductSpecific(e.target.checked)} 
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isProductSpecific" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Produtos Específicos</label>
                                 </div>
                            </div>
                            
                            {isProductSpecific && (
                                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 p-2">
                                    {products.length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum produto cadastrado.</p>
                                    ) : (
                                        products.map(product => (
                                            <label key={product.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={(newCoupon.productIds || []).includes(product.id)} 
                                                    onChange={() => handleProductToggleForCoupon(product.id)}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                                />
                                                <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{product.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cupons Cadastrados</h4>
                            {storeConfig.coupons.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">Nenhum cupom cadastrado.</p>
                            ) : (
                                <div className="space-y-2">
                                    {storeConfig.coupons.map(coupon => (
                                        <div key={coupon.id} className={`flex items-center justify-between p-3 rounded-md border ${coupon.enabled ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75'}`}>
                                            <div>
                                                <span className={`font-bold ${coupon.enabled ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 line-through'}`}>{coupon.code}</span>
                                                <span className="text-gray-600 dark:text-gray-300 ml-2">
                                                    - {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `R$ ${coupon.value.toFixed(2)} OFF`}
                                                    <span className="text-xs text-gray-500 ml-2 block sm:inline">
                                                        ({coupon.currentUses || 0} / {coupon.maxUses && coupon.maxUses > 0 ? coupon.maxUses : '∞'} usados)
                                                        {coupon.firstPurchaseOnly && " [1ª Compra]"}
                                                        {coupon.productIds && coupon.productIds.length > 0 && ` [${coupon.productIds.length} produtos]`}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleToggleCoupon(coupon.id)}
                                                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ${coupon.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                    title={coupon.enabled ? 'Desativar Cupom' : 'Ativar Cupom'}
                                                >
                                                    <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${coupon.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                                <button onClick={() => handleRemoveCoupon(coupon.id)} className="text-red-500 hover:text-red-700 p-1" title="Excluir Cupom">
                                                    <TrashIcon className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Configurações de E-mail</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-mails do Administrador (para receber notificações gerais)</label>
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="email" 
                                value={newEmail} 
                                onChange={e => setNewEmail(e.target.value)} 
                                className="flex-grow shadow-sm sm:text-sm border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="novo@email.com"
                            />
                            <button onClick={handleAddEmail} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Adicionar</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(storeConfig.emailConfig.adminEmails || []).map((email, index) => (
                                <div key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                    <span>{email}</span>
                                    <button onClick={() => handleRemoveEmail(email)} className="text-red-500 hover:text-red-700 focus:outline-none"><XIcon className="h-3 w-3"/></button>
                                </div>
                            ))}
                            {(storeConfig.emailConfig.adminEmails || []).length === 0 && <p className="text-sm text-gray-500 italic">Nenhum e-mail configurado.</p>}
                        </div>
                    </div>
                    
                    <div className="pt-4 mt-4 border-t dark:border-gray-600">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Configurações de Envio (SMTP)</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Estas configurações são necessárias para que o sistema possa enviar e-mails de recuperação de senha e notificações de pedidos.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Servidor SMTP (Host)</label>
                                <input 
                                    type="text" 
                                    value={storeConfig.emailConfig.smtpServer || ''} 
                                    onChange={e => handleNestedConfigChange('emailConfig', 'smtpServer', e.target.value)} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="ex: smtp.gmail.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Porta SMTP</label>
                                <input 
                                    type="number" 
                                    value={storeConfig.emailConfig.smtpPort || ''} 
                                    onChange={e => handleNestedConfigChange('emailConfig', 'smtpPort', Number(e.target.value))} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="ex: 587"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuário SMTP</label>
                                <input 
                                    type="text" 
                                    value={storeConfig.emailConfig.smtpUser || ''} 
                                    onChange={e => handleNestedConfigChange('emailConfig', 'smtpUser', e.target.value)} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha SMTP</label>
                                <input 
                                    type="password" 
                                    value={storeConfig.emailConfig.smtpPassword || ''} 
                                    onChange={e => handleNestedConfigChange('emailConfig', 'smtpPassword', e.target.value)} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail de Remetente (From)</label>
                                <input 
                                    type="email" 
                                    value={storeConfig.emailConfig.fromEmail || ''} 
                                    onChange={e => handleNestedConfigChange('emailConfig', 'fromEmail', e.target.value)} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="no-reply@seusite.com"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StoreSettingsManager;
