export const metadata = {
    title: 'Delete My Data | Zunno',
    description: 'Request deletion of your Zunno data',
};

export default function DataDeletionPage() {
    return (
        <main className="min-h-screen bg-black max-w-2xl mx-auto px-6 py-16 text-gray-300">
            <h1 className="text-3xl font-bold text-white mb-2">Data Deletion Request</h1>
            <p className="text-sm text-gray-500 mb-10">Your privacy matters to us</p>

            <div className="space-y-6 text-sm leading-relaxed">
                <p>
                    If you would like to request the deletion of your personal data associated with your Zunno account, including any data collected through connected social media accounts (such as Facebook or Instagram), you can do so by emailing us directly.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <h2 className="text-white font-semibold text-base">How to Request Data Deletion</h2>
                    <ol className="list-decimal list-outside ml-5 space-y-3 text-gray-300 marker:text-cyan-400">
                        <li className="pl-1">
                            Send an email to{' '}
                            <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                                jinrix@luminarkai.com
                            </a>
                        </li>
                        <li className="pl-1">
                            Use the subject line:{' '}
                            <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">Data Deletion Request</span>
                        </li>
                        <li className="pl-1">Include the email address associated with your Zunno account</li>
                        <li className="pl-1">
                            We will process your request and confirm deletion within <strong className="text-white">30 days</strong>
                        </li>
                    </ol>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
                    <h2 className="text-white font-semibold text-base">What Gets Deleted</h2>
                    <ul className="list-disc list-outside ml-5 space-y-2 text-gray-300 marker:text-cyan-400">
                        <li className="pl-1">Your account information (name, email address)</li>
                        <li className="pl-1">Connected social media account tokens and credentials</li>
                        <li className="pl-1">Any content, posts, or media you created or scheduled through Zunno</li>
                        <li className="pl-1">Your billing and subscription history (as permitted by law)</li>
                    </ul>
                    <p className="mt-2 text-gray-500 text-xs">
                        Note: We may retain certain information as required by law or for legitimate business purposes such as fraud prevention. Any retained data will be securely stored and isolated.
                    </p>
                </div>

                <p>
                    If you connected your Facebook or Instagram account to Zunno and wish to revoke access, you can also do so directly through your{' '}
                    <a
                        href="https://www.facebook.com/settings?tab=applications"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline"
                    >
                        Facebook App Settings
                    </a>{' '}
                    at any time.
                </p>

                <p>
                    For any questions about your data or this process, please contact us at{' '}
                    <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                        jinrix@luminarkai.com
                    </a>
                    .
                </p>
            </div>
        </main>
    );
}
