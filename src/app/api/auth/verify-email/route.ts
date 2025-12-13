import { db } from '@/db';
import { users, verificationTokens } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, email } = body;

        if (!token || !email) {
            return NextResponse.json({ error: '无效的验证链接' }, { status: 400 });
        }

        // 查找验证令牌
        const [verifyToken] = await db
            .select()
            .from(verificationTokens)
            .where(and(
                eq(verificationTokens.identifier, email),
                eq(verificationTokens.token, token)
            ));

        if (!verifyToken) {
            return NextResponse.json({ error: '验证链接无效或已过期' }, { status: 400 });
        }

        // 检查是否过期
        if (new Date() > verifyToken.expires) {
            await db.delete(verificationTokens).where(and(
                eq(verificationTokens.identifier, email),
                eq(verificationTokens.token, token)
            ));
            return NextResponse.json({ error: '验证链接已过期，请重新注册' }, { status: 400 });
        }

        // 检查用户是否已存在
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (existingUser) {
            return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 });
        }

        // 创建用户
        const [newUser] = await db
            .insert(users)
            .values({
                name: verifyToken.pendingName,
                email,
                password: verifyToken.pendingPassword,
                emailVerified: new Date(),
                balance: 10, // 注册赠送 10 积分
            })
            .returning({ id: users.id, email: users.email });

        // 删除验证令牌
        await db.delete(verificationTokens).where(and(
            eq(verificationTokens.identifier, email),
            eq(verificationTokens.token, token)
        ));

        return NextResponse.json({
            success: true,
            message: '邮箱验证成功！现在可以登录了。',
            user: { id: newUser.id, email: newUser.email },
        });
    } catch (error) {
        console.error('验证失败:', error);
        return NextResponse.json({ error: '验证失败，请稍后重试' }, { status: 500 });
    }
}
