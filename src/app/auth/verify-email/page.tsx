'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
            setStatus('error');
            setMessage('无效的验证链接');
            return;
        }

        // 调用验证 API
        fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, email }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setStatus('success');
                    setMessage(data.message);
                    // 3 秒后跳转登录
                    setTimeout(() => router.push('/auth/signin'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.error || '验证失败');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('验证失败，请重试');
            });
    }, [searchParams, router]);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24">
            <div className="glass-card w-full max-w-md p-8 text-center">
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-4">正在验证...</h1>
                        <p className="text-zinc-400">请稍候</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-4 text-green-400">验证成功！</h1>
                        <p className="text-zinc-400 mb-6">{message}</p>
                        <p className="text-zinc-500 text-sm">3 秒后自动跳转到登录页...</p>
                        <Link href="/auth/signin" className="btn-primary inline-block mt-4">
                            立即登录
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-4 text-red-400">验证失败</h1>
                        <p className="text-zinc-400 mb-6">{message}</p>
                        <Link href="/auth/signin" className="btn-secondary inline-block">
                            返回注册
                        </Link>
                    </>
                )}
            </div>
        </main>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24">
                <div className="glass-card w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">正在验证...</h1>
                </div>
            </main>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
