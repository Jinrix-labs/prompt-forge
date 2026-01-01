import './globals.css'
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { Navigation } from '@/components/Navigation'

export const metadata = {
    title: 'ZUNNO - AI-Powered Prompt Generation & Workflows',
    description: 'Generate optimized prompts for AI image and video generation, or build powerful AI workflows',
}

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body>
                    <Navigation />
                    {children}
                    <Analytics />
                </body>
            </html>
        </ClerkProvider>
    )
}
