import './globals.css'

export const metadata = {
    title: 'Prompt Forge - AI-Powered Prompt Generation',
    description: 'Generate optimized prompts for AI image and video generation',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
