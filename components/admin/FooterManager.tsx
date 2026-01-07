
import React, { useState, useEffect } from 'react';
import type { SiteConfig, SocialLink, FooterImage, FooterElement, FooterElementStyle } from '../../types';
import { useSite } from '../../context/SiteContext';
import { UploadIcon, TrashIcon, PlusIcon, ArrowDownIcon, ArrowUpIcon, XIcon } from '../Icons';

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

const elementLabels: Record<FooterElement, string> = {
    newsletter: 'Newsletter',
    social: 'Links Sociais',
    text: 'Texto de Copyright',
    images: 'Imagens (Selos)',
    categories: 'Links de Categorias',
    map: 'Mapa do Google',
    address: 'Endereço (Texto Manual)'
};

// --- Sub-components for each manager section ---

const SocialLinkItem: React.FC<{link: SocialLink, onRemove: (id: string) => void}> = ({ link, onRemove }) => {
    const iconUrl = useObjectURL(link.icon);
    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 rounded-md">
            <div className="flex items-center gap-3">
                <img src={iconUrl} alt={link.name} className="w-8 h-8 object-contain rounded-full" />
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">{link.name}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-500 hover:underline">{link.url}</a>
                </div>
            </div>
            <button onClick={() => onRemove(link.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"><TrashIcon /></button>
        </div>
    );
}

const FooterImageItem: React.FC<{image: FooterImage, onRemove: (id: string) => void}> = ({ image, onRemove }) => {
    const imageUrl = useObjectURL(image.image);
    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 rounded-md">
            <div className="flex items-center gap-3">
                <img src={imageUrl} alt="Footer image" className="w-16 h-10 object-contain rounded" />
                <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Ordem: {image.order}</p>
                    <a href={image.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">{image.link || 'Sem link'}</a>
                </div>
            </div>
            <button onClick={() => onRemove(image.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"><TrashIcon /></button>
        </div>
    );
};


const FooterManager: React.FC = () => {
    const { siteConfig, setSiteConfig } = useSite();
    const { footerConfig, newsletterConfig, whatsAppConfig } = siteConfig;

    // State for forms
    const [socialLinkName, setSocialLinkName] = useState('');
    const [socialLinkUrl, setSocialLinkUrl] = useState('');
    const [socialLinkIcon, setSocialLinkIcon] = useState<File | null>(null);
    const [socialIconPreview, setSocialIconPreview] = useState<string | null>(null);
    const [socialFormKey, setSocialFormKey] = useState(Date.now());

    const [footerImageFile, setFooterImageFile] = useState<File | null>(null);
    const [footerImageLink, setFooterImageLink] = useState('');
    const [footerImageWidth, setFooterImageWidth] = useState('80px');
    const [footerImageHeight, setFooterImageHeight] = useState('auto');
    const [footerImageOrder, setFooterImageOrder] = useState(0);
    const [footerImageFormKey, setFooterImageFormKey] = useState(Date.now());

    useEffect(() => {
        return () => {
            if (socialIconPreview) URL.revokeObjectURL(socialIconPreview);
        }
    }, [socialIconPreview]);
    
    // Handlers for config changes
    const handleFooterConfigChange = (key: keyof SiteConfig['footerConfig'], value: any) => {
        setSiteConfig(prev => ({ ...prev, footerConfig: { ...prev.footerConfig, [key]: value } }));
    };

    const handleNewsletterConfigChange = (key: keyof SiteConfig['newsletterConfig'], value: any) => {
        setSiteConfig(prev => ({ ...prev, newsletterConfig: { ...prev.newsletterConfig, [key]: value } }));
    };

    const handleWhatsAppConfigChange = (key: keyof SiteConfig['whatsAppConfig'], value: any) => {
        setSiteConfig(prev => ({ ...prev, whatsAppConfig: { ...prev.whatsAppConfig, [key]: value } }));
    };
    
    const handleMoveElement = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...footerConfig.elementOrder];
        const item = newOrder[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        if (swapIndex < 0 || swapIndex >= newOrder.length) return;

        newOrder[index] = newOrder[swapIndex];
        newOrder[swapIndex] = item;
        
        handleFooterConfigChange('elementOrder', newOrder);
    };

    // Social Links handlers
    const handleSocialIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSocialLinkIcon(file);
            setSocialIconPreview(URL.createObjectURL(file));
        }
    };

    const handleAddSocialLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (!socialLinkIcon) { alert('Ícone é obrigatório.'); return; }
        const newLink: SocialLink = {
            id: new Date().toISOString(),
            name: socialLinkName,
            url: socialLinkUrl,
            icon: socialLinkIcon
        };
        handleFooterConfigChange('socialLinks', [...footerConfig.socialLinks, newLink]);
        setSocialLinkName(''); setSocialLinkUrl(''); setSocialLinkIcon(null); setSocialIconPreview(null); setSocialFormKey(Date.now());
    };

    const handleRemoveSocialLink = (id: string) => {
        handleFooterConfigChange('socialLinks', footerConfig.socialLinks.filter(l => l.id !== id));
    };

    // Footer Images handlers
    const handleFooterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setFooterImageFile(e.target.files[0]);
    };

    const handleAddFooterImage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!footerImageFile) { alert('Imagem é obrigatória.'); return; }
        const newImage: FooterImage = {
            id: new Date().toISOString(),
            image: footerImageFile,
            link: footerImageLink,
            width: footerImageWidth,
            height: footerImageHeight,
            order: footerImageOrder
        };
        handleFooterConfigChange('footerImages', [...footerConfig.footerImages, newImage]);
        setFooterImageFile(null); setFooterImageLink(''); setFooterImageOrder(prev => prev + 1); setFooterImageFormKey(Date.now());
    };

    const handleRemoveFooterImage = (id: string) => {
        handleFooterConfigChange('footerImages', footerConfig.footerImages.filter(img => img.id !== id));
    };

    return (
        <div className="space-y-8">
            {/* General Footer Settings */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Configurações Gerais do Rodapé</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Texto de Copyright</label>
                        <input type="text" value={footerConfig.text} onChange={e => handleFooterConfigChange('text', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor de Fundo</label><input type="color" value={footerConfig.bgColor} onChange={e => handleFooterConfigChange('bgColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor do Texto Padrão</label><input type="color" value={footerConfig.defaultTextColor} onChange={e => handleFooterConfigChange('defaultTextColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" /></div>
                    </div>
                </div>
            </div>

            {/* Map & Address Settings */}
            <div>
                 <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Localização e Mapa</h3>
                 <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço da Loja (Texto Manual)</label>
                         <textarea 
                            rows={3}
                            value={footerConfig.address || ''} 
                            onChange={e => handleFooterConfigChange('address', e.target.value)} 
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                            placeholder="Av. Paulista, 1000 - São Paulo, SP"
                         />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Este texto aparecerá no rodapé como um bloco de texto.</p>
                    </div>
                    <div className="pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center mb-2">
                            <input 
                                type="checkbox" 
                                checked={footerConfig.mapConfig?.enabled || false} 
                                onChange={e => handleFooterConfigChange('mapConfig', { ...footerConfig.mapConfig, enabled: e.target.checked })} 
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded" 
                            />
                            <label className="ml-2 text-sm text-gray-900 dark:text-gray-200">Ativar Mapa do Google</label>
                        </div>
                        <div className={`grid grid-cols-1 gap-4 ${!footerConfig.mapConfig?.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL de Incorporação (Embed URL)</label>
                                <input 
                                    type="text" 
                                    value={footerConfig.mapConfig?.embedUrl || ''} 
                                    onChange={e => handleFooterConfigChange('mapConfig', { ...footerConfig.mapConfig, embedUrl: e.target.value })} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Cole o link "src" do código de incorporação (iframe) do Google Maps.
                                </p>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Largura do Mapa</label>
                                    <input 
                                        type="text" 
                                        value={footerConfig.mapConfig?.width || '100%'} 
                                        onChange={e => handleFooterConfigChange('mapConfig', { ...footerConfig.mapConfig, width: e.target.value })} 
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                        placeholder="ex: 100%, 500px"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Altura do Mapa</label>
                                    <input 
                                        type="text" 
                                        value={footerConfig.mapConfig?.height || '300px'} 
                                        onChange={e => handleFooterConfigChange('mapConfig', { ...footerConfig.mapConfig, height: e.target.value })} 
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                        placeholder="ex: 300px, 50vh"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>

             {/* Layout and Order Manager */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Ordem e Alinhamento dos Elementos</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-2">
                    {(footerConfig.elementOrder || []).map((element, index) => (
                        <div key={element} className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 border dark:border-gray-700 rounded-md">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">{elementLabels[element]}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <select
                                    value={footerConfig.elementStyles?.[element]?.alignment || 'center'}
                                    onChange={e => {
                                        const newStyles = {
                                            ...footerConfig.elementStyles,
                                            [element]: {
                                                ...footerConfig.elementStyles?.[element],
                                                alignment: e.target.value as 'left' | 'center' | 'right'
                                            }
                                        };
                                        handleFooterConfigChange('elementStyles', newStyles);
                                    }}
                                    className="text-sm border-gray-300 dark:border-gray-600 rounded-md py-1 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="left">Esquerda</option>
                                    <option value="center">Centro</option>
                                    <option value="right">Direita</option>
                                </select>
                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => handleMoveElement(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
                                    >
                                        <ArrowUpIcon />
                                    </button>
                                    <button
                                        onClick={() => handleMoveElement(index, 'down')}
                                        disabled={index === (footerConfig.elementOrder || []).length - 1}
                                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
                                    >
                                        <ArrowDownIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Social Links Manager */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Links Sociais</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                    <form key={socialFormKey} onSubmit={handleAddSocialLink} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><input type="text" placeholder="Nome (ex: Facebook)" value={socialLinkName} onChange={e => setSocialLinkName(e.target.value)} required className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" /><input type="url" placeholder="URL do Link" value={socialLinkUrl} onChange={e => setSocialLinkUrl(e.target.value)} required className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" /></div>
                        <div className="flex items-center gap-3"><span className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">{socialIconPreview ? <img src={socialIconPreview} alt="Preview" className="h-full w-full object-contain" /> : <UploadIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />}</span><input type="file" accept="image/*" onChange={handleSocialIconChange} required className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/></div>
                        <div className="text-right"><button type="submit" className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"><PlusIcon /> Adicionar Link</button></div>
                    </form>
                    <div className="space-y-2 border-t dark:border-gray-700 pt-4">
                        {footerConfig.socialLinks.map(link => <SocialLinkItem key={link.id} link={link} onRemove={handleRemoveSocialLink} />)}
                    </div>
                </div>
            </div>

            {/* Footer Images Manager */}
            <div>
                 <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Imagens no Rodapé (Selos, Pagamentos)</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                     <form key={footerImageFormKey} onSubmit={handleAddFooterImage} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><input type="url" placeholder="Link (opcional)" value={footerImageLink} onChange={e => setFooterImageLink(e.target.value)} className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" /><input type="number" placeholder="Ordem" value={footerImageOrder} onChange={e => setFooterImageOrder(Number(e.target.value))} required className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" /></div>
                        <input type="file" accept="image/*" onChange={handleFooterImageChange} required className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                        <div className="text-right"><button type="submit" className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"><PlusIcon /> Adicionar Imagem</button></div>
                    </form>
                    <div className="space-y-2 border-t dark:border-gray-700 pt-4">
                        {footerConfig.footerImages.sort((a,b) => a.order - b.order).map(img => <FooterImageItem key={img.id} image={img} onRemove={handleRemoveFooterImage} />)}
                    </div>
                </div>
            </div>

            {/* Newsletter Manager */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Newsletter</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                    <div className="flex items-center"><input type="checkbox" checked={newsletterConfig.enabled} onChange={e => handleNewsletterConfigChange('enabled', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" /><label className="ml-2 text-sm text-gray-900 dark:text-gray-200">Ativar Seção de Newsletter</label></div>
                    <div className={!newsletterConfig.enabled ? 'opacity-50 pointer-events-none' : ''}>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label><input type="text" value={newsletterConfig.title} onChange={e => handleNewsletterConfigChange('title', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subtítulo</label><input type="text" value={newsletterConfig.subtitle} onChange={e => handleNewsletterConfigChange('subtitle', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input type="text" placeholder="Placeholder do Input" value={newsletterConfig.inputPlaceholder} onChange={e => handleNewsletterConfigChange('inputPlaceholder', e.target.value)} className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                            <input type="text" placeholder="Texto do Botão" value={newsletterConfig.buttonText} onChange={e => handleNewsletterConfigChange('buttonText', e.target.value)} className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* WhatsApp Manager */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Botão Flutuante do WhatsApp</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                     <div className="flex items-center"><input type="checkbox" checked={whatsAppConfig.enabled} onChange={e => handleWhatsAppConfigChange('enabled', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" /><label className="ml-2 text-sm text-gray-900 dark:text-gray-200">Ativar Botão do WhatsApp</label></div>
                    <div className={!whatsAppConfig.enabled ? 'opacity-50 pointer-events-none' : ''}>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número (com código do país, ex: 5511999999999)</label><input type="tel" value={whatsAppConfig.number} onChange={e => handleWhatsAppConfigChange('number', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho</label><select value={whatsAppConfig.size} onChange={e => handleWhatsAppConfigChange('size', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"><option value="small">Pequeno</option><option value="medium">Médio</option><option value="large">Grande</option></select></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opacidade ({Math.round((whatsAppConfig.opacity || 1) * 100)}%)</label><input type="range" min="0.1" max="1" step="0.1" value={whatsAppConfig.opacity} onChange={e => handleWhatsAppConfigChange('opacity', parseFloat(e.target.value))} className="mt-1 block w-full" /></div>
                        </div>
                         <div className="flex items-center mt-2">
                             <input type="checkbox" checked={whatsAppConfig.allowClose !== false} onChange={e => handleWhatsAppConfigChange('allowClose', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                             <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Permitir que o usuário feche o botão</label>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FooterManager;