'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GeneratePage() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) { setError('请输入提示词'); return; }
        setLoading(true);
        setError('');
        setGeneratedImage(null);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt.trim() }),
            });
            const data = await res.json();

            if (data.success && data.imageUrl) {
                setGeneratedImage(data.imageUrl);
            } else {
                setError(data.error || '生成失败');
            }
        } catch {
            setError('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen px-6 py-12">
            <header className="max-w-4xl mx-auto flex items-center justify-between mb-12">
                <Link href="/" className="text-xl font-bold gradient-text">AI 画图工坊</Link>
                <Link href="/dashboard" className="btn-secondary text-sm">返回工作台</Link>
            </header>

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-2">创作你的<span className="gradient-text">艺术作品</span></h1>
                    <p className="text-zinc-400">输入描述，让 AI 为你生成独特的图像</p>
                </div>

                <div className="glass-card p-6 mb-8">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">提示词 (Prompt)</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="描述你想要的图像，例如：一只可爱的橘猫穿着太空服在月球上漫步..."
                        className="input-field min-h-[120px] resize-none"
                        disabled={loading}
                    />
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-zinc-500">消耗 <span className="text-yellow-400 font-semibold">5</span> 积分</span>
                        <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? (
                                <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>生成中...</>
                            ) : (
                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>开始生成</>
                            )}
                        </button>
                    </div>
                </div>

                {error && <div className="glass-card p-4 mb-8 border-red-500/30 bg-red-500/5"><p className="text-red-400 text-center">{error}</p></div>}

                {generatedImage && (
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">生成结果</h3>
                        <div className="relative rounded-xl overflow-hidden bg-zinc-900">
                            <img src={generatedImage} alt={prompt} className="w-full h-auto" />
                        </div>
                        <div className="mt-4 flex gap-4">
                            <a href={generatedImage} download={`ai-artwork-${Date.now()}.png`} className="btn-primary flex-1 text-center">下载图片</a>
                            <button onClick={() => { setGeneratedImage(null); setPrompt(''); }} className="btn-secondary flex-1">继续创作</button>
                        </div>
                    </div>
                )}

                <div className="mt-12 glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">💡 提示词技巧</h3>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        <li>• 描述越详细，生成结果越接近预期</li>
                        <li>• 可以指定艺术风格，如：油画风格、赛博朋克、水彩画</li>
                        <li>• 添加画面细节：光线、角度、氛围等</li>
                        <li>• 尝试不同的提示词组合获得最佳效果</li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
