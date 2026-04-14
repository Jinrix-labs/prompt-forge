import './globals.css'
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { Navigation } from '@/components/Navigation'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
    title: 'ZUNNO - AI-Powered Prompt Generation & Workflows',
    description: 'Generate optimized prompts for AI image and video generation, or build powerful AI workflows',
}

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className="flex min-h-screen flex-col">
                    <Navigation />
                    <div className="flex-1 flex flex-col">{children}</div>
                    <SiteFooter />
                    <Analytics />
                </body>
            </html>
        </ClerkProvider>
    )
}
