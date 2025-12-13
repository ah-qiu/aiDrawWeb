'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (mode === 'register') {
                // 注册 - 发送验证邮件
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const data = await res.json();

                if (data.success) {
                    setMessage('验证邮件已发送到你的邮箱，请查收并点击链接完成注册！');
                    // 开发模式显示链接
                    if (data.verifyUrl) {
                        console.log('验证链接:', data.verifyUrl);
                    }
                } else {
                    setError(data.error || '注册失败');
                }
            } else {
                // 登录
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (result?.error) {
                    setError('邮箱或密码错误');
                } else if (result?.ok) {
                    router.push('/dashboard');
                }
            }
        } catch {
            setError('操作失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24">
            <div className="glass-card w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {mode === 'register' ? '创建账号' : '欢迎回来'}
                    </h1>
                    <p className="text-zinc-400">
                        {mode === 'register' ? '注册后即可开始 AI 创作之旅' : '登录以继续你的创作'}
                    </p>
                </div>

                {/* 模式切换 */}
                <div className="flex mb-6 bg-zinc-800/50 rounded-xl p-1">
                    <button
                        onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'login' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
                    >
                        登录
                    </button>
                    <button
                        onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'register' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
                    >
                        注册
                    </button>
                </div>

                {/* 表单 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">昵称</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                placeholder="你的昵称"
                                required
                            />
                        </div>
                    )}


                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">邮箱</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input-field"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">密码</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input-field"
                            placeholder={mode === 'register' ? '至少 6 位密码' : '输入密码'}
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    {message && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                            <p className="text-green-400 text-sm text-center">{message}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 disabled:opacity-50"
                    >
                        {loading ? '处理中...' : mode === 'register' ? '发送验证邮件' : '登录'}
                    </button>
                </form>

                {mode === 'register' && (
                    <p className="mt-4 text-center text-sm text-zinc-500">
                        注册后需要验证邮箱才能登录
                    </p>
                )}

                {/* 分隔线 */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-zinc-700"></div>
                    <span className="px-4 text-zinc-500 text-sm">或使用社交账号</span>
                    <div className="flex-1 border-t border-zinc-700"></div>
                </div>

                {/* OAuth 登录 */}
                <div className="space-y-3">
                    <button
                        onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        使用 GitHub 登录
                    </button>

                    <button
                        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        使用 Google 登录
                    </button>
                </div>
            </div>

            <Link href="/" className="mt-6 text-zinc-400 hover:text-zinc-200 transition-colors">
                ← 返回首页
            </Link>
        </main>
    );
}
