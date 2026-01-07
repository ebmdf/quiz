
import React, { useState } from 'react';
import type { SiteCategory, NavigationItem, MusicTrack, MusicPlayerConfig, VisualizerType } from '../../types';
import { useSite } from '../../context/SiteContext';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, PencilIcon, PlusIcon, XIcon, ListIcon, MenuIcon } from '../Icons';

const availableTypes: { value: SiteCategory['type']; label: string }[] = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'wordsearch', label: 'Caça Palavras' },
    { value: 'products', label: 'Vitrine de Produtos' },
    { value: 'downloads', label: 'Downloads' },
    { value: 'reviews', label: 'Reviews' },
    { value: 'custom', label: 'Página Customizada' },
    { value: 'music', label: 'Player de Música' },
];

const SwitchToggle: React.FC<{ enabled: boolean; onChange: () => void; size?: 'sm' | 'md'; label?: string }> = ({ enabled, onChange, size = 'md', label }) => (
    <div className="flex items-center">
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex flex-shrink-0 ${size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'} border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
        >
            <span className="sr-only">Toggle</span>
            <span aria-hidden="true" className={`inline-block ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${enabled ? (size === 'sm' ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0'}`} />
        </button>
        {label && <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{label}</span>}
    </div>
);

// --- Sub Item Editor Component (Recursive) ---
const SubItemEditor: React.FC<{
    subItems: NavigationItem[];
    onChange: (items: NavigationItem[]) => void;
    level?: number;
}> = ({ subItems, onChange, level = 0 }) => {
    const { siteConfig } = useSite();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    
    // State for the item currently being added or edited
    const [tempItem, setTempItem] = useState<NavigationItem>({ 
        id: '', 
        name: '', 
        categoryIds: [], 
        enabled: true, 
        order: 0,
        color: '#6366f1',
        isSubMenu: false,
        subItems: []
    });

    const startEditing = (index: number) => {
        setEditingIndex(index);
        // Ensure subItems is initialized
        setTempItem({ subItems: [], ...subItems[index] });
        setSearchTerm('');
        setFilterType('all');
    };

    const startAdding = () => {
        setEditingIndex(-1); // -1 indicates new item
        setTempItem({ 
            id: Date.now().toString(), 
            name: '', 
            categoryIds: [], 
            enabled: true, 
            order: subItems.length,
            color: '#6366f1',
            isSubMenu: false,
            subItems: []
        });
        setSearchTerm('');
        setFilterType('all');
    };

    const cancelEdit = () => {
        setEditingIndex(null);
    };

    const saveItem = () => {
        if (!tempItem.name.trim()) {
            alert("O nome do item é obrigatório.");
            return;
        }

        const newItems = [...subItems];
        const itemToSave = { ...tempItem, id: tempItem.id || Date.now().toString() };
        
        if (editingIndex === -1) {
            newItems.push(itemToSave);
        } else if (editingIndex !== null) {
            newItems[editingIndex] = itemToSave;
        }
        onChange(newItems);
        setEditingIndex(null);
    };
    
    const deleteItem = (index: number) => {
        if (window.confirm("Tem certeza que deseja remover este item do menu?")) {
            const newItems = subItems.filter((_, i) => i !== index);
            onChange(newItems);
        }
    };

    const toggleItemEnabled = (index: number) => {
        const newItems = [...subItems];
        newItems[index].enabled = !newItems[index].enabled;
        onChange(newItems);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...subItems];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newItems.length) return;
        
        const temp = newItems[index];
        newItems[index] = newItems[swapIndex];
        newItems[swapIndex] = temp;
        onChange(newItems);
    };

    const handleCategoryToggleForTemp = (catId: string) => {
        const currentIds = tempItem.categoryIds || [];
        const newIds = currentIds.includes(catId) 
            ? currentIds.filter(id => id !== catId) 
            : [...currentIds, catId];
        setTempItem({...tempItem, categoryIds: newIds});
    };

    const filteredCategories = siteConfig.siteCategories.filter(cat => 
        (filterType === 'all' || cat.type === filterType) &&
        (cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         cat.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Render Editor Mode
    if (editingIndex !== null) {
        return (
            <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-100 dark:border-indigo-900 shadow-sm animate-fade-in mt-2 ${level > 0 ? 'ml-4 border-l-4 border-l-indigo-300' : ''}`}>
                <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-4 border-b border-indigo-50 dark:border-indigo-800 pb-2">
                    {editingIndex === -1 ? 'Adicionar Item' : 'Editar Item'} (Nível {level + 2})
                </h4>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Nome do Item</label>
                            <input 
                                type="text" 
                                value={tempItem.name} 
                                onChange={e => setTempItem({...tempItem, name: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Ex: Smartphones, Jogos..."
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Cor do Item</label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="color"
                                    value={tempItem.color || '#6366f1'}
                                    onChange={e => setTempItem({ ...tempItem, color: e.target.value })}
                                    className="h-9 w-12 rounded-md border border-gray-300 cursor-pointer"
                                />
                                <input 
                                    type="text" 
                                    value={tempItem.color || '#6366f1'} 
                                    onChange={e => setTempItem({ ...tempItem, color: e.target.value })}
                                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                        <SwitchToggle 
                            enabled={tempItem.isSubMenu || false} 
                            onChange={() => setTempItem({...tempItem, isSubMenu: !tempItem.isSubMenu})} 
                            label="Este item é um Sub-menu? (Contém mais opções)"
                        />
                    </div>

                    {tempItem.isSubMenu ? (
                        <div className="border-l-4 border-gray-200 dark:border-gray-600 pl-4 mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Gerencie os itens dentro de "{tempItem.name || 'Novo Item'}":</p>
                            <SubItemEditor 
                                subItems={tempItem.subItems || []} 
                                onChange={(items) => setTempItem({...tempItem, subItems: items})} 
                                level={level + 1}
                            />
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                                Conteúdo Vinculado (Ao clicar, mostrar:)
                            </label>
                            
                            {/* Content Type Filter */}
                            <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                <select 
                                    value={filterType} 
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="block w-full sm:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="all">Todos os Tipos</option>
                                    {availableTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <div className="relative w-full sm:w-1/2">
                                    <input 
                                        type="text" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar nome..."
                                        className="w-full text-sm border-gray-300 rounded-md p-2 pl-8 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                    <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 p-1 space-y-1 custom-scrollbar">
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(cat => (
                                        <label key={cat.id} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all border border-transparent ${tempItem.categoryIds.includes(cat.id) ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
                                            <input
                                                type="checkbox"
                                                checked={tempItem.categoryIds.includes(cat.id)}
                                                onChange={() => handleCategoryToggleForTemp(cat.id)}
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{cat.name}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold flex-shrink-0
                                                        ${cat.type === 'products' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                                                          cat.type === 'quiz' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                          'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'}`}>
                                                        {availableTypes.find(t => t.value === cat.type)?.label || cat.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                                        <p className="text-sm italic">Nenhum conteúdo encontrado.</p>
                                        {filterType !== 'all' && <button onClick={() => setFilterType('all')} className="mt-2 text-indigo-600 text-xs hover:underline">Ver todos</button>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" onClick={cancelEdit} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm">Cancelar</button>
                        <button type="button" onClick={saveItem} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm">
                            {editingIndex === -1 ? 'Adicionar à Lista' : 'Salvar Item'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render List Mode
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 overflow-hidden mt-2">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <ListIcon className="h-4 w-4 text-gray-500 dark:text-gray-400"/> Itens do Menu (Nível {level + 2})
                </h4>
                <button type="button" onClick={startAdding} className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium flex items-center gap-1 shadow-sm transition-colors">
                    <PlusIcon className="h-3 w-3"/> Adicionar
                </button>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 max-h-96 overflow-y-auto">
                {subItems.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                        <MenuIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        Este menu está vazio.
                    </div>
                ) : (
                    subItems.map((item, index) => (
                        <div key={item.id || index} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex flex-col items-center justify-center w-6 text-gray-300 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400">
                                     <button type="button" onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-0.5 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-20"><ArrowUpIcon className="h-3 w-3"/></button>
                                     <button type="button" onClick={() => moveItem(index, 'down')} disabled={index === subItems.length - 1} className="p-0.5 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-20"><ArrowDownIcon className="h-3 w-3"/></button>
                                </div>
                                <div className="min-w-0 pl-2 border-l-2 border-transparent group-hover:border-indigo-200 dark:group-hover:border-indigo-700 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div style={{width: 8, height: 8, backgroundColor: item.color || '#6366f1'}} className="rounded-full border border-gray-300"></div>
                                        <p className={`text-sm font-semibold truncate ${!item.enabled ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {item.name}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {item.isSubMenu 
                                            ? <span className="text-indigo-500 font-medium">Sub-menu com {item.subItems?.length || 0} itens</span> 
                                            : `${item.categoryIds.length} blocos vinculados`}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <SwitchToggle enabled={item.enabled} onChange={() => toggleItemEnabled(index)} size="sm" />
                                <div className="flex gap-1 border-l dark:border-gray-600 pl-3">
                                    <button type="button" onClick={() => startEditing(index)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors" title="Editar"><PencilIcon className="h-4 w-4"/></button>
                                    <button 
                                        type="button"
                                        onClick={() => deleteItem(index)} 
                                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" 
                                        title="Excluir"
                                    >
                                        <TrashIcon className="h-4 w-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const NavItemEditorModal: React.FC<{
    navItem: NavigationItem;
    setNavItem: (item: NavigationItem) => void;
    onSave: () => void;
    onClose: () => void;
}> = ({ navItem, setNavItem, onSave, onClose }) => {
    const { siteConfig } = useSite();
    const [searchTerm, setSearchTerm] = useState('');

    const handleCategoryToggle = (catId: string) => {
        const newCategoryIds = navItem.categoryIds.includes(catId)
            ? navItem.categoryIds.filter(id => id !== catId)
            : [...navItem.categoryIds, catId];
        setNavItem({ ...navItem, categoryIds: newCategoryIds });
    };

    const filteredCategories = siteConfig.siteCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Editar Página de Navegação</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-1.5 rounded-full transition-colors"><XIcon /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nome do Item no Menu</label>
                            <input
                                type="text"
                                value={navItem.name}
                                onChange={e => setNavItem({ ...navItem, name: e.target.value })}
                                className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Ex: Início"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Cor do Botão</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={navItem.color || '#6366f1'}
                                    onChange={e => setNavItem({ ...navItem, color: e.target.value })}
                                    className="h-9 w-12 rounded-md border border-gray-300 cursor-pointer"
                                />
                                <input 
                                    type="text" 
                                    value={navItem.color || '#6366f1'} 
                                    onChange={e => setNavItem({ ...navItem, color: e.target.value })}
                                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Tipo de Item</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                type="button"
                                onClick={() => setNavItem({ ...navItem, isSubMenu: false })}
                                className={`p-3 rounded-md border-2 flex flex-col items-center text-center transition-all ${!navItem.isSubMenu ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'}`}
                            >
                                <span className="font-semibold text-sm">Link Direto</span>
                                <span className="text-xs opacity-80 mt-1">Abre uma página única</span>
                            </button>
                            <button 
                                type="button"
                                onClick={() => setNavItem({ ...navItem, isSubMenu: true })}
                                className={`p-3 rounded-md border-2 flex flex-col items-center text-center transition-all ${navItem.isSubMenu ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'}`}
                            >
                                <span className="font-semibold text-sm">Menu Dropdown</span>
                                <span className="text-xs opacity-80 mt-1">Contém subcategorias</span>
                            </button>
                        </div>
                    </div>

                    {navItem.isSubMenu ? (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Itens do Menu Dropdown</label>
                            <SubItemEditor 
                                subItems={navItem.subItems || []} 
                                onChange={(items) => setNavItem({ ...navItem, subItems: items })} 
                            />
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Conteúdo da Página</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Selecione os blocos que serão exibidos nesta página.</p>
                            <div className="mb-2">
                                <input 
                                    type="text" 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    placeholder="Buscar blocos..." 
                                    className="w-full text-sm border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 p-1 rounded-md bg-white dark:bg-gray-700 space-y-1 custom-scrollbar">
                                {filteredCategories.map(cat => (
                                    <label key={cat.id} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${navItem.categoryIds.includes(cat.id) ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800' : 'hover:bg-gray-50 dark:hover:bg-gray-600 border border-transparent'}`}>
                                        <input
                                            type="checkbox"
                                            checked={navItem.categoryIds.includes(cat.id)}
                                            onChange={() => handleCategoryToggle(cat.id)}
                                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 rounded-full">{availableTypes.find(t=>t.value === cat.type)?.label}</span>
                                        </div>
                                    </label>
                                ))}
                                {filteredCategories.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 p-2 text-center italic">Nenhum bloco encontrado.</p>}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-colors">Cancelar</button>
                    <button type="button" onClick={onSave} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-colors">Salvar Alterações</button>
                </div>
            </div>
        </div>
    );
};

const MusicConfigEditorModal: React.FC<{
    category: SiteCategory;
    onClose: () => void;
    onSave: (category: SiteCategory) => void;
    allMusicTracks: MusicTrack[];
}> = ({ category, onClose, onSave, allMusicTracks }) => {
    const [config, setConfig] = useState<MusicPlayerConfig>(category.musicPlayerConfig!);

    const handleConfigChange = (field: keyof MusicPlayerConfig, value: any) => {
        setConfig(prev => ({ ...prev!, [field]: value }));
    };

    const handleTrackToggle = (trackId: string) => {
        const newTrackIds = config.trackIds.includes(trackId)
            ? config.trackIds.filter(id => id !== trackId)
            : [...config.trackIds, trackId];
        handleConfigChange('trackIds', newTrackIds);
    };

    const handleSave = () => {
        onSave({ ...category, musicPlayerConfig: config });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200]" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl flex flex-col p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Configurar Player de Música: {category.name}</h3>
                    <button type="button" onClick={onClose} className="text-gray-500 dark:text-gray-300"><XIcon /></button>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-2">
                    {/* Track Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Músicas nesta Playlist ({config.trackIds.length} selecionadas)</label>
                        <div className="max-h-48 overflow-y-auto border dark:border-gray-600 p-2 rounded-md bg-gray-50 dark:bg-gray-700 space-y-1">
                            {allMusicTracks.map(track => (
                                <label key={track.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.trackIds.includes(track.id)}
                                        onChange={() => handleTrackToggle(track.id)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-800 dark:text-gray-200">{track.name} {track.artist && <span className="text-xs text-gray-500 dark:text-gray-400">- {track.artist}</span>}</span>
                                </label>
                            ))}
                            {allMusicTracks.length === 0 && <p className="text-xs text-center text-gray-500 dark:text-gray-400">Nenhuma música adicionada. Adicione músicas na seção "Músicas".</p>}
                        </div>
                    </div>

                    {/* Boolean Toggles */}
                    <div className="flex items-center flex-wrap gap-x-6 gap-y-2 pt-2 border-t dark:border-gray-700">
                        <label className="flex items-center text-gray-700 dark:text-gray-300"><input type="checkbox" checked={config.autoplay} onChange={e => handleConfigChange('autoplay', e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" /> <span className="ml-2 text-sm">Autoplay</span></label>
                        <label className="flex items-center text-gray-700 dark:text-gray-300"><input type="checkbox" checked={config.loop} onChange={e => handleConfigChange('loop', e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" /> <span className="ml-2 text-sm">Repetir Playlist</span></label>
                        <label className="flex items-center text-gray-700 dark:text-gray-300"><input type="checkbox" checked={config.showPlaylist} onChange={e => handleConfigChange('showPlaylist', e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" /> <span className="ml-2 text-sm">Mostrar Playlist</span></label>
                        <label className="flex items-center text-gray-700 dark:text-gray-300"><input type="checkbox" checked={config.playAcrossPages} onChange={e => handleConfigChange('playAcrossPages', e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" /> <span className="ml-2 text-sm">Tocar entre páginas</span></label>
                    </div>

                    {/* Style and Size */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t dark:border-gray-700">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estilo do Player</label>
                            <select value={config.playerStyle} onChange={e => handleConfigChange('playerStyle', e.target.value as any)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                <option value="standard">Padrão</option>
                                <option value="compact">Compacto</option>
                                <option value="full-art">Arte Completa</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho Pré-definido</label>
                            <select value={config.sizePreset} onChange={e => handleConfigChange('sizePreset', e.target.value as any)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                <option value="small">Pequeno</option>
                                <option value="medium">Médio</option>
                                <option value="large">Grande</option>
                                <option value="custom">Customizado</option>
                            </select>
                        </div>
                    </div>
                    {config.sizePreset === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" value={config.customWidth || ''} onChange={e => handleConfigChange('customWidth', e.target.value)} placeholder="Largura (ex: 100%, 400px)" className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            <input type="text" value={config.customHeight || ''} onChange={e => handleConfigChange('customHeight', e.target.value)} placeholder="Altura (ex: auto, 500px)" className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                    )}

                    {/* Visualizer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t dark:border-gray-700">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Visualizador</label>
                            <select value={config.visualizerType} onChange={e => handleConfigChange('visualizerType', e.target.value as any)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                <option value="none">Nenhum</option>
                                <option value="bars">Barras</option>
                                <option value="circle">Círculo</option>
                                <option value="wave">Onda</option>
                            </select>
                        </div>
                        <div className={config.visualizerType === 'none' ? 'opacity-50' : ''}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor do Visualizador</label>
                            <input type="color" value={config.visualizerColor || '#6366f1'} onChange={e => handleConfigChange('visualizerColor', e.target.value)} disabled={config.visualizerType === 'none'} className="mt-1 block w-full h-10 rounded-md border-gray-300" />
                        </div>
                    </div>
                    
                    {/* Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t dark:border-gray-700">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor de Fundo</label>
                            <input type="color" value={config.backgroundColor || '#1f2937'} onChange={e => handleConfigChange('backgroundColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor Primária</label>
                            <input type="color" value={config.primaryColor || '#6366f1'} onChange={e => handleConfigChange('primaryColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor do Texto</label>
                            <input type="color" value={config.textColor || '#ffffff'} onChange={e => handleConfigChange('textColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300" />
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-right space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md">Cancelar</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Salvar Configurações</button>
                </div>
            </div>
        </div>
    );
};

const CategoryManager: React.FC = () => {
    const { siteConfig, setSiteConfig, musicTracks } = useSite();

    // State for Modals
    const [editingNavItem, setEditingNavItem] = useState<NavigationItem | null>(null);
    const [editingCategory, setEditingCategory] = useState<SiteCategory | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [editingMusicConfig, setEditingMusicConfig] = useState<SiteCategory | null>(null);

    // --- Navigation Item Management ---
    const handleAddNavItem = () => {
        const newNavItem: NavigationItem = {
            id: new Date().getTime().toString(),
            name: 'Nova Página',
            categoryIds: [],
            enabled: true,
            order: siteConfig.navigationItems.length,
            color: '#6366f1',
            isSubMenu: false,
            subItems: []
        };
        setSiteConfig(prev => ({ ...prev, navigationItems: [...prev.navigationItems, newNavItem] }));
        setEditingNavItem(newNavItem); // Open editor for the new item
    };
    
    const handleUpdateNavItem = (updatedItem: NavigationItem) => {
        setSiteConfig(prev => ({
            ...prev,
            navigationItems: prev.navigationItems.map(item => item.id === updatedItem.id ? updatedItem : item)
        }));
    };

    const handleRemoveNavItem = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este item de navegação?')) {
            setSiteConfig(prev => ({
                ...prev,
                navigationItems: prev.navigationItems.filter(item => item.id !== id)
            }));
        }
    };
    
    const handleMoveNavItem = (index: number, direction: 'up' | 'down') => {
        const items = [...siteConfig.navigationItems].sort((a, b) => a.order - b.order);
        const item = items[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= items.length) return;
        items[index] = items[swapIndex];
        items[swapIndex] = item;
        const reordered = items.map((nav, idx) => ({ ...nav, order: idx }));
        setSiteConfig(prev => ({ ...prev, navigationItems: reordered }));
    };

    // --- Content Blocks Management ---
    const handleAddCategory = (type: SiteCategory['type']) => {
        const defaultName = availableTypes.find(t => t.value === type)?.label || 'Novo Bloco';
        const newCategory: SiteCategory = {
            id: new Date().getTime().toString(),
            name: defaultName,
            type: type,
            enabled: true,
            order: siteConfig.siteCategories.length,
            color: '#8b5cf6',
            content: type === 'custom' ? '<p>Edite este conteúdo...</p>' : undefined,
            musicPlayerConfig: type === 'music' ? {
                trackIds: [],
                autoplay: false,
                loop: false,
                showPlaylist: true,
                sizePreset: 'medium',
                playerStyle: 'standard',
                visualizerType: 'bars',
                visualizerColor: '#6366f1',
                backgroundColor: '#1f2937',
                primaryColor: '#6366f1',
                textColor: '#ffffff',
                playAcrossPages: false,
            } : undefined,
        };
        setSiteConfig(prev => ({ ...prev, siteCategories: [...prev.siteCategories, newCategory] }));
    };

    const handleUpdateCategory = (updatedCategory: SiteCategory) => {
        setSiteConfig(prev => ({
            ...prev,
            siteCategories: prev.siteCategories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
        }));
    };

    const handleRemoveCategory = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este bloco de conteúdo? Ele também será removido de todas as páginas de navegação.')) {
            setSiteConfig(prev => ({
                ...prev,
                siteCategories: prev.siteCategories.filter(c => c.id !== id),
                navigationItems: prev.navigationItems.map(nav => ({
                    ...nav,
                    categoryIds: nav.categoryIds.filter(catId => catId !== id)
                }))
            }));
        }
    };
    
    // --- Modal Logic ---
    const handleSaveContent = () => {
        if (!editingCategory) return;
        handleUpdateCategory({ ...editingCategory, content: editingContent });
        setEditingCategory(null);
        setEditingContent('');
    };
    
    const handleSaveNavItem = () => {
        if (!editingNavItem) return;
        handleUpdateNavItem(editingNavItem);
        setEditingNavItem(null);
    };

    const sortedNavItems = [...siteConfig.navigationItems].sort((a,b) => a.order - b.order);

    return (
        <div className="space-y-8">
            {/* --- Modals --- */}
            {editingNavItem && <NavItemEditorModal navItem={editingNavItem} setNavItem={setEditingNavItem} onSave={handleSaveNavItem} onClose={() => setEditingNavItem(null)} />}
            {editingMusicConfig && <MusicConfigEditorModal 
                category={editingMusicConfig} 
                onClose={() => setEditingMusicConfig(null)} 
                onSave={(updatedCategory) => {
                    handleUpdateCategory(updatedCategory);
                    setEditingMusicConfig(null);
                }} 
                allMusicTracks={musicTracks}
            />}
            {editingCategory && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200]" onClick={() => setEditingCategory(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col p-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Editar Conteúdo de: {editingCategory.name}</h3>
                        <textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="w-full flex-grow p-2 border rounded-md font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Insira seu HTML aqui..." />
                        <div className="mt-4 text-right space-x-2"><button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md">Cancelar</button><button type="button" onClick={handleSaveContent} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Salvar Conteúdo</button></div>
                    </div>
                </div>
            )}

            {/* --- Navigation Items Section --- */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Itens de Navegação (Páginas)</h3>
                    <button type="button" onClick={handleAddNavItem} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"><PlusIcon className="h-4 w-4 mr-1"/> Nova Página</button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-2">
                    {sortedNavItems.map((item, index) => (
                         <div key={item.id} className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 border dark:border-gray-700 rounded-md shadow-sm gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div style={{width: 24, height: 24, backgroundColor: item.color}} className="rounded-full flex-shrink-0 shadow-inner border border-black/10"></div>
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-200 truncate flex items-center gap-2">
                                        {item.name}
                                        {item.isSubMenu && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">Dropdown</span>}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.isSubMenu 
                                            ? `${item.subItems?.length || 0} subcategoria(s)` 
                                            : `${item.categoryIds.length} bloco(s) de conteúdo`
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <SwitchToggle enabled={item.enabled} onChange={() => handleUpdateNavItem({ ...item, enabled: !item.enabled })} size="sm" />
                                <div className="flex items-center text-gray-400 border-l dark:border-gray-600 pl-2 ml-2">
                                    <button type="button" onClick={() => handleMoveNavItem(index, 'up')} disabled={index === 0} className="p-1 rounded hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowUpIcon className="h-4 w-4"/></button>
                                    <button type="button" onClick={() => handleMoveNavItem(index, 'down')} disabled={index === sortedNavItems.length - 1} className="p-1 rounded hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowDownIcon className="h-4 w-4"/></button>
                                </div>
                                <button type="button" onClick={() => setEditingNavItem(item)} className="p-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Editar"><PencilIcon className="h-5 w-5"/></button>
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveNavItem(item.id)} 
                                    className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" 
                                    title="Excluir"
                                >
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        </div>
                    ))}
                    {sortedNavItems.length === 0 && <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-6 italic">Nenhuma página de navegação criada.</p>}
                </div>
            </div>

            {/* --- Content Blocks Section --- */}
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Blocos de Conteúdo Disponíveis</h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                     <div className="space-y-2">
                         {siteConfig.siteCategories.map(cat => (
                             <div key={cat.id} className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 border dark:border-gray-700 rounded-md shadow-sm gap-4">
                                <div className="flex-1">
                                    <input type="text" value={cat.name} onChange={e => handleUpdateCategory({ ...cat, name: e.target.value })} className="text-md font-medium text-gray-800 dark:text-gray-200 border-b-2 border-transparent focus:border-indigo-500 focus:outline-none w-full bg-transparent" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mt-0.5">{cat.type}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {cat.type === 'custom' && <button type="button" onClick={() => { setEditingCategory(cat); setEditingContent(cat.content || ''); }} className="p-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" title="Editar HTML"><PencilIcon /></button>}
                                     {cat.type === 'music' && <button type="button" onClick={() => setEditingMusicConfig(cat)} className="p-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" title="Configurar Player"><PencilIcon /></button>}
                                    <SwitchToggle enabled={cat.enabled} onChange={() => handleUpdateCategory({ ...cat, enabled: !cat.enabled })} size="sm" />
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveCategory(cat.id)} 
                                        disabled={cat.type === 'account'} 
                                        className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Excluir Bloco"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                         ))}
                     </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-4 border-t dark:border-gray-700">
                        {availableTypes.map(type => (
                            <button type="button" key={type.value} onClick={() => handleAddCategory(type.value)} className="text-sm text-center p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-600 hover:border-indigo-300 transition-colors text-gray-700 dark:text-gray-200 font-medium">
                                + {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;
