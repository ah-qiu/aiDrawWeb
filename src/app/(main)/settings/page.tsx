'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const router = useRouter();

    // Profile State
    const [name, setName] = useState(session?.user?.name || '');
    const [image, setImage] = useState(session?.user?.image || '');
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Handle Profile Update
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);
        setProfileMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, image }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            await update({ name, image }); // Update session
            setProfileMessage({ type: 'success', text: '个人信息更新成功' });
            router.refresh();
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.message });
        } finally {
            setIsProfileLoading(false);
        }
    };

    // Handle Password Change
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: '两次输入的密码不一致' });
            return;
        }

        setIsPasswordLoading(true);
        setPasswordMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setPasswordMessage({ type: 'success', text: '密码修改成功' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setPasswordMessage({ type: 'error', text: error.message });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold mb-2">个人信息</h1>
                <p className="text-zinc-500 dark:text-zinc-400">管理您的个人资料和账号安全</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Profile Section */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm">
                            👤
                        </span>
                        基本资料
                    </h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">昵称</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                placeholder="输入您的昵称"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">头像 URL</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                                    {image ? (
                                        <img src={image} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">?</div>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">目前支持图片链接，您可以上传到图床后填入。</p>
                        </div>

                        {profileMessage.text && (
                            <div className={`p-3 rounded-lg text-sm ${profileMessage.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                {profileMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isProfileLoading}
                            className="w-full btn-primary py-2.5 mt-2"
                        >
                            {isProfileLoading ? '保存中...' : '保存修改'}
                        </button>
                    </form>
                </div>

                {/* Security Section - Only verify password logic exists backend, ensuring OAuth users see generic message or handle gracefully */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center text-sm">
                            🔒
                        </span>
                        安全设置
                    </h2>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">当前密码</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">新密码</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">确认新密码</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                            />
                        </div>

                        {passwordMessage.text && (
                            <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                {passwordMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPasswordLoading}
                            className="w-full btn-secondary py-2.5 mt-2"
                        >
                            {isPasswordLoading ? '修改中...' : '修改密码'}
                        </button>
                    </form>

                    <div className="mt-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-800 text-xs text-zinc-400">
                        注：如果您使用 Github 或 Google 登录，无需设置密码。
                    </div>
                </div>
            </div>
        </div>
    );
}
