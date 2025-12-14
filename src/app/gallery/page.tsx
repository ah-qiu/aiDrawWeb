import { auth } from '@/auth';
import { db } from '@/db';
import { generations, users, likes } from '@/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import Link from 'next/link';
import { LikeButton } from './components/LikeButton';

export default async function GalleryPage() {
    const session = await auth();
    const currentUserId = session?.user?.id;

    // 获取作品列表，同时关联用户信息的点赞数据
    // 注意：这里使用 map 来处理数据，或者更复杂的查询。
    // 为了性能和简单起见，我们先获取作品，然后对每个作品查询点赞数（N+1问题在小数据量下可接受，或者使用聚合查询）

    // 更好的方式是使用聚合查询
    const artworksData = await db
        .select({
            id: generations.id,
            prompt: generations.prompt,
            imageUrl: generations.imageUrl,
            createdAt: generations.createdAt,
            userName: users.name,
            userImage: users.image,
            likeCount: sql<number>`(SELECT count(*) FROM ${likes} WHERE ${likes.generationId} = ${generations.id})`,
            // 如果用户已登录，检查是否已点赞
            isLiked: currentUserId
                ? sql<boolean>`EXISTS (SELECT 1 FROM ${likes} WHERE ${likes.generationId} = ${generations.id} AND ${likes.userId} = ${currentUserId})`
                : sql<boolean>`false`
        })
        .from(generations)
        .leftJoin(users, eq(generations.userId, users.id))
        .where(eq(generations.status, 'COMPLETED'))
        .orderBy(desc(generations.createdAt))
        .limit(50);

    return (
        <main className="relative min-h-screen px-6 py-12">
            <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
                <Link href="/" className="text-xl font-bold gradient-text">AI 画图工坊</Link>
                <nav className="flex items-center gap-6">
                    <Link href="/generate" className="text-zinc-400 hover:text-[var(--foreground)] transition-colors">生成图片</Link>
                    {session ? (
                        <Link href="/dashboard" className="btn-primary text-sm">我的工作台</Link>
                    ) : (
                        <Link href="/auth/signin" className="btn-primary text-sm">登录</Link>
                    )}
                </nav>
            </header>

            <div className="max-w-6xl mx-auto mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4">社区<span className="gradient-text">画廊</span></h1>
                <p className="opacity-70 max-w-2xl mx-auto">探索由 AI 生成的精彩艺术作品，获取灵感，或分享你的创作</p>
            </div>

            {artworksData.length > 0 ? (
                <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {artworksData.map((artwork) => (
                        <div key={artwork.id} className="glass-card overflow-hidden break-inside-avoid shadow-sm hover:shadow-md transition-shadow">
                            {artwork.imageUrl && <img src={artwork.imageUrl} alt={artwork.prompt} className="w-full object-cover" />}
                            <div className="p-4">
                                <p className="text-sm opacity-80 line-clamp-2 mb-3 font-medium">{artwork.prompt}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {artwork.userImage && <img src={artwork.userImage} alt={artwork.userName ?? 'User'} className="w-6 h-6 rounded-full" />}
                                        <span className="text-xs opacity-60">{artwork.userName ?? '匿名用户'}</span>
                                    </div>
                                    <LikeButton
                                        generationId={artwork.id}
                                        initialCount={Number(artwork.likeCount)}
                                        initialIsLiked={Boolean(artwork.isLiked)}
                                        isLoggedIn={!!currentUserId}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="max-w-6xl mx-auto text-center py-24">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-zinc-800/10 flex items-center justify-center">
                        <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">还没有作品</h3>
                    <p className="opacity-60 mb-6">成为第一个创作者，开始生成你的 AI 艺术作品！</p>
                    <Link href="/generate" className="btn-primary inline-block">开始创作</Link>
                </div>
            )}
        </main>
    );
}
