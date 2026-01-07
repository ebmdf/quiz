
import React from 'react';
import { useSite } from '../../context/SiteContext';
import type { WordSearchConfig } from '../../types';

const WordSearchManager: React.FC = () => {
    const { siteConfig, setSiteConfig } = useSite();
    const { wordSearchConfig } = siteConfig;

    const handleSizeChange = (difficulty: 'facil' | 'medio' | 'dificil', value: number) => {
        setSiteConfig(prev => ({
            ...prev,
            wordSearchConfig: {
                ...prev.wordSearchConfig,
                sizes: {
                    ...prev.wordSearchConfig.sizes,
                    [difficulty]: value
                }
            }
        }));
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Configurações do Caça-Palavras</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Tamanho da Grade por Dificuldade</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Define o número de linhas e colunas para cada nível.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="size-facil" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fácil</label>
                            <input 
                                type="number" 
                                id="size-facil" 
                                value={wordSearchConfig.sizes.facil} 
                                onChange={e => handleSizeChange('facil', parseInt(e.target.value, 10) || 10)} 
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                            />
                        </div>
                        <div>
                            <label htmlFor="size-medio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Médio</label>
                            <input 
                                type="number" 
                                id="size-medio" 
                                value={wordSearchConfig.sizes.medio} 
                                onChange={e => handleSizeChange('medio', parseInt(e.target.value, 10) || 12)} 
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                            />
                        </div>
                        <div>
                            <label htmlFor="size-dificil" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Difícil</label>
                            <input 
                                type="number" 
                                id="size-dificil" 
                                value={wordSearchConfig.sizes.dificil} 
                                onChange={e => handleSizeChange('dificil', parseInt(e.target.value, 10) || 15)} 
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WordSearchManager;
