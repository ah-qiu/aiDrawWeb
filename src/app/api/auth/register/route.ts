import { db } from '@/db';
import { users, verificationTokens } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        // 验证输入
        if (!name || !email || !password) {
            return NextResponse.json({ error: '请填写昵称、邮箱和密码' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: '密码至少需要 6 位' }, { status: 400 });
        }

        // 检查60秒发送频率限制
        const [existingToken] = await db
            .select()
            .from(verificationTokens)
            .where(eq(verificationTokens.identifier, email));

        if (existingToken) {
            const tokenCreatedAt = new Date(existingToken.expires.getTime() - 24 * 60 * 60 * 1000); // 反推创建时间
            const secondsSinceCreated = (Date.now() - tokenCreatedAt.getTime()) / 1000;
            const remainingSeconds = Math.ceil(60 - secondsSinceCreated);

            if (remainingSeconds > 0) {
                return NextResponse.json(
                    { error: `请等待 ${remainingSeconds} 秒后再发送`, cooldown: remainingSeconds },
                    { status: 429 }
                );
            }
        }

        // 检查邮箱是否已存在
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (existingUser) {
            // 如果用户已存在且已验证
            if (existingUser.emailVerified) {
                return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 });
            }
            // 如果用户存在但未验证，删除旧记录重新发送
            await db.delete(users).where(eq(users.email, email));
        }

        // 删除该邮箱的旧验证令牌
        await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));

        // 生成验证令牌
        const token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时有效

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 12);

        // 保存验证令牌和待设置的密码、昵称
        await db.insert(verificationTokens).values({
            identifier: email,
            token,
            expires,
            pendingPassword: hashedPassword,
            pendingName: name,
        });

        // 构建验证链接
        const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'http://localhost:3000';
        const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

        // 发送验证邮件
        if (process.env.AUTH_RESEND_KEY) {
            await resend.emails.send({
                from: process.env.AUTH_EMAIL_FROM || 'AI画图工坊 <noreply@aiqiumagic.dpdns.org>',
                to: email,
                subject: '验证你的邮箱 - AI 画图工坊',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">欢迎加入 AI 画图工坊！</h2>
                        <p style="color: #666;">你好${name ? ` ${name}` : ''}，</p>
                        <p style="color: #666;">请点击下面的按钮验证你的邮箱地址：</p>
                        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #a855f7, #3b82f6); color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                            验证邮箱
                        </a>
                        <p style="color: #999; font-size: 14px;">此链接 24 小时内有效。</p>
                        <p style="color: #999; font-size: 14px;">如果你没有注册账号，请忽略此邮件。</p>
                    </div>
                `,
            });
        } else {
            // 开发模式：打印验证链接到控制台
            console.log('===========================================');
            console.log('验证链接 (开发模式):');
            console.log(verifyUrl);
            console.log('===========================================');
        }

        return NextResponse.json({
            success: true,
            message: '验证邮件已发送，请查收邮箱！',
            // 开发模式返回链接
            ...(process.env.NODE_ENV === 'development' && !process.env.AUTH_RESEND_KEY && { verifyUrl }),
        });
    } catch (error) {
        console.error('注册失败:', error);
        return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 });
    }
}
