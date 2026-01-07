import React, { useEffect, useState, useMemo } from 'react';
import type { SiteConfig, Difficulty, Theme } from '../types';
import { TrophyIcon } from './Icons';
import CommentsSection from './CommentsSection';

interface ResultScreenProps {
    playerName: string;
    score: number;
    correctAnswersCount: number;
    totalQuestions: number;
    onRestart: () => void;
    onChangeTheme: () => void;
    onExit: () => void;
    siteConfig: SiteConfig;
    difficulty: Difficulty | null;
    theme: Theme | null;
    onNextLevel: () => void;
}

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
            {confettiPieces.map(p => <div key={p.id} className="confetti" style={p.style} />)}
        </div>
    );
};

const ResultScreen: React.FC<ResultScreenProps> = ({
    playerName,
    score,
    correctAnswersCount,
    totalQuestions,
    onRestart,
    onChangeTheme,
    onExit,
    siteConfig,
    difficulty,
    theme,
    onNextLevel,
}) => {
    const [performancePercentage, setPerformancePercentage] = useState(0);
    const [countdown, setCountdown] = useState<number | null>(null);

    const isPerfectScore = useMemo(() => correctAnswersCount === totalQuestions && totalQuestions > 0, [correctAnswersCount, totalQuestions]);
    
    const nextDifficultyLevel = useMemo(() => {
        if (difficulty === 'facil') return 'Médio';
        if (difficulty === 'medio') return 'Difícil';
        return null;
    }, [difficulty]);

    const showNextLevelButton = isPerfectScore && nextDifficultyLevel;

    const { text, showConfetti } = useMemo(() => {
        const percentage = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
        if (isPerfectScore) return { text: 'Perfeito!', showConfetti: true };
        if (percentage >= 80) return { text: 'Excelente!', showConfetti: true };
        if (percentage >= 60) return { text: 'Muito bom!', showConfetti: true };
        if (percentage >= 40) return { text: 'Bom trabalho!', showConfetti: false };
        return { text: 'Continue tentando!', showConfetti: false };
    }, [correctAnswersCount, totalQuestions, isPerfectScore]);

    useEffect(() => {
        const percentage = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
        const timeout = setTimeout(() => setPerformancePercentage(percentage), 300);
        return () => clearTimeout(timeout);
    }, [correctAnswersCount, totalQuestions]);
    
    useEffect(() => {
        if (countdown === null) return;
        if (countdown > 0) {
            const timerId = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
            return () => clearTimeout(timerId);
        } else {
             if (showNextLevelButton) {
                onNextLevel();
            } else {
                onRestart();
            }
        }
    }, [countdown, onRestart, onNextLevel, showNextLevelButton]);

    const handleMainButtonClick = () => {
        setCountdown(3);
    };

    const { themeConfig } = siteConfig;

    return (
        <div className="p-4 sm:p-8 text-center fade-in relative">
            {showConfetti && <Confetti />}
            <div className="relative z-10">
                <div className="mb-6">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `color-mix(in srgb, ${themeConfig.primaryColor} 20%, transparent)`}}>
                        <TrophyIcon />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: themeConfig.textColor }}>Quiz Concluído!</h2>
                    <p style={{ color: themeConfig.secondaryTextColor }}>Parabéns, <span className="font-medium" style={{ color: themeConfig.primaryColor }}>{playerName}</span>!</p>
                </div>

                <div className="bg-white/50 border border-gray-200 p-6 rounded-xl mb-6 space-y-2">
                    <div className="flex justify-between text-lg">
                        <span style={{ color: themeConfig.secondaryTextColor }}>Acertos:</span>
                        <span className="font-semibold" style={{ color: themeConfig.primaryColor }}>{correctAnswersCount} / {totalQuestions}</span>
                    </div>
                     <div className="flex justify-between text-lg">
                        <span style={{ color: themeConfig.secondaryTextColor }}>Pontuação Final:</span>
                        <span className="font-semibold" style={{ color: themeConfig.primaryColor }}>{score}</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: `color-mix(in srgb, ${themeConfig.primaryColor} 10%, transparent)` }}>
                    <div className="flex justify-between items-center mb-2">
                        <span style={{ color: themeConfig.secondaryTextColor }}>Desempenho:</span>
                        <span className="font-medium" style={{ color: themeConfig.primaryColor }}>{text}</span>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-2.5" style={{ backgroundColor: `color-mix(in srgb, ${themeConfig.primaryColor} 30%, transparent)` }}>
                        <div
                            className="h-2.5 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${performancePercentage}%`, backgroundColor: themeConfig.primaryColor }}
                        ></div>
                    </div>
                </div>
                <div className="space-y-3">
                    <button 
                        onClick={handleMainButtonClick}
                        disabled={countdown !== null}
                        className="w-full text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-75" 
                        style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                        {countdown !== null ? (
                             <div className="flex items-center justify-center gap-3 w-full">
                                <span className="font-medium text-lg">Começa em</span>
                                <div className="relative w-10 h-10">
                                    <svg className="absolute w-full h-full" viewBox="0 0 40 40">
                                        <defs>
                                            <linearGradient id="countdownGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#fde047" />
                                                <stop offset="100%" stopColor="#f97316" />
                                            </linearGradient>
                                        </defs>
                                        <circle
                                            className="stroke-current text-white/30"
                                            strokeWidth="4"
                                            fill="transparent"
                                            r="18"
                                            cx="20"
                                            cy="20"
                                        />
                                        <circle
                                            className="animate-spin"
                                            stroke="url(#countdownGradient)"
                                            style={{
                                                transformOrigin: '50% 50%',
                                            }}
                                            strokeWidth="4"
                                            strokeDasharray="80 113.1"
                                            strokeLinecap="round"
                                            fill="transparent"
                                            r="18"
                                            cx="20"
                                            cy="20"
                                        />
                                    </svg>
                                    <div
                                        className="absolute inset-0 flex items-center justify-center font-bold text-lg text-white tabular-nums"
                                    >
                                        {countdown}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            showNextLevelButton ? `Próxima Fase: ${nextDifficultyLevel}` : 'Tentar Novamente'
                        )}
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onChangeTheme} className="flex-1 bg-white px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors" style={{ color: themeConfig.primaryColor, borderColor: themeConfig.primaryColor, borderWidth: 1 }}>
                            Mudar Tema
                        </button>
                        <button onClick={onExit} className="flex-1 text-white px-6 py-3 rounded-lg font-medium transition-colors" style={{ backgroundColor: themeConfig.dangerColor }}>
                            Sair
                        </button>
                    </div>
                </div>
                {siteConfig.commentsConfig.enabled && siteConfig.commentsConfig.enableOnQuiz && theme && difficulty && (
                    <div className="mt-8 pt-6 border-t text-left">
                        <CommentsSection 
                            targetId={`quiz-${theme}-${difficulty}`} 
                            targetType="quiz" 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultScreen;