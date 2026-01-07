
import React, { useState, useEffect } from 'react';
import type { Product, ProductButton, ProductVariant, ProductVariantOption } from '../../types';
import { useSite } from '../../context/SiteContext';
import { UploadIcon, TrashIcon, PlusIcon, StarIcon, XIcon, PencilIcon } from '../Icons';

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

const StarRatingInput: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
            <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1 rounded-full text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
                <StarIcon filled={star <= rating} className="h-6 w-6"/>
            </button>
        ))}
    </div>
);


const ProductItem: React.FC<{product: Product, onRemove: (id: string) => void, onToggle: (id: string) => void, onEdit: (product: Product) => void}> = ({ product, onRemove, onToggle, onEdit }) => {
    const imageUrl = useObjectURL(product.image);
    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 rounded-md gap-2">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <img src={imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        {product.stock !== undefined ? (
                            <>
                                <span>Estoque: {product.stock}</span>
                                {product.stock <= 5 && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${product.stock === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                        {product.stock === 0 ? 'ESGOTADO' : 'ESTOQUE BAIXO'}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span>Estoque não gerenciado</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{product.description}</p>
                    <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline truncate block">{product.link || 'Sem link direto'}</a>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button type="button" onClick={() => onEdit(product)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30" title="Editar">
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onToggle(product.id)}
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ${product.enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                >
                    <span className="sr-only">Ativar/Desativar</span>
                    <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${product.enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
                </button>
                <button type="button" onClick={() => onRemove(product.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"><TrashIcon /></button>
            </div>
        </div>
    );
};

const ProductManager: React.FC = () => {
    const { products, setProducts } = useSite();
    
    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | undefined>();
    const [listPrice, setListPrice] = useState<number | undefined>();
    const [priceColor, setPriceColor] = useState('#4f46e5');
    const [listPriceColor, setListPriceColor] = useState('#9ca3af');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [link, setLink] = useState('');
    const [rating, setRating] = useState(0);
    const [couponText, setCouponText] = useState('');
    const [stock, setStock] = useState<number | undefined>();
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [weight, setWeight] = useState<number | undefined>();
    const [width, setWidth] = useState<number | undefined>();
    const [height, setHeight] = useState<number | undefined>();
    const [length, setLength] = useState<number | undefined>();
    const [showDiscountPercentage, setShowDiscountPercentage] = useState(true);
    const [visibility, setVisibility] = useState<Product['visibility']>({ type: 'all' });
    const [cepRanges, setCepRanges] = useState<{ start: string; end: string }[]>([{ start: '', end: '' }]);
    
    // Individual Shipping Rule State
    const [shippingRuleEnabled, setShippingRuleEnabled] = useState(false);
    const [shippingRuleType, setShippingRuleType] = useState<'free' | 'fixed'>('free');
    const [shippingRuleMinQty, setShippingRuleMinQty] = useState(0);
    const [shippingRuleMinTotal, setShippingRuleMinTotal] = useState(0);
    const [shippingRuleFixedCost, setShippingRuleFixedCost] = useState(0);

    // Installment options
    const [maxInstallments, setMaxInstallments] = useState<number | undefined>();
    const [interestFreeInstallments, setInterestFreeInstallments] = useState<number | undefined>();
    const [installmentInterest, setInstallmentInterest] = useState<number | undefined>();
    const [installmentEnabled, setInstallmentEnabled] = useState(false);

    const [buttons, setButtons] = useState<ProductButton[]>([]);
    const [btnText, setBtnText] = useState('');
    const [btnLink, setBtnLink] = useState('');
    const [btnColor, setBtnColor] = useState('#10b981');
    const [btnTextColor, setBtnTextColor] = useState('#ffffff');
    const [btnStyle, setBtnStyle] = useState<'solid' | 'outline'>('solid');
    
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        }
    }, [imagePreview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddButtonToList = () => {
        if (!btnText || !btnLink) {
            alert('Texto e link do botão são obrigatórios.');
            return;
        }
        const newButton: ProductButton = {
            id: new Date().toISOString() + Math.random(),
            text: btnText,
            link: btnLink,
            color: btnColor,
            textColor: btnTextColor,
            style: btnStyle,
        };
        setButtons(prev => [...prev, newButton]);
        setBtnText('');
        setBtnLink('');
    };
    
    const handleAddVariant = () => {
        setVariants(prev => [...prev, { id: Date.now().toString(), name: '', options: [] }]);
    };

    const handleVariantChange = (variantIndex: number, field: 'name', value: string) => {
        setVariants(prev => {
            const newVariants = [...prev];
            newVariants[variantIndex][field] = value;
            return newVariants;
        });
    };

    const handleRemoveVariant = (variantIndex: number) => {
        setVariants(prev => prev.filter((_, i) => i !== variantIndex));
    };

    const handleAddOption = (variantIndex: number) => {
        setVariants(prev => {
            const newVariants = [...prev];
            newVariants[variantIndex].options.push({ id: Date.now().toString(), value: '' });
            return newVariants;
        });
    };

    const handleOptionChange = (variantIndex: number, optionIndex: number, field: keyof Omit<ProductVariantOption, 'id'>, value: string | number | File | undefined) => {
        setVariants(prev => {
            const newVariants = [...prev];
            (newVariants[variantIndex].options[optionIndex] as any)[field] = value;
            return newVariants;
        });
    };

    const handleRemoveOption = (variantIndex: number, optionIndex: number) => {
        setVariants(prev => {
            const newVariants = [...prev];
            newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex);
            return newVariants;
        });
    };

    const handleAddCepRange = () => {
        setCepRanges(prev => [...prev, { start: '', end: '' }]);
    };
    const handleCepRangeChange = (index: number, field: 'start' | 'end', value: string) => {
        const newRanges = [...cepRanges];
        newRanges[index][field] = value;
        setCepRanges(newRanges);
        setVisibility(prev => ({ ...prev, cepRanges: newRanges.filter(r => r.start && r.end) }));
    };
    const handleRemoveCepRange = (index: number) => {
        setCepRanges(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) {
            alert('Por favor, adicione uma imagem para o produto.');
            return;
        }

        const productData: Product = { 
            id: editingId || new Date().toISOString(), 
            name, description, price, listPrice, priceColor, listPriceColor, 
            image: imageFile,
            buttons,
            link,
            enabled: true,
            rating: rating > 0 ? rating : undefined,
            couponText: couponText || undefined,
            variants: variants.length > 0 ? variants : undefined,
            stock,
            weight,
            width,
            height,
            length,
            showDiscountPercentage,
            shippingRule: {
                enabled: shippingRuleEnabled,
                type: shippingRuleType,
                minQuantity: shippingRuleMinQty,
                minTotal: shippingRuleMinTotal,
                fixedCost: shippingRuleType === 'fixed' ? shippingRuleFixedCost : undefined
            },
            visibility: visibility?.type !== 'all' ? visibility : undefined,
            installmentOptions: installmentEnabled ? {
                enabled: true,
                maxInstallments,
                interestFreeInstallments,
                interestRate: installmentInterest
            } : undefined
        };

        if (editingId) {
            setProducts(prev => prev.map(p => p.id === editingId ? productData : p));
        } else {
            setProducts(prev => [...prev, productData]);
        }

        resetForm();
    };

    const resetForm = () => {
        setEditingId(null);
        setName(''); setDescription(''); setPrice(undefined); setListPrice(undefined);
        setLink(''); setImageFile(null); setImagePreview(null); setRating(0);
        setCouponText(''); setStock(undefined); setButtons([]); setVariants([]);
        setBtnText(''); setBtnLink(''); setBtnColor('#10b981'); setBtnTextColor('#ffffff');
        setBtnStyle('solid'); setWeight(undefined); setWidth(undefined); setHeight(undefined);
        setLength(undefined); setShowDiscountPercentage(true);
        // Reset Shipping Rule
        setShippingRuleEnabled(false); setShippingRuleType('free'); setShippingRuleMinQty(0); setShippingRuleMinTotal(0); setShippingRuleFixedCost(0);
        
        setVisibility({ type: 'all' }); setCepRanges([{ start: '', end: '' }]);
        setMaxInstallments(undefined); setInterestFreeInstallments(undefined);
        setInstallmentEnabled(false); setInstallmentInterest(undefined);

        const fileInput = document.getElementById('product-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };
    
    const handleEditProduct = (product: Product) => {
        setEditingId(product.id);
        setName(product.name);
        setDescription(product.description || '');
        setPrice(product.price);
        setListPrice(product.listPrice);
        setPriceColor(product.priceColor || '#4f46e5');
        setListPriceColor(product.listPriceColor || '#9ca3af');
        setLink(product.link || '');
        setRating(product.rating || 0);
        setCouponText(product.couponText || '');
        setStock(product.stock);
        setVariants(product.variants || []);
        setWeight(product.weight);
        setWidth(product.width);
        setHeight(product.height);
        setLength(product.length);
        setShowDiscountPercentage(product.showDiscountPercentage ?? true);
        
        // Load Shipping Rule
        if (product.shippingRule) {
            setShippingRuleEnabled(product.shippingRule.enabled);
            setShippingRuleType(product.shippingRule.type);
            setShippingRuleMinQty(product.shippingRule.minQuantity);
            setShippingRuleMinTotal(product.shippingRule.minTotal || 0);
            setShippingRuleFixedCost(product.shippingRule.fixedCost || 0);
        } else {
            setShippingRuleEnabled(false);
            setShippingRuleType('free');
            setShippingRuleMinQty(0);
            setShippingRuleMinTotal(0);
            setShippingRuleFixedCost(0);
        }

        setVisibility(product.visibility || { type: 'all' });
        setCepRanges(product.visibility?.cepRanges || [{ start: '', end: '' }]);
        setButtons(product.buttons || []);
        
        if (product.installmentOptions) {
            setInstallmentEnabled(true);
            setMaxInstallments(product.installmentOptions.maxInstallments);
            setInterestFreeInstallments(product.installmentOptions.interestFreeInstallments);
            setInstallmentInterest(product.installmentOptions.interestRate);
        } else {
            setInstallmentEnabled(false);
            setMaxInstallments(undefined);
            setInterestFreeInstallments(undefined);
            setInstallmentInterest(undefined);
        }

        // Handle Image
        setImageFile(product.image);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        // We create a blob URL for preview if it's a File, otherwise if it's a string (legacy), we might need handling, but types say File
        if (product.image instanceof File) {
            setImagePreview(URL.createObjectURL(product.image));
        } else {
            // fallback if somehow a string got in or for type compatibility
            setImagePreview(product.image as unknown as string);
        }
        
        // Scroll to top to see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleRemoveProduct = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este produto?')) {
            setProducts(products.filter(p => p.id !== id));
            if (editingId === id) resetForm();
        }
    };

    const handleToggleProduct = (id: string) => {
        setProducts(products.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    };

    return (
        <div>
             <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
                 {editingId ? 'Editar Produto' : 'Gerenciar Produtos'}
             </h3>
             
             <form onSubmit={handleSaveProduct} className={`bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border ${editingId ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'dark:border-gray-700'} space-y-4 mb-6`}>
                {editingId && (
                    <div className="flex justify-between items-center mb-2 pb-2 border-b dark:border-gray-700">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Editando: {name}</span>
                        <button type="button" onClick={resetForm} className="text-xs text-red-500 hover:underline">Cancelar Edição</button>
                    </div>
                )}
                
                <div>
                    <label htmlFor="prod-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Produto</label>
                    <input type="text" id="prod-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label htmlFor="prod-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição do Produto</label>
                    <textarea id="prod-desc" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="prod-list-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço De (R$) - Opcional</label>
                        <div className="flex items-center gap-2">
                             <input type="number" step="0.01" id="prod-list-price" value={listPrice || ''} onChange={e => setListPrice(e.target.value ? Number(e.target.value) : undefined)} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                             <input type="color" value={listPriceColor} onChange={e => setListPriceColor(e.target.value)} className="h-9 w-12 rounded-md border-gray-300"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="prod-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço Por (R$) - Opcional</label>
                        <div className="flex items-center gap-2">
                            <input type="number" step="0.01" id="prod-price" value={price || ''} onChange={e => setPrice(e.target.value ? Number(e.target.value) : undefined)} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            <input type="color" value={priceColor} onChange={e => setPriceColor(e.target.value)} className="h-9 w-12 rounded-md border-gray-300"/>
                        </div>
                    </div>
                </div>
                 <div className="pt-2">
                    <label className="flex items-center text-gray-700 dark:text-gray-300">
                        <input type="checkbox" checked={showDiscountPercentage} onChange={e => setShowDiscountPercentage(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" /> 
                        <span className="ml-2 text-sm">Mostrar porcentagem de desconto no card do produto</span>
                    </label>
                </div>
                 
                 <div className="border-t dark:border-gray-700 pt-4">
                    <div className="flex items-center mb-3">
                        <input type="checkbox" id="prod-installment-enable" checked={installmentEnabled} onChange={e => setInstallmentEnabled(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" />
                        <label htmlFor="prod-installment-enable" className="ml-2 text-md font-semibold text-gray-600 dark:text-gray-300">Configuração de Parcelamento (Opcional)</label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Se habilitado e preenchido, substitui a configuração global da loja para este produto.</p>
                    
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${!installmentEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div>
                            <label htmlFor="prod-max-installments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Máximo de Parcelas</label>
                            <input type="number" id="prod-max-installments" value={maxInstallments || ''} onChange={e => setMaxInstallments(e.target.value ? Number(e.target.value) : undefined)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Ex: 12" />
                        </div>
                        <div>
                            <label htmlFor="prod-interest-free" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sem Juros até (Parcelas)</label>
                            <input type="number" id="prod-interest-free" value={interestFreeInstallments || ''} onChange={e => setInterestFreeInstallments(e.target.value ? Number(e.target.value) : undefined)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Ex: 3" />
                        </div>
                        <div>
                            <label htmlFor="prod-interest-rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Taxa de Juros (%)</label>
                            <input type="number" step="0.01" id="prod-interest-rate" value={installmentInterest || ''} onChange={e => setInstallmentInterest(e.target.value ? Number(e.target.value) : undefined)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Ex: 1.99" />
                        </div>
                    </div>
                </div>

                 <div className="border-t dark:border-gray-700 pt-4">
                    <div className="flex items-center mb-3">
                        <input type="checkbox" id="prod-shipping-enable" checked={shippingRuleEnabled} onChange={e => setShippingRuleEnabled(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" />
                        <label htmlFor="prod-shipping-enable" className="ml-2 text-md font-semibold text-gray-600 dark:text-gray-300">Regra de Frete Individual (Promoção)</label>
                    </div>
                    
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${!shippingRuleEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Frete</label>
                            <select value={shippingRuleType} onChange={e => setShippingRuleType(e.target.value as 'free' | 'fixed')} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                <option value="free">Frete Grátis</option>
                                <option value="fixed">Frete Fixo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mín. Quantidade</label>
                            <input type="number" value={shippingRuleMinQty} onChange={e => setShippingRuleMinQty(Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mín. Valor Total (R$)</label>
                            <input type="number" value={shippingRuleMinTotal} onChange={e => setShippingRuleMinTotal(Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        {shippingRuleType === 'fixed' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custo Fixo (R$)</label>
                                <input type="number" value={shippingRuleFixedCost} onChange={e => setShippingRuleFixedCost(Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                        )}
                    </div>
                </div>

                 <div>
                    <label htmlFor="prod-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estoque (Opcional)</label>
                    <input type="number" id="prod-stock" value={stock || ''} onChange={e => setStock(e.target.value ? Number(e.target.value) : undefined)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Deixe em branco para não gerenciar o estoque deste item.</p>
                </div>
                <div className="border-t dark:border-gray-700 pt-4">
                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Dimensões para Frete (Opcional)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="prod-weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso (kg)</label>
                            <input type="number" step="0.001" id="prod-weight" placeholder="ex: 0.3" value={weight || ''} onChange={e => setWeight(e.target.value ? Number(e.target.value) : undefined)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="prod-length" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comprimento (cm)</label>
                            <input type="number" step="1" id="prod-length" placeholder="ex: 16" value={length || ''} onChange={e => setLength(e.target.value ? Number(e.target.value) : undefined)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="prod-width" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Largura (cm)</label>
                            <input type="number" step="1" id="prod-width" placeholder="ex: 11" value={width || ''} onChange={e => setWidth(e.target.value ? Number(e.target.value) : undefined)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="prod-height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Altura (cm)</label>
                            <input type="number" step="1" id="prod-height" placeholder="ex: 2" value={height || ''} onChange={e => setHeight(e.target.value ? Number(e.target.value) : undefined)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avaliação (Opcional)</label>
                    <StarRatingInput rating={rating} setRating={setRating} />
                </div>
                <div>
                    <label htmlFor="prod-coupon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Texto do Cupom (ex: 10% OFF)</label>
                    <input type="text" id="prod-coupon" value={couponText} onChange={e => setCouponText(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label htmlFor="prod-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link do Produto (Opcional)</label>
                    <input type="url" id="prod-link" value={link} onChange={e => setLink(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="https://..." />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Se preenchido e não houver botões, o card inteiro do produto se tornará clicável.</p>
                </div>
                <div>
                    <label htmlFor="product-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imagem Principal do Produto</label>
                    <div className="mt-1 flex items-center gap-4">
                         <span className="h-24 w-24 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
                            {imagePreview ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" /> : <UploadIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                        </span>
                        <input id="product-upload" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                    </div>
                </div>

                 <div className="border-t dark:border-gray-700 pt-4">
                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Opções Variáveis (ex: Tamanho, Cor)</h4>
                    <div className="space-y-3">
                        {variants.map((variant, vIndex) => (
                            <div key={variant.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
                                <div className="flex justify-between items-center mb-2">
                                    <input 
                                        type="text" 
                                        placeholder="Nome da Variação (ex: Cor)" 
                                        value={variant.name}
                                        onChange={e => handleVariantChange(vIndex, 'name', e.target.value)}
                                        className="font-medium text-gray-700 dark:text-white border-b-2 border-transparent focus:border-indigo-500 focus:outline-none w-full bg-transparent placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                    <button type="button" onClick={() => handleRemoveVariant(vIndex)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                                <div className="space-y-2 pl-4 border-l-2 dark:border-gray-600">
                                    {variant.options.map((option, oIndex) => (
                                        <div key={option.id} className="bg-white dark:bg-gray-800 p-2 rounded-md border dark:border-gray-600 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
                                            <input type="text" placeholder="Valor (ex: Azul)" value={option.value} onChange={e => handleOptionChange(vIndex, oIndex, 'value', e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                                            <input type="number" placeholder="+ Preço (ex: 10)" value={option.priceModifier || ''} onChange={e => handleOptionChange(vIndex, oIndex, 'priceModifier', Number(e.target.value) || undefined)} className="w-full text-sm border-gray-300 rounded-md" />
                                            <input type="number" placeholder="Peso (g)" value={option.weight || ''} onChange={e => handleOptionChange(vIndex, oIndex, 'weight', Number(e.target.value) || undefined)} className="w-full text-sm border-gray-300 rounded-md" />
                                            <div className="flex items-center gap-2">
                                                <input type="file" id={`variant-img-${vIndex}-${oIndex}`} onChange={e => handleOptionChange(vIndex, oIndex, 'image', e.target.files?.[0])} className="text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70 w-full" />
                                                <button type="button" onClick={() => handleRemoveOption(vIndex, oIndex)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"><XIcon className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => handleAddOption(vIndex)} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">+ Adicionar Opção</button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddVariant} className="inline-flex items-center px-3 py-1.5 border border-dashed text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <PlusIcon className="h-4 w-4 mr-1" /> Adicionar Variação
                        </button>
                    </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-4">
                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Visibilidade do Produto</h4>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Visibilidade</label>
                            <select value={visibility?.type || 'all'} onChange={e => setVisibility({ type: e.target.value as any })} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                <option value="all">Todos</option>
                                <option value="city">Por Cidade</option>
                                <option value="cep_range">Por Faixa de CEP</option>
                            </select>
                        </div>
                        {visibility?.type === 'city' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cidades (separadas por vírgula)</label>
                                <input type="text" value={visibility.cities || ''} onChange={e => setVisibility(prev => ({ ...prev, cities: e.target.value }))} placeholder="Ex: Santa Maria, Brasília" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                        )}
                        {visibility?.type === 'cep_range' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Faixas de CEP</label>
                                {cepRanges.map((range, index) => (
                                    <div key={index} className="flex items-center gap-2 mt-1">
                                        <input type="text" placeholder="CEP Início" value={range.start} onChange={e => handleCepRangeChange(index, 'start', e.target.value)} className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                        <span className="text-gray-700 dark:text-gray-300">-</span>
                                        <input type="text" placeholder="CEP Fim" value={range.end} onChange={e => handleCepRangeChange(index, 'end', e.target.value)} className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                        <button type="button" onClick={() => handleRemoveCepRange(index)} className="text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddCepRange} className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">+ Adicionar faixa</button>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2 border-t dark:border-gray-700 pt-4">Botões do Produto (para produtos sem variações)</h4>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg space-y-3">
                        <div className="space-y-2 mb-4">
                            {buttons.map(btn => (
                                <div key={btn.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border dark:border-gray-600 rounded-md text-sm">
                                    <div className="flex items-center gap-2">
                                        <div style={{width: 16, height: 16, borderRadius: '50%', backgroundColor: btn.style === 'solid' ? btn.color : 'transparent', border: `2px solid ${btn.color || '#000'}`}}></div>
                                        <span className="font-medium text-gray-900 dark:text-white">{btn.text}</span>
                                        <span className="text-gray-500 dark:text-gray-400 truncate">({btn.link})</span>
                                    </div>
                                    <button type="button" onClick={() => setButtons(prev => prev.filter(b => b.id !== btn.id))} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            ))}
                            {buttons.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Nenhum botão adicionado.</p>}
                        </div>

                        <div className="border-t dark:border-gray-600 pt-3 space-y-3">
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Adicionar novo botão</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input type="text" placeholder="Texto do Botão" value={btnText} onChange={e => setBtnText(e.target.value)} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                <input type="url" placeholder="Link do Botão" value={btnLink} onChange={e => setBtnLink(e.target.value)} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                 <select value={btnStyle} onChange={e => setBtnStyle(e.target.value as any)} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                     <option value="solid">Sólido</option>
                                     <option value="outline">Contorno</option>
                                 </select>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-700 dark:text-gray-300">Cor:</label>
                                    <input type="color" value={btnColor} onChange={e => setBtnColor(e.target.value)} className="h-9 w-12 rounded-md border-gray-300" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-700 dark:text-gray-300">Texto:</label>
                                    <input type="color" value={btnTextColor} onChange={e => setBtnTextColor(e.target.value)} className="h-9 w-12 rounded-md border-gray-300" />
                                </div>
                            </div>
                            <div className="text-right">
                                <button type="button" onClick={handleAddButtonToList} className="text-sm bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600">Adicionar Botão</button>
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="flex justify-end gap-3">
                    {editingId && (
                        <button 
                            type="button" 
                            onClick={resetForm} 
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm"
                        >
                            Cancelar
                        </button>
                    )}
                    <button 
                        type="submit" 
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                        {editingId ? <><PencilIcon className="h-4 w-4 mr-1" /> Atualizar Produto</> : <><PlusIcon className="h-4 w-4 mr-1" /> Adicionar Produto</>}
                    </button>
                </div>
            </form>
             <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Produtos Atuais</h4>
             <div className="space-y-2">
                {products.map(product => (
                    <ProductItem key={product.id} product={product} onRemove={handleRemoveProduct} onToggle={handleToggleProduct} onEdit={handleEditProduct} />
                ))}
                 {products.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhum produto adicionado.</p>}
             </div>
        </div>
    );
};

export default ProductManager;
