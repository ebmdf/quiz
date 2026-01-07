



import React, { useState, useEffect, useMemo } from 'react';
import type { Product, ProductShowcase as ProductShowcaseType } from '../../types';
import { useSite } from '../../context/SiteContext';
import { StoreIcon, StarIcon } from '../Icons';

const useObjectURL = (file?: File | Blob | string) => {
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (!file || typeof file === 'string') {
            setUrl(file as string);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);
    return url;
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex justify-start">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="h-3 w-3 text-amber-400" filled={i < Math.floor(rating)} />
        ))}
    </div>
);


const ProductCard: React.FC<{ product: Product; onProductSelect: (product: Product) => void; showcaseConfig?: ProductShowcaseType }> = ({ product, onProductSelect, showcaseConfig }) => {
    const { siteConfig, logAnalyticsEvent } = useSite();
    const imageUrl = useObjectURL(product.image);
    const hasVariants = product.variants && product.variants.length > 0;
    const isOutOfStock = product.stock === 0;
    
    const handleCardClick = (e: React.MouseEvent) => {
        if (isOutOfStock || (e.target as HTMLElement).closest('a')) {
            return;
        }
        logAnalyticsEvent('product_click', { productId: product.id, productName: product.name });
        onProductSelect(product);
    };

    // Price Font Size Mapping
    const priceSizeClass = {
        small: 'text-lg',
        medium: 'text-2xl',
        large: 'text-3xl',
        xl: 'text-4xl'
    }[showcaseConfig?.priceSize || 'medium'];

    // Installment Calculation
    const installmentText = useMemo(() => {
        const price = product.price;
        if (!price || price <= 0) return null;

        // Determine which config to use
        const useSpecific = product.installmentOptions?.enabled;
        const maxInstallments = useSpecific && product.installmentOptions?.maxInstallments 
            ? product.installmentOptions.maxInstallments 
            : siteConfig.storeConfig.installmentConfig.maxInstallments;
            
        const interestFreeInstallments = useSpecific && product.installmentOptions?.interestFreeInstallments !== undefined
            ? product.installmentOptions.interestFreeInstallments
            : siteConfig.storeConfig.installmentConfig.interestFreeInstallments;
            
        const interestRate = useSpecific && product.installmentOptions?.interestRate !== undefined
            ? product.installmentOptions.interestRate
            : siteConfig.storeConfig.installmentConfig.interestRate;
        
        if (!maxInstallments || maxInstallments <= 1) return null;

        let val = 0;
        let suffix = '';

        // If number of installments is within the interest-free range
        if (maxInstallments <= interestFreeInstallments) {
             val = price / maxInstallments;
             suffix = 'sem juros';
        } else {
             const effectiveInterestRate = interestRate / 100;
             // Calculating total amount with compound interest over the period
             const totalWithInterest = price * Math.pow(1 + effectiveInterestRate, maxInstallments);
             val = totalWithInterest / maxInstallments;
             suffix = 'c/ juros';
        }
        
        // Only show if value is reasonable
        if (val < 5) return null;

        return `${maxInstallments}x de R$ ${val.toFixed(2).replace('.', ',')} ${suffix}`;
    }, [product.price, product.installmentOptions, siteConfig.storeConfig.installmentConfig]);
    
    const cardContent = (
        <>
            <div className="h-56 w-full overflow-hidden relative flex-shrink-0 p-2">
                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className={`w-full h-full object-contain hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'filter grayscale opacity-60' : ''}`} 
                />
                 {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <span className="text-white font-bold text-xs bg-gray-800/90 px-3 py-1 rounded shadow-sm">ESGOTADO</span>
                    </div>
                )}
                 {product.listPrice && product.price && (product.showDiscountPercentage ?? true) && !isOutOfStock && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
                        {Math.round(100 - (product.price / product.listPrice * 100))}% OFF
                    </div>
                 )}
            </div>
            
            <div className="p-4 flex flex-col flex-grow w-full">
                {/* Title */}
                <h3 className="text-sm font-normal text-gray-700 dark:text-gray-300 line-clamp-2 mb-1 text-left leading-snug min-h-[2.5rem]">
                    {product.name}
                </h3>

                {/* Rating - NEW */}
                {showcaseConfig?.showRating && product.rating && product.rating > 0 && (
                    <div className="mb-2">
                        <StarRating rating={product.rating} />
                    </div>
                )}
                
                {/* Price Section */}
                <div className="mt-auto text-left">
                    {product.listPrice !== undefined && product.listPrice > 0 && (
                        <span className="text-xs text-gray-400 line-through block">
                            R$ {product.listPrice.toFixed(2).replace('.', ',')}
                        </span>
                    )}
                    {product.price !== undefined && product.price > 0 ? (
                        <div className="flex items-baseline flex-wrap gap-1">
                            {hasVariants && <span className="text-xs text-gray-500 font-normal">A partir de</span>}
                            <span className={`${priceSizeClass} font-bold text-[#ef4444]`}> 
                                R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-500">Consulte</span>
                    )}
                    
                    {/* Installment hint */}
                    {installmentText && (
                        <p className="text-xs text-green-600 dark:text-green-500 mt-1 font-medium">
                            {installmentText}
                        </p>
                    )}
                </div>
            </div>
        </>
    );

    // Base card style: White background, rounded, shadow
    const cardClasses = "bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-xl overflow-hidden flex flex-col group border border-gray-100 dark:border-gray-700 h-full transition-all duration-300";

    if (hasVariants) {
        return (
            <button onClick={handleCardClick} disabled={isOutOfStock} className={`${cardClasses} w-full text-left disabled:opacity-75 disabled:cursor-not-allowed`}>
                {cardContent}
            </button>
        );
    }

    if (product.link && (!product.buttons || product.buttons.length === 0)) {
        return (
            <a href={isOutOfStock ? undefined : product.link} target="_blank" rel="noopener noreferrer" className={`${cardClasses} block ${isOutOfStock ? 'opacity-75 cursor-not-allowed' : ''}`} onClick={(e) => {if(isOutOfStock) e.preventDefault(); else logAnalyticsEvent('product_click', { productId: product.id, productName: product.name });}}>
                {cardContent}
            </a>
        );
    }
    
    return (
        <div onClick={handleCardClick} className={`${cardClasses} cursor-pointer ${isOutOfStock ? 'opacity-75' : ''}`}>
            {cardContent}
        </div>
    );
}

