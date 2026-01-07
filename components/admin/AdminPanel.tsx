


import React, { useState } from 'react';
import { XIcon } from '../Icons';
import { useSite } from '../../context/SiteContext';

// Import individual manager components
import GeneralManager from './GeneralManager';
import CategoryManager from './CategoryManager';
import BannerManager from './BannerManager';
import ProductManager from './ProductManager';
import StoreSettingsManager from './StoreManager';
import ShippingManager from './ShippingManager';
import PaymentManager from './PaymentManager';
import CarouselManager from './CarouselManager';
import DownloadManager from './DownloadManager';
import FooterManager from './FooterManager';
import ThemeManager from './ThemeManager';
import ReviewManager from './ReviewManager';
import ProductShowcaseManager from './ProductShowcaseManager';
import MusicManager from './MusicManager';
import PopupManager from './PopupManager';
import AnalyticsManager from './AnalyticsManager';
import UserManager from './UserManager';
import OrderManager from './OrderManager';
import SecurityManager from './SecurityManager';
import SeoManager from './SeoManager';
import WordSearchManager from './WordSearchManager';
import CommentManager from './CommentManager';
import BackupManager from './BackupManager';
import PrivacyManager from './PrivacyManager';

interface AdminPanelProps {
    onClose: () => void;
    onLogout: () => void;
}

const adminMenu = [
    {
        title: 'Visão Geral',
        items: [
            { id: 'general', label: 'Configurações Gerais' },
            { id: 'analytics', label: 'Análises & Relatórios' },
            { id: 'security', label: 'Segurança' },
            { id: 'seo', label: 'SEO & Compartilhamento' },
            { id: 'privacy', label: 'Privacidade & Cookies' },
            { id: 'backup', label: 'Backup & Restauração' },
        ],
    },
    {
        title: 'Layout & Aparência',
        items: [
            { id: 'appearance', label: 'Tema & Cores' },
            { id: 'categories', label: 'Navegação & Páginas' },
            { id: 'carousel', label: 'Carrossel Principal' },
            { id: 'popup', label: 'Popup de Entrada' },
            { id: 'footer', label: 'Rodapé' },
        ],
    },
    {
        title: 'Gestão de Conteúdo',
        items: [
            { id: 'products', label: 'Produtos' },
            { id: 'showcases', label: 'Vitrines de Produtos' },
            { id: 'comments', label: 'Comentários & Avaliações' },
            { id: 'banners', label: 'Banners & Anúncios' },
            { id: 'reviews', label: 'Avaliações (Reviews)' },
            { id: 'uploads', label: 'Downloads' },
            { id: 'music', label: 'Músicas' },
            { id: 'wordsearch', label: 'Caça-Palavras' },
        ],
    },
    {
        title: 'Vendas',
        items: [
            { id: 'orders', label: 'Pedidos' },
            { id: 'users', label: 'Clientes' },
        ],
    },
    {
        title: 'Configurações da Loja',
        items: [
            { id: 'store_settings', label: 'Geral da Loja' },
            { id: 'shipping', label: 'Frete & Entrega' },
            { id: 'payments', label: 'Pagamentos' },
        ],
    },
];


const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onLogout }) => {
    const [activeTab, setActiveTab] = useState('general');
    const siteContext = useSite();

    const tabClasses = (tabName: string) => 
        `w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeTab === tabName ? 'bg-indigo-100 text-indigo-700 font-semibold dark:bg-indigo-900/50 dark:text-indigo-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`;
    
    const renderActiveTab = () => {
        switch(activeTab) {
            case 'general':
                return <GeneralManager />;
            case 'analytics':
                return <AnalyticsManager />;
            case 'security':
                return <SecurityManager onLogout={onLogout} />;
            case 'seo':
                return <SeoManager />;
            case 'privacy':
                return <PrivacyManager />;
            case 'backup':
                return <BackupManager />;
            case 'appearance':
                return <ThemeManager />;
            case 'categories':
                return <CategoryManager />;
            case 'carousel':
                return <CarouselManager />;
            case 'popup':
                return <PopupManager />;
            case 'footer':
                return <FooterManager />;
            case 'products':
                return <ProductManager />;
            case 'showcases':
                return <ProductShowcaseManager />;
            case 'comments':
                return <CommentManager />;
            case 'banners':
                return <BannerManager />;
            case 'reviews':
                return <ReviewManager />;
            case 'uploads':
                return <DownloadManager />;
            case 'music':
                return <MusicManager />;
            case 'wordsearch':
                return <WordSearchManager />;
            case 'orders':
                return <OrderManager />;
            case 'users':
                return <UserManager />;
            case 'store_settings':
                return <StoreSettingsManager />;
            case 'shipping':
                return <ShippingManager />;
            case 'payments':
                return <PaymentManager />;
            default:
                return <div>Selecione uma categoria</div>;
        }
    }

    return (
        <div className="admin-overlay" onClick={onClose}>
            <div className="admin-panel bg-gray-100 dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col overflow-hidden border dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Painel Admin</h2>
                    <div>
                        <button onClick={onLogout} className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mr-4 font-medium">Sair</button>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <XIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </header>
                
                <div className="flex flex-1 overflow-hidden">
                    <nav className="w-64 bg-gray-50 dark:bg-gray-800 p-3 border-r dark:border-gray-700 flex-shrink-0 overflow-y-auto space-y-4">
                        {adminMenu.map(group => (
                            <div key={group.title}>
                                <h4 className="px-3 text-xs font-bold uppercase text-blue-900 dark:text-blue-300 tracking-wider">{group.title}</h4>
                                <ul className="mt-2 space-y-1">
                                    {group.items.map(item => (
                                        <li key={item.id}>
                                            <button onClick={() => setActiveTab(item.id)} className={tabClasses(item.id)}>
                                                {item.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    <main className="flex-1 p-6 bg-white dark:bg-gray-900 overflow-y-auto text-gray-900 dark:text-gray-200">
                        {renderActiveTab()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
