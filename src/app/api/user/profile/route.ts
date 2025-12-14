import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '未登录' }, { status: 401 });
        }

        const { name, image } = await req.json();

        // 验证数据
        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: '昵称不能为空' }, { status: 400 });
        }

        // 检查昵称唯一性 (排除自己)
        const existingUser = await db.query.users.findFirst({
            where: and(
                eq(users.name, name),
                ne(users.id, session.user.id)
            ),
        });

        if (existingUser) {
            return NextResponse.json({ error: '该昵称已被使用，请换一个' }, { status: 400 });
        }

        // 更新用户
        await db
            .update(users)
            .set({
                name,
                image: image || null, // 允许清空头像
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: '更新失败，请稍后重试' }, { status: 500 });
    }
}
