'use client';

import { useEffect } from 'react';

interface ImageLightboxProps {
    imageUrl: string;
    prompt: string;
    onClose: () => void;
}

export function ImageLightbox({ imageUrl, prompt, onClose }: ImageLightboxProps) {
    // 按 ESC 关闭
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt={prompt}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                    <p className="text-white text-sm font-medium line-clamp-3">{prompt}</p>
                </div>
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
