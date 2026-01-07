
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useSite } from '../context/SiteContext';
import type { Difficulty } from '../types';
import CommentsSection from './CommentsSection';
import { getOfflineWords } from '../data/offlineData';
import { PlusIcon } from './Icons';

const highlightColors = [
    '#38bdf8', '#fbbf24', '#34d399', '#f87171', '#a78bfa', '#60a5fa',
    '#f472b6', '#a3e635', '#2dd4bf', '#f97316', '#84cc16', '#d946ef'
];

const highlightTextColors: Record<string, string> = {
    '#fbbf24': '#1c1917', '#a3e635': '#1c1917', '#84cc16': '#1c1917',
};

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Confetti: React.FC = () => {
    const confettiPieces = useMemo(() => {
        const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        return Array.from({ length: 100 }).map((_, i) => ({
            id: i,
            style: {
                left: `${Math.random() * 100}%`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                width: `${Math.random() * 8 + 6}px`,
                height: `${Math.random() * 8 + 6}px`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
            },
        }));
    }, []);

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            {confettiPieces.map(p => <div key={p.id} className="confetti" style={p.style as React.CSSProperties} />)}
        </div>
    );
};

interface VictoryScreenProps {
    onRestart: () => void;
    onNextLevel: () => void;
    onExit: () => void;
    currentDifficulty: Difficulty;
    points: number;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ onRestart, onNextLevel, onExit, currentDifficulty, points }) => {
    const canGoNext = currentDifficulty !== 'dificil';
    const nextLevelLabels: Record<string, string> = {
        'facil': 'Médio',
        'medio': 'Difícil'
    };

    const message = points === 0 ? "Sem Pontos!" : "Excelente desempenho!";

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <Confetti />
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl text-center relative z-10 animate-zoom-in max-w-md w-full border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl sm:text-4xl font-black text-yellow-500 mb-2 drop-shadow-sm">🎉 FIM DE JOGO!</h2>
                <p className="text-md sm:text-lg text-gray-600 dark:text-gray-300 mb-6 font-medium">{message}</p>
                
                <div className="bg-indigo-50 dark:bg-gray-900/50 p-6 rounded-xl mb-8 text-center transform scale-105 border-2 border-indigo-100 dark:border-indigo-500/30">
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 uppercase tracking-widest font-bold mb-2">Pontuação Final</p>
                    <p className="text-6xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{points}</p>
                </div>

                <div className="space-y-3">
                    {canGoNext && (
                         <button 
                            onClick={onNextLevel} 
                            className="w-full px-4 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold text-lg transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                        >
                            Ir para Nível {nextLevelLabels[currentDifficulty]}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                    
                    <button 
                        onClick={onRestart} 
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 font-bold transition-colors"
                    >
                        Jogar Novamente ({currentDifficulty})
                    </button>

                    <button 
                        onClick={onExit} 
                        className="w-full px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold transition-colors shadow-sm"
                    >
                        Sair do Jogo
                    </button>
                </div>
            </div>
        </div>
    );
};

interface WordSearchConfig {
    theme: string;
    themeName: string;
    difficulty: Difficulty;
    playerName: string;
    size: number;
}

interface WordSearchSolution {
    word: string;
    start: [number, number];
    end: [number, number];
}

interface WordSearchStat {
    date: string;
    theme: string;
    difficulty: Difficulty;
    points: number;
    playerName: string;
}

const CACHE_PREFIX = 'wordsearch-puzzle-';

const generateWordSearchGrid = (words: string[], size: number) => {
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
    const solution: WordSearchSolution[] = [];
    const directions = [
        [0, 1], // horizontal
        [1, 0], // vertical
        [1, 1], // diagonal down-right
        [1, -1] // diagonal down-left
    ];
    const placedWords: string[] = [];

    for (const word of sortedWords) {
        // FIX: Normalize to remove accents (e.g., LEÃO -> LEAO) and remove non-letters
        const sanitizedWord = word
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .replace(/[^A-Z]/g, "");

        if (sanitizedWord.length > size || sanitizedWord.length < 2) continue;

        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const [rowDir, colDir] = dir;
            const rStart = Math.floor(Math.random() * size);
            const cStart = Math.floor(Math.random() * size);
            const rEnd = rStart + (sanitizedWord.length - 1) * rowDir;
            const cEnd = cStart + (sanitizedWord.length - 1) * colDir;

            if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) {
                attempts++;
                continue;
            }

            let fits = true;
            for (let i = 0; i < sanitizedWord.length; i++) {
                const r = rStart + i * rowDir;
                const c = cStart + i * colDir;
                if (grid[r][c] !== '' && grid[r][c] !== sanitizedWord[i]) {
                    fits = false;
                    break;
                }
            }

            if (fits) {
                for (let i = 0; i < sanitizedWord.length; i++) {
                    grid[rStart + i * rowDir][cStart + i * colDir] = sanitizedWord[i];
                }
                solution.push({
                    word: sanitizedWord,
                    start: [rStart, cStart],
                    end: [rEnd, cEnd]
                });
                placedWords.push(sanitizedWord);
                placed = true;
            }
            attempts++;
        }
    }

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }

    return { grid, solution, placedWords };
};

