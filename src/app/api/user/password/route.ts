import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '未登录' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: '请输入当前密码和新密码' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: '新密码长度至少需要6位' }, { status: 400 });
        }

        // 获取用户当前信息（包含密码哈希）
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 });
        }

        // 检查是否为 Credentials 用户
        if (!user.password) {
            return NextResponse.json({ error: 'OAuth 登录用户无法修改密码' }, { status: 403 });
        }

        // 验证当前密码
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: '当前密码错误' }, { status: 400 });
        }

        // 哈希新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 更新数据库
        await db
            .update(users)
            .set({
                password: hashedPassword,
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: '修改失败，请稍后重试' }, { status: 500 });
    }
}
