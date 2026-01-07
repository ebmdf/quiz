
import React, { useState, useEffect } from 'react';
import type { Banner, ButtonPosition, ContentBanner, SiteCategory } from '../../types';
import { UploadIcon, TrashIcon, PlusIcon } from '../Icons';
import { useSite } from '../../context/SiteContext';

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

const SiteBannerItem: React.FC<{ banner: Banner, onRemove: (id: string) => void }> = ({ banner, onRemove }) => {
    const imageUrl = useObjectURL(banner.image);
    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 rounded-md">
            <div className="flex items-center gap-4">
                <img src={imageUrl} alt="Banner" className="w-16 h-16 object-contain rounded-md" />
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">Tipo: <span className="font-normal capitalize">{banner.type === 'floating' ? `Flutuante (${banner.floatingVerticalPosition}, ${banner.floatingHorizontalPosition})` : `Fixo (${banner.position})`}</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dimensões: {banner.width} x {banner.height}</p>
                    {banner.buttonText && <p className="text-sm text-gray-500 dark:text-gray-400">Botão: "{banner.buttonText}" ({banner.buttonPosition})</p>}
                </div>
            </div>
            <button type="button" onClick={() => onRemove(banner.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"><TrashIcon /></button>
        </div>
    );
}

const ContentBannerItem: React.FC<{ banner: ContentBanner, onRemove: (id: string) => void, onToggle: (id: string) => void, categories: SiteCategory[] }> = ({ banner, onRemove, onToggle, categories }) => {
    const imageUrl = useObjectURL(banner.image);
    const categoryName = categories.find(c => c.id === banner.categoryId)?.name || 'N/A';
    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 rounded-md">
            <div className="flex items-center gap-4">
                {banner.type === 'image' && imageUrl && <img src={imageUrl} alt="Banner" className="w-16 h-10 object-contain rounded-md" />}
                {banner.type === 'html' && <div className="w-16 h-10 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center rounded-md font-mono text-lg">&lt;/&gt;</div>}
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">Ordem: {banner.order} <span className="font-normal capitalize text-gray-500 dark:text-gray-400">({banner.type} em {categoryName})</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dimensões: {banner.width} x {banner.height}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <button type="button" onClick={() => onToggle(banner.id)} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ${banner.enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                    <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${banner.enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
                </button>
                <button type="button" onClick={() => onRemove(banner.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"><TrashIcon /></button>
            </div>
        </div>
    );
}

const BannerManager: React.FC = () => {
    const { banners, setBanners, contentBanners, setContentBanners, siteConfig } = useSite();
    const [mode, setMode] = useState<'site' | 'content'>('site');
    
    // State for Site Banners
    const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [type, setType] = useState<'fixed' | 'floating'>('fixed');
    const [position, setPosition] = useState<'left' | 'right'>('left');
    const [floatingVerticalPosition, setFloatingVerticalPosition] = useState<'top' | 'bottom'>('top');
    const [floatingHorizontalPosition, setFloatingHorizontalPosition] = useState<'left' | 'center' | 'right'>('center');
    const [width, setWidth] = useState('200');
    const [height, setHeight] = useState('400');
    const [isAuto, setIsAuto] = useState(false);
    const [affiliateLink, setAffiliateLink] = useState('');
    const [buttonText, setButtonText] = useState('');
    const [buttonColor, setButtonColor] = useState('#4f46e5');
    const [buttonTextColor, setButtonTextColor] = useState('#ffffff');
    const [buttonPosition, setButtonPosition] = useState<ButtonPosition>('center');
    const [formKey, setFormKey] = useState(Date.now());

    // State for Content Banners
    const [cOrder, setCOrder] = useState(0);
    const [cType, setCType] = useState<'image' | 'html'>('image');
    const [cImageFile, setCImageFile] = useState<File | null>(null);
    const [cImagePreview, setCImagePreview] = useState<string|null>(null);
    const [cLink, setCLink] = useState('');
    const [cHtml, setCHtml] = useState('');
    const [cWidth, setCWidth] = useState('100%');
    const [cHeight, setCHeight] = useState('auto');
    const [cCategoryId, setCCategoryId] = useState(siteConfig.siteCategories.find(c => c.type === 'products')?.id || '');
    const [cFormKey, setCFormKey] = useState(Date.now());

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            if (cImagePreview) URL.revokeObjectURL(cImagePreview);
        }
    }, [imagePreview, cImagePreview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
     const handleCFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCImageFile(file);
            setCImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddBanner = (e: React.FormEvent) => {
        e.preventDefault();
        const finalImage = imageSource === 'url' ? imageUrl : imageFile;
        if (!finalImage) {
            alert('Por favor, selecione ou insira a URL de uma imagem.');
            return;
        }
        const newBanner: Banner = {
            id: new Date().toISOString(),
            image: finalImage,
            width: isAuto ? 'auto' : `${width}px`,
            height: isAuto ? 'auto' : `${height}px`,
            affiliateLink, buttonText, buttonColor, buttonTextColor, buttonPosition, type,
            position: type === 'fixed' ? position : undefined,
            floatingVerticalPosition: type === 'floating' ? floatingVerticalPosition : undefined,
            floatingHorizontalPosition: type === 'floating' ? floatingHorizontalPosition : undefined,
        };
        setBanners([...banners, newBanner]);
        setImageUrl(''); setImageFile(null); setImagePreview(null); setAffiliateLink(''); setButtonText(''); setFormKey(Date.now());
    };
    
    const handleAddContentBanner = (e: React.FormEvent) => {
        e.preventDefault();
        if (cType === 'image' && !cImageFile) {
            alert('Por favor, selecione uma imagem para o banner.');
            return;
        }
        if (cType === 'html' && !cHtml.trim()) {
            alert('Por favor, insira o conteúdo HTML/script para o anúncio.');
            return;
        }
        if (!cCategoryId) {
            alert('Por favor, selecione uma categoria para o banner.');
            return;
        }

        const newBanner: ContentBanner = {
            id: new Date().toISOString(),
            order: cOrder,
            enabled: true,
            type: cType,
            image: cType === 'image' ? cImageFile! : undefined,
            link: cType === 'image' ? cLink : undefined,
            htmlContent: cType === 'html' ? cHtml : undefined,
            width: cWidth,
            height: cHeight,
            categoryId: cCategoryId
        };
        setContentBanners([...contentBanners, newBanner]);
        setCOrder(cOrder + 1); setCLink(''); setCHtml(''); setCImageFile(null); setCImagePreview(null); setCFormKey(Date.now());
    };

    const handleRemoveBanner = (id: string) => setBanners(banners.filter(b => b.id !== id));
    const handleRemoveContentBanner = (id: string) => setContentBanners(contentBanners.filter(b => b.id !== id));
    const handleToggleContentBanner = (id: string) => setContentBanners(contentBanners.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));

    const buttonPositionOptions: { value: ButtonPosition, label: string }[] = [
        { value: 'center', label: 'Centro' }, { value: 'top-left', label: 'Topo Esquerda' }, { value: 'top-center', label: 'Topo Centro' },
        { value: 'top-right', label: 'Topo Direita' }, { value: 'bottom-left', label: 'Base Esquerda' }, { value: 'bottom-center', label: 'Base Centro' },
        { value: 'bottom-right', label: 'Base Direita' },
    ];
    
    const modeButtonClasses = (m: 'site' | 'content') => `px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === m ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`;

    return (
        <div>
            <div className="mb-4 flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button onClick={() => setMode('site')} className={modeButtonClasses('site')}>Banners Globais</button>
                <button onClick={() => setMode('content')} className={modeButtonClasses('content')}>Banners de Conteúdo</button>
            </div>
            {mode === 'site' && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Gerenciar Banners Globais (Fixos e Flutuantes)</h3>
                    <form key={formKey} onSubmit={handleAddBanner} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4 mb-6">
                        {/* Site Banner Form */}
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fonte da Imagem</label>
                            <div className="flex gap-4 text-gray-900 dark:text-gray-200"><label className="flex items-center"><input type="radio" value="upload" checked={imageSource === 'upload'} onChange={() => setImageSource('upload')} className="mr-1" /> Upload</label><label className="flex items-center"><input type="radio" value="url" checked={imageSource === 'url'} onChange={() => setImageSource('url')} className="mr-1" /> URL</label></div>
                        </div>
                        <div>
                            {imageSource === 'upload' ? (<><label htmlFor="banner-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload de Imagem</label><div className="mt-1 flex items-center gap-4"><span className="h-24 w-24 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">{imagePreview ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" /> : <UploadIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}</span><input id="banner-upload" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/></div></>) 
                            : (<div><label htmlFor="banner-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL da Imagem</label><input id="banner-url" type="url" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>)}
                        </div>
                        <div className="text-gray-900 dark:text-gray-200"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de banner</label><div className="mt-2 flex gap-4"><label className="flex items-center"><input type="radio" value="fixed" checked={type === 'fixed'} onChange={() => setType('fixed')} className="mr-1" /> Fixo (Laterais)</label><label className="flex items-center"><input type="radio" value="floating" checked={type === 'floating'} onChange={() => setType('floating')} className="mr-1"/> Flutuante</label></div></div>
                        {type === 'fixed' && (<div><label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Posição</label><select id="position" value={position} onChange={e => setPosition(e.target.value as 'left' | 'right')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"><option value="left">Esquerda</option><option value="right">Direita</option></select></div>)}
                        {type === 'floating' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label htmlFor="floating-vertical-position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Posição Vertical</label><select id="floating-vertical-position" value={floatingVerticalPosition} onChange={e => setFloatingVerticalPosition(e.target.value as 'top' | 'bottom')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"><option value="top">Topo</option><option value="bottom">Rodapé</option></select></div><div><label htmlFor="floating-horizontal-position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Posição Horizontal</label><select id="floating-horizontal-position" value={floatingHorizontalPosition} onChange={e => setFloatingHorizontalPosition(e.target.value as 'left' | 'center' | 'right')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></div></div>)}
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho do Banner</label><div className="mt-2 flex items-center"><input type="checkbox" id="auto-size" checked={isAuto} onChange={e => setIsAuto(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/><label htmlFor="auto-size" className="ml-2 text-sm text-gray-900 dark:text-gray-200">Largura e Altura automáticas (usa o tamanho da imagem)</label></div></div>
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isAuto ? 'opacity-50 pointer-events-none' : ''}`}><div><label htmlFor="width" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Largura (px)</label><input type="number" id="width" value={width} onChange={e => setWidth(e.target.value)} disabled={isAuto} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-200 dark:disabled:bg-gray-700" /></div><div><label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Altura (px)</label><input type="number" id="height" value={height} onChange={e => setHeight(e.target.value)} disabled={isAuto} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-200 dark:disabled:bg-gray-700" /></div></div>
                        <div><label htmlFor="banner-affiliate-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link de Afiliado (Opcional)</label><input type="url" id="banner-affiliate-link" value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="https://..." /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Botão (Opcional, requer Link de Afiliado)</label><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1"><input type="text" value={buttonText} onChange={e => setButtonText(e.target.value)} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Texto do Botão" /><select value={buttonPosition} onChange={e => setButtonPosition(e.target.value as ButtonPosition)} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">{buttonPositionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select><div className="flex items-center gap-2"><label htmlFor="banner-btn-color" className="text-sm text-gray-700 dark:text-gray-300">Fundo:</label><input type="color" id="banner-btn-color" value={buttonColor} onChange={e => setButtonColor(e.target.value)} className="h-8 w-12 rounded-md border-gray-300" /></div><div className="flex items-center gap-2"><label htmlFor="banner-btn-text-color" className="text-sm text-gray-700 dark:text-gray-300">Texto:</label><input type="color" id="banner-btn-text-color" value={buttonTextColor} onChange={e => setButtonTextColor(e.target.value)} className="h-8 w-12 rounded-md border-gray-300" /></div></div></div>
                        <div className="text-right"><button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"><PlusIcon /> Adicionar Banner</button></div>
                    </form>
                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Banners Atuais</h4>
                    <div className="space-y-2">{banners.map(banner => (<SiteBannerItem key={banner.id} banner={banner} onRemove={handleRemoveBanner} />))}{banners.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhum banner adicionado.</p>}</div>
                </div>
            )}
            {mode === 'content' && (
                 <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Gerenciar Banners de Conteúdo</h3>
                    <form key={cFormKey} onSubmit={handleAddContentBanner} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div><label htmlFor="corder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ordem</label><input type="number" id="corder" value={cOrder} onChange={e => setCOrder(Number(e.target.value))} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Define a posição do banner.</p></div>
                           <div><label htmlFor="ccategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label><select id="ccategory" value={cCategoryId} onChange={e => setCCategoryId(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"><option value="">Selecione...</option>{siteConfig.siteCategories.filter(c => c.type !== 'quiz').map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
                           <div className="text-gray-900 dark:text-gray-200"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label><div className="mt-2 flex gap-4"><label className="flex items-center"><input type="radio" value="image" checked={cType === 'image'} onChange={() => setCType('image')} className="mr-1" /> Imagem</label><label className="flex items-center"><input type="radio" value="html" checked={cType === 'html'} onChange={() => setCType('html')} className="mr-1"/> HTML/Anúncio</label></div></div>
                        </div>
                        {cType === 'image' && (<>
                            <div><label htmlFor="clink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link (Opcional)</label><input type="url" id="clink" value={cLink} onChange={e => setCLink(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="https://..." /></div>
                            <div><label htmlFor="cimage-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload de Imagem</label><div className="mt-1 flex items-center gap-4"><span className="h-24 w-48 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">{cImagePreview ? <img src={cImagePreview} alt="Preview" className="h-full w-full object-cover" /> : <UploadIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}</span><input id="cimage-upload" type="file" accept="image/*" onChange={handleCFileChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/></div></div>
                        </>)}
                        {cType === 'html' && (<div><label htmlFor="chtml" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo HTML / Script</label><textarea id="chtml" rows={4} value={cHtml} onChange={e => setCHtml(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md font-mono" placeholder="<ins class='...'>"></textarea><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cole seu código de anúncio (ex: Google AdSense) aqui.</p></div>)}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><label htmlFor="cwidth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Largura</label><input type="text" id="cwidth" value={cWidth} onChange={e => setCWidth(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Ex: 100%, 800px"/></div>
                           <div><label htmlFor="cheight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Altura</label><input type="text" id="cheight" value={cHeight} onChange={e => setCHeight(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Ex: auto, 250px"/></div>
                        </div>
                        <div className="text-right"><button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"><PlusIcon /> Adicionar Banner</button></div>
                    </form>
                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Banners Atuais</h4>
                    <div className="space-y-2">{contentBanners.sort((a,b)=>a.order-b.order).map(banner => (<ContentBannerItem key={banner.id} banner={banner} onRemove={handleRemoveContentBanner} onToggle={handleToggleContentBanner} categories={siteConfig.siteCategories} />))}{contentBanners.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhum banner de conteúdo adicionado.</p>}</div>
                </div>
            )}
        </div>
    );
};

export default BannerManager;
