import { auth } from '@/auth';
import { db } from '@/db';
import { users, generations, transactions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { generateImage } from '@/lib/gemini';
import { NextResponse } from 'next/server';

const GENERATION_COST = 5;

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { prompt, negativePrompt } = body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json({ error: '请输入有效的提示词' }, { status: 400 });
        }

        // 检查余额
        const [user] = await db
            .select({ balance: users.balance })
            .from(users)
            .where(eq(users.id, userId));

        if (!user || user.balance < GENERATION_COST) {
            return NextResponse.json({
                error: `积分不足，需要 ${GENERATION_COST} 积分，当前余额 ${user?.balance ?? 0}`,
            }, { status: 400 });
        }

        // 创建生成记录
        const [newGeneration] = await db
            .insert(generations)
            .values({
                userId,
                prompt: prompt.trim(),
                negativePrompt: negativePrompt?.trim() || null,
                status: 'PROCESSING',
                cost: GENERATION_COST,
            })
            .returning();

        try {
            // 扣除积分
            await db
                .update(users)
                .set({
                    balance: sql`${users.balance} - ${GENERATION_COST}`,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));

            // 记录交易
            await db.insert(transactions).values({
                userId,
                amount: -GENERATION_COST,
                type: 'GENERATE',
                description: `生成图片: ${prompt.substring(0, 50)}...`,
            });

            // 调用 AI 生成
            const result = await generateImage(prompt);

            if (result.success && result.imageData) {
                await db
                    .update(generations)
                    .set({
                        status: 'COMPLETED',
                        imageUrl: result.imageData,
                        completedAt: new Date(),
                    })
                    .where(eq(generations.id, newGeneration.id));

                return NextResponse.json({
                    success: true,
                    generationId: newGeneration.id,
                    imageUrl: result.imageData,
                });
            } else {
                // 生成失败，退款
                await db
                    .update(users)
                    .set({
                        balance: sql`${users.balance} + ${GENERATION_COST}`,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));

                await db.insert(transactions).values({
                    userId,
                    amount: GENERATION_COST,
                    type: 'REFUND',
                    description: '生成失败退款',
                });

                await db
                    .update(generations)
                    .set({ status: 'FAILED', errorMessage: result.error })
                    .where(eq(generations.id, newGeneration.id));

                return NextResponse.json({ error: result.error || '图片生成失败' }, { status: 500 });
            }
        } catch (apiError) {
            // 异常退款
            await db
                .update(users)
                .set({
                    balance: sql`${users.balance} + ${GENERATION_COST}`,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));

            await db.insert(transactions).values({
                userId,
                amount: GENERATION_COST,
                type: 'REFUND',
                description: '生成异常退款',
            });

            await db
                .update(generations)
                .set({
                    status: 'FAILED',
                    errorMessage: apiError instanceof Error ? apiError.message : '未知错误',
                })
                .where(eq(generations.id, newGeneration.id));

            throw apiError;
        }
    } catch (error) {
        console.error('生成图片错误:', error);
        return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 });
    }
}