interface ProductShowcaseProps {
    showcase: ProductShowcaseType;
    allProducts: Product[];
    onProductSelect: (product: Product) => void;
}

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ showcase, allProducts, onProductSelect }) => {
    const { siteConfig, shippingDetails } = useSite();
    const showcaseIconUrl = useObjectURL(showcase.icon);
    
    const hasGeoRestrictedProducts = useMemo(() => 
        allProducts.some(p => showcase.productIds.includes(p.id) && p.visibility && p.visibility.type !== 'all'), 
        [allProducts, showcase.productIds]
    );

    let productsToShow = allProducts
        .filter(p => {
            if (!showcase.productIds.includes(p.id) || !p.enabled) return false;

            // Visibility Check
            if (!p.visibility || p.visibility.type === 'all') {
                return true; // Visible to everyone
            }
            if (!shippingDetails) {
                return false; // Hide geo-restricted products if no location is set
            }

            const cleanUserCep = shippingDetails.cep.replace(/\D/g, '');

            if (p.visibility.type === 'city') {
                const visibleCities = (p.visibility.cities || '').toLowerCase().split(',').map(c => c.trim()).filter(Boolean);
                const userCity = shippingDetails.address.split(' - ')[1]?.split('/')[0]?.trim().toLowerCase();
                return userCity ? visibleCities.includes(userCity) : false;
            }
            
            if (p.visibility.type === 'cep_range') {
                return (p.visibility.cepRanges || []).some(range => {
                    const start = range.start.replace(/\D/g, '');
                    const end = range.end.replace(/\D/g, '');
                    return cleanUserCep >= start && cleanUserCep <= end;
                });
            }

            return true;
        });
    
    // Apply Display Limit
    if (showcase.displayLimit && showcase.displayLimit > 0) {
        productsToShow = productsToShow.slice(0, showcase.displayLimit);
    }
    
    if (productsToShow.length === 0 && !hasGeoRestrictedProducts) {
        return null;
    }

    // Decorative Line Component
    const DecorativeLine = () => (
        showcase.showLine ? (
            <div 
                style={{ 
                    height: showcase.lineThickness ? `${showcase.lineThickness}px` : '2px', 
                    backgroundColor: showcase.lineColor || '#4f46e5',
                    width: '100%',
                    marginTop: showcase.linePosition === 'bottom' ? '12px' : '0',
                    marginBottom: showcase.linePosition === 'top' ? '12px' : '0'
                }}
                className="w-full rounded-full opacity-80"
            />
        ) : null
    );

    return (
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-2xl slide-in dark:!bg-gray-900" style={{ backgroundColor: showcase.backgroundColor || siteConfig.storeConfig.themeBgColor }}>
            <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 w-full">
                {showcase.showLine && showcase.linePosition === 'top' && <DecorativeLine />}
                
                <h2 className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center gap-2" style={{ color: showcase.titleColor || siteConfig.storeConfig.themePrimaryColor }}>
                    {showcaseIconUrl ? (
                        <img src={showcaseIconUrl} alt="" className="h-8 w-8 object-contain" />
                    ) : (
                        <StoreIcon className="h-6 w-6" />
                    )}
                    {showcase.title}
                </h2>

                {showcase.showLine && showcase.linePosition === 'bottom' && <DecorativeLine />}
            </div>
            
            {hasGeoRestrictedProducts && !shippingDetails && (
                <div className="text-center text-sm text-gray-600 bg-amber-100 p-3 rounded-md mb-6 dark:text-gray-800 mx-auto max-w-lg">
                    <p>ℹ️ Alguns produtos só são visíveis após o cálculo do frete. Visite a página de um produto para informar seu CEP.</p>
                </div>
            )}

            {productsToShow.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {productsToShow.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onProductSelect={onProductSelect}
                            showcaseConfig={showcase} 
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center text-gray-500 py-4 dark:text-gray-400">
                    <p>Nenhum produto disponível para sua região no momento.</p>
                </div>
            )}
        </div>
    );
};

export default ProductShowcase;