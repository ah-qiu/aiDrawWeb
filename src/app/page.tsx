import Link from 'next/link';
import { auth } from '@/auth';
import { ThemeToggle } from './components/ThemeToggle';

export default async function Home() {
    const session = await auth();

    return (
        <main className="relative flex min-h-screen flex-col items-center px-6 py-12">
            {/* Header 导航栏 */}
            <header className="w-full max-w-6xl flex items-center justify-between mb-16">
                <Link href="/" className="text-xl font-bold gradient-text">
                    AI 画图工坊
                </Link>
                <nav className="flex items-center gap-6">
                    <Link href="/gallery" className="text-zinc-400 hover:text-white transition-colors">
                        画廊
                    </Link>
                    <Link href="/pricing" className="text-zinc-400 hover:text-white transition-colors">
                        价格
                    </Link>
                    {session ? (
                        <Link href="/dashboard" className="btn-primary text-sm">
                            我的工作台
                        </Link>
                    ) : (
                        <Link href="/auth/signin" className="btn-primary text-sm">
                            登录
                        </Link>
                    )}
                    <ThemeToggle />
                </nav>
            </header>

            {/* Hero 区域 */}
            <section className="flex flex-col items-center text-center max-w-4xl flex-1 justify-center">
                <div className="glass-card px-4 py-2 mb-8 text-sm text-zinc-400">
                    ✨ Powered by <span className="gradient-text font-semibold">Nano Banana</span>
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                    用 AI 释放你的
                    <br />
                    <span className="gradient-text">创意想象力</span>
                </h1>

                <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
                    输入你的灵感，让 Google Gemini 图像模型为你生成惊艳的艺术作品。
                    <br className="hidden sm:block" />
                    每日免费体验，随时开启创作之旅。
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/generate" className="btn-primary flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        立即开始创作
                    </Link>
                    <Link href="/gallery" className="btn-secondary text-center">
                        浏览画廊
                    </Link>
                </div>
            </section>

            {/* 特性卡片区 */}
            <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                <Link href="/auth/signin" className="glass-card p-6 hover:border-purple-500/30 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">每日免费额度</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        注册即送积分，每天签到领取免费生图机会。
                    </p>
                </Link>

                <Link href="/generate" className="glass-card p-6 hover:border-blue-500/30 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">顶级 AI 模型</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        采用 Nano Banana (Gemini Image) 模型，画质与创意双顶。
                    </p>
                </Link>

                <Link href="/gallery" className="glass-card p-6 hover:border-cyan-500/30 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">社区画廊</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        浏览他人作品获取灵感，分享你的创作赢得点赞。
                    </p>
                </Link>
            </section>
        </main>
    );
}
