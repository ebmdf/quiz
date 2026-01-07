
import React, { useState, useEffect } from 'react';
import type { SiteConfig, Difficulty } from '../../types';
import {
    RandomIcon,
    AnimalsIcon,
    FoodIcon,
    SportsIcon,
    ProfessionsIcon,
    CountriesIcon,
    TechnologyIcon,
    NatureIcon,
    ColorsIcon,
    HistoryIcon,
    XIcon,
} from '../Icons';
import { useSite } from '../../context/SiteContext';

type Theme = 'aleatorio' | 'animais' | 'comidas' | 'esportes' | 'profissoes' | 'paises' | 'tecnologia' | 'natureza' | 'cores';

interface WordSearchStat {
    date: string;
    theme: string;
    difficulty: Difficulty;
    points: number;
    playerName: string;
}

const ScoreHistoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [stats, setStats] = useState<WordSearchStat[]>([]);

    useEffect(() => {
        try {
            const STORAGE_KEY = 'quiz-app-data';
            const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            setStats(storage.wordSearchStats || []);
        } catch (error) {
            console.error("Failed to load word search stats:", error);
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Histórico de Pontuações</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300"><XIcon className="h-5 w-5"/></button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {stats.length > 0 ? (
                        <table className="w-full text-sm text-left dark:text-gray-300">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="p-2">Data</th>
                                    <th className="p-2">Tema</th>
                                    <th className="p-2">Dificuldade</th>
                                    <th className="p-2">Pontos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map((stat, index) => (
                                    <tr key={index} className="border-b dark:border-gray-700">
                                        <td className="p-2">{new Date(stat.date).toLocaleDateString()}</td>
                                        <td className="p-2">{stat.theme}</td>
                                        <td className="p-2 capitalize">{stat.difficulty}</td>
                                        <td className="p-2 font-bold">{stat.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma pontuação registrada ainda.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


interface WordSearchSetupProps {
    onStartGame: (config: { theme: Theme; themeName: string; difficulty: Difficulty; playerName: string; size: number }) => void;
    initialPlayerName: string;
    setPlayerName: (name: string) => void;
}

const themes = [
    { id: 'aleatorio', name: 'Aleatório', icon: <RandomIcon className="h-8 w-8" />, color: 'from-purple-500 to-pink-500', selectedBorder: 'border-yellow-400' },
    { id: 'animais', name: 'Animais', icon: <AnimalsIcon className="h-8 w-8" />, color: 'bg-green-500' },
    { id: 'comidas', name: 'Comidas', icon: <FoodIcon className="h-8 w-8" />, color: 'bg-orange-500' },
    { id: 'esportes', name: 'Esportes', icon: <SportsIcon className="h-8 w-8" />, color: 'bg-blue-600' },
    { id: 'profissoes', name: 'Profissões', icon: <ProfessionsIcon className="h-8 w-8" />, color: 'bg-purple-600' },
    { id: 'paises', name: 'Países', icon: <CountriesIcon className="h-8 w-8" />, color: 'bg-red-600' },
    { id: 'tecnologia', name: 'Tecnologia', icon: <TechnologyIcon className="h-8 w-8" />, color: 'bg-indigo-600' },
    { id: 'natureza', name: 'Natureza', icon: <NatureIcon className="h-8 w-8" />, color: 'bg-teal-500' },
    { id: 'cores', name: 'Cores', icon: <ColorsIcon className="h-8 w-8" />, color: 'bg-pink-500' },
];

const difficulties = [
    { id: 'facil', name: 'Fácil', icon: '🟢', color: 'bg-green-500' },
    { id: 'medio', name: 'Médio', icon: '🟡', color: 'bg-yellow-500' },
    { id: 'dificil', name: 'Difícil', icon: '🔴', color: 'bg-red-500' },
];

const WordSearchSetup: React.FC<WordSearchSetupProps> = ({ onStartGame, initialPlayerName, setPlayerName }) => {
    const { siteConfig } = useSite();
    const [selectedTheme, setSelectedTheme] = useState<Theme>('aleatorio');
    const [showHistory, setShowHistory] = useState(false);
    
    const handleStart = (difficulty: Difficulty) => {
        if (initialPlayerName.trim() && selectedTheme && difficulty) {
            const themeDetails = themes.find(t => t.id === selectedTheme);
            const size = siteConfig.wordSearchConfig.sizes[difficulty];
            onStartGame({
                theme: selectedTheme,
                themeName: themeDetails?.name || 'Aleatório',
                difficulty,
                playerName: initialPlayerName.trim(),
                size: size,
            });
        } else {
            const nameInput = document.getElementById('player-name');
            nameInput?.focus();
            nameInput?.classList.add('ring-2', 'ring-red-500');
            setTimeout(() => nameInput?.classList.remove('ring-2', 'ring-red-500'), 2000);
        }
    };

    return (
        <>
            {showHistory && <ScoreHistoryModal onClose={() => setShowHistory(false)} />}
            <div className="bg-gray-50 dark:bg-gray-800 dark:border dark:border-gray-700 p-4 sm:p-6 rounded-2xl shadow-lg max-w-3xl mx-auto animate-zoom-in border">
                <h1 className="text-2xl sm:text-3xl font-black text-center text-gray-800 dark:text-white mb-6">Configure seu Caça-Palavras</h1>

                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-600 dark:text-white mb-3 text-center">Escolha o Tema:</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => setSelectedTheme(theme.id as Theme)}
                                className={`p-3 rounded-lg text-white font-semibold flex flex-col items-center justify-center transition-all duration-200 transform hover:-translate-y-1 focus:outline-none border-4 ${theme.id === 'aleatorio' ? 'bg-gradient-to-br' : ''} ${theme.color} ${selectedTheme === theme.id ? `shadow-lg ${theme.selectedBorder || 'border-yellow-400'}` : 'border-transparent'}`}
                            >
                                {theme.icon}
                                <span className="mt-1.5 text-xs sm:text-sm">{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-8 max-w-sm mx-auto">
                    <label htmlFor="player-name" className="text-lg font-semibold text-gray-600 dark:text-white mb-2 text-center block">Nome do Jogador:</label>
                    <input
                        id="player-name"
                        type="text"
                        value={initialPlayerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-center text-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-600 dark:text-white mb-3 text-center">Iniciar Jogo:</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        {difficulties.map(diff => (
                            <button
                                key={diff.id}
                                onClick={() => handleStart(diff.id as Difficulty)}
                                className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg shadow-md ${diff.color} hover:opacity-90 transition transform hover:-translate-y-0.5`}
                            >
                                <span className="mr-2">{diff.icon}</span>
                                {diff.name}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="border-t dark:border-gray-700 pt-6 mt-6 text-center">
                    <button onClick={() => setShowHistory(true)} className="px-8 py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition flex items-center justify-center mx-auto shadow-sm">
                        <HistoryIcon className="h-5 w-5 mr-2" />
                        Ver Histórico de Pontuações
                    </button>
                </div>

            </div>
        </>
    );
};

export default WordSearchSetup;
