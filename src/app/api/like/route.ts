import { auth } from '@/auth';
import { db } from '@/db';
import { likes } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 });
        }

        const { generationId } = await req.json();
        if (!generationId) {
            return NextResponse.json({ error: '参数错误' }, { status: 400 });
        }

        const userId = session.user.id;

        // 检查是否已点赞
        const existingLike = await db
            .select()
            .from(likes)
            .where(and(
                eq(likes.userId, userId),
                eq(likes.generationId, generationId)
            ))
            .limit(1);

        let isLiked = false;

        if (existingLike.length > 0) {
            // 已点赞 -> 取消点赞
            await db
                .delete(likes)
                .where(and(
                    eq(likes.userId, userId),
                    eq(likes.generationId, generationId)
                ));
            isLiked = false;
        } else {
            // 未点赞 -> 添加点赞
            await db.insert(likes).values({
                userId,
                generationId,
            });
            isLiked = true;
        }

        // 获取最新点赞总数
        const [result] = await db
            .select({ count: sql<number>`count(*)` })
            .from(likes)
            .where(eq(likes.generationId, generationId));

        return NextResponse.json({
            success: true,
            isLiked,
            count: Number(result?.count ?? 0),
        });

    } catch (error) {
        console.error('点赞操作失败:', error);
        return NextResponse.json({ error: '操作失败' }, { status: 500 });
    }
}
