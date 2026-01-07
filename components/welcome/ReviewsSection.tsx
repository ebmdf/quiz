
import React, { useState, useEffect } from 'react';
import type { Review } from '../../types';
import { useSite } from '../../context/SiteContext';
import { StarIcon, XIcon } from '../Icons';

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

interface ReviewsSectionProps {
    reviews: Review[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="h-5 w-5 text-amber-400" filled={i < rating} />
        ))}
    </div>
);

const ReviewItem: React.FC<{review: Review, onVideoClick: (url: string) => void}> = ({ review, onVideoClick }) => {
    const imageUrl = useObjectURL(review.image);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center text-center border border-transparent dark:border-gray-700">
            <img src={imageUrl} alt={review.name} className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-indigo-200 dark:border-indigo-900"/>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{review.name}</h3>
            <div className="my-2">
                <StarRating rating={review.rating} />
            </div>
            {review.type === 'text' ? (
                <p className="text-gray-600 dark:text-gray-300 italic">"{review.content}"</p>
            ) : (
                <button
                    onClick={() => onVideoClick(review.content)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Assistir Vídeo
                </button>
            )}
        </div>
    )
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
    const { siteConfig } = useSite();
    const { reviewsConfig } = siteConfig;
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    
    const enabledReviews = reviews.filter(r => r.enabled);

    const getYoutubeEmbedUrl = (url: string) => {
        let videoId = '';
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(youtubeRegex);
        if (match) {
            videoId = match[1];
        }
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null;
    }

    const handleVideoClick = (url: string) => {
        const embedUrl = getYoutubeEmbedUrl(url);
        if (embedUrl) setVideoUrl(embedUrl);
        else alert("URL do vídeo inválida.");
    }

    if (!reviewsConfig.enabled || enabledReviews.length === 0) {
        return (
             <div className="mt-10 p-6 rounded-2xl text-center dark:!bg-gray-900" style={{ backgroundColor: siteConfig.storeConfig.themeBgColor }}>
                 <h2 className="text-2xl font-bold text-center mb-6" style={{ color: siteConfig.storeConfig.themePrimaryColor }}>
                    {reviewsConfig.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Nenhum review disponível no momento.</p>
            </div>
        );
    }

    return (
        <>
            {videoUrl && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4" onClick={() => setVideoUrl(null)}>
                    <div
                        className="relative w-full bg-black rounded-lg shadow-xl"
                        style={{ maxWidth: reviewsConfig.videoModalWidth, aspectRatio: '16 / 9' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <iframe
                            src={videoUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                        ></iframe>
                        <button 
                            onClick={() => setVideoUrl(null)} 
                            className="absolute -top-3 -right-3 bg-white rounded-full p-2 z-10 shadow-lg hover:bg-gray-200 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                            aria-label="Fechar vídeo"
                        >
                            <XIcon className="h-6 w-6 text-black"/>
                        </button>
                    </div>
                </div>
            )}
            <div className="mt-10 p-6 rounded-2xl slide-in dark:!bg-gray-900" style={{ backgroundColor: siteConfig.storeConfig.themeBgColor }}>
                <h2 className="text-2xl font-bold text-center mb-8" style={{ color: siteConfig.storeConfig.themePrimaryColor }}>
                    {reviewsConfig.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enabledReviews.map(review => (
                        <ReviewItem key={review.id} review={review} onVideoClick={handleVideoClick} />
                    ))}
                </div>
            </div>
        </>
    );
};

export default ReviewsSection;
