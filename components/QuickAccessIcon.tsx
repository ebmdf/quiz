import React, { useState, useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';
import { MusicIcon, VolumeUpIcon as VolumeIcon, XIcon } from './Icons';
import type { AudioPlayerState } from '../types';

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


const QuickAccessIcon: React.FC = () => {
    const { 
        siteConfig, 
        musicTracks, 
        audioPlayerState,
        setAudioPlayerState,
        audioElementRef,
        audioContext,
    } = useSite();
    const [isPlayerVisible, setIsPlayerVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(audioPlayerState?.volume ?? 0.75);
    const [isSeeking, setIsSeeking] = useState(false);
    const playerRef = useRef<HTMLDivElement>(null);
    const [isDismissed, setIsDismissed] = useState(() => sessionStorage.getItem('music-player-dismissed') === 'true');
    
    const { globalMusicConfig, themeConfig } = siteConfig;
    const { 
        enabled, 
        quickAccessIcon, 
        trackIds, 
        shuffle: defaultShuffle, 
        autoplay, 
        primaryColor, 
        backgroundColor, 
        textColor,
        showOnMobile 
    } = globalMusicConfig;
    
    const isPlayerActive = audioPlayerState?.config === globalMusicConfig;
    const isPlaying = isPlayerActive && audioPlayerState.isPlaying;
    const currentTrack = isPlayerActive ? audioPlayerState.playlist[audioPlayerState.currentTrackIndex] : null;

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (playerRef.current && !playerRef.current.contains(event.target as Node)) {
                setIsPlayerVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [playerRef]);

    useEffect(() => {
        const audio = audioElementRef.current;
        if (!audio || !isPlayerActive) return;
        
        const updateProgress = () => { if (!isSeeking) setProgress(audio.currentTime); };
        const updateDuration = () => setDuration(audio.duration);
        
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('durationchange', updateDuration);

        setProgress(audio.currentTime);
        setDuration(audio.duration);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('durationchange', updateDuration);
        };
    }, [audioElementRef, isPlayerActive, isSeeking]);

    const handleDismiss = () => {
        sessionStorage.setItem('music-player-dismissed', 'true');
        setIsDismissed(true);
        setIsPlayerVisible(false);
        if (isPlayerActive) {
            setAudioPlayerState(prev => prev ? ({ ...prev, isPlaying: false }) : null);
        }
    };

    if (isDismissed || !enabled || !quickAccessIcon || !trackIds || trackIds.length === 0) {
        return null;
    }

    if (!showOnMobile && window.innerWidth < 768) {
        return null;
    }
    
    const handleIconClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isPlayerActive) {
            const globalPlaylist = musicTracks.filter(t => trackIds.includes(t.id));
            if (globalPlaylist.length === 0) {
                alert("Nenhuma música na playlist global. Adicione músicas no painel de admin.");
                return;
            }
            
            if (audioContext?.state === 'suspended') {
                audioContext.resume();
            }

            const newState: AudioPlayerState = {
                playlist: defaultShuffle ? shuffleArray(globalPlaylist) : globalPlaylist,
                originalPlaylist: globalPlaylist,
                config: globalMusicConfig,
                currentTrackIndex: 0,
                isPlaying: autoplay,
                shuffle: defaultShuffle || false,
                volume: audioElementRef.current?.volume ?? 0.75,
            };
            setAudioPlayerState(newState);
        }
        
        setIsPlayerVisible(!isPlayerVisible);
    };

    const handlePlayPause = () => {
        setAudioPlayerState(prev => prev ? ({ ...prev, isPlaying: !isPlaying }) : null);
    };
    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProgress(Number(e.target.value));
    };
    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        if (audioElementRef.current) {
            audioElementRef.current.currentTime = Number(e.currentTarget.value);
        }
        setIsSeeking(false);
    };
    const handleSeekMouseDown = () => setIsSeeking(true);
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if(audioElementRef.current) audioElementRef.current.volume = newVolume;
        setAudioPlayerState(prev => prev ? ({ ...prev, volume: newVolume }) : null);
    }
    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
    
    // Color definitions with fallbacks
    const bgColor = backgroundColor || '#f9fafb';
    const fgColor = textColor || '#1f2937';
    const accentColor = primaryColor || themeConfig.primaryColor;
    const sliderTrackColor = `color-mix(in srgb, ${fgColor} 25%, transparent)`;
    
    const { iconColor, iconBgColor, opacity } = quickAccessIcon;

    const containerClasses: Record<typeof quickAccessIcon.position, string> = {
        'header-left':  'fixed top-4 left-4 z-50',
        'header-right': 'fixed top-4 right-4 z-50 flex-row-reverse',
        'footer-left':  'fixed bottom-4 left-4 z-50',
        'footer-right': 'fixed bottom-4 right-4 z-50 flex-row-reverse',
    };
    
    const sizeClasses: Record<typeof quickAccessIcon.size, { button: string; icon: string }> = {
        small: { button: 'p-2', icon: 'h-5 w-5' },
        medium: { button: 'p-3', icon: 'h-6 w-6' },
        large: { button: 'p-4', icon: 'h-7 w-7' },
    };
    const isReverse = quickAccessIcon.position.includes('right');
    const containerClass = containerClasses[quickAccessIcon.position] || containerClasses['footer-right'];
    const sizeClass = sizeClasses[quickAccessIcon.size] || sizeClasses['medium'];
    
    return (
        <div className={`${containerClass} flex items-center group/container`} ref={playerRef} style={{ opacity: opacity ?? 1 }}>
             <button
                onClick={handleDismiss}
                className="absolute -top-1 -right-1 bg-gray-700 text-white rounded-full p-1 opacity-0 group-hover/container:opacity-100 transition-opacity hover:bg-red-500 z-10"
                aria-label="Fechar player de música"
                style={isReverse ? { right: 'auto', left: -4 } : {}}
            >
                <XIcon className="h-3 w-3" />
            </button>
            <button
                onClick={handleIconClick}
                className={`${sizeClass.button} rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-105 backdrop-blur-sm`}
                style={{
                    color: iconColor || '#1f2937',
                    backgroundColor: iconBgColor || 'rgba(243, 244, 246, 0.9)',
                }}
                aria-label="Player de música"
            >
                <MusicIcon className={sizeClass.icon} />
            </button>

            {isPlayerVisible && currentTrack && (
                <div 
                    className={`flex items-center gap-3 p-2 rounded-lg shadow-lg border border-black/10 backdrop-blur-sm`}
                    style={{ 
                        animation: 'fadeIn 0.3s ease-out',
                        backgroundColor: bgColor,
                        color: fgColor,
                        ...(isReverse ? { marginRight: '0.5rem' } : { marginLeft: '0.5rem' })
                    }}
                >
                    <button onClick={handlePlayPause} className="p-1 rounded-full flex-shrink-0" style={{ color: accentColor }}>
                        {isPlaying ? <PauseIcon className="h-7 w-7" /> : <PlayIcon className="h-7 w-7" />}
                    </button>
                    
                    <div className="flex flex-col flex-grow w-48">
                        <div>
                            <p className="font-bold text-sm truncate">{currentTrack.name}</p>
                            <p className="text-xs opacity-80 truncate">{currentTrack.artist || 'Artista desconhecido'}</p>
                        </div>
                        <div className="w-full h-4 group relative flex items-center">
                             <input
                                type="range"
                                value={progress}
                                max={duration || 1}
                                onMouseDown={handleSeekMouseDown}
                                onMouseUp={handleSeekMouseUp}
                                onChange={handleSeekChange}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, ${accentColor} ${progressPercent}%, ${sliderTrackColor} ${progressPercent}%)`
                                }}
                            />
                        </div>
                        <span className="text-xs font-mono opacity-70 -mt-1">{formatTime(progress)} / {formatTime(duration)}</span>
                    </div>

                    <div className="group flex items-center gap-1 border-l pl-2" style={{ borderColor: sliderTrackColor }}>
                        <VolumeIcon className="h-5 w-5 opacity-70" />
                        <input
                            type="range"
                            min="0" max="1" step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-0 group-hover:w-20 h-1.5 rounded-full appearance-none cursor-pointer transition-all duration-300"
                             style={{
                                background: `linear-gradient(to right, ${accentColor} ${volume * 100}%, ${sliderTrackColor} ${volume * 100}%)`
                            }}
                        />
                    </div>
                    
                    <button onClick={() => setIsPlayerVisible(false)} title="Fechar player" className="p-1 rounded-full hover:bg-black/10 flex-shrink-0">
                        <XIcon className="h-5 w-5 opacity-70" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuickAccessIcon;