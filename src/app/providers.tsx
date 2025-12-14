'use client'

import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="data-theme">
            <NextTopLoader color="#a855f7" showSpinner={false} />
            {children}
        </ThemeProvider>
    )
}
