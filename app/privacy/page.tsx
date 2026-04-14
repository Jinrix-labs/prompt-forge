export const metadata = {
    title: 'Privacy Policy | Zunno',
    description: 'Zunno Privacy Policy',
};

const PRIVACY_TOC = [
    { id: 'information-we-collect', label: 'What Information Do We Collect?' },
    { id: 'how-we-process-your-information', label: 'How Do We Process Your Information?' },
    { id: 'when-we-share-personal-information', label: 'When and With Whom Do We Share Your Personal Information?' },
    { id: 'artificial-intelligence-products', label: 'Do We Offer Artificial Intelligence-Based Products?' },
    { id: 'social-logins', label: 'How Do We Handle Your Social Logins?' },
    { id: 'how-long-we-keep-information', label: 'How Long Do We Keep Your Information?' },
    { id: 'how-we-keep-information-safe', label: 'How Do We Keep Your Information Safe?' },
    { id: 'information-from-minors', label: 'Do We Collect Information From Minors?' },
    { id: 'your-privacy-rights', label: 'What Are Your Privacy Rights?' },
    { id: 'do-not-track-features', label: 'Controls for Do-Not-Track Features' },
    { id: 'us-state-privacy-rights', label: 'Do United States Residents Have Specific Privacy Rights?' },
    { id: 'updates-to-this-notice', label: 'Do We Make Updates to This Notice?' },
    { id: 'contact-about-notice', label: 'How Can You Contact Us About This Notice?' },
    { id: 'review-update-delete-data', label: 'How Can You Review, Update, or Delete the Data We Collect From You?' },
] as const;

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black max-w-3xl mx-auto px-6 py-16 text-gray-300">
            <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mb-10">Last updated: April 14, 2026</p>

            <div className="space-y-10 text-sm leading-relaxed">
                <section>
                    <p>
                        This Privacy Notice for <strong className="text-white">Zunno</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) describes how and why we might access, collect, store, use, and/or share (&quot;process&quot;) your personal information when you use our services (&quot;Services&quot;), including when you visit our website at{' '}
                        <a href="https://zunno.app" className="text-cyan-400 hover:underline">
                            https://zunno.app
                        </a>{' '}
                        or engage with us in other related ways.
                    </p>
                    <p className="mt-3">
                        <strong className="text-white">Questions or concerns?</strong> If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at{' '}
                        <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                            jinrix@luminarkai.com
                        </a>
                        .
                    </p>
                </section>

                <section id="table-of-contents" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-4">Table of Contents</h2>
                    <ol className="list-decimal list-outside ml-5 space-y-2 text-gray-300 marker:text-cyan-400">
                        {PRIVACY_TOC.map((item) => (
                            <li key={item.id} className="pl-1">
                                <a href={`#${item.id}`} className="text-cyan-400 hover:underline">
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="information-we-collect" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">1. What Information Do We Collect?</h2>
                    <p className="text-gray-400 italic mb-3">We collect personal information that you provide to us.</p>
                    <p>
                        We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, participate in activities on the Services, or otherwise contact us.
                    </p>
                    <p className="mt-3">
                        <strong className="text-white">Personal information you provide may include:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                        <li>Usernames</li>
                        <li>Email addresses</li>
                    </ul>
                    <p className="mt-3">
                        <strong className="text-white">Sensitive Information.</strong> We do not process sensitive information.
                    </p>
                    <p className="mt-3">
                        <strong className="text-white">Payment Data.</strong> We may collect data necessary to process your payment if you choose to make purchases. All payment data is handled and stored by{' '}
                        <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                            Stripe
                        </a>
                        .
                    </p>
                    <p className="mt-3">
                        <strong className="text-white">Social Media Login Data.</strong> We may provide you with the option to register using your existing social media account details. If you choose to register in this way, we will collect certain profile information about you from the social media provider as described in Section 5.
                    </p>
                    <p className="mt-3">All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes.</p>
                </section>

                <section id="how-we-process-your-information" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">2. How Do We Process Your Information?</h2>
                    <p className="text-gray-400 italic mb-3">
                        We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-2 ml-2">
                        <li>
                            <strong className="text-white">To facilitate account creation and authentication</strong> and otherwise manage user accounts.
                        </li>
                        <li>
                            <strong className="text-white">To protect our Services</strong> — including fraud monitoring and prevention.
                        </li>
                        <li>
                            <strong className="text-white">To comply with our legal obligations</strong> — including responding to legal requests and defending our legal rights.
                        </li>
                    </ul>
                </section>

                <section id="when-we-share-personal-information" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">3. When and With Whom Do We Share Your Personal Information?</h2>
                    <p className="text-gray-400 italic mb-3">We may share information in specific situations and with specific third parties.</p>
                    <ul className="list-disc list-inside mt-2 space-y-2 ml-2">
                        <li>
                            <strong className="text-white">Business Transfers.</strong> We may share or transfer your information in connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
                        </li>
                    </ul>
                </section>

                <section id="artificial-intelligence-products" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">4. Do We Offer Artificial Intelligence-Based Products?</h2>
                    <p className="text-gray-400 italic mb-3">We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.</p>
                    <p>
                        We provide AI-powered features through third-party service providers including <strong className="text-white">Anthropic, Groq, OpenAI,</strong> and <strong className="text-white">DALL-E</strong>. Your input, output, and personal information will be shared with and processed by these AI Service Providers. You must not use the AI Products in any way that violates the terms or policies of any AI Service Provider.
                    </p>
                    <p className="mt-3">
                        <strong className="text-white">Our AI Products are designed for:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                        <li>AI content automation</li>
                        <li>AI search</li>
                        <li>Image generation</li>
                        <li>AI document generation</li>
                    </ul>
                </section>

                <section id="social-logins" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">5. How Do We Handle Your Social Logins?</h2>
                    <p className="text-gray-400 italic mb-3">If you choose to register or log in using a social media account, we may have access to certain information about you.</p>
                    <p>
                        Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or X logins). Where you choose to do this, we will receive certain profile information about you from your social media provider, which will often include your name, email address, and profile picture.
                    </p>
                    <p className="mt-3">We will use the information we receive only for the purposes described in this Privacy Notice. We are not responsible for other uses of your personal information by your third-party social media provider.</p>
                </section>

                <section id="how-long-we-keep-information" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">6. How Long Do We Keep Your Information?</h2>
                    <p className="text-gray-400 italic mb-3">We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</p>
                    <p>
                        We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice. No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.
                    </p>
                    <p className="mt-3">When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or securely store it and isolate it from any further processing until deletion is possible.</p>
                </section>

                <section id="how-we-keep-information-safe" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">7. How Do We Keep Your Information Safe?</h2>
                    <p className="text-gray-400 italic mb-3">We aim to protect your personal information through a system of organizational and technical security measures.</p>
                    <p>
                        We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure. You should only access the Services within a secure environment.
                    </p>
                </section>

                <section id="information-from-minors" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">8. Do We Collect Information From Minors?</h2>
                    <p className="text-gray-400 italic mb-3">We do not knowingly collect data from or market to children under 18 years of age.</p>
                    <p>
                        We do not knowingly collect, solicit data from, or market to children under 18 years of age. By using the Services, you represent that you are at least 18. If you become aware of any data we may have collected from children under age 18, please contact us at{' '}
                        <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                            jinrix@luminarkai.com
                        </a>
                        .
                    </p>
                </section>

                <section id="your-privacy-rights" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">9. What Are Your Privacy Rights?</h2>
                    <p className="text-gray-400 italic mb-3">You may review, change, or terminate your account at any time.</p>
                    <p>
                        <strong className="text-white">Withdrawing your consent:</strong> You have the right to withdraw your consent at any time by contacting us using the contact details in Section 13.
                    </p>
                    <p className="mt-3">
                        <strong className="text-white">Account Information:</strong> You can log in to your account settings to update your user account at any time. Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, or comply with applicable legal requirements.
                    </p>
                    <p className="mt-3">
                        If you have questions about your privacy rights, you may email us at{' '}
                        <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                            jinrix@luminarkai.com
                        </a>
                        .
                    </p>
                </section>

                <section id="do-not-track-features" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">10. Controls for Do-Not-Track Features</h2>
                    <p>
                        Most web browsers include a Do-Not-Track (&quot;DNT&quot;) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals.
                    </p>
                    <p className="mt-3">
                        California law requires us to let you know how we respond to web browser DNT signals. Because there currently is not an industry or legal standard for recognizing or honoring DNT signals, we do not respond to them at this time.
                    </p>
                </section>

                <section id="us-state-privacy-rights" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">11. Do United States Residents Have Specific Privacy Rights?</h2>
                    <p className="text-gray-400 italic mb-3">
                        If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have specific privacy rights.
                    </p>
                    <p>
                        <strong className="text-white">These rights may include:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-2 ml-2">
                        <li>
                            <strong className="text-white">Right to know</strong> whether or not we are processing your personal data
                        </li>
                        <li>
                            <strong className="text-white">Right to access</strong> your personal data
                        </li>
                        <li>
                            <strong className="text-white">Right to correct</strong> inaccuracies in your personal data
                        </li>
                        <li>
                            <strong className="text-white">Right to request</strong> the deletion of your personal data
                        </li>
                        <li>
                            <strong className="text-white">Right to obtain a copy</strong> of the personal data you previously shared with us
                        </li>
                        <li>
                            <strong className="text-white">Right to non-discrimination</strong> for exercising your rights
                        </li>
                        <li>
                            <strong className="text-white">Right to opt out</strong> of targeted advertising, the sale of personal data, or profiling
                        </li>
                    </ul>
                    <p className="mt-3">
                        <strong className="text-white">How to Exercise Your Rights:</strong> Email us at{' '}
                        <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                            jinrix@luminarkai.com
                        </a>
                        .
                    </p>
                    <p className="mt-3">
                        <strong className="text-white">Appeals:</strong> If we decline to take action regarding your request, you may appeal our decision by emailing us at{' '}
                        <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                            jinrix@luminarkai.com
                        </a>
                        . If your appeal is denied, you may submit a complaint to your state attorney general.
                    </p>
                </section>

                <section id="updates-to-this-notice" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">12. Do We Make Updates to This Notice?</h2>
                    <p className="text-gray-400 italic mb-3">Yes, we will update this notice as necessary to stay compliant with relevant laws.</p>
                    <p>
                        We may update this Privacy Notice from time to time. The updated version will be indicated by an updated &quot;Revised&quot; date at the top of this Privacy Notice. If we make material changes, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification.
                    </p>
                </section>

                <section id="contact-about-notice" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">13. How Can You Contact Us About This Notice?</h2>
                    <p>
                        If you have questions or comments about this notice, you may email us at{' '}
                        <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                            jinrix@luminarkai.com
                        </a>
                        .
                    </p>
                </section>

                <section id="review-update-delete-data" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-white mb-3">14. How Can You Review, Update, or Delete the Data We Collect From You?</h2>
                    <p>
                        Based on the applicable laws of your country or state of residence in the US, you may have the right to request access to the personal information we collect from you, correct inaccuracies, or delete your personal information. To request to review, update, or delete your personal information, please email us at{' '}
                        <a href="mailto:jinrix@luminarkai.com" className="text-cyan-400 hover:underline">
                            jinrix@luminarkai.com
                        </a>
                        .
                    </p>
                </section>
            </div>
        </main>
    );
}
