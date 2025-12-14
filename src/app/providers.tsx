'use client'

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import NextTopLoader from 'nextjs-toploader'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                <NextTopLoader color="#a855f7" showSpinner={false} />
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}
