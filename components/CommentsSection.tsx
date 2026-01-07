
import React, { useState, useMemo } from 'react';
import { useSite } from '../context/SiteContext';
import { StarIcon } from './Icons';
import type { Comment } from '../types';

const StarRatingInput: React.FC<{ rating: number; setRating: (rating: number) => void; size?: 'sm' | 'md' }> = ({ rating, setRating, size = 'md' }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
            <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1 rounded-full text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
            >
                <StarIcon filled={star <= rating} className={size === 'md' ? 'h-6 w-6' : 'h-5 w-5'} />
            </button>
        ))}
    </div>
);

const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="h-4 w-4 text-amber-400" filled={i < rating} />
        ))}
    </div>
);

const CommentCard: React.FC<{ comment: Comment }> = ({ comment }) => {
    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{comment.userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.timestamp).toLocaleDateString()}</p>
                </div>
                <StarRatingDisplay rating={comment.rating} />
            </div>
            <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">{comment.text}</p>
            {comment.adminReply && (
                 <div className="mt-3 bg-indigo-50 dark:bg-indigo-900/40 p-3 rounded-md border-l-4 border-indigo-400 dark:border-indigo-500">
                    <p className="font-semibold text-indigo-800 dark:text-indigo-200 text-sm">Resposta do Administrador:</p>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">{comment.adminReply.text}</p>
                </div>
            )}
        </div>
    );
};

interface CommentsSectionProps {
    targetId: string;
    targetType: Comment['targetType'];
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ targetId, targetType }) => {
    const { siteConfig, comments, setComments, currentUser } = useSite();
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            setError('Você precisa estar logado para comentar.');
            return;
        }
        if (newComment.trim().length < 5) {
            setError('Seu comentário precisa ter pelo menos 5 caracteres.');
            return;
        }

        const comment: Comment = {
            id: new Date().toISOString() + Math.random(),
            userId: currentUser.id,
            userName: currentUser.name,
            targetId,
            targetType,
            text: newComment.trim(),
            rating: newRating,
            timestamp: Date.now(),
            isApproved: !siteConfig.commentsConfig.requireApproval,
        };

        setComments(prev => [...prev, comment]);
        setNewComment('');
        setNewRating(5);
        setError('');
        setSuccess(siteConfig.commentsConfig.requireApproval ? 'Seu comentário foi enviado para aprovação.' : 'Comentário adicionado com sucesso!');
        setTimeout(() => setSuccess(''), 4000);
    };

    const commentsForTarget = useMemo(() => {
        return comments
            .filter(c => c.targetId === targetId && (c.isApproved || currentUser?.email === siteConfig.adminCredentials.email))
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [comments, targetId, currentUser, siteConfig.adminCredentials.email]);

    return (
        <div>
            <h3 className="text-lg font-bold mb-4 dark:text-white" style={{ color: siteConfig.themeConfig.textColor }}>Comentários e Avaliações</h3>

            {currentUser ? (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 mb-6 space-y-3">
                    <h4 className="font-semibold text-gray-800 dark:text-white">Deixe sua avaliação</h4>
                    <div>
                        <textarea 
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            rows={3}
                            placeholder="Escreva seu comentário..."
                        />
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <StarRatingInput rating={newRating} setRating={setNewRating} />
                        <button type="submit" className="px-5 py-2 text-white font-semibold rounded-lg transition-colors hover:opacity-90" style={{backgroundColor: siteConfig.themeConfig.primaryColor}}>Enviar Avaliação</button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>}
                </form>
            ) : (
                <div className="p-4 text-center bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 rounded-lg mb-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Você precisa estar logado para deixar um comentário.</p>
                </div>
            )}
            
            <div className="space-y-4">
                {commentsForTarget.length > 0 ? (
                    commentsForTarget.map(comment => <CommentCard key={comment.id} comment={comment} />)
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhum comentário ainda. Seja o primeiro a avaliar!</p>
                )}
            </div>
        </div>
    );
};

export default CommentsSection;
