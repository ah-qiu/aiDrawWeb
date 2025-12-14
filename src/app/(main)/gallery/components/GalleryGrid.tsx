import { db } from '@/db';
import { generations, users, likes } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { ArtworkCard } from './ArtworkCard';
import Link from 'next/link';

interface GalleryGridProps {
    currentUserId?: string;
}

export async function GalleryGrid({ currentUserId }: GalleryGridProps) {
    console.log('[GalleryGrid] Fetching data. currentUserId:', currentUserId);
    const start = Date.now();

    try {
        const artworksData = await db
            .select({
                id: generations.id,
                prompt: generations.prompt,
                imageUrl: generations.imageUrl,
                createdAt: generations.createdAt,
                userName: users.name,
                userImage: users.image,
                likeCount: sql<number>`(SELECT count(*) FROM ${likes} WHERE ${likes.generationId} = ${generations.id})`,
                isLiked: currentUserId
                    ? sql<boolean>`EXISTS (SELECT 1 FROM ${likes} WHERE ${likes.generationId} = ${generations.id} AND ${likes.userId} = ${currentUserId})`
                    : sql<boolean>`false` // Using raw string literal false which works with postgres
            })
            .from(generations)
            .leftJoin(users, eq(generations.userId, users.id))
            .where(eq(generations.status, 'COMPLETED'))
            .orderBy(desc(generations.createdAt))
            .limit(50);

        console.log('[GalleryGrid] Data fetched in', Date.now() - start, 'ms. Count:', artworksData.length);

        if (artworksData.length === 0) {
            return (
                <div className="max-w-6xl mx-auto text-center py-24 animate-in fade-in duration-500">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-zinc-800/10 flex items-center justify-center">
                        <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">还没有作品</h3>
                    <p className="opacity-60 mb-6">成为第一个创作者，开始生成你的 AI 艺术作品！</p>
                    <Link href="/generate" className="btn-primary inline-block">开始创作</Link>
                </div>
            );
        }

        return (
            <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 animate-in fade-in duration-500">
                {artworksData.map((artwork) => (
                    <ArtworkCard
                        key={artwork.id}
                        id={artwork.id}
                        prompt={artwork.prompt}
                        imageUrl={artwork.imageUrl}
                        userName={artwork.userName}
                        userImage={artwork.userImage}
                        likeCount={Number(artwork.likeCount)}
                        isLiked={Boolean(artwork.isLiked)}
                        isLoggedIn={!!currentUserId}
                    />
                ))}
            </div>
        );
    } catch (error) {
        console.error('[GalleryGrid] Error fetching data:', error);
        return (
            <div className="max-w-6xl mx-auto text-center py-24 text-red-500">
                <p>加载失败，请稍后重试。</p>
                <p className="text-xs opacity-50 mt-2">{String(error)}</p>
            </div>
        );
    }
}