const WordSearch: React.FC<{ config: WordSearchConfig; onExit: () => void; }> = ({ config, onExit }) => {
    const { siteConfig, logAnalyticsEvent } = useSite();
    const [gameConfig, setGameConfig] = useState(config);

    const [grid, setGrid] = useState<string[][] | null>(null);
    const [words, setWords] = useState<string[] | null>(null);
    const [solution, setSolution] = useState<WordSearchSolution[] | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState("Conectando à IA...");
    const [error, setError] = useState<string | null>(null);
    
    const [gameId, setGameId] = useState(0);
    const [usedWordsHistory, setUsedWordsHistory] = useState<string[]>([]);

    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [selection, setSelection] = useState<[number, number][]>([]);
    const [foundPaths, setFoundPaths] = useState<Record<string, { path: [number, number][], color: string }>>({});
    const [pulsePath, setPulsePath] = useState<[number, number][] | null>(null);
    
    // Game States
    const [isRoundComplete, setIsRoundComplete] = useState(false); // Now used for internal logic, not UI modal
    const [isVictory, setIsVictory] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    
    const [timer, setTimer] = useState(240); 
    const [points, setPoints] = useState(0);

    const isCellInPath = useMemo(() => {
        const cellMap = new Map<string, string>();
        Object.values(foundPaths).forEach(({ path, color }) => {
            path.forEach(([r, c]) => cellMap.set(`${r}-${c}`, color));
        });
        return cellMap;
    }, [foundPaths]);

     const saveWordSearchStat = useCallback((finalPoints: number, result: 'win' | 'timeout') => {
        try {
            const STORAGE_KEY = 'quiz-app-data';
            const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const stats: WordSearchStat[] = storage.wordSearchStats || [];
            const newStat: WordSearchStat = {
                date: new Date().toISOString(),
                theme: gameConfig.themeName,
                difficulty: gameConfig.difficulty,
                points: finalPoints,
                playerName: gameConfig.playerName,
            };
            stats.unshift(newStat);
            if (stats.length > 50) stats.pop();
            storage.wordSearchStats = stats;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
        } catch (error) {
            console.error("Failed to save word search stats:", error);
        }
    }, [gameConfig]);

    const calculatePath = (start: [number, number], end: [number, number]): [number, number][] => {
        const path: [number, number][] = [];
        const [r1, c1] = start;
        const [r2, c2] = end;
        const dR = Math.sign(r2 - r1);
        const dC = Math.sign(c2 - c1);
        let [r, c] = [r1, c1];
        
        let steps = 0;
        const maxSteps = Math.max(Math.abs(r2-r1), Math.abs(c2-c1)) + 2;

        while (steps < maxSteps) {
            path.push([r, c]);
            if (r === r2 && c === c2) break;
            r += dR;
            c += dC;
            steps++;
        }
        return path;
    };

    useEffect(() => {
        const cacheKey = `${CACHE_PREFIX}${gameConfig.theme}-${gameConfig.difficulty}-${gameId}`;
        const size = gameConfig.size;
        const wordCount = gameConfig.difficulty === 'facil' ? 6 : gameConfig.difficulty === 'medio' ? 8 : 10;
        
        const initialTime = gameConfig.difficulty === 'facil' ? 240 : gameConfig.difficulty === 'medio' ? 360 : 600;

        const fetchWordsAndGenerate = async () => {
            let puzzleData = null;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                // Pass usedWordsHistory to prompt to avoid repeats
                const historyStr = usedWordsHistory.slice(-50).join(', '); // Limit history context size
                const prompt = `Gere uma lista de ${wordCount} palavras simples em português do Brasil relacionadas ao tema "${gameConfig.themeName}". 
                As palavras devem ter no máximo ${size} letras. Evite palavras compostas, espaços ou hífens.
                Retorne APENAS um array JSON de strings. Exemplo: ["GATO", "CACHORRO"]. Não inclua markdown.
                IMPORTANTE: NÃO use estas palavras que já saíram recentemente: [${historyStr}].`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                });

                let jsonString = response.text.trim();
                const wordsList = JSON.parse(jsonString);

                if (!Array.isArray(wordsList) || wordsList.length === 0) {
                    throw new Error("Resposta inválida da IA");
                }
                
                const { grid, solution, placedWords } = generateWordSearchGrid(wordsList, size);
                
                puzzleData = { words: placedWords, grid, solution };
                
            } catch (e) {
                console.warn("Failed to generate new puzzle with AI, using offline data", e);
                // Offline Fallback with filtering
                const offlineCandidates = getOfflineWords(gameConfig.theme, 60);
                
                // Filter out words already in history
                const uniqueCandidates = offlineCandidates.filter(w => !usedWordsHistory.includes(w));
                
                // If we ran out of unique words (unlikely with 60), fallback to pool
                const finalPool = uniqueCandidates.length >= wordCount ? uniqueCandidates : offlineCandidates;
                
                const { grid, solution, placedWords } = generateWordSearchGrid(finalPool.slice(0, wordCount), size);
                puzzleData = { words: placedWords, grid, solution };
            }
            return puzzleData;
        };

        const startGame = async () => {
            logAnalyticsEvent('wordsearch_round_start', { theme: gameConfig.themeName, difficulty: gameConfig.difficulty, gameId });
            setIsLoading(true);
            setError(null);
            setFoundWords([]);
            setFoundPaths({});
            setSelection([]);
            setIsMouseDown(false);
            
            setIsRoundComplete(false);
            setIsVictory(false);
            setIsGameOver(false);
            
            setLoadingProgress(10);

            // Skip cache if we want fresh words every time, but keep light caching for strict reloading
            // Logic: We want different words *per round*, gameId handles that.
            const cachedPuzzleJSON = localStorage.getItem(cacheKey);
            let puzzleData = null;

            if (cachedPuzzleJSON) {
                try {
                    puzzleData = JSON.parse(cachedPuzzleJSON);
                    localStorage.removeItem(cacheKey); 
                } catch (e) {
                    console.error("Cache invalid");
                }
            }
            
            if (!puzzleData) {
                setLoadingMessage("Gerando novas palavras...");
                const progressInterval = setInterval(() => {
                    setLoadingProgress(p => Math.min(p + 10, 90));
                }, 200);

                puzzleData = await fetchWordsAndGenerate();
                clearInterval(progressInterval);
            }

            if (puzzleData) {
                setGrid(puzzleData.grid);
                setWords(puzzleData.words);
                setSolution(puzzleData.solution);
                setTimer(initialTime); // Reset timer for the new round
                setLoadingProgress(100);
                setIsLoading(false);
            } else {
                setError("Não foi possível gerar o jogo. Verifique sua conexão e tente novamente.");
                setIsLoading(false);
            }
        };

        startGame();
    }, [gameConfig, gameId, logAnalyticsEvent]); 

    useEffect(() => {
        // Win condition check
        if (!isLoading && words && foundWords.length > 0 && foundWords.length === words.length && !isRoundComplete && !isVictory) {
            setIsRoundComplete(true);
            const bonus = Math.floor(timer * 0.5);
            setPoints(p => p + bonus);
            
            // Add current words to history immediately
            setUsedWordsHistory(prev => [...prev, ...words]);

            // Auto-advance after a short delay (2s) to show the completed grid/confetti effect
            setTimeout(() => {
                setGameId(id => id + 1); // Triggers new round
            }, 2500);
        }
    }, [foundWords, words, isLoading, isRoundComplete, isVictory, timer]);

     useEffect(() => {
        if (timer > 0 && !isRoundComplete && !isVictory && !isGameOver && !isLoading) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else if (timer === 0 && !isRoundComplete && !isVictory && !isGameOver) {
            setIsGameOver(true);
            saveWordSearchStat(points, 'timeout');
        }
    }, [timer, isRoundComplete, isVictory, isGameOver, isLoading, points, saveWordSearchStat]);

     useEffect(() => {
        if (isGameOver && grid && words && solution) {
            const unfoundWords = words.filter(w => !foundWords.includes(w));
            const newPaths = { ...foundPaths };
            unfoundWords.forEach(word => {
                const sol = solution.find(s => s.word.toUpperCase() === word.toUpperCase());
                if (sol) {
                    const path = calculatePath(sol.start, sol.end);
                    newPaths[word] = { path, color: '#a1a1aa' }; // gray-400
                }
            });
            setFoundPaths(newPaths);
        }
    }, [isGameOver, grid, words, solution, foundWords]);

    const checkSelection = useCallback(() => {
        if (!grid || !words || selection.length < 2) return;

        const selectedString = selection.map(([r, c]) => grid[r][c]).join('');
        const reversedString = selectedString.split('').reverse().join('');

        const wordFound = words.find(word => (word === selectedString || word === reversedString) && !foundWords.includes(word));
        
        if (wordFound) {
            setPulsePath(selection);
            setTimeout(() => setPulsePath(null), 500);

            const nextColorIndex = foundWords.length % highlightColors.length;
            const color = highlightColors[nextColorIndex];
            
            setPoints(p => p + (wordFound.length * 10));
            setFoundWords(prev => [...prev, wordFound]);
            setFoundPaths(prev => ({ ...prev, [wordFound]: { path: selection, color } }));
        }
    }, [selection, grid, words, foundWords]);

    const handleMouseDown = useCallback((row: number, col: number) => {
        if (isRoundComplete || isVictory || isGameOver) return;
        setIsMouseDown(true);
        setSelection([[row, col]]);
    }, [isRoundComplete, isVictory, isGameOver]);
    
    const handleMouseEnter = useCallback((row: number, col: number) => {
        if (!isMouseDown || isRoundComplete || isVictory || isGameOver || !grid) return;
        
        const last = selection[selection.length - 1];
        if (last && last[0] === row && last[1] === col) return;
        
        const first = selection[0];
        const isHorizontal = first[0] === row;
        const isVertical = first[1] === col;
        const isDiagonal = Math.abs(first[0] - row) === Math.abs(first[1] - col);
        
        if (!isHorizontal && !isVertical && !isDiagonal) return;

        const newSelection = calculatePath(first, [row, col]);
        setSelection(newSelection);
        
    }, [isMouseDown, isRoundComplete, isVictory, isGameOver, selection, grid]);

    const handleMouseUp = useCallback(() => {
        if (!isMouseDown || isRoundComplete || isVictory || isGameOver) return;
        setIsMouseDown(false);
        checkSelection();
        setSelection([]);
    }, [isMouseDown, isRoundComplete, isVictory, isGameOver, checkSelection]);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, row: number, col: number) => {
        e.preventDefault();
        handleMouseDown(row, col);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element instanceof HTMLElement && element.dataset.row && element.dataset.col) {
            const row = parseInt(element.dataset.row, 10);
            const col = parseInt(element.dataset.col, 10);
            handleMouseEnter(row, col);
        }
    };
    
    const handleExitGame = () => {
        setIsVictory(true);
        saveWordSearchStat(points, 'win');
    };

    const handleRestart = useCallback(() => {
        logAnalyticsEvent('wordsearch_restart');
        setIsVictory(false);
        setIsRoundComplete(false);
        setPoints(0); // Reset points on full restart
        setUsedWordsHistory([]); // Reset history on full restart
        setGameId(id => id + 1);
    }, [logAnalyticsEvent]);

    const handleNextLevel = useCallback(() => {
        let nextDifficulty: Difficulty | undefined;
        if (gameConfig.difficulty === 'facil') nextDifficulty = 'medio';
        else if (gameConfig.difficulty === 'medio') nextDifficulty = 'dificil';
        
        if (nextDifficulty) {
            // Update config for next level
            const nextSize = siteConfig.wordSearchConfig.sizes[nextDifficulty];
            setGameConfig(prev => ({
                ...prev, 
                difficulty: nextDifficulty!,
                size: nextSize
            }));
            
            // Reset for new game at new level
            setIsVictory(false);
            setIsRoundComplete(false);
            setPoints(0); // Reset points on level change
            // We keep usedWordsHistory or clear it? Usually clear for new difficulty level to allow reusing basic words if needed, 
            // but strictly clearing avoids repetition. Let's clear to be fresh.
            setUsedWordsHistory([]); 
            setGameId(id => id + 1);
        }
    }, [gameConfig, siteConfig.wordSearchConfig.sizes]);

    const isCellSelected = (row: number, col: number) => selection.some(([r, c]) => r === row && c === col);
    const isCellPulsing = (row: number, col: number) => pulsePath?.some(([r, c]) => r === row && c === col);
    
    if (isLoading) {
        return (
            <div className="w-full p-4 sm:p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[500px]">
                <div className="text-center text-white">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
                    <p className="font-semibold text-lg">{loadingMessage}</p>
                    <p className="font-bold text-4xl mt-2">{loadingProgress}%</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full p-4 sm:p-6 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[500px]">
                <p className="text-white font-semibold text-center mb-4">{error}</p>
                <button onClick={onExit} className="px-6 py-2 bg-white text-red-600 font-bold rounded-lg">Voltar</button>
            </div>
        );
    }
    
    if (!grid || !words) return null;

    return (
        <div className="w-full p-1 bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-900 dark:to-orange-900 rounded-xl shadow-lg animate-fade-in relative flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] overflow-hidden">
            
            {/* Round Complete Overlay (Transient) */}
            {isRoundComplete && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                    <div className="bg-green-500 text-white px-8 py-4 rounded-xl shadow-2xl animate-bounce-in">
                        <h2 className="text-3xl font-bold">Muito Bem!</h2>
                        <p className="text-center text-sm mt-1">Próxima rodada em instantes...</p>
                    </div>
                    <Confetti />
                </div>
            )}

            {isVictory && <VictoryScreen onRestart={handleRestart} onNextLevel={handleNextLevel} onExit={onExit} currentDifficulty={gameConfig.difficulty} points={points} />}

            <header className="flex-shrink-0 flex flex-wrap justify-between items-center px-2 py-1 text-slate-800 dark:text-gray-100 font-semibold gap-1">
                <div className="flex items-center gap-x-3 flex-wrap text-xs">
                    <span>
                        <strong className="text-black dark:text-white">Tema:</strong>{' '}
                        <span className="text-green-800 dark:text-green-300">{gameConfig.themeName}</span>
                    </span>
                    <span>
                        <strong className="text-black dark:text-white">Nível:</strong>{' '}
                        <span className="capitalize text-purple-800 dark:text-purple-300">{gameConfig.difficulty}</span>
                    </span>
                    <span>
                        <strong className="text-black dark:text-white">Tempo:</strong>{' '}
                        <span className={`font-bold text-red-600 dark:text-red-400 ${timer <= 30 ? 'animate-pulse' : ''}`}>
                            {formatTime(timer)}
                        </span>
                    </span>
                    <span>
                        <strong className="text-black dark:text-white">Pontos:</strong>{' '}
                        <span className="text-blue-800 dark:text-blue-300">{points}</span>
                    </span>
                </div>
                <button onClick={handleExitGame} className="px-2 py-1 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-900 transition-colors">Sair</button>
            </header>
            
            {isGameOver && (
                <div className="absolute top-12 left-0 right-0 z-20 text-center p-2 bg-red-800/90 text-white font-bold animate-fade-in">
                    Tempo Esgotado! As palavras restantes foram reveladas.
                    <div className="mt-2 flex justify-center gap-2">
                        <button onClick={handleRestart} className="px-3 py-1 bg-white text-red-800 text-sm font-semibold rounded hover:bg-red-100">
                            Começar de Novo
                        </button>
                        <button onClick={onExit} className="px-3 py-1 bg-transparent border border-white text-white text-sm font-semibold rounded hover:bg-white/10">
                            Sair
                        </button>
                    </div>
                </div>
            )}

            {/* Main Game Area - Responsive Layout */}
            <div className="flex-grow flex flex-col lg:flex-row items-center justify-center w-full h-full overflow-hidden min-h-0 p-1 gap-1">
                
                {/* Grid Container - Square Resizing Logic */}
                <div className="flex-1 flex items-center justify-center w-full h-full min-h-0 min-w-0 relative">
                    <div 
                        className="relative shadow-xl bg-white/10 dark:bg-black/20 rounded-lg backdrop-blur-sm aspect-square max-w-full max-h-full w-full h-auto landscape:w-auto landscape:h-full"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ padding: '2px' }}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchEnd={handleMouseUp}
                            onTouchCancel={handleMouseUp}
                        >
                            <div 
                                className="word-grid"
                                style={{ 
                                    gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
                                    gridTemplateRows: `repeat(${grid.length}, 1fr)`,
                                    '--grid-size': grid.length
                                } as React.CSSProperties}
                            >
                                {grid.map((row, r) =>
                                    row.map((letter, c) => {
                                        const pathColor = isCellInPath.get(`${r}-${c}`);
                                        const isSelected = isCellSelected(r, c);
                                        const isPulsing = isCellPulsing(r, c);
                                        
                                        let cellStyle: React.CSSProperties = {};
                                        if (pathColor) {
                                            cellStyle.backgroundColor = pathColor;
                                            cellStyle.color = highlightTextColors[pathColor] || 'white';
                                        }
                                        
                                        return (
                                            <div
                                                key={`${r}-${c}`}
                                                data-row={r}
                                                data-col={c}
                                                className={`grid-cell
                                                    ${isPulsing ? 'pulse-animation' : ''}
                                                    ${isSelected ? 'selected' : ''}
                                                    ${!isRoundComplete && !isVictory && !isGameOver ? 'cursor-pointer' : 'cursor-default'}
                                                `}
                                                style={cellStyle}
                                                onMouseDown={() => handleMouseDown(r, c)}
                                                onMouseEnter={() => handleMouseEnter(r, c)}
                                                onTouchStart={(e) => handleTouchStart(e, r, c)}
                                                onTouchMove={handleTouchMove}
                                            >
                                                {letter}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Word List */}
                <div className="w-full lg:w-48 flex-shrink-0 bg-black/10 dark:bg-black/30 rounded-lg p-2 flex flex-col h-auto max-h-[25%] lg:max-h-full overflow-hidden">
                    <h3 className="font-black text-xs sm:text-sm text-blue-800 dark:text-blue-200 mb-1 text-center lg:text-left sticky top-0 bg-transparent uppercase tracking-wider border-b border-black/10 dark:border-white/10 pb-1">
                        Palavras ({foundWords.length}/{words.length})
                    </h3>
                    <ul className="flex flex-wrap justify-center gap-1 w-full lg:block lg:overflow-y-auto custom-scrollbar">
                        {words.map(word => (
                            <li 
                                key={word} 
                                className={`word-item font-bold tracking-wide transition-all duration-300 py-0.5 px-1.5 rounded text-[10px] sm:text-xs lg:text-sm lg:mb-1 ${foundWords.includes(word) ? 'found bg-white/20' : ''}`}
                            >
                                {word}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {(isVictory || isGameOver) && siteConfig.commentsConfig.enabled && siteConfig.commentsConfig.enableOnWordSearch && (
                <div className="mt-2 p-2 rounded-lg bg-black/10 dark:bg-black/30 text-left text-slate-800 dark:text-gray-200 flex-shrink-0 overflow-y-auto max-h-32">
                     <CommentsSection 
                        targetId={`wordsearch-${gameConfig.theme}-${gameConfig.difficulty}`} 
                        targetType="wordsearch" 
                    />
                </div>
            )}
        </div>
    );
};

export default WordSearch;
