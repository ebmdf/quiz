
import React, { useState, ReactNode } from 'react';
import type { StoreConfig, FreeShippingRegion, FixedShippingRegion, CorreiosConfig } from '../../types';
import { useSite } from '../../context/SiteContext';
import { TrashIcon, PlusIcon } from '../Icons';

// --- Componentes de UI Reutilizáveis ---

const SectionCard: React.FC<{ title: string; children: ReactNode; }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const SwitchToggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string; }> = ({ enabled, onChange, label }) => (
    <div className="flex items-center">
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
        >
            <span className="sr-only">{label}</span>
            <span aria-hidden="true" className={`inline-block w-5 h-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
        <label className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    </div>
);

const InputGroup: React.FC<{ label: string; children: ReactNode; helperText?: string }> = ({ label, children, helperText }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="mt-1">{children}</div>
        {helperText && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
);

// --- Componente Principal ---

const ShippingManager: React.FC = () => {
    const { siteConfig, setSiteConfig } = useSite();
    const { shippingConfig } = siteConfig.storeConfig;

    // --- State Local para Formulários ---
    const [freeRegion, setFreeRegion] = useState({ name: '', startCep: '', endCep: '', states: '', cities: '' });
    const [fixedRegion, setFixedRegion] = useState({ name: '', startCep: '', endCep: '', cost: 0 });

    // --- Handlers de Atualização de Estado ---
    const setStoreConfig = (cb: (prev: StoreConfig) => StoreConfig) => {
        setSiteConfig(prev => ({ ...prev, storeConfig: cb(prev.storeConfig) }));
    };

    const handleShippingConfigChange = (key: keyof typeof shippingConfig, value: any) => {
        setStoreConfig(prev => ({
            ...prev,
            shippingConfig: { ...prev.shippingConfig, [key]: value }
        }));
    };
    
    const handleCorreiosConfigChange = (key: keyof CorreiosConfig, value: any) => {
        setStoreConfig(prev => ({
            ...prev,
            shippingConfig: {
                ...prev.shippingConfig,
                correiosConfig: { ...prev.shippingConfig.correiosConfig, [key]: value }
            }
        }));
    };

    // --- Handlers para Regiões de Frete ---
    const handleAddFreeRegion = () => {
        if (!freeRegion.name) { alert('O nome da região é obrigatório.'); return; }
        const newRegion: FreeShippingRegion = { id: Date.now().toString(), ...freeRegion };
        const newRegions = [...(shippingConfig.freeShippingRegions || []), newRegion];
        handleShippingConfigChange('freeShippingRegions', newRegions);
        setFreeRegion({ name: '', startCep: '', endCep: '', states: '', cities: '' });
    };

    const handleRemoveFreeRegion = (id: string) => {
        const newRegions = shippingConfig.freeShippingRegions.filter(r => r.id !== id);
        handleShippingConfigChange('freeShippingRegions', newRegions);
    };

    const handleAddFixedRegion = () => {
        if (!fixedRegion.name || !fixedRegion.startCep || !fixedRegion.endCep || fixedRegion.cost <= 0) {
            alert('Todos os campos da região e um custo válido são obrigatórios.'); return;
        }
        const newRegion: FixedShippingRegion = { id: Date.now().toString(), ...fixedRegion };
        const newRegions = [...(shippingConfig.fixedShippingRegions || []), newRegion];
        handleShippingConfigChange('fixedShippingRegions', newRegions);
        setFixedRegion({ name: '', startCep: '', endCep: '', cost: 0 });
    };

    const handleRemoveFixedRegion = (id: string) => {
        const newRegions = shippingConfig.fixedShippingRegions.filter(r => r.id !== id);
        handleShippingConfigChange('fixedShippingRegions', newRegions);
    };


    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configurações de Frete e Entrega</h2>

            <SectionCard title="Configurações Gerais de Frete">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Valor Mínimo do Frete (R$)">
                        <input type="number" step="0.01" value={shippingConfig.baseCost} onChange={e => handleShippingConfigChange('baseCost', Number(e.target.value))} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </InputGroup>
                    <InputGroup label="Frete Grátis Acima de (R$)" helperText="Deixe em branco para desativar.">
                        <input type="number" step="0.01" value={shippingConfig.freeShippingThreshold || ''} onChange={e => handleShippingConfigChange('freeShippingThreshold', e.target.value ? Number(e.target.value) : undefined)} placeholder="Ex: 150.00" className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </InputGroup>
                </div>
            </SectionCard>

            <SectionCard title="Retirada na Loja">
                <SwitchToggle enabled={shippingConfig.storePickupEnabled} onChange={enabled => handleShippingConfigChange('storePickupEnabled', enabled)} label="Ativar opção de retirada na loja" />
                {shippingConfig.storePickupEnabled && (
                    <div className="pt-4 border-t dark:border-gray-700">
                        <InputGroup label="Endereço de Retirada">
                            <input type="text" value={shippingConfig.storeAddress} onChange={e => handleShippingConfigChange('storeAddress', e.target.value)} placeholder="Rua Exemplo, 123 - Cidade/UF" className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </InputGroup>
                    </div>
                )}
            </SectionCard>

            <SectionCard title="Regiões de Frete Personalizadas">
                {/* Regiões com Frete Grátis */}
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Regiões com Frete Grátis</h4>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                        {(shippingConfig.freeShippingRegions || []).map(r => (
                            <div key={r.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm"><p className="dark:text-gray-200"><span className="font-medium">{r.name}</span> ({r.states || r.cities || `${r.startCep}-${r.endCep}`})</p><button onClick={() => handleRemoveFreeRegion(r.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"><TrashIcon className="h-4 w-4" /></button></div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t dark:border-gray-700 space-y-2">
                        <input type="text" value={freeRegion.name} onChange={e => setFreeRegion(p => ({...p, name: e.target.value}))} placeholder="Nome da Região*" className="w-full sm:text-sm border-gray-300 rounded-md" />
                        <div className="grid grid-cols-2 gap-2"><input type="text" value={freeRegion.startCep} onChange={e => setFreeRegion(p => ({...p, startCep: e.target.value}))} placeholder="CEP Inicial" className="sm:text-sm border-gray-300 rounded-md" /><input type="text" value={freeRegion.endCep} onChange={e => setFreeRegion(p => ({...p, endCep: e.target.value}))} placeholder="CEP Final" className="sm:text-sm border-gray-300 rounded-md" /></div>
                        <div className="grid grid-cols-2 gap-2"><input type="text" value={freeRegion.states} onChange={e => setFreeRegion(p => ({...p, states: e.target.value}))} placeholder="Estados (SP,RJ)" className="sm:text-sm border-gray-300 rounded-md" /><input type="text" value={freeRegion.cities} onChange={e => setFreeRegion(p => ({...p, cities: e.target.value}))} placeholder="Cidades (Campinas)" className="sm:text-sm border-gray-300 rounded-md" /></div>
                        <button onClick={handleAddFreeRegion} className="w-full text-sm py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-semibold rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50">Adicionar Região Grátis</button>
                    </div>
                </div>
                 {/* Regiões com Frete Fixo */}
                <div className="pt-4 border-t dark:border-gray-700">
                    <SwitchToggle enabled={shippingConfig.fixedShippingRegionsEnabled} onChange={enabled => handleShippingConfigChange('fixedShippingRegionsEnabled', enabled)} label="Ativar regiões com frete fixo" />
                    {shippingConfig.fixedShippingRegionsEnabled && (
                        <div className="mt-3 space-y-2">
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {(shippingConfig.fixedShippingRegions || []).map(r => (
                                    <div key={r.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm"><p className="dark:text-gray-200"><span className="font-medium">{r.name}</span> ({r.startCep}-{r.endCep}): <span className="font-bold">R$ {r.cost.toFixed(2)}</span></p><button onClick={() => handleRemoveFixedRegion(r.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"><TrashIcon className="h-4 w-4" /></button></div>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                                <input type="text" value={fixedRegion.name} onChange={e => setFixedRegion(p => ({...p, name: e.target.value}))} placeholder="Nome da Região*" className="sm:text-sm border-gray-300 rounded-md" />
                                <input type="number" step="0.01" value={fixedRegion.cost || ''} onChange={e => setFixedRegion(p => ({...p, cost: Number(e.target.value)}))} placeholder="Custo Fixo (R$)*" className="sm:text-sm border-gray-300 rounded-md" />
                                <input type="text" value={fixedRegion.startCep} onChange={e => setFixedRegion(p => ({...p, startCep: e.target.value}))} placeholder="CEP Inicial*" className="sm:text-sm border-gray-300 rounded-md" />
                                <div className="flex gap-2"><input type="text" value={fixedRegion.endCep} onChange={e => setFixedRegion(p => ({...p, endCep: e.target.value}))} placeholder="CEP Final*" className="w-full sm:text-sm border-gray-300 rounded-md" /><button onClick={handleAddFixedRegion} className="px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"><PlusIcon className="h-5 w-5" /></button></div>
                            </div>
                        </div>
                    )}
                </div>
            </SectionCard>

            <SectionCard title="Correios (Simulação)">
                <SwitchToggle enabled={shippingConfig.correiosConfig.enabled} onChange={enabled => handleCorreiosConfigChange('enabled', enabled)} label="Ativar cálculo simulado de PAC e SEDEX" />
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Esta é uma simulação para fins de demonstração. Para taxas reais, é necessária integração com um sistema de backend.</p>
                {shippingConfig.correiosConfig.enabled && (
                    <div className="pt-4 border-t dark:border-gray-700 space-y-4">
                        <InputGroup label="CEP de Origem (para cálculo)"><input type="text" value={shippingConfig.correiosConfig.originCep} onChange={e => handleCorreiosConfigChange('originCep', e.target.value)} className="block w-full max-w-xs shadow-sm sm:text-sm border-gray-300 rounded-md" /></InputGroup>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pacote Padrão</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Usado quando um produto não tem dimensões/peso.</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <InputGroup label="Peso (kg)"><input type="number" step="0.1" value={shippingConfig.correiosConfig.defaultWeight} onChange={e => handleCorreiosConfigChange('defaultWeight', Number(e.target.value))} className="sm:text-sm border-gray-300 rounded-md w-full" /></InputGroup>
                                <InputGroup label="Comp. (cm)"><input type="number" value={shippingConfig.correiosConfig.defaultLength} onChange={e => handleCorreiosConfigChange('defaultLength', Number(e.target.value))} className="sm:text-sm border-gray-300 rounded-md w-full" /></InputGroup>
                                <InputGroup label="Larg. (cm)"><input type="number" value={shippingConfig.correiosConfig.defaultWidth} onChange={e => handleCorreiosConfigChange('defaultWidth', Number(e.target.value))} className="sm:text-sm border-gray-300 rounded-md w-full" /></InputGroup>
                                <InputGroup label="Alt. (cm)"><input type="number" value={shippingConfig.correiosConfig.defaultHeight} onChange={e => handleCorreiosConfigChange('defaultHeight', Number(e.target.value))} className="sm:text-sm border-gray-300 rounded-md w-full" /></InputGroup>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Configuração PAC</h4>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    <InputGroup label="Custo Base (R$)"><input type="number" step="0.01" value={shippingConfig.correiosConfig.pacBaseCost} onChange={e => handleCorreiosConfigChange('pacBaseCost', Number(e.target.value))} className="sm:text-sm border-gray-300 rounded-md w-full" /></InputGroup>
                                    <InputGroup label="Custo por Kg (R$)"><input type="number" step="0.01" value={shippingConfig.correiosConfig.pacKgCost} onChange={e => handleCorreiosConfigChange('pacKgCost', Number(e.target.value))} className="sm:text-sm border-gray-300 rounded-md w-full" /></InputGroup>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Configuração SEDEX</h4>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    <InputGroup label="Custo Base (R$)"><input type="number" step="0.01" value={shippingConfig.correiosConfig.sedexBaseCost} onChange={e => handleCorreiosConfigChange('sedexBaseCost', Number(e.target.value))} className="sm:text-sm border-gray-300 rounded-md w-full" /></InputGroup>
                                    <InputGroup label="Custo por Kg (R$)"><input type="number" step="0.01" value={shippingConfig.correiosConfig.sedexKgCost} onChange={e => handleCorreiosConfigChange('sedexKgCost', Number(e.target.value))} className="sm:text-sm border-gray-300 rounded-md w-full" /></InputGroup>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default ShippingManager;
