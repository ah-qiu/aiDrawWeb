'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AvatarCropModal } from '@/app/components/AvatarCropModal';

// 支持的图片格式
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_KB = 200;

// 图片压缩函数
async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        // 验证文件类型
        if (!ALLOWED_TYPES.includes(file.type)) {
            reject(new Error('不支持的图片格式，请上传 JPG、PNG、GIF 或 WebP 格式'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('无法创建画布'));
                    return;
                }

                // 计算压缩后的尺寸（最大边不超过 800px）
                let { width, height } = img;
                const maxDimension = 800;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // 逐步降低质量直到满足大小要求
                let quality = 0.9;
                let result = canvas.toDataURL('image/jpeg', quality);

                while (result.length > MAX_SIZE_KB * 1024 * 1.37 && quality > 0.1) {
                    quality -= 0.1;
                    result = canvas.toDataURL('image/jpeg', quality);
                }

                resolve(result);
            };
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
    });
}

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile State
    const [name, setName] = useState(session?.user?.name || '');
    const [image, setImage] = useState(session?.user?.image || '');
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null); // 裁剪弹窗图片源

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Handle Avatar Upload - 读取文件并显示裁剪弹窗
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 验证文件类型
        if (!ALLOWED_TYPES.includes(file.type)) {
            setProfileMessage({ type: 'error', text: '不支持的图片格式，请上传 JPG、PNG、GIF 或 WebP 格式' });
            return;
        }

        setIsUploading(true);
        setProfileMessage({ type: '', text: '' });

        try {
            // 读取文件为 DataURL
            const reader = new FileReader();
            reader.onload = (event) => {
                setCropImageSrc(event.target?.result as string);
                setIsUploading(false);
            };
            reader.onerror = () => {
                setProfileMessage({ type: 'error', text: '文件读取失败' });
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.message });
            setIsUploading(false);
        } finally {
            // 清空 input 以便重复选择同一文件
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle Crop Confirm - 裁剪完成回调
    const handleCropConfirm = (croppedImage: string) => {
        setImage(croppedImage);
        setCropImageSrc(null);
        setProfileMessage({ type: 'success', text: '头像已裁剪，请点击保存修改' });
    };

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
                            <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">头像</label>
                            <div className="flex items-center gap-4">
                                {/* 头像预览 */}
                                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border-2 border-zinc-200 dark:border-zinc-700 relative">
                                    {image ? (
                                        <img src={image} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-2xl">
                                            {name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                {/* 上传按钮 */}
                                <div className="flex-1">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                    >
                                        {isUploading ? '处理中...' : '选择头像'}
                                    </button>
                                    <p className="text-xs text-zinc-400 mt-1.5">
                                        支持 JPG、PNG、GIF、WebP，图片会自动压缩
                                    </p>
                                </div>
                            </div>
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

            {/* Avatar Crop Modal */}
            {cropImageSrc && (
                <AvatarCropModal
                    imageSrc={cropImageSrc}
                    onClose={() => setCropImageSrc(null)}
                    onConfirm={handleCropConfirm}
                />
            )}
        </div>
    );
}
