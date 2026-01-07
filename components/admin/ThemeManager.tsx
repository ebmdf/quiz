
import React, { useState, useEffect } from 'react';
import type { ThemeConfig } from '../../types';
import { useSite } from '../../context/SiteContext';

const ColorInput: React.FC<{label: string, value: string, name: keyof ThemeConfig, onSave: (key: string, val: string) => void, helper?: string}> = ({label, value, name, onSave, helper}) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    const handleBlur = () => {
        if (localValue !== value) {
            onSave(name, localValue);
        }
    };

    const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        setLocalValue(hex);
        onSave(name, hex);
    };

    const isValidHex = /^#[0-9A-F]{6}$/i.test(localValue);
    const pickerValue = isValidHex ? localValue : '#000000';

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="flex gap-2 mt-1 items-center">
                <div className="relative h-10 w-14 flex-shrink-0 cursor-pointer shadow-sm rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
                    <input 
                        type="color" 
                        value={pickerValue} 
                        onChange={handlePickerChange}
                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 border-0 cursor-pointer opacity-0 z-10"
                    />
                    <div 
                        className="absolute inset-0 z-0" 
                        style={{ backgroundColor: localValue }} 
                    />
                    {!isValidHex && (
                        <div className="absolute inset-0 z-[-1]" style={{ 
                            background: `
                                linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                                linear-gradient(45deg, transparent 75%, #ccc 75%), 
                                linear-gradient(-45deg, transparent 75%, #ccc 75%)
                            `, 
                            backgroundSize: '10px 10px', 
                            backgroundColor: 'white' 
                        }}></div>
                    )}
                </div>
                <input 
                    type="text" 
                    id={name} 
                    name={name}
                    value={localValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md font-mono dark:bg-gray-700 dark:text-white"
                    placeholder="#000000 ou rgba(0,0,0,0.5)"
                />
            </div>
            {helper && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helper}</p>}
        </div>
    );
};

const ThemeManager: React.FC = () => {
    const { siteConfig, setSiteConfig } = useSite();
    const { themeConfig } = siteConfig;

    const handleThemeChange = (key: string, value: string | boolean) => {
        setSiteConfig(prev => ({
            ...prev,
            themeConfig: {
                ...prev.themeConfig,
                [key]: value
            }
        }));
    };
    
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Aparência e Personalização</h3>
            
            <div className="space-y-6">
                
                {/* Seção de Navegação Refatorada */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow-sm">
                    <h4 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-6 border-b dark:border-gray-700 pb-2">Menu de Navegação (Header)</h4>
                    
                    <div className="space-y-6">
                        {/* Fixar Menu no Topo */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div>
                                <span className="block text-sm font-bold text-gray-900 dark:text-white">Fixar Menu no Topo</span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">O menu acompanha a rolagem da página.</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={themeConfig.enableStickyNav !== false}
                                    onChange={e => handleThemeChange('enableStickyNav', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                        
                        {/* Estilo do Menu */}
                        <div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Estilo do Menu</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Opção Padrão */}
                                <div 
                                    onClick={() => handleThemeChange('navStyle', 'standard')}
                                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 flex flex-col gap-2 relative ${themeConfig.navStyle !== 'floating' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold ${themeConfig.navStyle !== 'floating' ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>Padrão (Largura Total)</span>
                                        {themeConfig.navStyle !== 'floating' && <div className="h-4 w-4 rounded-full bg-indigo-600"></div>}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        O menu ocupa 100% da largura da tela, ideal para layouts tradicionais.
                                    </p>
                                </div>

                                {/* Opção Flutuante */}
                                <div 
                                    onClick={() => handleThemeChange('navStyle', 'floating')}
                                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 flex flex-col gap-2 relative ${themeConfig.navStyle === 'floating' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold ${themeConfig.navStyle === 'floating' ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>Flutuante (Ilha)</span>
                                        {themeConfig.navStyle === 'floating' && <div className="h-4 w-4 rounded-full bg-indigo-600"></div>}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Menu centralizado com bordas arredondadas e margens laterais (Visual Moderno).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-gray-700">
                            <ColorInput label="Cor do Texto do Menu (Padrão)" value={themeConfig.navigationTextColor || '#1f2937'} name="navigationTextColor" onSave={handleThemeChange} />
                            <ColorInput label="Cor do Texto do Menu (Ativo/Hover)" value={themeConfig.navigationSelectedTextColor || '#ffffff'} name="navigationSelectedTextColor" onSave={handleThemeChange} />
                        </div>
                    </div>
                </div>

                {/* Seção de Cores Gerais */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
                        <h4 className="text-md font-bold text-gray-800 dark:text-gray-200">Cores do Sistema</h4>
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            <input
                                type="checkbox"
                                id="enableDarkMode"
                                checked={themeConfig.enableDarkMode}
                                onChange={e => handleThemeChange('enableDarkMode', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="enableDarkMode" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                Ativar Botão Modo Escuro
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ColorInput label="Cor Primária (Destaques)" value={themeConfig.primaryColor} name="primaryColor" onSave={handleThemeChange} />
                        <ColorInput label="Cor Secundária" value={themeConfig.secondaryColor} name="secondaryColor" onSave={handleThemeChange} />
                        <ColorInput label="Cor do Texto Principal" value={themeConfig.textColor} name="textColor" onSave={handleThemeChange} />
                        <ColorInput label="Cor do Texto Secundário" value={themeConfig.secondaryTextColor} name="secondaryTextColor" onSave={handleThemeChange} />
                        <ColorInput label="Cor de Sucesso (Verde)" value={themeConfig.successColor} name="successColor" onSave={handleThemeChange} />
                        <ColorInput label="Cor de Erro/Perigo (Vermelho)" value={themeConfig.dangerColor} name="dangerColor" onSave={handleThemeChange} />
                    </div>
                </div>
                
                {/* Seção de Fundo e Cards */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow-sm">
                    <h4 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">Fundo & Estrutura</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ColorInput label="Início do Gradiente (Fundo)" value={themeConfig.backgroundColorStart} name="backgroundColorStart" onSave={handleThemeChange} />
                        <ColorInput label="Fim do Gradiente (Fundo)" value={themeConfig.backgroundColorEnd} name="backgroundColorEnd" onSave={handleThemeChange} />
                    </div>
                    
                    <div className="mt-6">
                        <ColorInput 
                            label="Fundo do Card Principal (Suporta Transparência)" 
                            value={themeConfig.cardBackgroundColor} 
                            name="cardBackgroundColor" 
                            onSave={handleThemeChange} 
                            helper="Dica: Use RGBA para criar efeito de vidro (Ex: rgba(255, 255, 255, 0.9))"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ThemeManager;
