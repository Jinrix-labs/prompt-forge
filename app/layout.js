import './globals.css'
import './zunno-design.css'
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { ConditionalNavigation } from '@/components/ConditionalNavigation'
import { SiteFooter } from '@/components/SiteFooter'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-plus-jakarta',
    display: 'swap',
})

const fraunces = Fraunces({
    subsets: ['latin'],
    weight: ['700', '900'],
    style: ['normal', 'italic'],
    variable: '--font-fraunces',
    display: 'swap',
})

export const metadata = {
    title: 'ZUNNO - Social Media Scheduling with AI',
    description: 'Write, improve, schedule, and publish posts to X, Instagram, and LinkedIn from one clean dashboard.',
}

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${plusJakarta.variable} ${fraunces.variable} flex min-h-screen flex-col`}>
                    <ConditionalNavigation />
                    <div className="flex-1 flex flex-col">{children}</div>
                    <SiteFooter />
                    <Analytics />
                </body>
            </html>
        </ClerkProvider>
    )
}
