'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
    generationId: string;
    initialCount: number;
    initialIsLiked: boolean;
    isLoggedIn: boolean;
}

export function LikeButton({ generationId, initialCount, initialIsLiked, isLoggedIn }: LikeButtonProps) {
    const [count, setCount] = useState(initialCount);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleToggleLike = async (e: React.MouseEvent) => {
        e.preventDefault(); // 防止点击卡片跳转（如果有）
        e.stopPropagation();

        if (!isLoggedIn) {
            router.push('/auth/signin');
            return;
        }

        if (isLoading) return;

        // 乐观 UI 更新
        const previousIsLiked = isLiked;
        const previousCount = count;

        setIsLiked(!isLiked);
        setCount(isLiked ? count - 1 : count + 1);
        setIsLoading(true);

        try {
            const res = await fetch('/api/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ generationId }),
            });

            if (!res.ok) throw new Error('Failed');

            const data = await res.json();
            if (data.success) {
                // 使用服务器返回的确切数据校准
                setIsLiked(data.isLiked);
                setCount(data.count);
            } else {
                // 失败回滚
                setIsLiked(previousIsLiked);
                setCount(previousCount);
            }
        } catch (error) {
            // 失败回滚
            setIsLiked(previousIsLiked);
            setCount(previousCount);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 group ${isLiked
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-zinc-100/10 text-zinc-400 hover:bg-red-500/10 hover:text-red-400'
                }`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth={isLiked ? 0 : 1.5}
                stroke="currentColor"
                fill={isLiked ? "currentColor" : "none"}
                className={`w-4 h-4 transition-transform duration-200 ${isLiked ? 'scale-110' : 'group-hover:scale-110'}`}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
            </svg>
            <span className="text-xs font-medium min-w-[12px]">{count}</span>
        </button>
    );
}
