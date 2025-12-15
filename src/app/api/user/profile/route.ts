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

        // 验证昵称
        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: '昵称不能为空' }, { status: 400 });
        }

        // 验证头像（如果提供）
        if (image) {
            // 检查是否是 Base64 格式或 URL
            const isBase64 = image.startsWith('data:image/');
            const isUrl = image.startsWith('http://') || image.startsWith('https://');

            if (!isBase64 && !isUrl) {
                return NextResponse.json({ error: '无效的头像格式' }, { status: 400 });
            }

            // 如果是 Base64，检查大小（300KB 编码后约对应 200KB 原始数据）
            if (isBase64 && image.length > 300 * 1024) {
                return NextResponse.json({ error: '头像图片过大，请重新选择' }, { status: 400 });
            }

            // 如果是 Base64，验证 MIME 类型
            if (isBase64) {
                const mimeMatch = image.match(/^data:(image\/[^;]+);base64,/);
                const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!mimeMatch || !allowedMimes.includes(mimeMatch[1])) {
                    return NextResponse.json({ error: '不支持的图片格式' }, { status: 400 });
                }
            }
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
