'use client';

import { useState } from 'react';
import { LikeButton } from './LikeButton';
import { ImageLightbox } from './ImageLightbox';

interface ArtworkCardProps {
    id: string;
    prompt: string;
    imageUrl: string | null;
    userName: string | null;
    userImage: string | null;
    likeCount: number;
    isLiked: boolean;
    isLoggedIn: boolean;
}

export function ArtworkCard({
    id,
    prompt,
    imageUrl,
    userName,
    userImage,
    likeCount,
    isLiked,
    isLoggedIn,
}: ArtworkCardProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);

    return (
        <>
            <div className="glass-card overflow-hidden break-inside-avoid shadow-sm hover:shadow-md transition-shadow">
                {imageUrl && (
                    <div
                        className="relative w-full aspect-square overflow-hidden bg-zinc-200/30 dark:bg-zinc-800/30 cursor-pointer group"
                        onClick={() => setShowLightbox(true)}
                    >
                        {/* 骨架占位符 */}
                        {!isLoaded && (
                            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-200/50 to-zinc-300/50 dark:from-zinc-700/50 dark:to-zinc-800/50" />
                        )}
                        {/* 实际图片 */}
                        <img
                            src={imageUrl}
                            alt={prompt}
                            className={`w-full h-full object-cover transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}
                            loading="lazy"
                            onLoad={() => setIsLoaded(true)}
                        />
                        {/* 放大提示 */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-2xl transition-opacity">🔍</span>
                        </div>
                    </div>
                )}
                <div className="p-4">
                    <p className="text-sm opacity-80 line-clamp-2 mb-3 font-medium">{prompt}</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {userImage && (
                                <img src={userImage} alt={userName ?? 'User'} className="w-6 h-6 rounded-full" />
                            )}
                            <span className="text-xs opacity-60">{userName ?? '匿名用户'}</span>
                        </div>
                        <LikeButton
                            generationId={id}
                            initialCount={likeCount}
                            initialIsLiked={isLiked}
                            isLoggedIn={isLoggedIn}
                        />
                    </div>
                </div>
            </div>

            {/* 弹窗查看大图 */}
            {showLightbox && imageUrl && (
                <ImageLightbox
                    imageUrl={imageUrl}
                    prompt={prompt}
                    onClose={() => setShowLightbox(false)}
                />
            )}
        </>
    );
}
