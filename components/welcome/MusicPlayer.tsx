import React, { useState, useEffect, useMemo } from 'react';
import type { SiteCategory, MusicPlayerConfig, VisualizerType } from '../../types';
import { useSite } from '../../context/SiteContext';
import AudioVisualizer from '../AudioVisualizer';

const PlayIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>);
const PauseIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);
const NextIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>);
const PrevIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>);
const VolumeUpIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>);
const VolumeDownIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V6a1 1 0 00-1-1z" /></svg>);

const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

interface MusicPlayerProps {
    category?: SiteCategory;
    useGlobalConfig?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ category, useGlobalConfig }) => {
    const { siteConfig, musicTracks, audioPlayerState, setAudioPlayerState, audioElementRef, audioContext, logAnalyticsEvent } = useSite();
    
    const config = useGlobalConfig 
        ? siteConfig.globalMusicConfig 
        : category?.musicPlayerConfig;

    const title = useGlobalConfig ? "Playlist Global" : category?.name;

    const playlist = useMemo(() => 
        musicTracks.filter(track => config?.trackIds.includes(track.id)),
        [musicTracks, config]
    );

    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const isThisPlayerActive = audioPlayerState?.config === config;

    useEffect(() => {
        const audio = audioElementRef.current;
        if (!audio) return;
        const timeUpdate = () => setProgress(audio.currentTime);
        const metaData = () => setDuration(audio.duration);
        
        if (isThisPlayerActive) {
            audio.addEventListener('timeupdate', timeUpdate);
            audio.addEventListener('loadedmetadata', metaData);
            setProgress(audio.currentTime);
            setDuration(audio.duration);
        }
        
        return () => {
            audio.removeEventListener('timeupdate', timeUpdate);
            audio.removeEventListener('loadedmetadata', metaData);
        };
    }, [audioElementRef, isThisPlayerActive]);

    useEffect(() => {
        const audio = audioElementRef.current;
        if (audio) setVolume(audio.volume);
    }, [audioElementRef]);

    useEffect(() => {
        return () => {
            if (isThisPlayerActive && !(config as MusicPlayerConfig)?.playAcrossPages) {
                setAudioPlayerState(null);
            }
        };
    }, [isThisPlayerActive, config, setAudioPlayerState]);
    
    if (!config || playlist.length === 0) {
        return (
             <div className="mt-10 p-6 rounded-2xl text-center" style={{ backgroundColor: siteConfig.storeConfig.themeBgColor }}>
                <h2 className="text-2xl font-bold text-center mb-6" style={{ color: siteConfig.storeConfig.themePrimaryColor }}>{title}</h2>
                <p className="text-gray-500">
                    {useGlobalConfig 
                        ? "Nenhuma música na playlist global. Configure na área de admin." 
                        : "Nenhuma música adicionada a este player. Configure na área de admin."}
                </p>
            </div>
        );
    }
    
    const currentTrackIndex = isThisPlayerActive ? audioPlayerState.currentTrackIndex : 0;
    const isPlaying = isThisPlayerActive ? audioPlayerState.isPlaying : false;
    const currentTrack = playlist[currentTrackIndex];

    const handlePlayPause = () => {
        if (audioContext?.state === 'suspended') {
            audioContext.resume();
        }
        if (isThisPlayerActive) {
            setAudioPlayerState(prev => prev ? ({ ...prev, isPlaying: !isPlaying }) : null);
        } else {
            logAnalyticsEvent('music_play', { trackName: playlist[0].name });
            setAudioPlayerState(prev => ({
                playlist,
                originalPlaylist: playlist,
                config,
                currentTrackIndex: 0,
                isPlaying: true,
                shuffle: prev?.shuffle ?? !!(config as any).shuffle,
                volume: prev?.volume ?? audioElementRef.current?.volume ?? 1,
            }));
        }
    };
    
    const handleNext = () => {
        if (!isThisPlayerActive) return;
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        setAudioPlayerState(prev => prev ? ({ ...prev, currentTrackIndex: nextIndex }) : null);
    };

    const handlePrev = () => {
        if (!isThisPlayerActive) return;
        const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        setAudioPlayerState(prev => prev ? ({ ...prev, currentTrackIndex: prevIndex }) : null);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioElementRef.current) {
            audioElementRef.current.currentTime = Number(e.target.value);
            setProgress(Number(e.target.value));
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        setVolume(newVolume);
        if (audioElementRef.current) audioElementRef.current.volume = newVolume;
    };

    const handleSelectTrack = (index: number) => {
        if (audioContext?.state === 'suspended') {
            audioContext.resume();
        }
        if (!isThisPlayerActive || index !== currentTrackIndex) {
            logAnalyticsEvent('music_play', { trackName: playlist[index].name });
        }
        setAudioPlayerState(prev => ({
            playlist,
            originalPlaylist: playlist,
            config,
            currentTrackIndex: index,
            isPlaying: true,
            shuffle: prev?.shuffle ?? !!(config as any).shuffle,
            volume: prev?.volume ?? audioElementRef.current?.volume ?? 1,
        }));
    };

    const sizeClasses = {
        small: 'max-w-sm',
        medium: 'max-w-md',
        large: 'max-w-lg',
        custom: '',
    };
    
    const playerConfig = config as MusicPlayerConfig;
    const playerSizeClass = sizeClasses[playerConfig.sizePreset || 'medium'];

    const customStyle = playerConfig.sizePreset === 'custom' ? {
        width: playerConfig.customWidth || '100%',
        height: playerConfig.customHeight || 'auto'
    } : {};

    const showPlaylist = useGlobalConfig ? true : (config as MusicPlayerConfig).showPlaylist;
    const primaryColor = config.primaryColor || '#6366f1';
    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
    const progressStyle = { '--progress-percent': `${progressPercent}%`, '--progress-color': primaryColor };

    const visualizerType = (useGlobalConfig ? siteConfig.globalMusicConfig.visualizerType : playerConfig.visualizerType) || 'none';
    const visualizerColor = (useGlobalConfig ? siteConfig.globalMusicConfig.visualizerColor : playerConfig.visualizerColor) || primaryColor;

    const renderPlayerLayout = () => {
        const playerStyle = playerConfig.playerStyle || 'standard';

        const trackInfo = (
             <div className="flex-shrink-0 text-center">
                <h3 className={`font-bold truncate ${playerStyle === 'compact' ? 'text-md' : 'text-xl'}`}>{currentTrack.name}</h3>
                <p className={`opacity-70 ${playerStyle === 'compact' ? 'text-sm' : 'text-md'}`}>{currentTrack.artist || 'Artista Desconhecido'}</p>
            </div>
        );

        const progressBar = (
            <div className="flex-shrink-0 space-y-1">
                <input type="range" value={progress} max={duration || 0} onChange={handleSeek} style={progressStyle as React.CSSProperties} className="progress-seek w-full" />
                <div className="flex justify-between text-xs font-mono">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        );

        const controls = (
            <div className={`flex-shrink-0 flex items-center justify-center gap-4 ${playerStyle === 'compact' ? 'my-2' : 'my-4'}`}>
                <button onClick={handlePrev} className="p-2 rounded-full hover:bg-white/10"><PrevIcon className={playerStyle === 'compact' ? 'h-5 w-5' : 'h-6 w-6'} /></button>
                <button onClick={handlePlayPause} className="p-2 rounded-full text-white hover:opacity-90" style={{backgroundColor: primaryColor}}>
                    {isPlaying ? <PauseIcon className={playerStyle === 'compact' ? 'h-8 w-8' : 'h-10 w-10'} /> : <PlayIcon className={playerStyle === 'compact' ? 'h-8 w-8' : 'h-10 w-10'} />}
                </button>
                <button onClick={handleNext} className="p-2 rounded-full hover:bg-white/10"><NextIcon className={playerStyle === 'compact' ? 'h-5 w-5' : 'h-6 w-6'} /></button>
            </div>
        );

        const volumeControl = (
             <div className="flex-shrink-0 flex items-center justify-center gap-2">
                <VolumeDownIcon className="h-5 w-5 opacity-70" />
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer range-xs" />
                <VolumeUpIcon className="h-5 w-5 opacity-70" />
            </div>
        );

        const playlistView = showPlaylist && (
            <div className="mt-4 flex-grow overflow-y-auto border-t border-white/10">
                <ul className="divide-y divide-white/10">
                    {playlist.map((track, index) => (
                        <li key={track.id} onClick={() => handleSelectTrack(index)} className={`flex items-center gap-3 cursor-pointer rounded-md p-3 ${index === currentTrackIndex && isThisPlayerActive ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                            <span className="font-mono text-sm opacity-70">{index + 1}.</span>
                            <div>
                                <p className="font-semibold">{track.name}</p>
                                <p className="opacity-70 text-sm">{track.artist}</p>
                            </div>
                            {index === currentTrackIndex && isThisPlayerActive && isPlaying && (
                                <span className="ml-auto" style={{color: primaryColor}}>
                                    <VolumeUpIcon className="h-5 w-5 animate-pulse"/>
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
        
        const visualizer = visualizerType !== 'none' && (
            <div className="flex justify-center items-center my-2 h-12">
                <AudioVisualizer type={visualizerType} color={visualizerColor} width={150} height={40}/>
            </div>
        );

        switch (playerStyle) {
            case 'compact':
                return <div style={{ backgroundColor: config.backgroundColor, color: config.textColor }} className="rounded-lg p-3 shadow-2xl space-y-2">
                    {trackInfo}
                    {progressBar}
                    {controls}
                    {visualizer}
                </div>
            case 'full-art':
                 return <div className="rounded-lg shadow-2xl overflow-hidden relative flex flex-col justify-end p-6" style={{ background: `linear-gradient(to top, ${config.backgroundColor} 20%, transparent), linear-gradient(135deg, ${config.primaryColor}, ${config.backgroundColor})`, color: config.textColor, minHeight: '350px' }}>
                    {visualizer && <div className="absolute top-6 left-1/2 -translate-x-1/2">{visualizer}</div>}
                    <div className="z-10 space-y-3">
                        {trackInfo}
                        {progressBar}
                        {controls}
                    </div>
                </div>
            default: // standard
                 return <div style={{ backgroundColor: config.backgroundColor, color: config.textColor }} className="rounded-lg flex flex-col flex-grow shadow-2xl p-4 sm:p-6">
                    <div className="mb-4">{trackInfo}</div>
                    {visualizer}
                    <div className="space-y-2">{progressBar}</div>
                    <div className="my-4">{controls}</div>
                    <div className="mb-4">{volumeControl}</div>
                    {playlistView}
                </div>
        }
    }

    return (
        <div className={`mx-auto flex flex-col slide-in ${playerSizeClass}`} style={customStyle}>
             <h2 className={`text-center mb-4 font-bold text-2xl`} style={{ color: siteConfig.storeConfig.themePrimaryColor }}>
                {title}
            </h2>
            {renderPlayerLayout()}
        </div>
    );
};

export default MusicPlayer;