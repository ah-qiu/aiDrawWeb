import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import { accounts, sessions, users, verificationTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    session: {
        strategy: 'jwt',
    },
    providers: [
        // OAuth 登录
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        // 邮箱密码登录
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: '邮箱', type: 'email' },
                password: { label: '密码', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('请输入邮箱和密码');
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                // 查找用户
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email));

                if (!user) {
                    throw new Error('邮箱或密码错误');
                }

                // 检查邮箱是否已验证
                if (!user.emailVerified) {
                    throw new Error('请先验证邮箱');
                }

                if (!user.password) {
                    throw new Error('此账号使用社交登录，请使用对应方式登录');
                }

                // 验证密码
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    throw new Error('邮箱或密码错误');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        jwt: async ({ token, user, trigger, session }) => {
            if (user) {
                token.id = user.id;
            }
            // 处理 session update 调用
            if (trigger === 'update' && session) {
                if (session.name) token.name = session.name;
                if (session.image !== undefined) token.image = session.image;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session.user && token.id) {
                session.user.id = token.id as string;

                // 从数据库获取最新的用户信息
                const [dbUser] = await db
                    .select({ name: users.name, image: users.image })
                    .from(users)
                    .where(eq(users.id, token.id as string));

                if (dbUser) {
                    session.user.name = dbUser.name;
                    // 只有非 Base64 的图片 URL 才放入 session，避免 cookie 过大
                    if (dbUser.image && !dbUser.image.startsWith('data:')) {
                        session.user.image = dbUser.image;
                    } else {
                        // Base64 图片标记为需要单独获取
                        session.user.image = dbUser.image ? '__BASE64__' : null;
                    }
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    trustHost: true,
});
