
import React, { useState, useEffect } from 'react';
import type { Question, Theme, Difficulty, SiteConfig } from '../types';

interface QuizScreenProps {
    playerName: string;
    theme: Theme;
    themeTitle: string;
    difficulty: Difficulty;
    questions: Question[];
    pointsPerQuestion: number;
    onQuizFinish: (finalScore: number, correctAnswersCount: number) => void;
    onQuit: () => void;
    onExit: () => void;
    siteConfig: SiteConfig;
}

const QuizScreen: React.FC<QuizScreenProps> = ({
    playerName,
    themeTitle,
    difficulty,
    questions,
    pointsPerQuestion,
    onQuizFinish,
    onQuit,
    onExit,
    siteConfig
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    useEffect(() => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setCorrectAnswersCount(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
    }, [questions]);
    
    // Auto-advance logic
    useEffect(() => {
        if (isAnswered) {
            const timer = setTimeout(() => {
                if (currentQuestionIndex < totalQuestions - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                    setIsAnswered(false);
                    setSelectedAnswer(null);
                } else {
                    onQuizFinish(score, correctAnswersCount);
                }
            }, 1200); // 1.2s delay for feedback
            return () => clearTimeout(timer);
        }
    }, [isAnswered, currentQuestionIndex, totalQuestions, score, correctAnswersCount, onQuizFinish]);

    const handleAnswerSelect = (selectedIndex: number) => {
        if (isAnswered) return;

        setIsAnswered(true);
        setSelectedAnswer(selectedIndex);

        if (selectedIndex === currentQuestion.resposta) {
            setScore(prev => prev + pointsPerQuestion);
            setCorrectAnswersCount(prev => prev + 1);
        }
    };

    const difficultyMap: Record<Difficulty, { label: string, className: string }> = {
        facil: { label: 'Fácil', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
        medio: { label: 'Médio', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100' },
        dificil: { label: 'Difícil', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
    };

    const difficultyInfo = difficultyMap[difficulty];
    const progressPercentage = (currentQuestionIndex / totalQuestions) * 100;

    const { themeConfig } = siteConfig;

    return (
        <div className="fade-in h-full flex flex-col">
            <div className="p-3 sm:p-6" style={{ background: `linear-gradient(to right, ${themeConfig.primaryColor}, ${themeConfig.secondaryColor})` }}>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-white font-semibold text-base sm:text-xl truncate max-w-[150px] sm:max-w-none">{themeTitle}</h2>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${difficultyInfo.className}`}>
                                {difficultyInfo.label}
                            </span>
                        </div>
                        <p className="text-indigo-100 text-xs sm:text-sm mt-0.5">Jogador: <span className="font-medium">{playerName}</span></p>
                    </div>
                    <div className="flex items-center">
                        <span className="bg-yellow-400 dark:bg-orange-300 text-black font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-base shadow-sm">
                            {score} pts
                        </span>
                    </div>
                </div>
                <div className="mt-3 bg-white/30 rounded-full overflow-hidden h-1.5 sm:h-2">
                    <div
                        className="progress-bar bg-gradient-to-r from-green-400 to-teal-500 h-full"
                        style={{ width: `${isAnswered && currentQuestionIndex === totalQuestions-1 ? 100 : progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="p-4 sm:p-6 flex-grow flex flex-col">
                <div className="mb-4 sm:mb-6">
                    <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 dark:!text-white opacity-80" style={{ color: themeConfig.primaryColor }}>
                        Pergunta {currentQuestionIndex + 1} de {totalQuestions}
                    </h3>
                    <h2 className="text-lg md:text-2xl font-semibold dark:!text-white leading-snug" style={{ color: themeConfig.textColor }}>
                        {currentQuestion.pergunta}
                    </h2>
                </div>
                <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-grow">
                    {currentQuestion.opcoes.map((option, index) => {
                        const isCorrect = index === currentQuestion.resposta;
                        const isSelected = index === selectedAnswer;
                        let btnClass = 'option-btn w-full text-left p-3 sm:p-4 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 border border-gray-200 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base';
                        
                        if (isAnswered) {
                            if (isCorrect) {
                                btnClass += ' correct';
                            } else if (isSelected) {
                                btnClass += ' incorrect';
                            }
                            btnClass += ' cursor-not-allowed';
                        }
                        
                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                disabled={isAnswered}
                                className={`${btnClass} slide-in`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <span 
                                    className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 ${isAnswered && (isCorrect || isSelected) ? 'bg-white/30' : 'bg-indigo-100 dark:bg-orange-300 dark:!text-gray-900'} rounded-full text-center leading-none mr-3 font-medium text-xs sm:text-sm flex-shrink-0`} 
                                    style={{ color: themeConfig.primaryColor }}
                                >
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span>{option}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex justify-between items-center gap-3 mt-auto">
                    <div className='flex gap-2 flex-grow'>
                        <button onClick={onQuit} className="px-2 sm:px-3 py-1.5 sm:py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap">
                            Mudar Tema
                        </button>
                        <button onClick={onExit} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm text-white font-medium" style={{ backgroundColor: themeConfig.dangerColor }}>
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizScreen;
