'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PricingPlan {
    id: string;
    name: string;
    credits: number;
    price: number;
    popular: boolean;
    features: string[];
}

export function PricingCard({ plan }: { plan: PricingPlan }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: plan.id }),
            });
            const data = await res.json();

            if (data.success) {
                alert(`充值成功！获得 ${plan.credits} 积分`);
                router.refresh();
            } else {
                alert(data.error || '充值失败');
            }
        } catch {
            alert('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`glass-card p-8 relative ${plan.popular ? 'border-purple-500/50 scale-105' : ''}`}>
            {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-sm font-medium">最受欢迎</div>
            )}
            <h3 className="text-xl font-bold text-center mb-2">{plan.name}</h3>
            <div className="text-center mb-4">
                <span className="text-4xl font-bold gradient-text">{plan.credits}</span>
                <span className="text-zinc-400 ml-2">积分</span>
            </div>
            <div className="text-center mb-6">
                <span className="text-3xl font-bold">¥{plan.price}</span>
            </div>
            <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                        <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                    </li>
                ))}
            </ul>
            <button onClick={handlePurchase} disabled={loading} className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.popular ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90' : 'bg-zinc-800 text-white hover:bg-zinc-700'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                {loading ? '处理中...' : '立即购买'}
            </button>
        </div>
    );
}
