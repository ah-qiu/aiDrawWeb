import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '未登录' }, { status: 401 });
        }

        const [user] = await db
            .select({ image: users.image })
            .from(users)
            .where(eq(users.id, session.user.id));

        return NextResponse.json({ image: user?.image || null });
    } catch (error) {
        console.error('Get avatar error:', error);
        return NextResponse.json({ error: '获取头像失败' }, { status: 500 });
    }
}
