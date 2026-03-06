import React from 'react';

/**
 * Support & Complaint System Page
 */

export default function SupportPage() {
    return (
        <div className="support-page p-8 bg-slate-950 min-h-screen text-slate-200">
            <div className="max-w-3xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2">Help & Support</h1>
                    <p className="text-slate-400">Need assistance? Our team and AI agent are here to help.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <SupportCard
                        title="Report an Advisor"
                        desc="Misleading performance or unethical behavior."
                        icon="⚠️"
                    />
                    <SupportCard
                        title="Payment Issue"
                        desc="Subscription activation or billing queries."
                        icon="💳"
                    />
                    <SupportCard
                        title="General Query"
                        desc="Platform usage, features, or account help."
                        icon="❓"
                    />
                    <SupportCard
                        title="Policy Feedback"
                        desc="Suggest improvements to our ecosystem."
                        icon="💡"
                    />
                </div>

                <form className="p-8 bg-slate-900 rounded-2xl border border-slate-800">
                    <h3 className="text-xl font-semibold mb-6">Submit a Formal Complaint</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Issue Category</label>
                            <select className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white">
                                <option>Advisor Misconduct</option>
                                <option>Payout Delay</option>
                                <option>Technical Bug</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Detailed Description</label>
                            <textarea
                                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white h-32"
                                placeholder="Explain the issue in detail..."
                            ></textarea>
                        </div>
                        <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition">
                            Send Complaint
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SupportCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
    return (
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-blue-500/50 transition cursor-pointer group">
            <div className="text-3xl mb-3 group-hover:scale-110 transition duration-300">{icon}</div>
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
        </div>
    );
}
