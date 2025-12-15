'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Image as ImageIcon, Sparkles, CreditCard, LayoutDashboard, Menu, X, User, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';

const NAV_ITEMS = [
    { label: '工作台', href: '/dashboard', icon: LayoutDashboard },
    { label: '开始创作', href: '/generate', icon: Sparkles },
    { label: '社区画廊', href: '/gallery', icon: ImageIcon },
    { label: '积分充值', href: '/pricing', icon: CreditCard },
    { label: '个人信息', href: '/settings', icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const [avatar, setAvatar] = useState<string | null>(null);

    // 如果 session 中头像是 __BASE64__ 标记，则从 API 获取实际头像
    useEffect(() => {
        if (session?.user?.image === '__BASE64__') {
            fetch('/api/user/avatar')
                .then(res => res.json())
                .then(data => {
                    if (data.image) setAvatar(data.image);
                })
                .catch(console.error);
        } else if (session?.user?.image && session.user.image !== '__BASE64__') {
            setAvatar(session.user.image);
        }
    }, [session?.user?.image]);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-40 h-screen w-64
                transform transition-transform duration-300 ease-in-out
                bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl
                border-r border-zinc-200 dark:border-zinc-800
                flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
                            AI
                        </div>
                        <span className="font-bold text-lg gradient-text">画图工坊</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-500' : 'opacity-70 group-hover:opacity-100'}`} />
                                {item.label}
                            </Link>
                        );
                    })}

                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-zinc-600 dark:text-zinc-400 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 mt-2"
                    >
                        <LogOut className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                        退出登录
                    </button>
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    {/* User Info */}
                    {session?.user && (
                        <Link
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 mb-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        >
                            {avatar && avatar !== '__BASE64__' ? (
                                <img
                                    src={avatar}
                                    alt={session.user.name || '用户头像'}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/20"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                    {session.user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                    {session.user.name || '用户'}
                                </p>
                                <p className="text-xs text-zinc-500 truncate">
                                    {session.user.email}
                                </p>
                            </div>
                        </Link>
                    )}

                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 mb-4">
                        <span className="text-xs text-zinc-500 font-medium">切换主题</span>
                        <ThemeToggle />
                    </div>
                </div>
            </aside>
        </>
    );
}
