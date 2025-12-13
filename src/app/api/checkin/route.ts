import { auth } from '@/auth';
import { db } from '@/db';
import { users, transactions } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

const DAILY_REWARD = 10;

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 });
        }

        const userId = session.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 检查今天是否已签到
        const existingCheckIn = await db
            .select()
            .from(transactions)
            .where(and(
                eq(transactions.userId, userId),
                eq(transactions.type, 'DAILY'),
                gte(transactions.createdAt, today)
            ))
            .limit(1);

        if (existingCheckIn.length > 0) {
            return NextResponse.json({
                success: false,
                message: '今天已签到，明天再来吧！',
                alreadyCheckedIn: true,
            });
        }

        // 更新用户余额 (不使用事务，Neon HTTP 不支持)
        await db
            .update(users)
            .set({
                balance: sql`${users.balance} + ${DAILY_REWARD}`,
                lastCheckIn: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        // 记录签到交易
        await db.insert(transactions).values({
            userId,
            amount: DAILY_REWARD,
            type: 'DAILY',
            description: '每日签到奖励',
        });

        // 获取更新后的余额
        const [updatedUser] = await db
            .select({ balance: users.balance })
            .from(users)
            .where(eq(users.id, userId));

        return NextResponse.json({
            success: true,
            message: `签到成功！获得 ${DAILY_REWARD} 积分`,
            reward: DAILY_REWARD,
            newBalance: updatedUser?.balance ?? 0,
        });
    } catch (error) {
        console.error('签到失败:', error);
        return NextResponse.json({ error: '签到失败，请稍后重试' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 });
        }

        const userId = session.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingCheckIn = await db
            .select()
            .from(transactions)
            .where(and(
                eq(transactions.userId, userId),
                eq(transactions.type, 'DAILY'),
                gte(transactions.createdAt, today)
            ))
            .limit(1);

        const [user] = await db
            .select({ balance: users.balance, lastCheckIn: users.lastCheckIn })
            .from(users)
            .where(eq(users.id, userId));

        return NextResponse.json({
            checkedInToday: existingCheckIn.length > 0,
            balance: user?.balance ?? 0,
            lastCheckIn: user?.lastCheckIn,
            dailyReward: DAILY_REWARD,
        });
    } catch (error) {
        console.error('获取签到状态失败:', error);
        return NextResponse.json({ error: '获取状态失败' }, { status: 500 });
    }
}
