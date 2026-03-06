import React from 'react';

/**
 * Platform Rules & Policies Page
 */

export default function RulesPage() {
    return (
        <div className="rules-page p-8 bg-slate-950 min-h-screen text-slate-200 selection:bg-blue-500/30">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Platform Rules & Trust Guidelines</h1>
                    <p className="text-slate-400">Ensuring a fair, transparent, and high-performance ecosystem for all.</p>
                </header>

                <section className="mb-10 p-6 bg-slate-900 rounded-xl border border-slate-800">
                    <h2 className="text-2xl font-semibold text-blue-400 mb-4">1. Advisor Code of Conduct</h2>
                    <ul className="space-y-3 list-disc list-inside text-slate-300">
                        <li>Advisors must maintain valid SEBI registration at all times.</li>
                        <li>Trades must be verified through the Verified Performance Engine.</li>
                        <li>No guarantee of returns is permitted; only objective performance data.</li>
                        <li>Any attempt to manipulate performance history results in immediate suspension.</li>
                    </ul>
                </section>

                <section className="mb-10 p-6 bg-slate-900 rounded-xl border border-slate-800">
                    <h2 className="text-2xl font-semibold text-teal-400 mb-4">2. Investor Guidelines</h2>
                    <ul className="space-y-3 list-disc list-inside text-slate-300">
                        <li>Investors must complete the AI Risk Profiling before subscribing.</li>
                        <li>Subscription fees are processed via verified UPI/Escrow channels.</li>
                        <li>Followers are responsible for their own trade execution based on advisor signals.</li>
                    </ul>
                </section>

                <section className="mb-10 p-6 bg-slate-900 rounded-xl border border-slate-800 text-sm">
                    <h2 className="text-2xl font-semibold text-red-400 mb-4">3. Risk Disclaimer</h2>
                    <p className="text-slate-400 leading-relaxed">
                        Trading in the Indian stock market involves significant risk. Past performance is not indicative of future results.
                        The Ecosystem of Smart Investing provides performance verification services but does not provide direct investment advice.
                        Invest only capital you can afford to lose.
                    </p>
                </section>
            </div>
        </div>
    );
}
