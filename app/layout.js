import './globals.css'
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"

export const metadata = {
    title: 'ZUNNO - AI-Powered Prompt Generation',
    description: 'Generate optimized prompts for AI image and video generation',
}

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body>
                    {children}
                    <Analytics />
                </body>
            </html>
        </ClerkProvider>
    )
}
