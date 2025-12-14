import { auth } from '@/auth';
import Link from 'next/link';
import { Suspense } from 'react';
import { GalleryGrid } from './components/GalleryGrid';
import { GallerySkeleton } from './components/GallerySkeleton';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
    const session = await auth();
    const currentUserId = session?.user?.id;

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

            <Suspense fallback={<GallerySkeleton />}>
                <GalleryGrid currentUserId={currentUserId} />
            </Suspense>
        </main>
    );
}
