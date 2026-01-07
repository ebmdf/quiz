
import React, { useState, useEffect } from 'react';
import type { MusicTrack, SiteConfig } from '../../types';
import { useSite } from '../../context/SiteContext';
import { TrashIcon, PlusIcon, MusicIcon } from '../Icons';

const useObjectURL = (file?: File | Blob) => {
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (!file) {
            setUrl(undefined);
            return;
        };
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);
    return url;
};

const MusicTrackItem: React.FC<{track: MusicTrack, onRemove: (id: string) => void}> = ({ track, onRemove }) => {
    const trackUrl = useObjectURL(track.file);
    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 rounded-md">
            <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                   <MusicIcon className="h-5 w-5 text-gray-500 dark:text-gray-400"/>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-gray-900 dark:text-white">{track.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{track.artist || 'Artista desconhecido'}</p>
                    {trackUrl && <audio src={trackUrl} controls className="h-8 w-full max-w-xs mt-1" />}
                </div>
            </div>
            <button onClick={() => onRemove(track.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 ml-4"><TrashIcon /></button>
        </div>
    )
}

const MusicManager: React.FC = () => {
    const { musicTracks, setMusicTracks, siteConfig, setSiteConfig } = useSite();
    const [name, setName] = useState('');
    const [artist, setArtist] = useState('');
    const [musicFile, setMusicFile] = useState<File | null>(null);
    const [formKey, setFormKey] = useState(Date.now());

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMusicFile(e.target.files[0]);
        } else {
            setMusicFile(null);
        }
    };

    const handleAddTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (!musicFile) {
            alert('Por favor, selecione um arquivo de música.');
            return;
        }

        const newTrack: MusicTrack = {
            id: new Date().toISOString(),
            name: name || musicFile.name,
            artist,
            file: musicFile
        };
        
        setMusicTracks([...musicTracks, newTrack]);
        setName('');
        setArtist('');
        setMusicFile(null);
        setFormKey(Date.now());
    };

    const handleRemoveTrack = (id: string) => {
        setMusicTracks(musicTracks.filter(d => d.id !== id));
    };

    const handleGlobalConfigChange = (field: keyof SiteConfig['globalMusicConfig'], value: any) => {
        setSiteConfig(prev => ({
            ...prev,
            globalMusicConfig: {
                ...prev.globalMusicConfig,
                [field]: value,
            }
        }));
    };
    
    const handleGlobalTrackToggle = (trackId: string) => {
        const currentTrackIds = siteConfig.globalMusicConfig.trackIds || [];
        const newTrackIds = currentTrackIds.includes(trackId)
            ? currentTrackIds.filter(id => id !== trackId)
            : [...currentTrackIds, trackId];
        handleGlobalConfigChange('trackIds', newTrackIds);
    };

    return (
        <div className="space-y-8">
             <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Gerenciar Músicas</h3>
                <form key={formKey} onSubmit={handleAddTrack} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4 mb-6">
                    <div>
                        <label htmlFor="track-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Música (opcional)</label>
                        <input type="text" id="track-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="Se vazio, usa o nome do arquivo" />
                    </div>
                    <div>
                        <label htmlFor="track-artist" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Artista (opcional)</label>
                        <input type="text" id="track-artist" value={artist} onChange={e => setArtist(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload de Arquivo de Áudio</label>
                        <input id="file-upload" type="file" onChange={handleFileChange} accept="audio/*" required className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                        {musicFile && <p className="text-sm text-green-700 dark:text-green-400 mt-2">Arquivo selecionado: {musicFile.name}</p>}
                    </div>
                    <div className="text-right">
                        <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"><PlusIcon /> Adicionar Música</button>
                    </div>
                </form>
                <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Músicas Adicionadas</h4>
                <div className="space-y-2">
                    {musicTracks.map(track => (
                        <MusicTrackItem key={track.id} track={track} onRemove={handleRemoveTrack} />
                    ))}
                    {musicTracks.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma música adicionada.</p>}
                </div>
             </div>

             <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Configurações do Player Global</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                     <div className="space-y-4">
                        <div className="border-t dark:border-gray-700 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div><label htmlFor="global-bg-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor de Fundo</label><input type="color" id="global-bg-color" value={siteConfig.globalMusicConfig.backgroundColor} onChange={e => handleGlobalConfigChange('backgroundColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" /></div>
                           <div><label htmlFor="global-primary-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor Primária</label><input type="color" id="global-primary-color" value={siteConfig.globalMusicConfig.primaryColor} onChange={e => handleGlobalConfigChange('primaryColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" /></div>
                           <div><label htmlFor="global-text-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor do Texto</label><input type="color" id="global-text-color" value={siteConfig.globalMusicConfig.textColor} onChange={e => handleGlobalConfigChange('textColor', e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" /></div>
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Playlist Global ({siteConfig.globalMusicConfig.trackIds.length} selecionadas)</label>
                            <div className="max-h-60 overflow-y-auto border dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-700 space-y-1">
                                {musicTracks.map(track => (
                                    <label key={track.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={siteConfig.globalMusicConfig.trackIds.includes(track.id)} 
                                            onChange={() => handleGlobalTrackToggle(track.id)} 
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                        />
                                        <span className="text-sm text-gray-800 dark:text-gray-200">{track.name} {track.artist && <span className="text-xs text-gray-500 dark:text-gray-400">- {track.artist}</span>}</span>
                                    </label>
                                ))}
                                {musicTracks.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Nenhuma música adicionada.</p>}
                            </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-x-6 gap-y-2 pt-2 border-t dark:border-gray-700">
                            <label className="flex items-center text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={siteConfig.globalMusicConfig.autoplay} onChange={e => handleGlobalConfigChange('autoplay', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" /> 
                                <span className="ml-2 text-sm">Autoplay</span>
                            </label>
                            <label className="flex items-center text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={siteConfig.globalMusicConfig.loop} onChange={e => handleGlobalConfigChange('loop', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" /> 
                                <span className="ml-2 text-sm">Repetir Playlist</span>
                            </label>
                            <label className="flex items-center text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={siteConfig.globalMusicConfig.shuffle} onChange={e => handleGlobalConfigChange('shuffle', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" /> 
                                <span className="ml-2 text-sm">Aleatório (Shuffle)</span>
                            </label>
                            <label className="flex items-center text-gray-700 dark:text-gray-300">
                                <input type="checkbox" id="global-player-show-mobile" checked={!!siteConfig.globalMusicConfig.showOnMobile} onChange={e => handleGlobalConfigChange('showOnMobile', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                <span className="ml-2 text-sm">Mostrar em dispositivos móveis</span>
                            </label>
                        </div>
                        
                        <div className="border-t dark:border-gray-700 pt-4 space-y-3">
                            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300">Visualizador Gráfico</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="visualizer-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Visualizador</label>
                                    <select 
                                        id="visualizer-type" 
                                        value={siteConfig.globalMusicConfig.visualizerType}
                                        onChange={e => handleGlobalConfigChange('visualizerType', e.target.value as any)}
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="none">Nenhum</option>
                                        <option value="bars">Barras</option>
                                        <option value="circle">Círculo</option>
                                        <option value="wave">Onda</option>
                                    </select>
                                </div>
                                <div className={siteConfig.globalMusicConfig.visualizerType === 'none' ? 'opacity-50' : ''}>
                                    <label htmlFor="visualizer-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor do Visualizador</label>
                                    <input 
                                        type="color" 
                                        id="visualizer-color" 
                                        value={siteConfig.globalMusicConfig.visualizerColor}
                                        onChange={e => handleGlobalConfigChange('visualizerColor', e.target.value)}
                                        disabled={siteConfig.globalMusicConfig.visualizerType === 'none'}
                                        className="h-10 w-full mt-1 rounded-md border-gray-300 dark:border-gray-600" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t dark:border-gray-700 pt-4 space-y-3">
                            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300">Ícone de Acesso Rápido</h4>
                            <div className="flex items-center p-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600">
                                <input 
                                    type="checkbox" 
                                    id="quick-access-enabled" 
                                    checked={siteConfig.globalMusicConfig.enabled}
                                    onChange={e => handleGlobalConfigChange('enabled', e.target.checked)}
                                    className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                />
                                <label htmlFor="quick-access-enabled" className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-200">
                                   Ativar Player de Música Flutuante
                                </label>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${!siteConfig.globalMusicConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div>
                                    <label htmlFor="quick-access-position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Posição</label>
                                    <select 
                                        id="quick-access-position" 
                                        value={siteConfig.globalMusicConfig.quickAccessIcon?.position}
                                        onChange={e => handleGlobalConfigChange('quickAccessIcon', { ...siteConfig.globalMusicConfig.quickAccessIcon, position: e.target.value as any })}
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="header-left">Topo (Esquerda)</option>
                                        <option value="header-right">Topo (Direita)</option>
                                        <option value="footer-left">Rodapé (Esquerda)</option>
                                        <option value="footer-right">Rodapé (Direita)</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="quick-access-size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho</label>
                                    <select 
                                        id="quick-access-size" 
                                        value={siteConfig.globalMusicConfig.quickAccessIcon?.size}
                                        onChange={e => handleGlobalConfigChange('quickAccessIcon', { ...siteConfig.globalMusicConfig.quickAccessIcon, size: e.target.value as any })}
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="small">Pequeno</option>
                                        <option value="medium">Médio</option>
                                        <option value="large">Grande</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="quick-access-icon-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor do Ícone</label>
                                    <input type="color" id="quick-access-icon-color" value={siteConfig.globalMusicConfig.quickAccessIcon?.iconColor || '#1f2937'} onChange={e => handleGlobalConfigChange('quickAccessIcon', { ...siteConfig.globalMusicConfig.quickAccessIcon, iconColor: e.target.value })} className="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label htmlFor="quick-access-bg-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fundo</label>
                                    <input type="text" id="quick-access-bg-color" value={siteConfig.globalMusicConfig.quickAccessIcon?.iconBgColor || 'rgba(243, 244, 246, 0.9)'} onChange={e => handleGlobalConfigChange('quickAccessIcon', { ...siteConfig.globalMusicConfig.quickAccessIcon, iconBgColor: e.target.value })} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="ex: #FFFFFF or rgba(255,255,255,0.8)" />
                                </div>
                                 <div className="lg:col-span-2">
                                    <label htmlFor="quick-access-opacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transparência ({Math.round((siteConfig.globalMusicConfig.quickAccessIcon?.opacity ?? 1) * 100)}%)</label>
                                    <input 
                                        type="range" id="quick-access-opacity" 
                                        min="0.1" max="1" step="0.1" 
                                        value={siteConfig.globalMusicConfig.quickAccessIcon?.opacity || 1}
                                        onChange={e => handleGlobalConfigChange('quickAccessIcon', { ...siteConfig.globalMusicConfig.quickAccessIcon, opacity: parseFloat(e.target.value) })}
                                        className="mt-1 block w-full" 
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MusicManager;
