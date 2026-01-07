import React, { useState, useEffect } from 'react';
import type { Review } from '../../types';
import { useSite } from '../../context/SiteContext';
import { UploadIcon, TrashIcon, PlusIcon, StarIcon } from '../Icons';

const useObjectURL = (file?: File | Blob) => {
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);
    return url;
};

const StarRatingInput: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
            <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1 rounded-full text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
                <StarIcon filled={star <= rating} className="h-6 w-6"/>
            </button>
        ))}
    </div>
);

const ReviewItem: React.FC<{review: Review, onToggle: (id: string) => void, onDelete: (id: string) => void}> = ({ review, onToggle, onDelete }) => {
    const imageUrl = useObjectURL(review.image);
    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 rounded-md gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <img src={imageUrl} alt={review.name} className="w-12 h-12 object-cover rounded-full" />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-gray-900 dark:text-white">{review.name} <span className="font-normal text-amber-500">({review.rating}★)</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{review.type === 'text' ? review.content : review.content}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onToggle(review.id)}
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ${review.enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                >
                    <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${review.enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
                </button>
                <button onClick={() => onDelete(review.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"><TrashIcon /></button>
            </div>
        </div>
    );
};

const ReviewManager: React.FC = () => {
    const { reviews, setReviews, siteConfig, setSiteConfig } = useSite();
    const [name, setName] = useState('');
    const [rating, setRating] = useState(5);
    const [type, setType] = useState<'text' | 'video'>('text');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formKey, setFormKey] = useState(Date.now());
    
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        }
    }, [imagePreview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const handleAddReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) {
            alert('Por favor, faça upload de uma imagem para o review.');
            return;
        }
        const newReview: Review = {
            id: new Date().toISOString(),
            name,
            rating,
            type,
            content,
            image: imageFile,
            enabled: true
        };
        setReviews([...reviews, newReview]);
        
        setName('');
        setRating(5);
        setType('text');
        setContent('');
        setImageFile(null);
        setImagePreview(null);
        setFormKey(Date.now());
    };
    
    const handleToggleReview = (id: string) => {
        setReviews(reviews.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    }
    
    const handleDeleteReview = (id: string) => {
        if (window.confirm("Tem certeza que deseja remover este review?")) {
            setReviews(reviews.filter(r => r.id !== id));
        }
    }

    const handleReviewsConfigChange = (key: string, value: any) => {
        setSiteConfig(prev => ({
            ...prev,
            reviewsConfig: {
                ...prev.reviewsConfig,
                [key]: value
            }
        }));
    }

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Gerenciar Reviews</h3>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4 mb-6">
                <div className="flex items-center">
                    <input type="checkbox" id="reviews-enabled" checked={siteConfig.reviewsConfig.enabled} onChange={e => handleReviewsConfigChange('enabled', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <label htmlFor="reviews-enabled" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-200">Ativar seção de Reviews no site</label>
                </div>
                 <div className={`space-y-4 ${!siteConfig.reviewsConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                     <div>
                        <label htmlFor="reviews-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título da Seção</label>
                        <input type="text" id="reviews-title" value={siteConfig.reviewsConfig.title} onChange={e => handleReviewsConfigChange('title', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="videoModalWidth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Largura Máxima do Player de Vídeo</label>
                        <input type="text" id="videoModalWidth" value={siteConfig.reviewsConfig.videoModalWidth} onChange={e => handleReviewsConfigChange('videoModalWidth', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="ex: 900px, 80vw"/>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">A altura será ajustada automaticamente para manter a proporção 16:9.</p>
                    </div>
                </div>
            </div>

            <form key={formKey} onSubmit={handleAddReview} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4 mb-6">
                <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300">Adicionar Novo Review</h4>
                <div>
                    <label htmlFor="review-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                    <input type="text" id="review-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avaliação</label>
                    <StarRatingInput rating={rating} setRating={setRating} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imagem de Perfil</label>
                    <div className="mt-1 flex items-center gap-4">
                        <span className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
                            {imagePreview ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" /> : <UploadIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                        </span>
                        <input id="review-upload" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Review</label>
                    <div className="mt-2 flex gap-4 text-gray-900 dark:text-gray-200">
                        <label className="flex items-center"><input type="radio" value="text" checked={type === 'text'} onChange={() => setType('text')} className="mr-1" /> Texto</label>
                        <label className="flex items-center"><input type="radio" value="video" checked={type === 'video'} onChange={() => setType('video')} className="mr-1"/> Vídeo (YouTube)</label>
                    </div>
                </div>
                <div>
                     <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo</label>
                     {type === 'text' ? (
                        <textarea id="review-content" value={content} onChange={e => setContent(e.target.value)} rows={4} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                     ) : (
                        <input type="url" id="review-content" placeholder="https://www.youtube.com/watch?v=..." value={content} onChange={e => setContent(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                     )}
                </div>
                 <div className="text-right">
                    <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"><PlusIcon /> Adicionar Review</button>
                </div>
            </form>

            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Reviews Atuais</h4>
            <div className="space-y-2">
                {reviews.map(review => (
                     <ReviewItem key={review.id} review={review} onToggle={handleToggleReview} onDelete={handleDeleteReview} />
                ))}
                 {reviews.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhum review adicionado.</p>}
            </div>
        </div>
    );
};

export default ReviewManager;