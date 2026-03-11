const API_URL = 'http://localhost:5000/api';

const testAccounts = [
    { email: 'admin@neuratrade.com', password: 'Admin@123', role: 'ADMIN' },
    { email: 'advisor@neuratrade.com', password: 'Advisor@123', role: 'ADVISOR' },
    { email: 'investor@neuratrade.com', password: 'Investor@123', role: 'INVESTOR' }
];

async function verify() {
    console.log('--- NeuraTrade API Verification ---');

    for (const account of testAccounts) {
        try {
            console.log(`\nTesting Login: ${account.email} (${account.role})...`);
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: account.email,
                    password: account.password
                })
            });

            const loginData = await loginRes.json();

            if (loginRes.status === 200) {
                console.log('✅ Login Successful');
                const token = loginData.token;
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Test specific endpoints based on role
                if (account.role === 'ADMIN') {
                    const metricsRes = await fetch(`${API_URL}/admin/metrics`, { headers });
                    console.log('✅ Admin Metrics API: Status', metricsRes.status);
                    const revenueRes = await fetch(`${API_URL}/admin/revenue`, { headers });
                    console.log('✅ Admin Revenue API: Status', revenueRes.status);
                } else if (account.role === 'ADVISOR') {
                    const strategiesRes = await fetch(`${API_URL}/advisor/strategies`, { headers });
                    console.log('✅ Advisor Strategies API: Status', strategiesRes.status);
                    const leadsRes = await fetch(`${API_URL}/advisor/leads`, { headers });
                    console.log('✅ Advisor Leads API: Status', leadsRes.status);
                } else if (account.role === 'INVESTOR') {
                    const portfolioRes = await fetch(`${API_URL}/portfolio/overview`, { headers });
                    console.log('✅ Investor Portfolio API: Status', portfolioRes.status);
                    const discoveryRes = await fetch(`${API_URL}/advisor-intelligence/discovery`, { headers });
                    console.log('✅ Marketplace Discovery API: Status', discoveryRes.status);
                    const insightsRes = await fetch(`${API_URL}/ai/insights`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ action: 'ASSET_ANALYSIS', payload: { symbol: 'BTC' } })
                    });
                    console.log('✅ AI Insights API: Status', insightsRes.status);
                }
            } else {
                console.error(`❌ Login Failed:`, loginData);
            }
        } catch (error) {
            console.error(`❌ Failed for ${account.email}:`, error.message);
        }
    }
}

verify();
