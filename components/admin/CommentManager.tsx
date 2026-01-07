import React, { useState, useMemo } from 'react';
import { useSite } from '../../context/SiteContext';
import { TrashIcon, StarIcon } from '../Icons';
import type { Comment } from '../../types';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="h-4 w-4 text-amber-400" filled={i < rating} />
        ))}
    </div>
);

const CommentItem: React.FC<{
    comment: Comment;
    onApprove: (id: string) => void;
    onDelete: (id: string) => void;
    onReply: (id: string, replyText: string) => void;
}> = ({ comment, onApprove, onDelete, onReply }) => {
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const handleReplySubmit = () => {
        if (replyText.trim()) {
            onReply(comment.id, replyText.trim());
            setIsReplying(false);
            setReplyText('');
        }
    };

    const targetLabels: Record<Comment['targetType'], string> = {
        product: 'Produto',
        quiz: 'Quiz',
        wordsearch: 'Caça-Palavras',
        download: 'Downloads',
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 border dark:border-gray-700 rounded-lg shadow-sm space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{comment.userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{comment.userId}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.timestamp).toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <StarRating rating={comment.rating} />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">em <strong>{targetLabels[comment.targetType]}</strong>: <em>{comment.targetId}</em></p>
                </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 italic">"{comment.text}"</p>
            {comment.adminReply && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-md ml-4 border-l-4 border-indigo-500">
                    <p className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm">Sua Resposta:</p>
                    <p className="text-sm text-indigo-700 dark:text-indigo-200">{comment.adminReply.text}</p>
                </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t dark:border-gray-700">
                 <div className="flex gap-2">
                    {!comment.isApproved && (
                        <button onClick={() => onApprove(comment.id)} className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-semibold rounded-md hover:bg-green-200 dark:hover:bg-green-900/50">Aprovar</button>
                    )}
                    <button onClick={() => setIsReplying(!isReplying)} className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-semibold rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/50">
                        {isReplying ? 'Cancelar' : (comment.adminReply ? 'Editar Resposta' : 'Responder')}
                    </button>
                </div>
                <button onClick={() => onDelete(comment.id)} className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-semibold rounded-md hover:bg-red-200 dark:hover:bg-red-900/50">Excluir</button>
            </div>
            {isReplying && (
                <div className="mt-2 flex gap-2">
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Digite sua resposta..." className="w-full text-sm p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"></textarea>
                    <button onClick={handleReplySubmit} className="px-4 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700">Enviar</button>
                </div>
            )}
        </div>
    );
};

const CommentManager: React.FC = () => {
    const { comments, setComments } = useSite();
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [sectionFilter, setSectionFilter] = useState<Comment['targetType'] | 'all'>('all');

    const handleApprove = (id: string) => {
        setComments(prev => prev.map(c => c.id === id ? { ...c, isApproved: true } : c));
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
            setComments(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleReply = (id: string, replyText: string) => {
        setComments(prev => prev.map(c => c.id === id ? { ...c, adminReply: { text: replyText, timestamp: Date.now() } } : c));
    };

    const filteredComments = useMemo(() => {
        return comments
            .filter(c => {
                if (filter === 'pending') return !c.isApproved;
                if (filter === 'approved') return c.isApproved;
                return true;
            })
            .filter(c => {
                if (sectionFilter === 'all') return true;
                return c.targetType === sectionFilter;
            })
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [comments, filter, sectionFilter]);

    const FilterButton: React.FC<{ current: typeof filter, value: typeof filter, label: string, count: number }> = ({ current, value, label, count }) => (
        <button onClick={() => setFilter(value)} className={`px-3 py-1 text-sm rounded-full transition-colors ${current === value ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
            {label} <span className="text-xs bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full">{count}</span>
        </button>
    );

    const allCount = comments.length;
    const pendingCount = comments.filter(c => !c.isApproved).length;
    const approvedCount = allCount - pendingCount;

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Gerenciar Comentários e Avaliações</h3>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <FilterButton current={filter} value="all" label="Todos" count={allCount} />
                    <FilterButton current={filter} value="pending" label="Pendentes" count={pendingCount} />
                    <FilterButton current={filter} value="approved" label="Aprovados" count={approvedCount} />
                </div>
                <div className="border-l dark:border-gray-600 pl-4">
                    <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value as any)} className="text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                        <option value="all">Todas as Seções</option>
                        <option value="product">Produtos</option>
                        <option value="quiz">Quiz</option>
                        <option value="wordsearch">Caça-Palavras</option>
                        <option value="download">Downloads</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredComments.map(comment => (
                    <CommentItem 
                        key={comment.id} 
                        comment={comment}
                        onApprove={handleApprove}
                        onDelete={handleDelete}
                        onReply={handleReply}
                    />
                ))}
                {filteredComments.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum comentário encontrado para os filtros selecionados.</p>
                )}
            </div>
        </div>
    );
};

export default CommentManager;