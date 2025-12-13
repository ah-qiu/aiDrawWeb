import { auth } from '@/auth';
import { db } from '@/db';
import { users, transactions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

const PRICING_PLANS: Record<string, { credits: number; price: number }> = {
    starter: { credits: 50, price: 9.9 },
    standard: { credits: 200, price: 29.9 },
    premium: { credits: 500, price: 59.9 },
};

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { planId } = body;

        const plan = PRICING_PLANS[planId];
        if (!plan) {
            return NextResponse.json({ error: '无效的套餐' }, { status: 400 });
        }

        // 更新余额
        await db
            .update(users)
            .set({
                balance: sql`${users.balance} + ${plan.credits}`,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        // 记录交易
        const planName = planId === 'starter' ? '入门' : planId === 'standard' ? '标准' : '高级';
        await db.insert(transactions).values({
            userId,
            amount: plan.credits,
            type: 'DEPOSIT',
            description: `购买${planName}套餐 (¥${plan.price})`,
        });

        // 获取更新后余额
        const [updatedUser] = await db
            .select({ balance: users.balance })
            .from(users)
            .where(eq(users.id, userId));

        return NextResponse.json({
            success: true,
            message: `充值成功！获得 ${plan.credits} 积分`,
            credits: plan.credits,
            newBalance: updatedUser?.balance ?? 0,
        });
    } catch (error) {
        console.error('充值失败:', error);
        return NextResponse.json({ error: '充值失败，请稍后重试' }, { status: 500 });
    }
}
