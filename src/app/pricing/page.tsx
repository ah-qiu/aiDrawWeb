import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PricingCard } from './components/PricingCard';

const PRICING_PLANS = [
    { id: 'starter', name: '入门包', credits: 50, price: 9.9, popular: false, features: ['50 积分', '可生成约 10 张图', '永不过期'] },
    { id: 'standard', name: '标准包', credits: 200, price: 29.9, popular: true, features: ['200 积分', '可生成约 40 张图', '永不过期', '优先队列'] },
    { id: 'premium', name: '高级包', credits: 500, price: 59.9, popular: false, features: ['500 积分', '可生成约 100 张图', '永不过期', '优先队列', 'VIP 支持'] },
];

export default async function PricingPage() {
    const session = await auth();
    if (!session?.user?.id) { redirect('/auth/signin?callbackUrl=/pricing'); }

    const [user] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, session.user.id));

    return (
        <main className="relative min-h-screen px-6 py-12">
            <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
                <Link href="/" className="text-xl font-bold gradient-text">AI 画图工坊</Link>
                <div className="flex items-center gap-4">
                    <div className="glass-card px-4 py-2 flex items-center gap-2">
                        <span className="text-zinc-400 text-sm">当前余额:</span>
                        <span className="font-semibold text-yellow-400">{user?.balance ?? 0}</span>
                        <span className="text-zinc-400 text-sm">积分</span>
                    </div>
                    <Link href="/dashboard" className="btn-secondary text-sm">返回工作台</Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">选择你的<span className="gradient-text">积分套餐</span></h1>
                <p className="text-zinc-400 max-w-2xl mx-auto">购买积分，解锁无限创意。每次 AI 生图消耗 5 积分，积分永不过期。</p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {PRICING_PLANS.map((plan) => <PricingCard key={plan.id} plan={plan} />)}
            </div>

            <div className="max-w-3xl mx-auto mt-20">
                <h2 className="text-2xl font-bold text-center mb-8">常见问题</h2>
                <div className="space-y-4">
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-2">积分会过期吗？</h3>
                        <p className="text-zinc-400 text-sm">不会。购买的积分永久有效，可随时使用。</p>
                    </div>
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-2">生成失败会扣积分吗？</h3>
                        <p className="text-zinc-400 text-sm">不会。如果 AI 生成失败，系统会自动退还积分到你的账户。</p>
                    </div>
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-2">支持哪些支付方式？</h3>
                        <p className="text-zinc-400 text-sm">目前支持微信支付、支付宝、银行卡等主流支付方式（演示模式）。</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
