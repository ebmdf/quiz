
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSite } from '../context/SiteContext';
import { LogoutIcon, ArrowDownIcon } from './Icons';
import type { NavigationItem } from '../types';

// Helper for recursive dropdown rendering
const DropdownItem: React.FC<{
    item: NavigationItem;
    isActive: boolean;
    onItemClick: (id: string) => void;
    depth?: number;
}> = ({ item, isActive, onItemClick, depth = 0 }) => {
    const [isSubOpen, setIsSubOpen] = useState(false);
    const hasSubItems = item.isSubMenu && item.subItems && item.subItems.length > 0;

    const handleClick = (e: React.MouseEvent) => {
        if (hasSubItems) {
            e.stopPropagation(); // Prevent closing parent dropdown
            setIsSubOpen(!isSubOpen);
        } else {
            onItemClick(item.id);
        }
    };

    // Close sub-menu when mouse leaves (desktop)
    const handleMouseEnter = () => {
        if (window.innerWidth >= 768 && hasSubItems) setIsSubOpen(true);
    };
    const handleMouseLeave = () => {
        if (window.innerWidth >= 768 && hasSubItems) setIsSubOpen(false);
    };

    return (
        <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                onClick={handleClick}
                type="button"
                className={`
                    w-full text-left px-4 py-3 text-sm transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-center justify-between
                    ${isActive 
                        ? 'text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}
                `}
            >
                <div className="flex items-center gap-2">
                    <span style={{backgroundColor: item.color || '#6366f1'}} className="w-2 h-2 rounded-full flex-shrink-0"></span>
                    <span className="truncate">{item.name}</span>
                </div>
                {hasSubItems && (
                    <ArrowDownIcon className={`h-3 w-3 opacity-60 flex-shrink-0 transition-transform duration-200 ${isSubOpen ? (window.innerWidth >= 768 ? '-rotate-90' : 'rotate-180') : (window.innerWidth >= 768 ? '-rotate-90' : '')}`} />
                )}
            </button>

            {/* Nested Dropdown (Flyout on Desktop, Accordion on Mobile) */}
            {hasSubItems && (
                <div className={`
                    ${isSubOpen ? 'block' : 'hidden'}
                    md:absolute md:left-full md:top-0 md:w-64 md:bg-white/95 md:dark:bg-gray-900/95 md:shadow-xl md:rounded-r-xl md:border md:border-gray-200 md:dark:border-gray-700 md:-ml-1
                    bg-gray-50 dark:bg-gray-800/50 border-l-4 border-indigo-100 dark:border-gray-700
                `}>
                    <div className="py-1">
                        {item.subItems!.filter(sub => sub.enabled).map(subItem => (
                            <DropdownItem 
                                key={subItem.id} 
                                item={subItem} 
                                isActive={isActive} 
                                onItemClick={onItemClick}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Navigation: React.FC = () => {
    const { siteConfig, activeNavId, setActiveNavId, currentUser, setCurrentUser, setGameState, gameState } = useSite();
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const navRef = useRef<HTMLElement>(null);

    // Always show all enabled nav items.
    const visibleNavItems = siteConfig.navigationItems
        ?.filter(c => c.enabled)
        .sort((a,b) => a.order - b.order) || [];

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Bom Dia';
        if (hour >= 12 && hour < 18) return 'Boa Tarde';
        return 'Boa Noite';
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (visibleNavItems.length === 0) return null;

    const handleNavClick = (navItem: NavigationItem) => {
        // If it's a sub-menu toggle
        if (navItem.isSubMenu) {
            setOpenDropdownId(prev => prev === navItem.id ? null : navItem.id);
            return;
        }

        // Normal nav item logic
        if (gameState !== 'welcome') {
            setGameState('welcome');
        }
        setActiveNavId(navItem.id);
        setOpenDropdownId(null);
        window.scrollTo(0, 0);
    };

    const handleSubItemClick = (subItemId: string) => {
        if (gameState !== 'welcome') {
            setGameState('welcome');
        }
        setActiveNavId(subItemId);
        setOpenDropdownId(null);
        window.scrollTo(0, 0);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setGameState('welcome');
        setActiveNavId(siteConfig.initialNavItemId);
    };
    
    // Logic for Navigation Style
    const isSticky = siteConfig.themeConfig.enableStickyNav !== false; // Default true
    const navStyle = siteConfig.themeConfig.navStyle || 'standard';
    const isFloating = navStyle === 'floating';

    // Base Style Construction
    let navContainerClasses = "z-50 transition-all duration-300 backdrop-blur-md bg-white/90 dark:bg-gray-900/90";
    
    if (isSticky) {
        navContainerClasses += " sticky top-0";
    } else {
        navContainerClasses += " relative";
    }

    // Specific Style Modifications
    if (isFloating) {
        // Floating / Island Style
        // Top margin/offset creates the floating effect
        // Rounded corners and specific width
        const floatSpacing = isSticky ? "top-3 sm:top-4" : "my-3 sm:my-4";
        navContainerClasses += ` ${floatSpacing} mx-auto w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-7xl rounded-2xl border border-black/5 dark:border-white/10 shadow-lg`;
    } else {
        // Standard Style
        // Full width, bottom border only
        navContainerClasses += " w-full border-b border-black/5 dark:border-white/10 shadow-sm";
    }

    return (
        <nav ref={navRef} className={navContainerClasses}>
             <div className="w-full flex flex-wrap items-center justify-center p-1.5 sm:p-2">
                
                {/* Navigation Items Container - Flex Wrap enabled for mobile */}
                <div className="flex flex-wrap items-center justify-center w-full gap-1">
                    
                    {visibleNavItems.map(nav => {
                        const accountCategory = siteConfig.siteCategories.find(c => c.type === 'account');
                        const isAccountNav = accountCategory && nav.categoryIds.includes(accountCategory.id);
                        const isActive = activeNavId === nav.id || (nav.subItems && nav.subItems.some(sub => sub.id === activeNavId));
                        const isDropdownOpen = openDropdownId === nav.id;

                        // User Account Button (replaces standard link if logged in)
                        if (isAccountNav && currentUser) {
                            return (
                                <div key="user-nav" className="relative group flex-shrink-0 order-first sm:order-none w-full sm:w-auto flex justify-center sm:block mb-1 sm:mb-0">
                                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 pl-3 border border-gray-200 dark:border-gray-700 shadow-sm whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => handleNavClick(nav)}
                                            className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2 flex flex-col sm:flex-row sm:gap-1 leading-tight items-start sm:items-center"
                                        >
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:inline">{greeting},</span>
                                            <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleLogout}
                                            className="p-1.5 rounded-full bg-white dark:bg-gray-700 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                                            title="Sair"
                                        >
                                            <LogoutIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={nav.id} className="relative group flex-shrink-0">
                                <button 
                                    type="button"
                                    onClick={() => handleNavClick(nav)}
                                    style={{
                                        backgroundColor: isActive ? (nav.color || '#6366f1') : 'transparent',
                                        color: isActive ? 'var(--nav-selected-text-color)' : 'var(--nav-text-color)',
                                    }}
                                    className={`
                                        px-3 py-2 text-sm font-semibold flex items-center justify-center gap-1 rounded-full whitespace-nowrap border border-transparent 
                                        ${!isActive ? 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300' : ''}
                                        transition-all duration-200
                                    `}
                                >
                                    <span className="truncate">{nav.name}</span>
                                    {nav.isSubMenu && (
                                        <ArrowDownIcon className={`h-3 w-3 opacity-70 flex-shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {nav.isSubMenu && nav.subItems && (
                                    <div className={`
                                        absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[100] origin-top
                                        transition-all duration-200
                                        ${isDropdownOpen ? 'opacity-100 visible scale-100 translate-y-0' : 'opacity-0 invisible scale-95 -translate-y-2'}
                                    `}>
                                        <div className="py-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                            {nav.subItems.filter(sub => sub.enabled).map(subItem => (
                                                <DropdownItem 
                                                    key={subItem.id}
                                                    item={subItem}
                                                    isActive={activeNavId === subItem.id}
                                                    onItemClick={handleSubItemClick}
                                                />
                                            ))}
                                            {nav.subItems.filter(sub => sub.enabled).length === 0 && (
                                                <div className="px-4 py-3 text-sm text-gray-500 italic text-center">
                                                    Vazio
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
