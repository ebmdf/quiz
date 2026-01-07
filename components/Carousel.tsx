import React, { useState, useEffect, useCallback } from 'react';
import type { CarouselConfig, ButtonPosition, CarouselImage } from '../types';

const getPositionClasses = (position?: ButtonPosition) => {
    switch (position) {
        case 'top-left': return 'items-start justify-start';
        case 'top-center': return 'items-start justify-center';
        case 'top-right': return 'items-start justify-end';
        case 'bottom-left': return 'items-end justify-start';
        case 'bottom-center': return 'items-end justify-center';
        case 'bottom-right': return 'items-end justify-end';
        case 'center':
        default: return 'items-center justify-center';
    }
};

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


const CarouselSlide: React.FC<{ image: CarouselImage }> = ({ image }) => {
    const imageUrl = useObjectURL(image.image);

    const slideContent = (
         <div 
            style={{ 
                backgroundImage: `url(${imageUrl})`,
             }} 
            className="w-full h-full bg-center bg-cover relative"
        >
            {image.link && image.showButton && image.buttonText && (
                <div className={`absolute inset-0 bg-black/20 flex p-4 ${getPositionClasses(image.buttonPosition)}`}>
                    <a
                        href={image.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            backgroundColor: image.buttonColor || '#4f46e5',
                            color: image.buttonTextColor || '#ffffff'
                        }}
                        className="px-6 py-3 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                        onClick={(e) => e.stopPropagation()} // Prevent slide change on button click
                    >
                        {image.buttonText}
                    </a>
                </div>
            )}
        </div>
    );

    if (image.link && !image.showButton) {
        return (
            <a href={image.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                {slideContent}
            </a>
        );
    }
    return slideContent;
}

interface CarouselProps {
    config: CarouselConfig;
}

const Carousel: React.FC<CarouselProps> = ({ config }) => {
    const { images, width, height, autoplay, transitionSpeed, transitionType } = config;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');

    const goToPrevious = () => {
        setDirection('prev');
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = useCallback(() => {
        setDirection('next');
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, images.length]);

    const goToSlide = (slideIndex: number) => {
        if (slideIndex > currentIndex) {
            setDirection('next');
        } else if (slideIndex < currentIndex) {
            setDirection('prev');
        }
        setCurrentIndex(slideIndex);
    };

    useEffect(() => {
        if (autoplay && images.length > 1) {
            const slideInterval = setInterval(goToNext, (transitionSpeed || 3000));
            return () => clearInterval(slideInterval);
        }
    }, [goToNext, autoplay, images.length, transitionSpeed]);

    if (!images || images.length === 0) {
        return null;
    }
    
    const getAnimationClass = () => {
        switch(transitionType) {
            case 'slide':
                return direction === 'next' ? 'animate-carousel-slide-from-right' : 'animate-carousel-slide-from-left';
            case 'zoom':
                return 'animate-carousel-zoom';
            case 'fade':
            default:
                return 'animate-carousel-fade';
        }
    };

    const image = images[currentIndex];

    return (
        <div style={{ width, height }} className="relative m-auto group overflow-hidden">
            <div key={currentIndex} className={`w-full h-full ${getAnimationClass()}`}>
                <CarouselSlide image={image} />
            </div>
            
            {images.length > 1 && (
                <>
                    {/* Left Arrow */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={goToPrevious}>
                        &#10094;
                    </div>
                    {/* Right Arrow */}
                    <div className="absolute top-1/2 -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={goToNext}>
                        &#10095;
                    </div>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center py-2">
                        {images.map((_, slideIndex) => (
                            <div key={slideIndex} onClick={() => goToSlide(slideIndex)} className={`w-3 h-3 rounded-full mx-1 cursor-pointer transition-colors ${currentIndex === slideIndex ? 'bg-white' : 'bg-white/50'}`}></div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Carousel;
