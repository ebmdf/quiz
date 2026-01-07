
import React, { useState, useEffect } from 'react';
import type { Theme, Difficulty } from '../../types';
import { useSite } from '../../context/SiteContext';
import {
  ScienceIcon, HistoryIcon, EntertainmentIcon, GeographyIcon,
  MathIcon, EnglishIcon, GeneralKnowledgeIcon, RandomIcon,
  EasyIcon, MediumIcon, HardIcon
} from '../Icons';

interface QuizSetupProps {
  onStartQuiz: (playerName: string, theme: Theme, difficulty: Difficulty) => void;
  initialPlayerName: string;
  setPlayerName: (name: string) => void;
  isLoading: boolean;
}

const themeData = [
    { id: 'ciencia', name: 'Ciência', icon: <ScienceIcon />, color: 'blue' },
    { id: 'historia', name: 'História', icon: <HistoryIcon />, color: 'green' },
    { id: 'entretenimento', name: 'Entretenimento', icon: <EntertainmentIcon />, color: 'purple' },
    { id: 'geografia', name: 'Geografia', icon: <GeographyIcon />, color: 'teal' },
    { id: 'matematica', name: 'Matemática', icon: <MathIcon />, color: 'red' },
    { id: 'ingles', name: 'Inglês', icon: <EnglishIcon />, color: 'indigo' },
    { id: 'conhecimentos-gerais', name: 'Gerais', icon: <GeneralKnowledgeIcon />, color: 'pink' },
    { id: 'aleatorio', name: 'Aleatório', icon: <RandomIcon />, color: 'amber' },
];

const QuizSetup: React.FC<QuizSetupProps> = ({ onStartQuiz, initialPlayerName, setPlayerName, isLoading }) => {
    const { siteConfig, logAnalyticsEvent } = useSite();
    const [playerName, setPlayerNameState] = useState(initialPlayerName);
    const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        setIsReady(!!(playerName.trim() && selectedTheme && selectedDifficulty));
    }, [playerName, selectedTheme, selectedDifficulty]);

     useEffect(() => {
        let timer: number;
        if (isLoading) {
            setElapsedTime(0);
            timer = window.setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isLoading]);

    const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayerNameState(e.target.value);
        setPlayerName(e.target.value);
    }

    const handleStart = () => {
        if (isReady && selectedTheme && selectedDifficulty && !isLoading) {
            logAnalyticsEvent('quiz_start', { theme: selectedTheme, difficulty: selectedDifficulty });
            onStartQuiz(playerName.trim(), selectedTheme, selectedDifficulty);
        }
    };

    return (
        <div className="fade-in">
            <div className="mb-8 space-y-6">
                <div className="relative">
                    <input
                        type="text"
                        id="player-name"
                        value={playerName}
                        onChange={handlePlayerNameChange}
                        className="input-field w-full px-4 py-3 border-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none placeholder-transparent dark:text-white"
                        placeholder="Seu nome"
                    />
                    <label htmlFor="player-name" className="floating-label text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">Seu nome</label>
                </div>

                <div className="bg-indigo-50 dark:bg-gray-800 border dark:border-gray-700 p-5 rounded-xl">
                    <h3 className="font-semibold mb-3 dark:text-white" style={{ color: siteConfig.themeConfig.primaryColor }}>Escolha um tema:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {themeData.map((theme) => (
                            <div
                                key={theme.id}
                                className={`theme-card p-3 rounded-xl cursor-pointer text-center border-2 transition-all
                                    bg-gradient-to-br from-${theme.color}-50 to-${theme.color}-100 
                                    dark:from-gray-700 dark:to-gray-800
                                    ${selectedTheme === theme.id 
                                        ? `border-${theme.color}-500 dark:border-${theme.color}-400 shadow-lg scale-105` 
                                        : 'border-transparent dark:border-gray-600 hover:dark:border-gray-500'}`}
                                onClick={() => setSelectedTheme(theme.id as Theme)}
                            >
                                <div className={`bg-${theme.color}-500 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2`}>
                                    {theme.icon}
                                </div>
                                <h3 className={`font-semibold text-sm text-${theme.color}-700 dark:text-gray-200`}>{theme.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-gray-800 border dark:border-gray-700 p-5 rounded-xl">
                    <h3 className="font-semibold mb-3 dark:text-white" style={{ color: siteConfig.themeConfig.primaryColor }}>Selecione a dificuldade:</h3>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                        <button 
                            className={`difficulty-btn flex-1 p-3 rounded-xl border-2 transition-all
                            bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30
                            ${selectedDifficulty === 'facil' ? 'border-green-500 dark:border-green-400 shadow-lg scale-105' : 'border-transparent dark:border-gray-600'}`} 
                            onClick={() => setSelectedDifficulty('facil')}
                        >
                            <div className="flex items-center justify-center mb-2"><EasyIcon /></div>
                            <h4 className="text-center font-medium text-green-700 dark:text-green-400">Fácil</h4>
                            <p className="text-xs text-center text-green-600 dark:text-green-500/80 mt-1">1 ponto por acerto</p>
                        </button>
                        
                        <button 
                            className={`difficulty-btn flex-1 p-3 rounded-xl border-2 transition-all
                            bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30
                            ${selectedDifficulty === 'medio' ? 'border-amber-500 dark:border-amber-400 shadow-lg scale-105' : 'border-transparent dark:border-gray-600'}`} 
                            onClick={() => setSelectedDifficulty('medio')}
                        >
                            <div className="flex items-center justify-center mb-2"><MediumIcon /></div>
                            <h4 className="text-center font-medium text-amber-700 dark:text-amber-400">Médio</h4>
                            <p className="text-xs text-center text-amber-600 dark:text-amber-500/80 mt-1">2 pontos por acerto</p>
                        </button>

                        <button 
                            className={`difficulty-btn flex-1 p-3 rounded-xl border-2 transition-all
                            bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30
                            ${selectedDifficulty === 'dificil' ? 'border-red-500 dark:border-red-400 shadow-lg scale-105' : 'border-transparent dark:border-gray-600'}`} 
                            onClick={() => setSelectedDifficulty('dificil')}
                        >
                            <div className="flex items-center justify-center mb-2"><HardIcon /></div>
                            <h4 className="text-center font-medium text-red-700 dark:text-red-400">Difícil</h4>
                            <p className="text-xs text-center text-red-600 dark:text-red-500/80 mt-1">3 pontos por acerto</p>
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center mb-8">
                <button
                    onClick={handleStart}
                    disabled={!isReady || isLoading}
                    className={`min-w-[220px] text-white px-6 py-3 rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${isReady && !isLoading ? 'pulse' : ''}`}
                    style={{ backgroundColor: siteConfig.themeConfig.primaryColor, margin: '0 auto' }}
                >
                    {isLoading ? (
                        <>
                            <span>Iniciando Quiz...</span>
                            <span className="ml-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm tabular-nums text-yellow-500">
                                {elapsedTime}s
                            </span>
                        </>
                    ) : (
                        'Iniciar Quiz'
                    )}
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 h-5">
                    {!isReady ? 'Preencha seu nome, selecione um tema e uma dificuldade' : 'Tudo pronto! Clique para começar'}
                </p>
            </div>
        </div>
    );
};

export default QuizSetup;
