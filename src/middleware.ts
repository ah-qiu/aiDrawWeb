import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    // 需要登录才能访问的路径
    const protectedPaths = ['/dashboard', '/generate', '/profile'];
    const isProtectedPath = protectedPaths.some((path) =>
        pathname.startsWith(path)
    );

    // 如果访问受保护路径但未登录，重定向到登录页
    if (isProtectedPath && !isLoggedIn) {
        const signInUrl = new URL('/auth/signin', req.nextUrl.origin);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
});

// 配置中间件匹配的路径
export const config = {
    matcher: ['/dashboard/:path*', '/generate/:path*', '/profile/:path*'],
};
