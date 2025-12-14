import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeToggle } from "./components/ThemeToggle";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "AI 画图工坊 | 用 AI 释放你的创意想象力",
    description: "输入你的灵感，让 Google Gemini 图像模型为你生成惊艳的艺术作品。每日免费体验，随时开启创作之旅。",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased gradient-bg min-h-screen`}>
                <Providers>
                    <div className="fixed inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                    <div className="fixed top-4 right-4 z-50">
                        <ThemeToggle />
                    </div>
                    <div className="relative z-10">{children}</div>
                </Providers>
            </body>
        </html>
    );
}
