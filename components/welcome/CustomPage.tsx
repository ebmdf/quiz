import React from 'react';
import type { SiteCategory } from '../../types';
import { useSite } from '../../context/SiteContext';

interface CustomPageProps {
    category: SiteCategory;
}

const CustomPage: React.FC<CustomPageProps> = ({ category }) => {
    const { siteConfig } = useSite();

    return (
        <div className="mt-10 p-6 rounded-2xl slide-in" style={{ backgroundColor: siteConfig.storeConfig.themeBgColor || '#f9fafb' }}>
            <h2 className="text-2xl font-bold text-center mb-6" style={{ color: siteConfig.storeConfig.themePrimaryColor || '#4f46e5' }}>
                {category.name}
            </h2>
            {category.content ? (
                <div dangerouslySetInnerHTML={{ __html: category.content }} />
            ) : (
                <p className="text-gray-600 text-center">O conteúdo desta seção estará disponível em breve.</p>
            )}
        </div>
    );
};

export default CustomPage;
