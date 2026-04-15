import Link from 'next/link';

export const metadata = {
    title: 'Calendar | ZUNNO',
    description: 'View and manage scheduled posts',
};

export default function CalendarPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                <div
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: '1s' }}
                />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
                <p className="text-gray-400 mb-8">
                    See what is scheduled across your accounts. Calendar views will be added here.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/dashboard"
                        className="border-2 border-cyan-500 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold px-6 py-3 rounded-lg transition-all"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="border-2 border-gray-700 text-gray-400 hover:border-gray-500 font-bold px-6 py-3 rounded-lg transition-all"
                    >
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
