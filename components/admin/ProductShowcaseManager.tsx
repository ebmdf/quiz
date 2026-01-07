


import React, { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import type { ProductShowcase, Product } from '../../types';
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, PencilIcon, XIcon, UploadIcon } from '../Icons';

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

const ShowcaseItem: React.FC<{
    showcase: ProductShowcase;
    allProducts: Product[];
    onUpdate: (showcase: ProductShowcase) => void;
    onDelete: () => void;
    onMove: (direction: 'up' | 'down') => void;
    isFirst: boolean;
    isLast: boolean;
}> = ({ showcase, allProducts, onUpdate, onDelete, onMove, isFirst, isLast }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(showcase.title);
    const [productIds, setProductIds] = useState(showcase.productIds);
    const [displayLimit, setDisplayLimit] = useState(showcase.displayLimit);
    const [priceSize, setPriceSize] = useState(showcase.priceSize || 'medium');
    const [customButtonLabel, setCustomButtonLabel] = useState(showcase.customButtonLabel || '');
    const [backgroundColor, setBackgroundColor] = useState(showcase.backgroundColor || '#f9fafb');
    const [titleColor, setTitleColor] = useState(showcase.titleColor || '#4f46e5');
    const [iconFile, setIconFile] = useState<File | string | undefined>(showcase.icon);
    
    // New States for Rating and Line
    const [showRating, setShowRating] = useState(showcase.showRating || false);
    const [showLine, setShowLine] = useState(showcase.showLine || false);
    const [lineColor, setLineColor] = useState(showcase.lineColor || '#4f46e5');
    const [lineThickness, setLineThickness] = useState(showcase.lineThickness || 2);
    const [linePosition, setLinePosition] = useState<'top' | 'bottom'>(showcase.linePosition || 'bottom');

    const iconPreview = useObjectURL(iconFile);

    const handleProductToggle = (productId: string) => {
        setProductIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };
    
    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIconFile(e.target.files[0]);
        }
    };

    const handleSave = () => {
        onUpdate({ 
            ...showcase, 
            title, 
            productIds, 
            displayLimit, 
            priceSize,
            customButtonLabel,
            backgroundColor, 
            titleColor, 
            icon: iconFile,
            showRating,
            showLine,
            lineColor,
            lineThickness,
            linePosition
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTitle(showcase.title);
        setProductIds(showcase.productIds);
        setDisplayLimit(showcase.displayLimit);
        setPriceSize(showcase.priceSize || 'medium');
        setCustomButtonLabel(showcase.customButtonLabel || '');
        setBackgroundColor(showcase.backgroundColor || '#f9fafb');
        setTitleColor(showcase.titleColor || '#4f46e5');
        setIconFile(showcase.icon);
        setShowRating(showcase.showRating || false);
        setShowLine(showcase.showLine || false);
        setLineColor(showcase.lineColor || '#4f46e5');
        setLineThickness(showcase.lineThickness || 2);
        setLinePosition(showcase.linePosition || 'bottom');
        setIsEditing(false);
    };
    
    const displayIconUrl = useObjectURL(showcase.icon);


    if (isEditing) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 border dark:border-gray-700 rounded-lg shadow-md space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full text-lg font-semibold text-gray-800 dark:text-white border-b-2 border-indigo-200 focus:border-indigo-500 focus:outline-none bg-transparent"
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor de Fundo</label>
                        <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor do Título</label>
                        <input type="color" value={titleColor} onChange={e => setTitleColor(e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" />
                    </div>
                </div>
                 <div>
                    <label htmlFor={`icon-upload-${showcase.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ícone da Vitrine (Opcional)</label>
                    <div className="mt-1 flex items-center gap-4">
                        <span className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
                            {iconPreview ? <img src={iconPreview} alt="Preview" className="h-full w-full object-contain" /> : <PlusIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                        </span>
                        <input id={`icon-upload-${showcase.id}`} type="file" accept="image/*" onChange={handleIconUpload} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho da Fonte do Preço</label>
                        <select 
                            value={priceSize} 
                            onChange={e => setPriceSize(e.target.value as any)} 
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        >
                            <option value="small">Pequeno</option>
                            <option value="medium">Médio (Padrão)</option>
                            <option value="large">Grande</option>
                            <option value="xl">Muito Grande</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Botão "Ver Preço"</label>
                        <input 
                            type="text" 
                            value={customButtonLabel} 
                            onChange={e => setCustomButtonLabel(e.target.value)} 
                            placeholder="Ex: Ver Oferta"
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Deixe em branco para usar o padrão da loja.</p>
                    </div>
                </div>

                {/* NEW: Rating Option */}
                <div className="border-t dark:border-gray-700 pt-4">
                    <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            id={`showRating-${showcase.id}`} 
                            checked={showRating} 
                            onChange={e => setShowRating(e.target.checked)} 
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor={`showRating-${showcase.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            Mostrar Avaliações (Estrelas) nos Produtos
                        </label>
                    </div>
                </div>

                {/* NEW: Decorative Line Options */}
                <div className="border-t dark:border-gray-700 pt-4">
                    <div className="flex items-center mb-3">
                        <input 
                            type="checkbox" 
                            id={`showLine-${showcase.id}`} 
                            checked={showLine} 
                            onChange={e => setShowLine(e.target.checked)} 
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor={`showLine-${showcase.id}`} className="ml-2 block text-sm font-medium text-gray-900 dark:text-white">
                            Adicionar Linha Decorativa no Título
                        </label>
                    </div>
                    {showLine && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Cor da Linha</label>
                                <input type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} className="mt-1 block w-full h-8 rounded-md border-gray-300 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Espessura (px)</label>
                                <input 
                                    type="number" 
                                    min="1" max="10"
                                    value={lineThickness} 
                                    onChange={e => setLineThickness(Number(e.target.value))} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Posição</label>
                                <select 
                                    value={linePosition} 
                                    onChange={e => setLinePosition(e.target.value as 'top' | 'bottom')} 
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="top">Em Cima do Título</option>
                                    <option value="bottom">Abaixo do Título</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                 <div>
                    <label htmlFor={`limit-${showcase.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Limite de Produtos Exibidos (Amostra)
                    </label>
                    <input
                        type="number"
                        id={`limit-${showcase.id}`}
                        value={displayLimit || ''}
                        onChange={e => setDisplayLimit(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        placeholder="Ex: 4 (deixa em branco para mostrar todos)"
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Defina quantos produtos aparecerão inicialmente. Útil para criar amostras de categorias.
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Produtos na Vitrine ({productIds.length} selecionados)</label>
                    <div className="max-h-60 overflow-y-auto border dark:border-gray-600 p-2 rounded-md bg-gray-50 dark:bg-gray-700 space-y-1">
                        {allProducts.map(product => (
                            <label key={product.id} className="flex items-center gap-2 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={productIds.includes(product.id)}
                                    onChange={() => handleProductToggle(product.id)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-200">{product.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
               
                <div className="flex justify-end gap-2">
                    <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">Salvar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 border dark:border-gray-700 rounded-md shadow-sm gap-4">
            <div className="flex-1 min-w-0 flex items-center gap-3">
                {displayIconUrl ? (
                    <img src={displayIconUrl} alt="ícone" className="w-8 h-8 object-contain flex-shrink-0" />
                ) : (
                    <div className="flex items-center gap-1 flex-shrink-0" title="Cor de fundo e cor do título">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: showcase.backgroundColor || '#f9fafb' }}></div>
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: showcase.titleColor || '#4f46e5' }}></div>
                    </div>
                )}
                <div>
                    <p className="font-semibold text-gray-800 dark:text-white truncate">{showcase.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{showcase.productIds.length} produtos | Exibindo: {showcase.displayLimit || 'Todos'}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => onUpdate({ ...showcase, enabled: !showcase.enabled })} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ${showcase.enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                    <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${showcase.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <button onClick={() => onMove('up')} disabled={isFirst} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowUpIcon /></button>
                    <button onClick={() => onMove('down')} disabled={isLast} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowDownIcon /></button>
                </div>
                <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"><PencilIcon /></button>
                <button onClick={onDelete} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"><TrashIcon /></button>
            </div>
        </div>
    );
};

const ProductShowcaseManager: React.FC = () => {
    const { productShowcases, setProductShowcases, products } = useSite();
    const [newShowcaseTitle, setNewShowcaseTitle] = useState('');

    const handleAddShowcase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newShowcaseTitle.trim()) return;

        const newShowcase: ProductShowcase = {
            id: new Date().toISOString(),
            title: newShowcaseTitle.trim(),
            productIds: [],
            enabled: true,
            order: productShowcases.length,
        };
        setProductShowcases([...productShowcases, newShowcase]);
        setNewShowcaseTitle('');
    };

    const handleUpdateShowcase = (updatedShowcase: ProductShowcase) => {
        setProductShowcases(productShowcases.map(s => s.id === updatedShowcase.id ? updatedShowcase : s));
    };

    const handleDeleteShowcase = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover esta vitrine?')) {
            setProductShowcases(productShowcases.filter(s => s.id !== id));
        }
    };

    const handleMoveShowcase = (index: number, direction: 'up' | 'down') => {
        const showcases = [...productShowcases].sort((a, b) => a.order - b.order);
        const item = showcases[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= showcases.length) return;

        showcases[index] = showcases[swapIndex];
        showcases[swapIndex] = item;
        
        setProductShowcases(showcases.map((s, idx) => ({ ...s, order: idx })));
    };

    const sortedShowcases = [...productShowcases].sort((a,b) => a.order - b.order);

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Gerenciar Vitrines de Produtos</h3>
            <form onSubmit={handleAddShowcase} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4 mb-6">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Adicionar Nova Vitrine</h4>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newShowcaseTitle}
                        onChange={e => setNewShowcaseTitle(e.target.value)}
                        placeholder="Título da nova vitrine"
                        className="flex-grow block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <PlusIcon className="h-5 w-5 mr-1" /> Adicionar
                    </button>
                </div>
            </form>

            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Vitrines Atuais</h4>
            <div className="space-y-3">
                {sortedShowcases.map((showcase, index) => (
                    <ShowcaseItem
                        key={showcase.id}
                        showcase={showcase}
                        allProducts={products}
                        onUpdate={handleUpdateShowcase}
                        onDelete={() => handleDeleteShowcase(showcase.id)}
                        onMove={(dir) => handleMoveShowcase(index, dir)}
                        isFirst={index === 0}
                        isLast={index === sortedShowcases.length - 1}
                    />
                ))}
                {productShowcases.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma vitrine adicionada.</p>}
            </div>
        </div>
    );
};

export default ProductShowcaseManager;