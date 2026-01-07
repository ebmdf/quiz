

import React, { useState, useMemo, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import { XIcon, TrashIcon } from './Icons';
import type { CartItem } from '../types';
import { DEFAULT_SITE_CONFIG } from '../context/SiteContext';

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

const CartItemRow: React.FC<{ item: CartItem }> = ({ item }) => {
    const { products, setCart, siteConfig } = useSite();
    const product = products.find(p => p.id === item.productId);
    const imageUrl = useObjectURL(product?.image);

    if (!product) return null;

    const { rowTotal, originalRowTotal, couponCode, discountAmount } = useMemo(() => {
        let unitBasePrice = product.price || 0;
        if (product.variants) {
            for (const variant of product.variants) {
                const selectedOptionId = item.selectedOptions[variant.id];
                if (selectedOptionId) {
                    const option = variant.options.find(o => o.id === selectedOptionId);
                    if (option && typeof option.priceModifier === 'number') {
                        unitBasePrice += option.priceModifier;
                    }
                }
            }
        }
        
        const totalOriginal = unitBasePrice * item.quantity;
        
        let totalDiscountAmount = 0;
        let appliedCouponCode = null;
        
        if (item.couponCode && siteConfig.storeConfig.productDetailConfig.showCouponInfo) {
            const coupon = siteConfig.storeConfig.coupons.find(c => c.code === item.couponCode && c.enabled);
            // Strict check: Only apply if product matches (if restriction exists)
            const isProductValid = !coupon?.productIds || coupon.productIds.length === 0 || coupon.productIds.includes(product.id);

            if (coupon && isProductValid) {
                 appliedCouponCode = coupon.code;
                 if (coupon.type === 'percentage') {
                     // Percentage applies to the whole amount
                     totalDiscountAmount = totalOriginal * (coupon.value / 100);
                 } else {
                     // Fixed Discount: Applied ONCE per line item, NOT per unit quantity.
                     // We cap it at totalOriginal so we don't give negative price.
                     totalDiscountAmount = Math.min(totalOriginal, coupon.value);
                 }
            }
        }

        const totalFinal = Math.max(0, totalOriginal - totalDiscountAmount);

        return { 
            rowTotal: totalFinal, 
            originalRowTotal: totalOriginal, 
            couponCode: appliedCouponCode,
            discountAmount: totalDiscountAmount
        };
    }, [product, item.selectedOptions, item.quantity, item.couponCode, siteConfig.storeConfig.coupons, siteConfig.storeConfig.productDetailConfig.showCouponInfo]);

    const handleQuantityChange = (newQuantity: number) => {
        setCart(prev => prev.map(cartItem =>
            cartItem.id === item.id ? { ...cartItem, quantity: Math.max(1, newQuantity) } : cartItem
        ));
    };

    const handleRemove = () => {
        setCart(prev => prev.filter(cartItem => cartItem.id !== item.id));
    };
    
    const selectedOptionsText = product.variants?.map(variant => {
        const optionId = item.selectedOptions[variant.id];
        const option = variant.options.find(o => o.id === optionId);
        return option ? `${variant.name}: ${option.value}` : '';
    }).filter(Boolean).join(', ');

    return (
        <div className="flex items-center gap-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <img src={imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-md" />
            <div className="flex-grow">
                <h4 className="font-semibold text-gray-800 dark:text-white">{product.name}</h4>
                {selectedOptionsText && <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOptionsText}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                    {couponCode && (
                        <span className="text-xs text-gray-500 line-through">R$ {originalRowTotal.toFixed(2).replace('.', ',')}</span>
                    )}
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">R$ {rowTotal.toFixed(2).replace('.', ',')}</p>
                    {couponCode && (
                        <div className="flex flex-col items-start">
                            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-1.5 py-0.5 rounded">
                                Cupom: {couponCode}
                            </span>
                            <span className="text-[10px] text-green-600 dark:text-green-400">
                                (- R$ {discountAmount.toFixed(2).replace('.', ',')})
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                <button onClick={() => handleQuantityChange(item.quantity - 1)} className="px-2 py-1 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">-</button>
                <span className="px-3 border-x border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.quantity + 1)} className="px-2 py-1 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">+</button>
            </div>
            <button onClick={handleRemove} className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"><TrashIcon /></button>
        </div>
    );
};


interface CartModalProps {
    onClose: () => void;
    onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ onClose, onCheckout }) => {
    const { cart, products, shippingDetails, siteConfig, selectedInstallmentCount, setSelectedInstallmentCount } = useSite();

    const { grossTotal, totalDiscount, netSubtotal } = useMemo(() => {
        return cart.reduce((acc, item) => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return acc;

            let itemBasePrice = product.price || 0;
            if (product.variants) {
                product.variants.forEach(variant => {
                    const optionId = item.selectedOptions[variant.id];
                    const option = variant.options.find(o => o.id === optionId);
                    if(option?.priceModifier) itemBasePrice += option.priceModifier;
                });
            }
            
            const lineOriginalTotal = itemBasePrice * item.quantity;
            let lineDiscount = 0;

            // Calculate discount
            if (item.couponCode && siteConfig.storeConfig.productDetailConfig.showCouponInfo) {
                 const coupon = siteConfig.storeConfig.coupons.find(c => c.code === item.couponCode && c.enabled);
                 // Verify product specificity
                 const isProductValid = !coupon?.productIds || coupon.productIds.length === 0 || coupon.productIds.includes(product.id);

                 if (coupon && isProductValid) {
                     if (coupon.type === 'percentage') {
                         lineDiscount = lineOriginalTotal * (coupon.value / 100);
                     } else {
                         // For Fixed coupon, applied ONCE per line item (not multiplied by quantity)
                         // Cap at lineOriginalTotal to avoid negative values
                         lineDiscount = Math.min(lineOriginalTotal, coupon.value);
                     }
                 }
            }

            acc.grossTotal += lineOriginalTotal;
            acc.totalDiscount += lineDiscount;
            
            return acc;
        }, { grossTotal: 0, totalDiscount: 0, get netSubtotal() { return Math.max(0, this.grossTotal - this.totalDiscount) } });
    }, [cart, products, siteConfig.storeConfig.coupons, siteConfig.storeConfig.productDetailConfig.showCouponInfo]);
    
    const shippingCost = shippingDetails?.cost ?? 0;
    const total = netSubtotal + shippingCost;

    // Installment Calculation Logic inside Cart
    const installmentOptions = useMemo(() => {
        const { maxInstallments, interestFreeInstallments, interestRate, specialInstallmentRule } = siteConfig.storeConfig.installmentConfig;
        
        let effectiveMaxInstallments = maxInstallments;
        let effectiveInterestFreeInstallments = interestFreeInstallments;

        if (specialInstallmentRule?.enabled && total >= specialInstallmentRule.minTotal) {
            effectiveMaxInstallments = specialInstallmentRule.maxInstallments;
            effectiveInterestFreeInstallments = specialInstallmentRule.interestFreeInstallments;
        }

        const options = [];
        for (let i = 1; i <= effectiveMaxInstallments; i++) {
            if (i <= effectiveInterestFreeInstallments) {
                options.push({ count: i, value: total / i, total: total, interest: 'sem juros' });
            } else {
                 // Apply interest to the total amount for installments
                 const totalWithInterest = total * Math.pow(1 + (interestRate / 100), i - effectiveInterestFreeInstallments);
                options.push({ count: i, value: totalWithInterest / i, total: totalWithInterest, interest: 'c/ juros' });
            }
        }
        return options;
    }, [total, siteConfig.storeConfig.installmentConfig]);

    // Get the selected installment total to display
    // If an installment plan is selected, the displayed Total reflects the full amount (potentially with interest)
    const selectedInstallmentOption = installmentOptions.find(opt => opt.count === selectedInstallmentCount) || installmentOptions[0];
    const displayedTotal = selectedInstallmentOption ? selectedInstallmentOption.total : total;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-[200]" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full flex flex-col shadow-2xl border-l dark:border-gray-700" onClick={e => e.stopPropagation()} style={{animation: 'slideInFromRight 0.3s ease-out'}}>
                <header className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Seu Carrinho</h3>
                    <button onClick={onClose} className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><XIcon /></button>
                </header>
                
                {cart.length > 0 ? (
                    <>
                        <div className="flex-grow overflow-y-auto px-4 bg-white dark:bg-gray-800">
                            {cart.map(item => <CartItemRow key={item.id} item={item} />)}
                        </div>
                        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-4">
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex justify-between">
                                    <span>Subtotal (Bruto)</span>
                                    <span className="font-semibold">R$ {grossTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                                        <span>Descontos</span>
                                        <span className="font-bold">- R$ {totalDiscount.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                )}
                                {shippingDetails ? (
                                    <div className="flex justify-between">
                                        <span>
                                            {shippingDetails.method === 'pickup'
                                                ? 'Retirar na Loja'
                                                : `Frete (${shippingDetails.address})`}
                                        </span>
                                        <span className="font-semibold">{shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Calcule o frete na página de um produto para adicioná-lo aqui.</p>
                                )}
                                
                                {/* Installment Selector inside Cart */}
                                <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Simular Parcelamento:</label>
                                    <select 
                                        value={selectedInstallmentCount} 
                                        onChange={(e) => setSelectedInstallmentCount(Number(e.target.value))}
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    >
                                        {installmentOptions.map(opt => (
                                            <option key={opt.count} value={opt.count}>
                                                {opt.count}x de R$ {opt.value.toFixed(2).replace('.', ',')} {opt.interest === 'c/ juros' ? `(Total: R$ ${opt.total.toFixed(2)})` : 'sem juros'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                                    <span>Total</span>
                                    <span>R$ {displayedTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>
                            <button onClick={onCheckout} disabled={!shippingDetails} className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors">
                                Ir para o Pagamento
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-800">
                        <svg className="h-24 w-24 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <h4 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Seu carrinho está vazio</h4>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Adicione produtos para vê-los aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;
