import Link from 'next/link';

export default function VerifyRequestPage() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24">
            <div className="glass-card w-full max-w-md p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold mb-4">查收你的邮箱</h1>
                <p className="text-zinc-400 mb-6">
                    我们已向你的邮箱发送了一封包含登录链接的邮件。
                    <br />
                    请点击邮件中的链接完成登录。
                </p>

                <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-zinc-400">
                        💡 <span className="text-zinc-300">提示：</span>如果没有收到邮件，请检查垃圾邮件文件夹
                    </p>
                </div>

                <Link href="/auth/signin" className="btn-secondary inline-block">
                    返回登录页
                </Link>
            </div>
        </main>
    );
}
