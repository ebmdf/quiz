import React, { useState } from 'react';
import { XIcon } from './Icons';
import { useSite } from '../../context/SiteContext';

// Import individual manager components
import GeneralManager from './admin/GeneralManager';
import CategoryManager from './admin/CategoryManager';
import BannerManager from './admin/BannerManager';
import ProductManager from './admin/ProductManager';
import StoreSettingsManager from './admin/StoreManager';
import ShippingManager from './admin/ShippingManager';
import PaymentManager from './admin/PaymentManager';
import CarouselManager from './admin/CarouselManager';
import DownloadManager from './admin/DownloadManager';
import FooterManager from './admin/FooterManager';
import ThemeManager from './admin/ThemeManager';
import ReviewManager from './admin/ReviewManager';
import ProductShowcaseManager from './admin/ProductShowcaseManager';
import MusicManager from './admin/MusicManager';
import PopupManager from './admin/PopupManager';
import AnalyticsManager from './admin/AnalyticsManager';
import UserManager from './admin/UserManager';
import OrderManager from './admin/OrderManager';

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
            { id: 'banners', label: 'Banners & Anúncios' },
            { id: 'reviews', label: 'Avaliações (Reviews)' },
            { id: 'uploads', label: 'Downloads' },
            { id: 'music', label: 'Músicas' },
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
        `w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeTab === tabName ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'hover:bg-gray-200 text-gray-700'}`;
    
    const renderActiveTab = () => {
        switch(activeTab) {
            case 'general':
                return <GeneralManager />;
            case 'analytics':
                return <AnalyticsManager />;
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
            case 'banners':
                return <BannerManager />;
            case 'reviews':
                return <ReviewManager />;
            case 'uploads':
                return <DownloadManager />;
            case 'music':
                return <MusicManager />;
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
            <div className="admin-panel bg-gray-100 rounded-lg shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 bg-white border-b flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Painel Admin</h2>
                    <div>
                        <button onClick={onLogout} className="text-sm text-gray-600 hover:text-indigo-600 mr-4 font-medium">Sair</button>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                            <XIcon className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </header>
                
                <div className="flex flex-1 overflow-hidden">
                    <nav className="w-64 bg-gray-50 p-3 border-r flex-shrink-0 overflow-y-auto space-y-4">
                        {adminMenu.map(group => (
                            <div key={group.title}>
                                <h4 className="px-3 text-xs font-bold uppercase text-blue-900 tracking-wider">{group.title}</h4>
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

                    <main className="flex-1 p-6 bg-white overflow-y-auto">
                        {renderActiveTab()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;