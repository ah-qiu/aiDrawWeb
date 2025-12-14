import { auth, signOut } from '@/auth';
import { db } from '@/db';
import { users, generations, likes } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckInButton } from './components/CheckInButton';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    const [userData] = await db
        .select({ balance: users.balance, name: users.name, image: users.image, lastCheckIn: users.lastCheckIn })
        .from(users)
        .where(eq(users.id, session.user.id));

    // 如果用户不存在（可能是 session 过期或数据不一致），重定向到登录
    if (!userData) {
        redirect('/auth/signin');
    }

    const [generationsData] = await db
        .select({ count: count() })
        .from(generations)
        .where(eq(generations.userId, session.user.id));

    const generationCount = generationsData?.count ?? 0;

    // 获取总获赞数
    // 统计该用户所有作品的获赞数总和
    const [likesData] = await db
        .select({ count: count() })
        .from(likes)
        .innerJoin(generations, eq(likes.generationId, generations.id))
        .where(eq(generations.userId, session.user.id));

    const totalLikesReceived = likesData?.count ?? 0;

    return (
        <main className="relative min-h-screen px-6 py-12">
            <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
                <Link href="/" className="text-xl font-bold gradient-text">AI 画图工坊</Link>
                <div className="flex items-center gap-4">
                    <div className="glass-card px-4 py-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className="font-semibold">{userData?.balance ?? 0}</span>
                        <span className="text-zinc-400 text-sm">积分</span>
                        <Link href="/pricing" className="ml-2 text-xs px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition-opacity">充值</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {userData?.image && <img src={userData.image} alt={userData.name ?? 'User'} className="w-10 h-10 rounded-full border-2 border-zinc-700" />}
                        <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
                            <button type="submit" className="text-sm text-zinc-400 hover:text-white transition-colors">退出</button>
                        </form>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto">
                <section className="mb-12">
                    <h1 className="text-3xl font-bold mb-2">欢迎回来，{userData?.name ?? '创作者'}！</h1>
                    <p className="text-zinc-400">准备好开始今天的创作了吗？</p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">每日签到</h3>
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-sm mb-4">每日签到可获得 10 积分奖励</p>
                        <CheckInButton />
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">开始创作</h3>
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-sm mb-4">使用 AI 生成独特的艺术作品</p>
                        <Link href="/generate" className="btn-primary inline-block text-center w-full">生成图片</Link>
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">我的作品</h3>
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-sm mb-4">查看你创作的所有作品</p>
                        <Link href="/gallery" className="btn-secondary inline-block text-center w-full">查看画廊</Link>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-6">账户概览</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card p-4 text-center">
                            <div className="text-3xl font-bold gradient-text mb-1">{userData?.balance ?? 0}</div>
                            <div className="text-zinc-400 text-sm">可用积分</div>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-1">{generationCount}</div>
                            <div className="text-zinc-400 text-sm">生成作品</div>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <div className="text-3xl font-bold text-green-400 mb-1">{totalLikesReceived}</div>
                            <div className="text-zinc-400 text-sm">获得点赞</div>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <div className="text-3xl font-bold text-cyan-400 mb-1">10</div>
                            <div className="text-zinc-400 text-sm">每日免费</div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
