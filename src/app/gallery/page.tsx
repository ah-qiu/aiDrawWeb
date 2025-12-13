import { auth } from '@/auth';
import { db } from '@/db';
import { generations, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function GalleryPage() {
    const session = await auth();

    const artworks = await db
        .select({ id: generations.id, prompt: generations.prompt, imageUrl: generations.imageUrl, createdAt: generations.createdAt, userName: users.name, userImage: users.image })
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
                    <Link href="/generate" className="text-zinc-400 hover:text-white transition-colors">生成图片</Link>
                    {session ? (
                        <Link href="/dashboard" className="btn-primary text-sm">我的工作台</Link>
                    ) : (
                        <Link href="/auth/signin" className="btn-primary text-sm">登录</Link>
                    )}
                </nav>
            </header>

            <div className="max-w-6xl mx-auto mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4">社区<span className="gradient-text">画廊</span></h1>
                <p className="text-zinc-400 max-w-2xl mx-auto">探索由 AI 生成的精彩艺术作品，获取灵感，或分享你的创作</p>
            </div>

            {artworks.length > 0 ? (
                <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {artworks.map((artwork) => (
                        <div key={artwork.id} className="glass-card overflow-hidden break-inside-avoid">
                            {artwork.imageUrl && <img src={artwork.imageUrl} alt={artwork.prompt} className="w-full object-cover" />}
                            <div className="p-4">
                                <p className="text-sm text-zinc-300 line-clamp-2 mb-3">{artwork.prompt}</p>
                                <div className="flex items-center gap-2">
                                    {artwork.userImage && <img src={artwork.userImage} alt={artwork.userName ?? 'User'} className="w-6 h-6 rounded-full" />}
                                    <span className="text-xs text-zinc-500">{artwork.userName ?? '匿名用户'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="max-w-6xl mx-auto text-center py-24">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-zinc-800 flex items-center justify-center">
                        <svg className="w-12 h-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">还没有作品</h3>
                    <p className="text-zinc-400 mb-6">成为第一个创作者，开始生成你的 AI 艺术作品！</p>
                    <Link href="/generate" className="btn-primary inline-block">开始创作</Link>
                </div>
            )}
        </main>
    );
}
