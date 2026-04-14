import Link from 'next/link';

export function SiteFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-gray-800 bg-black">
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <p className="text-gray-600">© {year} Zunno</p>
                <nav
                    aria-label="Legal"
                    className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
                >
                    <Link href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors">
                        Terms of Use
                    </Link>
                    <Link href="/delete-my-data" className="text-gray-400 hover:text-cyan-400 transition-colors">
                        Delete my data
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
