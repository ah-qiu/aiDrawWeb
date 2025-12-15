'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

interface AvatarCropModalProps {
    imageSrc: string;
    onClose: () => void;
    onConfirm: (croppedImage: string) => void;
}

// 创建裁剪后的图片
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => {
        image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('无法创建画布');
    }

    // 输出固定大小 400x400
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputSize,
        outputSize
    );

    // 压缩到 200KB 以内
    let quality = 0.9;
    let result = canvas.toDataURL('image/jpeg', quality);

    while (result.length > 200 * 1024 * 1.37 && quality > 0.1) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
    }

    return result;
}

export function AvatarCropModal({ imageSrc, onClose, onConfirm }: AvatarCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;

        setIsProcessing(true);
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onConfirm(croppedImage);
        } catch (error) {
            console.error('裁剪失败:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 背景遮罩 */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* 弹窗内容 */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* 标题 */}
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        调整头像
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                        拖动并缩放以选择显示区域
                    </p>
                </div>

                {/* 裁剪区域 */}
                <div className="relative h-80 bg-zinc-100 dark:bg-zinc-800">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                {/* 缩放滑块 */}
                <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-zinc-500">缩放</span>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>
                </div>

                {/* 按钮 */}
                <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isProcessing ? '处理中...' : '确认'}
                    </button>
                </div>
            </div>
        </div>
    );
}
