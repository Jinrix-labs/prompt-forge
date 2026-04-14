import Link from 'next/link';

export const metadata = {
    title: 'Terms of Use | Zunno',
    description: 'Zunno Terms of Use',
};

const TERMS_TOC = [
    { id: 'acceptance-of-terms', label: 'Acceptance of Terms' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'account-registration', label: 'Account Registration' },
    { id: 'use-of-the-services', label: 'Use of the Services' },
    { id: 'ai-generated-content', label: 'AI-Generated Content' },
    { id: 'social-media-integrations', label: 'Social Media Integrations' },
    { id: 'subscriptions-and-billing', label: 'Subscriptions and Billing' },
    { id: 'intellectual-property', label: 'Intellectual Property' },
    { id: 'user-content', label: 'User Content' },
    { id: 'prohibited-conduct', label: 'Prohibited Conduct' },
    { id: 'termination', label: 'Termination' },
    { id: 'disclaimers', label: 'Disclaimers' },
    { id: 'limitation-of-liability', label: 'Limitation of Liability' },
    { id: 'indemnification', label: 'Indemnification' },
    { id: 'governing-law', label: 'Governing Law' },
    { id: 'changes-to-these-terms', label: 'Changes to These Terms' },
    { id: 'contact-us', label: 'Contact Us' },
] as const;

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black max-w-3xl mx-auto px-6 py-16 text-gray-300">
            <h1 className="text-3xl font-bold text-white mb-2">Terms of Use</h1>
            <p className="text-sm text-gray-500 mb-10">Last updated: April 14, 2026</p>

            <div className="space-y-10 text-sm leading-relaxed">
                <section>
                    <p>
                        These Terms of Use (&quot;Terms&quot;) govern your access to and use of the services provided by{' '}
                        <strong className="text-white">Zunno</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), including our website at{' '}
                        <a href="https://zunno.app" className="text-cyan-400 hover:underline">
                            https://zunno.app
                        </a>{' '}
                        and any related products or services (collectively, the &quot;Services&quot;).
                    </p>
                    <p className="mt-3">
                        By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
                    </p>
                </section>

                <section id="table-of-contents" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-4">Table of Contents</h2>
                    <ol className="list-decimal list-outside ml-5 space-y-2 text-gray-300 marker:text-cyan-400">
                        {TERMS_TOC.map((item) => (
                            <li key={item.id} className="pl-1">
                                <a href={`#${item.id}`} className="text-cyan-400 hover:underline">
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="acceptance-of-terms" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                    <p>
                        By creating an account or otherwise accessing or using the Services, you confirm that you have read, understood, and agree to be bound by these Terms and our{' '}
                        <Link href="/privacy" className="text-cyan-400 hover:underline">
                            Privacy Policy
                        </Link>
                        , which is incorporated herein by reference.
                    </p>
                </section>

                <section id="eligibility" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">2. Eligibility</h2>
                    <p>
                        You must be at least 18 years of age to use the Services. By using the Services, you represent and warrant that you meet this requirement. If you are using the Services on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms.
                    </p>
                </section>

                <section id="account-registration" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">3. Account Registration</h2>
                    <p>
                        To access certain features of the Services, you must register for an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                    </p>
                    <p className="mt-3">
                        You must notify us immediately at{' '}
                        <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                            jinrix@luminarkai.com
                        </a>{' '}
                        if you become aware of any unauthorized use of your account.
                    </p>
                </section>

                <section id="use-of-the-services" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">4. Use of the Services</h2>
                    <p>
                        Zunno grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Services for your personal or internal business purposes, subject to these Terms.
                    </p>
                    <p className="mt-3">
                        You agree not to use the Services in any manner that could damage, disable, overburden, or impair the Services or interfere with any other party&apos;s use of the Services.
                    </p>
                </section>

                <section id="ai-generated-content" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">5. AI-Generated Content</h2>
                    <p>
                        The Services include features powered by artificial intelligence that generate content such as text, images, and social media posts (&quot;AI Content&quot;). You acknowledge that:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-2 ml-2">
                        <li>AI Content is generated automatically and may not always be accurate, appropriate, or suitable for your purposes.</li>
                        <li>You are solely responsible for reviewing, editing, and approving any AI Content before publishing or distributing it.</li>
                        <li>We do not guarantee that AI Content will be free from errors, biases, or inaccuracies.</li>
                        <li>You must not use AI Content in any way that violates applicable laws, these Terms, or the policies of any third-party platform.</li>
                    </ul>
                </section>

                <section id="social-media-integrations" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">6. Social Media Integrations</h2>
                    <p>
                        The Services allow you to connect and interact with third-party social media platforms such as Instagram, X (Twitter), and LinkedIn (&quot;Social Platforms&quot;). By connecting your Social Platform accounts to Zunno, you:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-2 ml-2">
                        <li>Authorize Zunno to access and post content to your connected accounts on your behalf.</li>
                        <li>Agree to comply with the terms of service and policies of each Social Platform.</li>
                        <li>Acknowledge that Zunno is not responsible for any actions taken by Social Platforms with respect to your account or content.</li>
                        <li>Understand that Social Platforms may revoke access at any time, which may affect the functionality of the Services.</li>
                    </ul>
                    <p className="mt-3">You may disconnect your Social Platform accounts from Zunno at any time through your account settings.</p>
                </section>

                <section id="subscriptions-and-billing" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">7. Subscriptions and Billing</h2>
                    <p>
                        Certain features of the Services are available on a paid subscription basis. By subscribing, you agree to pay the applicable fees as described on our pricing page. All payments are processed securely by{' '}
                        <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                            Stripe
                        </a>
                        .
                    </p>
                    <ul className="list-disc list-inside mt-3 space-y-2 ml-2">
                        <li>
                            <strong className="text-white">Billing Cycle:</strong> Subscriptions are billed on a recurring basis (monthly or annually) until cancelled.
                        </li>
                        <li>
                            <strong className="text-white">Cancellation:</strong> You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of the current billing period.
                        </li>
                        <li>
                            <strong className="text-white">Refunds:</strong> All fees are non-refundable except as required by applicable law or as otherwise stated in our refund policy.
                        </li>
                        <li>
                            <strong className="text-white">Price Changes:</strong> We reserve the right to change our pricing at any time. We will provide reasonable notice of any price changes before they take effect.
                        </li>
                    </ul>
                </section>

                <section id="intellectual-property" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">8. Intellectual Property</h2>
                    <p>
                        The Services and all content, features, and functionality thereof, including but not limited to all information, software, text, displays, images, and design, are owned by Zunno and are protected by applicable intellectual property laws.
                    </p>
                    <p className="mt-3">
                        These Terms do not grant you any right, title, or interest in the Services or any content therein, except for the limited license expressly set forth in Section 4.
                    </p>
                </section>

                <section id="user-content" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">9. User Content</h2>
                    <p>
                        You retain ownership of any content you create, upload, or submit through the Services (&quot;User Content&quot;). By submitting User Content, you grant Zunno a non-exclusive, worldwide, royalty-free license to use, store, display, and process your User Content solely as necessary to provide the Services to you.
                    </p>
                    <p className="mt-3">
                        You represent and warrant that you own or have the necessary rights to your User Content and that your User Content does not violate any third-party rights or applicable laws.
                    </p>
                </section>

                <section id="prohibited-conduct" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">10. Prohibited Conduct</h2>
                    <p>You agree not to use the Services to:</p>
                    <ul className="list-disc list-inside mt-2 space-y-2 ml-2">
                        <li>Violate any applicable local, state, national, or international law or regulation.</li>
                        <li>Post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable.</li>
                        <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
                        <li>Engage in any automated data collection, scraping, or harvesting of the Services without our prior written consent.</li>
                        <li>Attempt to gain unauthorized access to any portion of the Services or any systems or networks connected to the Services.</li>
                        <li>Use the Services to send unsolicited commercial communications (spam).</li>
                        <li>Use the Services in any manner that could infringe upon the intellectual property rights of others.</li>
                        <li>Interfere with or disrupt the integrity or performance of the Services.</li>
                    </ul>
                </section>

                <section id="termination" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">11. Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate your access to the Services at any time, with or without notice, for any reason, including if we reasonably believe you have violated these Terms.
                    </p>
                    <p className="mt-3">
                        You may terminate your account at any time by contacting us at{' '}
                        <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                            jinrix@luminarkai.com
                        </a>{' '}
                        or through your account settings. Upon termination, your right to use the Services will immediately cease.
                    </p>
                </section>

                <section id="disclaimers" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">12. Disclaimers</h2>
                    <p>
                        THE SERVICES ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                    </p>
                    <p className="mt-3">
                        WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT ANY DEFECTS WILL BE CORRECTED. YOU USE THE SERVICES AT YOUR OWN RISK.
                    </p>
                </section>

                <section id="limitation-of-liability" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">13. Limitation of Liability</h2>
                    <p>
                        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, ZUNNO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                    </p>
                    <p className="mt-3">
                        IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICES EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                    </p>
                </section>

                <section id="indemnification" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">14. Indemnification</h2>
                    <p>
                        You agree to indemnify, defend, and hold harmless Zunno and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys&apos; fees, arising out of or in any way connected with your access to or use of the Services, your User Content, or your violation of these Terms.
                    </p>
                </section>

                <section id="governing-law" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">15. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of the State of Utah, United States, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Utah County, Utah.
                    </p>
                </section>

                <section id="changes-to-these-terms" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">16. Changes to These Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the Services after any such changes constitutes your acceptance of the new Terms.
                    </p>
                </section>

                <section id="contact-us" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">17. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at:{' '}
                        <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                            jinrix@luminarkai.com
                        </a>
                    </p>
                </section>
            </div>
        </main>
    );
}
