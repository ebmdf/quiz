import React, { useState, useEffect } from 'react';
import type { CarouselConfig, CarouselImage, ButtonPosition } from '../../types';
import { UploadIcon, TrashIcon, PlusIcon } from '../Icons';
import { useSite } from '../../context/SiteContext';

const useObjectURL = (file?: File | Blob) => {
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);
    return url;
};

const CarouselImageItem: React.FC<{image: CarouselImage, onRemove: (id: string) => void}> = ({ image, onRemove }) => {
    const imageUrl = useObjectURL(image.image);
    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 rounded-md">
            <div className="flex items-center gap-4">
                <img src={imageUrl} alt="Carousel item" className="w-24 h-16 object-cover rounded-md" />
                <div>
                    <p className="text-sm text-indigo-500 dark:text-indigo-400 truncate">{image.link || 'Sem link'}</p>
                    {image.showButton && <span className="text-xs bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{image.buttonText} ({image.buttonPosition})</span>}
                </div>
            </div>
            <button onClick={() => onRemove(image.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"><TrashIcon /></button>
        </div>
    );
}

const CarouselManager: React.FC = () => {
    const { siteConfig, setSiteConfig } = useSite();
    const { carouselConfig } = siteConfig;

    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [newImageLink, setNewImageLink] = useState('');
    const [showButton, setShowButton] = useState(false);
    const [buttonText, setButtonText] = useState('');
    const [buttonColor, setButtonColor] = useState('#4f46e5');
    const [buttonTextColor, setButtonTextColor] = useState('#ffffff');
    const [buttonPosition, setButtonPosition] = useState<ButtonPosition>('center');
    const [formKey, setFormKey] = useState(Date.now());

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        }
    }, [imagePreview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const handleAddImage = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newImageFile) {
            alert('Por favor, selecione uma imagem.');
            return;
        }

        const newImage: CarouselImage = {
            id: new Date().toISOString() + Math.random(),
            image: newImageFile,
            link: newImageLink || undefined,
            showButton: showButton && !!newImageLink,
            buttonText: showButton ? buttonText : undefined,
            buttonColor: showButton ? buttonColor : undefined,
            buttonTextColor: showButton ? buttonTextColor : undefined,
            buttonPosition: showButton ? buttonPosition : undefined
        };
        
        setSiteConfig({...siteConfig, carouselConfig: {...carouselConfig, images: [...carouselConfig.images, newImage]}});
        
        setNewImageFile(null);
        setImagePreview(null);
        setNewImageLink('');
        setShowButton(false);
        setButtonText('');
        setFormKey(Date.now());
    };

    const handleRemoveImage = (id: string) => {
        const updatedImages = carouselConfig.images.filter(img => img.id !== id);
        setSiteConfig({...siteConfig, carouselConfig: {...carouselConfig, images: updatedImages}});
    }
    
    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;
        const finalValue = name === 'transitionSpeed' ? Number(value) : (isCheckbox ? checked : value);

        setSiteConfig({...siteConfig, carouselConfig: { ...carouselConfig, [name]: finalValue }});
    }

    const buttonPositionOptions: { value: ButtonPosition, label: string }[] = [
        { value: 'center', label: 'Centro' },
        { value: 'top-left', label: 'Topo Esquerda' },
        { value: 'top-center', label: 'Topo Centro' },
        { value: 'top-right', label: 'Topo Direita' },
        { value: 'bottom-left', label: 'Base Esquerda' },
        { value: 'bottom-center', label: 'Base Centro' },
        { value: 'bottom-right', label: 'Base Direita' },
    ];

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Gerenciar Carrossel</h3>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4 mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="width" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Largura (e.g., 100% ou 800px)</label>
                        <input type="text" name="width" id="width" value={carouselConfig.width} onChange={handleConfigChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Altura (e.g., 400px)</label>
                        <input type="text" name="height" id="height" value={carouselConfig.height} onChange={handleConfigChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="transitionSpeed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Intervalo do Autoplay (ms)</label>
                        <input type="number" name="transitionSpeed" id="transitionSpeed" value={carouselConfig.transitionSpeed} onChange={handleConfigChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="transitionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Transição</label>
                        <select name="transitionType" id="transitionType" value={carouselConfig.transitionType || 'fade'} onChange={handleConfigChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            <option value="fade">Esmaecer (Fade)</option>
                            <option value="slide">Deslizar (Slide)</option>
                            <option value="zoom">Zoom</option>
                        </select>
                    </div>
                    <div className="flex items-center pb-2">
                        <input type="checkbox" name="autoplay" id="autoplay" checked={carouselConfig.autoplay} onChange={handleConfigChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                        <label htmlFor="autoplay" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">Autoplay</label>
                    </div>
                </div>
            </div>

            <form key={formKey} onSubmit={handleAddImage} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4 mb-6">
                <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300">Adicionar Nova Imagem</h4>
                 <div>
                    <label htmlFor="carousel-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload de Imagem</label>
                     <div className="mt-1 flex items-center gap-4">
                        <span className="h-24 w-48 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
                            {imagePreview ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" /> : <UploadIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                        </span>
                        <input id="carousel-upload" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="carousel-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link (Opcional)</label>
                    <input type="url" id="carousel-link" value={newImageLink} onChange={e => setNewImageLink(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="https://..." />
                </div>
                <div>
                    <div className="flex items-center">
                        <input type="checkbox" id="show-button" checked={showButton} onChange={e => setShowButton(e.target.checked)} disabled={!newImageLink} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"/>
                        <label htmlFor="show-button" className={`ml-2 block text-sm ${!newImageLink ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-200'}`}>Ativar botão (requer link)</label>
                    </div>
                </div>
                {showButton && newImageLink && (
                    <div className="border-t dark:border-gray-700 pt-4 space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customizar Botão</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" value={buttonText} onChange={e => setButtonText(e.target.value)} className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="Texto do Botão" />
                            <select value={buttonPosition} onChange={e => setButtonPosition(e.target.value as ButtonPosition)} className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                                {buttonPositionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700 dark:text-gray-300">Fundo do Botão:</label>
                                <input type="color" value={buttonColor} onChange={e => setButtonColor(e.target.value)} className="h-9 w-12 rounded-md border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700 dark:text-gray-300">Texto do Botão:</label>
                                <input type="color" value={buttonTextColor} onChange={e => setButtonTextColor(e.target.value)} className="h-9 w-12 rounded-md border-gray-300 dark:border-gray-600" />
                            </div>
                        </div>
                    </div>
                )}
                 <div className="text-right">
                    <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"><PlusIcon /> Adicionar Imagem</button>
                </div>
            </form>

            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Imagens do Carrossel</h4>
             <div className="space-y-2">
                {carouselConfig.images.map(image => (
                    <CarouselImageItem key={image.id} image={image} onRemove={handleRemoveImage} />
                ))}
                 {carouselConfig.images.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma imagem adicionada ao carrossel.</p>}
             </div>
        </div>
    );
};

export default CarouselManager;