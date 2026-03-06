import React from 'react';

/**
 * Admin Dashboard Page
 * 
 * Provides a high-level overview of platform metrics and navigation to management modules.
 */

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard p-8 bg-slate-900 min-h-screen text-white">
            <header className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold">Admin Control Panel</h1>
                <p className="text-slate-400">Platform Overview & Management</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard title="Total Investors" value="1,240" trend="+12% from last month" color="text-blue-400" />
                <StatCard title="Total Advisors" value="48" trend="+3 new this week" color="text-green-400" />
                <StatCard title="Active Subscriptions" value="892" trend="+5.4% conversion" color="text-purple-400" />
                <StatCard title="Monthly Revenue" value="₹4.45L" trend="+15% MoM" color="text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-semibold mb-4">Pending Advisor Approvals</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                            <div>
                                <p className="font-medium">Rohan Sharma</p>
                                <p className="text-xs text-slate-400">SEBI: INA123456789</p>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm transition">Review</button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                            <div>
                                <p className="font-medium">Priya Verma</p>
                                <p className="text-xs text-slate-400">SEBI: INA987654321</p>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm transition">Review</button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
                    <nav className="flex flex-col space-y-2 text-slate-300">
                        <a href="/admin/advisors" className="p-3 hover:bg-slate-700 rounded-lg transition">Manage Advisors</a>
                        <a href="/admin/investors" className="p-3 hover:bg-slate-700 rounded-lg transition">Manage Investors</a>
                        <a href="/admin/subscriptions" className="p-3 hover:bg-slate-700 rounded-lg transition">Subscription Settings</a>
                        <a href="/admin/content" className="p-3 hover:bg-slate-700 rounded-lg transition">Content Management</a>
                    </nav>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, color }: { title: string; value: string; trend: string; color: string }) {
    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-1">{title}</h3>
            <div className={`text-2xl font-bold mb-2 ${color}`}>{value}</div>
            <p className="text-xs text-slate-500">{trend}</p>
        </div>
    );
}
