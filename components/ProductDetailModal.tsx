








import React, { useState, useEffect, useMemo } from 'react';
import type { Product, ProductVariant, ProductVariantOption, ShippingDetails, Coupon } from '../types';
import { useSite } from '../context/SiteContext';
import { XIcon, StarIcon, HeartIcon, MessengerIcon, FacebookIcon, PinterestIcon, XTwitterIcon, InstagramIcon, TikTokIcon } from './Icons';
import CommentsSection from './CommentsSection';

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

const StarRating: React.FC<{ rating: number, reviewCountText?: string }> = ({ rating, reviewCountText }) => (
    <div className="flex items-center gap-2">
        <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{rating.toFixed(1).replace('.', ',')}</span>
        <div className="flex">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="h-4 w-4 text-amber-400" filled={i < Math.floor(rating)} />
            ))}
        </div>
        {reviewCountText && <span className="text-sm text-gray-500 dark:text-gray-400 underline">{reviewCountText} Avaliações</span>}
    </div>
);

const CountdownTimer: React.FC<{ initialHours: number, initialMinutes: number, initialSeconds: number }> = ({ initialHours, initialMinutes, initialSeconds }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: initialHours || 0, minutes: initialMinutes || 0, seconds: initialSeconds || 0 });

    useEffect(() => {
        setTimeLeft({ hours: initialHours || 0, minutes: initialMinutes || 0, seconds: initialSeconds || 0 });
    }, [initialHours, initialMinutes, initialSeconds]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    seconds = 59;
                    minutes--;
                } else if (hours > 0) {
                    seconds = 59;
                    minutes = 59;
                    hours--;
                } else {
                    clearInterval(timer);
                    return { hours: 0, minutes: 0, seconds: 0 };
                }
                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const format = (num: number) => num.toString().padStart(2, '0');

    return (
        <div className="flex items-center gap-1 font-bold text-inherit opacity-90">
            <span>TERMINA EM</span>
            <span className="bg-black/20 px-2 py-1 rounded">{format(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-black/20 px-2 py-1 rounded">{format(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-black/20 px-2 py-1 rounded">{format(timeLeft.seconds)}</span>
        </div>
    );
};

const ShippingCalculator: React.FC<{ product: Product; quantity: number; totalPrice: number; selectedOptions: Record<string, string>; }> = ({ product, quantity, totalPrice, selectedOptions }) => {
    const { siteConfig, setShippingDetails, shippingDetails } = useSite();
    const { shippingConfig } = siteConfig.storeConfig;
    
    // Initialize CEP from global state if available
    const [cep, setCep] = useState(shippingDetails?.cep || '');
    const [options, setOptions] = useState<ShippingDetails[] | null>(null);
    const [selectedOption, setSelectedOption] = useState<ShippingDetails | null>(shippingDetails || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update local CEP when global shipping details change (e.g. after calculation)
    useEffect(() => {
        if (shippingDetails?.cep) {
            setCep(shippingDetails.cep);
            setSelectedOption(shippingDetails);
        }
    }, [shippingDetails]);

    // Debounce effect for automatic calculation
    useEffect(() => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) {
            setOptions(null);
            setError(null);
            // Do not reset global shipping details here to allow user to see previous calc if they are typing
            return;
        }

        // NOTE: Removida a verificação que impedia o recálculo se o CEP fosse o mesmo.
        // Isso é necessário porque se a quantidade ou o preço mudarem (gatilhos deste useEffect),
        // as regras de frete grátis/fixo podem mudar mesmo com o mesmo CEP.

        const handler = setTimeout(() => {
            handleCalculateShipping(cleanCep);
        }, 800); // 800ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [cep, product, quantity, totalPrice, selectedOptions]);


    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const maskedValue = value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);
        setCep(maskedValue);
    };

    const calculateCorreiosShipping = async (params: {
        cepDestino: string, peso: number, comprimento: number, altura: number, largura: number
    }) => {
        const { correiosConfig } = shippingConfig;
        if (!correiosConfig.enabled) {
            return [];
        }

        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network latency

        const { cepDestino } = params;
        const originCepPrefix = parseInt((correiosConfig.originCep || '0').replace(/\D/g, '').charAt(0), 10);
        const destCepPrefix = parseInt(cepDestino.charAt(0), 10);
        
        // Regiões dos Correios: 0-3 Sudeste, 4-5 Nordeste, 6 Norte, 7 Centro-Oeste, 8-9 Sul
        const regions = [2, 2, 2, 2, 3, 3, 4, 1, 0, 0]; // 0=Sul, 1=CO, 2=SE, 3=NE, 4=Norte
        const originRegion = regions[originCepPrefix];
        const destRegion = regions[destCepPrefix];
        const regionDiff = Math.abs(originRegion - destRegion);
        
        let distanceFactor;
        if (originCepPrefix === destCepPrefix) {
            distanceFactor = 1.0; // Mesmo estado/próximo
        } else if (regionDiff === 0) {
            distanceFactor = 1.2; // Mesma região
        } else if (regionDiff === 1) {
            distanceFactor = 1.5; // Região adjacente
        } else {
            distanceFactor = 1.8; // Região distante
        }

        const peso = params.peso || correiosConfig.defaultWeight;
        const comprimento = params.comprimento || correiosConfig.defaultLength;
        const altura = params.altura || correiosConfig.defaultHeight;
        const largura = params.largura || correiosConfig.defaultWidth;
        
        // Fator de peso cúbico dos Correios é 6000 cm³/kg
        const volume = (comprimento * altura * largura) / 6000;
        const finalWeight = Math.max(peso, volume);

        if (finalWeight > 30) throw new Error("Peso/volume excede o limite de 30kg dos Correios.");

        // Fórmulas de preço configuráveis
        // PAC
        const pacCost = correiosConfig.pacBaseCost + (finalWeight * correiosConfig.pacKgCost) * distanceFactor;
        const pacDeliveryTime = 4 + Math.round(distanceFactor * 3);
        
        // SEDEX
        const sedexCost = correiosConfig.sedexBaseCost + (finalWeight * correiosConfig.sedexKgCost) * distanceFactor;
        const sedexDeliveryTime = 1 + Math.round(distanceFactor * 2);

        return [
            { method: 'PAC' as const, cost: pacCost, deliveryTime: `em até ${pacDeliveryTime} dias úteis` },
            { method: 'SEDEX' as const, cost: sedexCost, deliveryTime: `em até ${sedexDeliveryTime} dias úteis` },
        ];
    };

    const handleCalculateShipping = async (cleanCep: string) => {
        setIsLoading(true);
        setError(null);
        // Do not clear options immediately to avoid flicker, unless logic requires
        
        try {
            const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            if (!viaCepResponse.ok) throw new Error('Não foi possível consultar o CEP.');
            const addressData = await viaCepResponse.json();
            if (addressData.erro) throw new Error('CEP não encontrado.');
            const addressString = `${addressData.logradouro ? addressData.logradouro + ',' : ''} ${addressData.bairro} - ${addressData.localidade}/${addressData.uf}`;
            
            const availableOptions: ShippingDetails[] = [];
            
            // 0. Per-product shipping rule (Enhanced with Enabled flag, Min Quantity AND Min Total)
            if (product.shippingRule && product.shippingRule.enabled) {
                const rule = product.shippingRule;
                const qtyCondition = quantity >= (rule.minQuantity || 0);
                const priceCondition = totalPrice >= (rule.minTotal || 0);

                if (qtyCondition && priceCondition) {
                     if (rule.type === 'free') {
                        availableOptions.push({ method: 'special_free', cost: 0, deliveryTime: '5-10 dias úteis', label: 'Frete Grátis', address: addressString, cep: cleanCep });
                    } else if (rule.type === 'fixed' && rule.fixedCost !== undefined) {
                        availableOptions.push({ method: 'special_fixed', cost: rule.fixedCost, deliveryTime: '5-10 dias úteis', label: `Frete Fixo`, address: addressString, cep: cleanCep });
                    }
                }
            }


            // 1. Store Pickup
            if (shippingConfig.storePickupEnabled) {
                availableOptions.push({ method: 'pickup', cost: 0, deliveryTime: 'Pronto para retirada', address: shippingConfig.storeAddress, cep: cleanCep });
            }
            
            // 2. Generic Free Shipping (threshold)
            const isAboveThreshold = shippingConfig.freeShippingThreshold && totalPrice >= shippingConfig.freeShippingThreshold;
            if (isAboveThreshold) {
                availableOptions.push({ method: 'free', cost: 0, deliveryTime: '5-10 dias úteis', address: addressString, cep: cleanCep });
            }

            // 3. Specific Free Shipping Regions
            let freeShippingRegionFound = false;
            for (const region of shippingConfig.freeShippingRegions) {
                const cleanRegionCities = (region.cities || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
                const cleanRegionStates = (region.states || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

                const cityMatch = cleanRegionCities.includes(addressData.localidade.toLowerCase());
                const stateMatch = cleanRegionStates.includes(addressData.uf.toLowerCase());
                const cepMatch = region.startCep && region.endCep && cleanCep >= region.startCep.replace(/\D/g, '') && cleanCep <= region.endCep.replace(/\D/g, '');

                if (cityMatch || stateMatch || cepMatch) {
                    availableOptions.push({ method: 'free', cost: 0, deliveryTime: '5-10 dias úteis', address: addressString, cep: cleanCep, label: `Frete Grátis (${region.name})` });
                    freeShippingRegionFound = true;
                    break;
                }
            }

            // 4. Fixed Rate Shipping (if enabled and no free region found)
            if(!freeShippingRegionFound && shippingConfig.fixedShippingRegionsEnabled) {
                const fixedRateRegion = (shippingConfig.fixedShippingRegions || []).find(region => 
                    cleanCep >= region.startCep.replace(/\D/g, '') && cleanCep <= region.endCep.replace(/\D/g, '')
                );
                if(fixedRateRegion) {
                    availableOptions.push({ method: 'fixed', label: fixedRateRegion.name, cost: fixedRateRegion.cost, deliveryTime: '3-7 dias úteis', address: addressString, cep: cleanCep });
                }
            }
            
            // 5. Correios (PAC/SEDEX)
            let correiosError = null;
            let variantWeightGrams = 0;
            if (product.variants) {
                for (const variant of product.variants) {
                    const optionId = selectedOptions[variant.id];
                    if (optionId) {
                        const option = variant.options.find(o => o.id === optionId);
                        if (option?.weight) {
                            variantWeightGrams += option.weight;
                        }
                    }
                }
            }
            const totalWeightKg = ((product.weight || shippingConfig.correiosConfig.defaultWeight) * 1000 + variantWeightGrams) * quantity / 1000;

            if (shippingConfig.correiosConfig.enabled) {
                try {
                    const correiosOptions = await calculateCorreiosShipping({
                        cepDestino: cleanCep,
                        peso: totalWeightKg,
                        comprimento: Math.max(product.length || shippingConfig.correiosConfig.defaultLength, 16),
                        largura: Math.max(product.width || shippingConfig.correiosConfig.defaultWidth, 11),
                        altura: Math.max(product.height || shippingConfig.correiosConfig.defaultHeight, 2),
                    });
                    correiosOptions.forEach(opt => availableOptions.push({ ...opt, address: addressString, cep: cleanCep }));
                } catch (e) {
                    correiosError = (e as Error).message;
                }
            }
            
            if (availableOptions.length > 0) {
                const uniqueOptions = Array.from(new Map(availableOptions.map(opt => [opt.label || opt.method, opt])).values())
                                           .sort((a, b) => a.cost - b.cost);
                setOptions(uniqueOptions);
                
                // Auto-select best option (cheapest)
                if (uniqueOptions.length > 0) {
                    handleOptionSelect(uniqueOptions[0]);
                }
            } else {
                 setError(correiosError || 'Nenhuma opção de entrega encontrada para este CEP.');
                 setOptions([]);
                 setSelectedOption(null);
                 setShippingDetails(null);
            }

        } catch (err) {
            setError((err as Error).message || 'Erro ao calcular o frete.');
            setOptions([]);
            setSelectedOption(null);
            setShippingDetails(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (option: ShippingDetails) => {
        setSelectedOption(option);
        setShippingDetails(option);
    };

    const getOptionLabel = (opt: ShippingDetails) => {
        if (opt.method === 'free' || opt.method === 'special_free') return opt.label || 'Frete Grátis';
        if (opt.label) return opt.label;
        switch(opt.method) {
            case 'pickup': return 'Retirar na Loja';
            default: return opt.method;
        }
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                <input type="text" value={cep} onChange={handleCepChange} placeholder="Seu CEP" className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                {isLoading && <div className="absolute top-2.5 right-3 h-5 w-5 animate-spin rounded-full border-b-2 border-indigo-500"></div>}
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {options && options.length > 0 && (
                <div className="space-y-2 pt-2 animate-fade-in">
                    {options.map((opt, idx) => {
                        const isSelected = selectedOption?.label === opt.label && selectedOption.cost === opt.cost;
                        const isSpecial = opt.method === 'special_free' || opt.method === 'special_fixed' || opt.method === 'free';
                        
                        return (
                            <label key={idx} className={`flex items-center p-2 border rounded-md cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'} ${isSpecial ? 'border-l-4 border-l-green-500' : ''}`}>
                                <input type="radio" name="shipping" checked={isSelected} onChange={() => handleOptionSelect(opt)} className="mr-3 text-indigo-600 focus:ring-indigo-500" />
                                <div className="flex-grow text-sm">
                                    <p className="font-semibold capitalize text-gray-800 dark:text-gray-200 flex items-center">
                                        {getOptionLabel(opt)}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">{opt.address}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">{opt.deliveryTime}</p>
                                </div>
                                <span className={`font-semibold text-sm ${opt.cost === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>{opt.cost === 0 ? 'Grátis' : `R$ ${opt.cost.toFixed(2).replace('.', ',')}`}</span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


interface ProductDetailModalProps {
    product: Product;
    onClose: () => void;
    onBuyNow: (product: Product, quantity: number, selectedOptions: Record<string, string>) => void;
    onAddToCartSuccess: () => void;
}

const ThumbnailButton: React.FC<{
    image: string | File;
    isActive: boolean;
    onClick: () => void;
}> = ({ image, isActive, onClick }) => {
    const thumbUrl = useObjectURL(image);
    return (
        <button onClick={onClick} className={`w-16 h-16 rounded-md border-2 overflow-hidden transition-colors ${isActive ? 'border-orange-500' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
            <img src={thumbUrl} alt="Thumbnail" className="w-full h-full object-cover" />
        </button>
    );
};

const OptionButton: React.FC<{
    option: ProductVariantOption;
    isSelected: boolean;
    onClick: () => void;
}> = ({ option, isSelected, onClick }) => {
    const optionImageUrl = useObjectURL(option.image);
    const hasImage = !!option.image;

    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-md border text-sm transition-all duration-200 ${isSelected ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
        >
            <div className="flex items-center gap-2">
               {hasImage && <img src={optionImageUrl} alt={option.value} className="w-6 h-6 object-cover rounded-sm" />}
               <span>{option.value}</span>
            </div>
        </button>
    );
};

const ShareButton: React.FC<{ onClick: () => void, icon: React.ReactNode, customIcon?: File | string, title: string, className?: string }> = ({ onClick, icon, customIcon, title, className }) => {
    const customIconUrl = useObjectURL(customIcon as any);
    
    return (
        <button onClick={onClick} className={className || "text-gray-500 hover:text-blue-800 dark:text-gray-400 dark:hover:text-blue-600 transition-colors"} title={title}>
            {customIconUrl ? (
                <img src={customIconUrl} alt={title} className="w-6 h-6 object-contain" />
            ) : (
                icon
            )}
        </button>
    );
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onBuyNow, onAddToCartSuccess }) => {
    const { siteConfig, addToCart, setProducts, orders, currentUser, cart, shippingDetails } = useSite();
    const { productDetailConfig, storeName, emailConfig } = siteConfig.storeConfig;
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [activeThumbnail, setActiveThumbnail] = useState<string | File>(product.image);
    const [justAdded, setJustAdded] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false); // Local state toggle
    const [showCepError, setShowCepError] = useState(false);

    // Coupon Logic
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponMessage, setCouponMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const mainImageUrl = useObjectURL(activeThumbnail);
    
    const imageVariants = useMemo(() => {
        const images = new Map<string, string | File>();
        if (product.image) {
            images.set('default', product.image);
        }
        product.variants?.forEach(variant => {
            variant.options.forEach(option => {
                if (option.image) {
                    images.set(option.id, option.image);
                }
            });
        });
        return Array.from(images.values());
    }, [product]);

    useEffect(() => {
        // Reset image and selections when product changes
        setActiveThumbnail(product.image);
        setSelectedOptions({});
        setQuantity(1);
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponMessage(null);
        setShowCepError(false);
        // Note: isFavorited is local state here, real implementations would sync with user profile/backend
    }, [product]);

    useEffect(() => {
        if (shippingDetails) {
            setShowCepError(false);
        }
    }, [shippingDetails]);

    const handleOptionSelect = (variantId: string, optionId: string) => {
        setSelectedOptions(prev => ({ ...prev, [variantId]: optionId }));
        const variant = product.variants?.find(v => v.id === variantId);
        const option = variant?.options.find(o => o.id === optionId);
        if (option?.image) {
            setActiveThumbnail(option.image);
        }
    };

    const handleShare = (platform: 'facebook' | 'twitter' | 'pinterest' | 'whatsapp' | 'instagram' | 'tiktok') => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`Confira este produto: ${product.name} - ${storeName}`);
        const img = encodeURIComponent(mainImageUrl || '');
        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${productDetailConfig.facebookShareLink ? encodeURIComponent(productDetailConfig.facebookShareLink) : url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${productDetailConfig.twitterShareLink ? encodeURIComponent(productDetailConfig.twitterShareLink) : url}`;
                break;
            case 'pinterest':
                 shareUrl = `https://pinterest.com/pin/create/button/?url=${productDetailConfig.pinterestShareLink ? encodeURIComponent(productDetailConfig.pinterestShareLink) : url}&description=${text}&media=${img}`;
                break;
            case 'whatsapp':
                 if (productDetailConfig.whatsAppShareNumber) {
                    // Send inquiry to specific number
                    const phone = productDetailConfig.whatsAppShareNumber.replace(/\D/g, '');
                    const msg = encodeURIComponent(`Olá, tenho interesse no produto: ${product.name}\n${window.location.href}`);
                    shareUrl = `https://wa.me/${phone}?text=${msg}`;
                 } else {
                    // Share to contacts
                    shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
                 }
                 break;
            case 'instagram':
                // Instagram web sharing is limited. Open profile link if set, else copy link.
                if (productDetailConfig.instagramShareLink) {
                    shareUrl = productDetailConfig.instagramShareLink;
                } else {
                    // Fallback: Try to open the app or homepage, and copy link
                    navigator.clipboard.writeText(window.location.href).then(() => alert('Link copiado para a área de transferência!'));
                    shareUrl = 'https://www.instagram.com/';
                }
                break;
            case 'tiktok':
                if (productDetailConfig.tikTokShareLink) {
                    shareUrl = productDetailConfig.tikTokShareLink;
                } else {
                    navigator.clipboard.writeText(window.location.href).then(() => alert('Link copiado para a área de transferência!'));
                    shareUrl = 'https://www.tiktok.com/';
                }
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    const handleToggleFavorite = () => {
        setIsFavorited(!isFavorited);
        setProducts(prev => prev.map(p => {
            if (p.id === product.id) {
                // Toggle count
                const currentCount = p.favoriteCount || 0;
                const newCount = isFavorited ? Math.max(0, currentCount - 1) : currentCount + 1;
                return { ...p, favoriteCount: newCount };
            }
            return p;
        }));
    };

    const handleReport = (e: React.MouseEvent) => {
        e.preventDefault();
        const subject = encodeURIComponent(`Denúncia: Produto ${product.name} (ID: ${product.id})`);
        const body = encodeURIComponent(`Olá, gostaria de reportar um problema com o produto ${product.name}.\n\nMotivo:\n`);
        // Use specific report email or fallback to first admin email
        const targetEmail = productDetailConfig.reportEmail || emailConfig.adminEmails?.[0] || 'admin@example.com';
        window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    };

    const handleApplyCoupon = () => {
        setCouponMessage(null);
        if (!couponCode.trim()) return;
        
        if (appliedCoupon) {
             setCouponMessage({ text: 'Já existe um cupom aplicado.', type: 'error' });
             return;
        }
        
        const availableCoupons = siteConfig.storeConfig.coupons || [];
        const coupon = availableCoupons.find(c => c.code === couponCode.trim().toUpperCase());

        if (coupon && coupon.enabled) {
             // Check if coupon is already applied in cart (Prevent reuse in same session if strict, or simply warn)
             // The requirement says "When it is in the cart already... do not allow applying the same code".
             const isCouponInCart = cart.some(item => item.couponCode === coupon.code);
             if (isCouponInCart) {
                 setCouponMessage({ text: 'Cupom já aplicado em itens no carrinho.', type: 'warning' });
                 return;
             }

             // Check Product Specificity
             if (coupon.productIds && coupon.productIds.length > 0) {
                 if (!coupon.productIds.includes(product.id)) {
                     setCouponMessage({ text: 'Este cupom não é válido para este produto.', type: 'error' });
                     return;
                 }
             }

             // Check Max Uses (Client-side check, also enforced on checkout)
            if (coupon.maxUses && (coupon.currentUses || 0) >= coupon.maxUses) {
                setAppliedCoupon(null);
                setCouponMessage({ text: 'Limite de uso atingido para este cupom.', type: 'error' });
                return;
            }

            // Check First Purchase Only - STRICT LOGIN REQUIREMENT
            if (coupon.firstPurchaseOnly) {
                if (!currentUser) {
                     setCouponMessage({ text: 'Faça login para usar cupom de primeira compra.', type: 'error' });
                     return;
                }
                // Check if user has any past non-cancelled orders
                const hasOrders = orders.some(o => o.userId === currentUser.id && o.status !== 'cancelled');
                if (hasOrders) {
                     setCouponMessage({ text: 'Cupom inválido para esta compra (somente 1ª compra).', type: 'error' });
                     return;
                }
            }

            setAppliedCoupon(coupon);
            setCouponMessage({ text: `Cupom ${coupon.code} aplicado!`, type: 'success' });
        } else {
            setAppliedCoupon(null);
            setCouponMessage({ text: 'Cupom inválido ou expirado.', type: 'warning' });
        }
    };
    
    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponMessage(null);
    };

    // Price Calculation with Discount logic
    const { currentPrice, originalPrice } = useMemo(() => {
        let basePrice = product.price || 0;
        let list = product.listPrice || 0;
        
        // Add variant prices
        if (product.variants) {
            product.variants.forEach(variant => {
                const selectedOptionId = selectedOptions[variant.id];
                if (selectedOptionId) {
                    const option = variant.options.find(o => o.id === selectedOptionId);
                    if (option?.priceModifier) {
                        basePrice += option.priceModifier;
                         // Assume list price increases similarly if not defined otherwise
                        if(list > 0) list += option.priceModifier; 
                    }
                }
            });
        }
        
        let final = basePrice * quantity;
        let finalList = list * quantity;
        
        if (appliedCoupon) {
            if (appliedCoupon.type === 'percentage') {
                final = final - (final * (appliedCoupon.value / 100));
            } else {
                final = Math.max(0, final - appliedCoupon.value);
            }
        }
        
        return { currentPrice: final, originalPrice: finalList };
    }, [product, selectedOptions, quantity, appliedCoupon]);


    const handleAddToCart = () => {
        if (productDetailConfig.showShippingInfo && !shippingDetails) {
            setShowCepError(true);
            const calculatorSection = document.getElementById('shipping-calculator-section');
            if (calculatorSection) {
                calculatorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        setShowCepError(false);

        addToCart(product, quantity, selectedOptions, appliedCoupon?.code);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
        onAddToCartSuccess();
        if (!product.link) onClose(); // Close modal if it's a direct add
    };

    const handleBuyNowClick = () => {
        if (productDetailConfig.showShippingInfo && !shippingDetails) {
            setShowCepError(true);
            const calculatorSection = document.getElementById('shipping-calculator-section');
            if (calculatorSection) {
                calculatorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        setShowCepError(false);
        
        // Apply current coupon if any to cart during add
        addToCart(product, quantity, selectedOptions, appliedCoupon?.code);
        onBuyNow(product, quantity, selectedOptions);
    };

    const allVariantsSelected = product.variants?.every(v => selectedOptions[v.id]);
    const isOutOfStock = product.stock === 0;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                {/* Left Side: Images */}
                <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-900 p-6 flex flex-col items-center justify-center relative">
                    <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-white/80 dark:bg-black/50 rounded-full md:hidden z-10"><XIcon /></button>
                    
                    <div className="w-full h-64 md:h-96 mb-4 relative">
                        <img src={mainImageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                        {productDetailConfig.showFavoriteButton && (
                            <div className="absolute top-0 right-0 flex flex-col items-center">
                                <button onClick={handleToggleFavorite} className="p-2 rounded-full bg-white/50 hover:bg-white transition-colors text-red-500 shadow-sm">
                                    <HeartIcon filled={isFavorited} />
                                </button>
                                {product.favoriteCount !== undefined && product.favoriteCount > 0 && (
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-1 bg-white/80 dark:bg-black/50 px-1.5 rounded">{product.favoriteCount}</span>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {imageVariants.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto w-full px-2 pb-2 no-scrollbar justify-center">
                            {imageVariants.map((img, idx) => (
                                <ThumbnailButton 
                                    key={idx} 
                                    image={img} 
                                    isActive={activeThumbnail === img} 
                                    onClick={() => setActiveThumbnail(img)} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col relative bg-white dark:bg-gray-800">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hidden md:block"><XIcon /></button>
                    
                    <div className="mb-1">
                        {productDetailConfig.showReportLink && (
                            <div className="flex justify-end">
                                <button onClick={handleReport} className="text-xs text-gray-400 hover:text-red-500 underline transition-colors">{productDetailConfig.reportLinkText}</button>
                            </div>
                        )}
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">{product.name}</h2>
                        {product.rating && <div className="mb-4"><StarRating rating={product.rating} reviewCountText="12" /></div>}
                    </div>

                    {/* Lightning Deal Banner */}
                    {productDetailConfig.showLightningDeal && (
                        <div className="mb-6 p-3 rounded-lg flex items-center justify-between text-white shadow-sm" style={{ backgroundColor: productDetailConfig.lightningDealBgColor || '#f97316', color: productDetailConfig.lightningDealTextColor }}>
                             <span className="font-bold text-sm md:text-base flex items-center gap-2">
                                {productDetailConfig.lightningDealText}
                            </span>
                            {productDetailConfig.lightningDealTimerEnabled && (
                                <CountdownTimer 
                                    initialHours={productDetailConfig.lightningDealHours} 
                                    initialMinutes={productDetailConfig.lightningDealMinutes} 
                                    initialSeconds={productDetailConfig.lightningDealSeconds} 
                                />
                            )}
                        </div>
                    )}

                    <div className="mb-6">
                        {/* Updated Price Display with De/Por logic */}
                        <div className="flex items-baseline gap-3 flex-wrap">
                             {(originalPrice > currentPrice) && (
                                <span className="text-gray-400 dark:text-gray-500 line-through text-lg font-medium">
                                    De R$ {originalPrice.toFixed(2).replace('.', ',')}
                                </span>
                            )}
                            <span className="text-3xl font-bold" style={{ color: product.priceColor || siteConfig.storeConfig.themePrimaryColor }}>
                                Por R$ {currentPrice.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                        {product.couponText && (
                            <p className="text-sm text-green-600 font-medium mt-1 bg-green-50 inline-block px-2 py-1 rounded border border-green-100">
                                {product.couponText}
                            </p>
                        )}
                        
                         {/* Coupon Input Section */}
                         {productDetailConfig.showCouponInfo && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">{productDetailConfig.couponInfoLabel}</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={couponCode} 
                                        onChange={e => setCouponCode(e.target.value)} 
                                        placeholder="Código" 
                                        className="flex-grow text-sm p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white uppercase"
                                        disabled={!!appliedCoupon}
                                    />
                                    {appliedCoupon ? (
                                        <button onClick={removeCoupon} className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded hover:bg-red-200">Remover</button>
                                    ) : (
                                        <button onClick={handleApplyCoupon} className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded hover:bg-gray-700">Aplicar</button>
                                    )}
                                </div>
                                {couponMessage && (
                                    <p className={`text-xs mt-2 font-bold ${
                                        couponMessage.type === 'success' ? 'text-green-600' :
                                        couponMessage.type === 'warning' ? 'text-orange-500 dark:text-orange-400' : 
                                        'text-red-600'
                                    }`}>
                                        {couponMessage.text}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {product.description && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Descrição</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{product.description}</p>
                        </div>
                    )}

                    {/* Variants */}
                    {product.variants?.map(variant => (
                        <div key={variant.id} className="mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{variant.name}: <span className="font-normal text-gray-500">{variant.options.find(o => o.id === selectedOptions[variant.id])?.value}</span></h3>
                            <div className="flex flex-wrap gap-2">
                                {variant.options.map(option => (
                                    <OptionButton
                                        key={option.id}
                                        option={option}
                                        isSelected={selectedOptions[variant.id] === option.id}
                                        onClick={() => handleOptionSelect(variant.id, option.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {/* Shipping Calc */}
                    {productDetailConfig.showShippingInfo && !isOutOfStock && (
                         <div id="shipping-calculator-section" className="mb-6 bg-blue-50 dark:bg-gray-700/50 p-4 rounded-lg border border-blue-100 dark:border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                <h4 className="font-bold text-gray-800 dark:text-white text-sm">Calcular Frete e Prazo</h4>
                            </div>
                            <ShippingCalculator 
                                product={product} 
                                quantity={quantity} 
                                totalPrice={currentPrice} 
                                selectedOptions={selectedOptions} 
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-4 mb-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                        {showCepError && (
                            <div className="text-center mb-2 w-full">
                                <p className="text-red-600 dark:text-red-400 font-bold text-sm bg-red-100 dark:bg-red-900/50 p-2 rounded animate-pulse">
                                    ⚠️ Por favor, informe seu CEP para continuar.
                                </p>
                            </div>
                        )}
                        
                        <div className="flex flex-wrap gap-4 w-full">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg h-12 w-full sm:w-auto bg-gray-50 dark:bg-gray-700 flex-shrink-0">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                                    className="h-full px-3 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-lg font-medium focus:outline-none"
                                    disabled={isOutOfStock}
                                >
                                    −
                                </button>
                                <span className="w-12 h-full flex items-center justify-center font-semibold text-gray-800 dark:text-white border-x border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                    {quantity}
                                </span>
                                <button 
                                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} 
                                    className="h-full px-3 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-lg font-medium focus:outline-none"
                                    disabled={isOutOfStock}
                                >
                                    +
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 flex-1 w-full min-w-[200px]">
                                {product.link ? (
                                    <a
                                        href={product.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full h-12 rounded-lg font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center text-center leading-tight ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed text-white' : 'hover:-translate-y-0.5'}`}
                                        style={!isOutOfStock ? { backgroundColor: siteConfig.storeConfig.buyButtonColor, color: siteConfig.storeConfig.buyButtonTextColor } : {}}
                                        onClick={(e) => { if(isOutOfStock) e.preventDefault(); }}
                                    >
                                        {isOutOfStock ? 'Esgotado' : (siteConfig.storeConfig.buyButtonText || 'Comprar Agora')}
                                    </a>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={!allVariantsSelected || isOutOfStock}
                                            className={`flex-1 h-12 rounded-lg font-bold text-xs sm:text-sm shadow-md transition-all transform active:scale-95 flex items-center justify-center px-2 leading-tight whitespace-normal min-w-[120px] ${justAdded ? 'bg-green-600 text-white' : ''} ${(!allVariantsSelected || isOutOfStock) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                                            style={(!allVariantsSelected || isOutOfStock || justAdded) ? {} : { backgroundColor: siteConfig.storeConfig.buyButtonColor, color: siteConfig.storeConfig.buyButtonTextColor }}
                                        >
                                            {isOutOfStock ? 'Esgotado' : justAdded ? 'Adicionado!' : 'Adicionar ao Carrinho'}
                                        </button>
                                        {!isOutOfStock && (
                                            <button
                                                onClick={handleBuyNowClick}
                                                disabled={!allVariantsSelected}
                                                className={`flex-1 h-12 rounded-lg font-bold text-xs sm:text-sm shadow-md transition-all transform active:scale-95 flex items-center justify-center px-2 leading-tight min-w-[120px] bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 ${!allVariantsSelected ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''}`}
                                            >
                                                Comprar Agora
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Social Sharing */}
                    {productDetailConfig.showShareButtons && (
                        <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-6">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{productDetailConfig.shareButtonsLabel}</span>
                            {productDetailConfig.enableFacebookShare !== false && <ShareButton onClick={() => handleShare('facebook')} icon={<FacebookIcon className="h-6 w-6" />} customIcon={productDetailConfig.customIconFacebook} title="Facebook" className="text-blue-600 hover:text-blue-800" />}
                            {productDetailConfig.enableTwitterShare !== false && <ShareButton onClick={() => handleShare('twitter')} icon={<XTwitterIcon className="h-6 w-6" />} customIcon={productDetailConfig.customIconTwitter} title="Twitter/X" className="text-black dark:text-white hover:opacity-70" />}
                            {productDetailConfig.enablePinterestShare !== false && <ShareButton onClick={() => handleShare('pinterest')} icon={<PinterestIcon className="h-6 w-6" />} customIcon={productDetailConfig.customIconPinterest} title="Pinterest" className="text-red-600 hover:text-red-800" />}
                            {productDetailConfig.enableWhatsAppShare !== false && <ShareButton onClick={() => handleShare('whatsapp')} icon={<div className="bg-green-500 text-white rounded-full p-1"><MessengerIcon className="h-4 w-4" /></div>} customIcon={productDetailConfig.customIconWhatsApp} title="WhatsApp" className="hover:opacity-80" />}
                            {productDetailConfig.enableInstagramShare !== false && <ShareButton onClick={() => handleShare('instagram')} icon={<InstagramIcon className="h-6 w-6" />} customIcon={productDetailConfig.customIconInstagram} title="Instagram" className="text-pink-600 hover:text-pink-800" />}
                            {productDetailConfig.enableTikTokShare !== false && <ShareButton onClick={() => handleShare('tiktok')} icon={<TikTokIcon className="h-6 w-6" />} customIcon={productDetailConfig.customIconTikTok} title="TikTok" className="text-black dark:text-white hover:opacity-70" />}
                        </div>
                    )}
                    
                    {/* Comments */}
                    {siteConfig.commentsConfig.enabled && siteConfig.commentsConfig.enableOnProducts && (
                         <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                            <CommentsSection 
                                targetId={product.id} 
                                targetType="product" 
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;