
import React, { useMemo } from 'react';
import { useSite } from '../context/SiteContext';

const CartIconSVG: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);


interface CartIconProps {
    onOpen: () => void;
}

const CartIcon: React.FC<CartIconProps> = ({ onOpen }) => {
    const { cart, siteConfig, products } = useSite();
    const { cartIconConfig } = siteConfig.storeConfig;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const hasSellableProducts = useMemo(() => {
        return products.some(p => p.enabled && (p.price !== undefined || (p.variants && p.variants.length > 0)));
    }, [products]);

    if (!cartIconConfig.enabled || !hasSellableProducts || totalItems === 0) {
        return null;
    }

    const positionClasses = {
        'top-left': 'top-6 left-6',
        'top-right': 'top-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'bottom-right': 'bottom-6 right-6',
    }[cartIconConfig.position] || 'bottom-6 right-24';
    
    const sizeClassMap = {
        small: { button: 'px-3 py-2', icon: 'h-5 w-5', label: 'text-xs', badge: 'h-5 w-5 text-xs', badgePos: '-top-0.5 -right-0.5' },
        medium: { button: 'px-4 py-2', icon: 'h-6 w-6', label: 'text-sm', badge: 'h-6 w-6 text-xs', badgePos: '-top-1 -right-1' },
        large: { button: 'px-5 py-3', icon: 'h-7 w-7', label: 'text-base', badge: 'h-7 w-7 text-sm', badgePos: '-top-1 -right-1' },
    };
    const sizeClasses = sizeClassMap[cartIconConfig.size] || sizeClassMap.medium;

    return (
        <button 
            onClick={onOpen}
            className={`fixed z-50 rounded-full shadow-lg border hover:scale-110 transition-transform flex items-center gap-2 animate-zoom-in ${positionClasses} ${sizeClasses.button}`}
            style={{ 
                backgroundColor: cartIconConfig.backgroundColor,
                color: cartIconConfig.iconColor
            }}
            aria-label={`Abrir carrinho com ${totalItems} itens`}
        >
            <CartIconSVG className={sizeClasses.icon}/>
            {cartIconConfig.labelText && <span className={`font-semibold ${sizeClasses.label}`}>{cartIconConfig.labelText}</span>}
            {totalItems > 0 && (
                <span 
                    className={`absolute font-bold rounded-full flex items-center justify-center ${sizeClasses.badge} ${sizeClasses.badgePos}`}
                    style={{
                        backgroundColor: cartIconConfig.badgeBackgroundColor,
                        color: cartIconConfig.badgeTextColor,
                    }}
                >
                    {totalItems}
                </span>
            )}
        </button>
    );
};

export default CartIcon;
