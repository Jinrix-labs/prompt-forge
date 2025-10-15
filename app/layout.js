import './globals.css'

export const metadata = {
    title: 'ZUNNO - AI-Powered Prompt Generation',
    description: 'Generate optimized prompts for AI image and video generation',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
