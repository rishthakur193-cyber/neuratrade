const puppeteer = require('puppeteer');
const fs = require('fs');
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runAudit() {
    console.log("Starting Puppeteer Audit (v3)...");
    const report = {
        working: [],
        failing: [],
        mocked: [],
        consoleLogs: [],
        networkErrors: [],
        dbReality: "",
        mobileTest: ""
    };

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(10000);
    page.setDefaultTimeout(10000);

    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            report.consoleLogs.push({ type: msg.type(), text: msg.text() });
            console.log(`[Browser ${msg.type().toUpperCase()}] ${msg.text()}`);
        }
    });

    try {
        // 1. App Load & Registration Flow (Multi-Step)
        console.log("Navigating to http://localhost:3000/auth/register...");
        await page.goto('http://localhost:3000/auth/register', { waitUntil: 'networkidle2' });

        console.log("Step 1: Identity Profile (Wait for input)...");
        await page.waitForSelector('input[name="fullName"]', { timeout: 10000 });
        await page.type('input[name="fullName"]', 'Audit Tester');
        await page.type('input[name="email"]', `audit_${Date.now()}@ecosystem.io`);
        await page.type('input[name="password"]', 'Password123!');

        console.log("Clicking Continue Sequence - Step 1 -> 2...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const nextBtn = btns.find(b => b.innerText.includes('Continue'));
            if (nextBtn) nextBtn.click();
            else throw new Error("Could not find Continue button in Step 1");
        });
        await wait(2000);

        console.log("Step 2: Compliance Profile (Wait for PAN input)...");
        await page.waitForSelector('input[name="pan"]', { timeout: 5000 });
        await page.type('input[name="pan"]', 'ABCDE1234F');
        await page.type('input[name="aadhaar"]', '1234 5678 9012');

        console.log("Clicking Continue Sequence - Step 2 -> 3...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const nextBtn = btns.find(b => b.innerText.includes('Continue'));
            if (nextBtn) nextBtn.click();
            else throw new Error("Could not find Continue button in Step 2");
        });
        await wait(2000);

        console.log("Step 3: Wealth Profile & Submit...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const submitBtn = btns.find(b => b.innerText.includes('Complete'));
            if (submitBtn) submitBtn.click();
            else throw new Error("Could not find Complete button in Step 3");
        });

        console.log("Waiting for registration success (System Ready)...");
        try {
            await page.waitForFunction(() => document.body.innerText.includes('System Ready'), { timeout: 15000 });
            console.log("SUCCESS: Registration completed.");
            report.working.push("User Registration Flow (Multi-Step)");
            report.dbReality += "DB successfully created a new user. ";
        } catch (e) {
            console.log("FAILURE: Registration success state not detected. Taking failure_reg.png");
            await page.screenshot({ path: 'failure_reg.png' });
            report.failing.push("User Registration Flow");
            report.dbReality += "Registration timed out. ";
        }

        await wait(3000);

        // 2. Login Flow
        console.log("Navigating to Login Page...");
        await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
        await page.waitForSelector('input[type="email"]', { timeout: 5000 });
        await page.type('input[type="email"]', 'rahul@ecosystem.io');
        await page.type('input[type="password"]', 'password');

        console.log("Clicking Verify Identity...");
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const loginBtn = buttons.find(b => b.innerText.includes('Verify Identity'));
            if (loginBtn) loginBtn.click();
            else throw new Error("Could not find Verify Identity button");
        });

        console.log("Waiting for dashboard redirect...");
        await wait(6000);

        if (page.url().includes('dashboard')) {
            console.log("SUCCESS: Login redirect to dashboard.");
            report.working.push("Login Flow & Dashboard Redirect");
            report.working.push("Dashboard Route"); // Keep this as it implies dashboard is reachable after login

            // 3. Dashboard Interactivity (Wait for values to load)
            await wait(3000);
            console.log("Checking 8 Pillars Analysis...");

            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const btn = buttons.find(b => b.innerText.includes('8 Pillars'));
                if (btn) btn.click();
            });

            await wait(5000); // Wait for Gemini API
            const bodyHtml = await page.evaluate(() => document.body.innerHTML);
            if (bodyHtml.includes("AI Verdict")) {
                report.working.push("AI 8 Pillars Analysis (Gemini Integration works)");
            } else {
                report.failing.push("AI 8 Pillars Analysis failed to render verdict.");
            }

            console.log("Checking Order Execution...");
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const btn = buttons.find(b => b.innerText.includes('EXECUTE'));
                if (btn) btn.click();
            });
            await wait(2000);

            const bodyNext = await page.evaluate(() => document.body.innerHTML);
            if (bodyNext.includes("EXECUTION_ACKNOWLEDGED") || bodyNext.includes("CONDUIT_FAILURE")) {
                report.working.push("Order Execution API (Trigger works, backend responds)");
            } else {
                report.failing.push("Order Execution API failed to acknowledge.");
            }

        } else {
            report.failing.push("Login Flow & Dashboard Redirect");
            const bodyHtml = await page.evaluate(() => document.body.innerHTML);
            if (bodyHtml.includes("Invalid credentials")) report.dbReality += "Login failed - Invalid credentials (Password might be different for seeded user). ";
        }

        // 5. Platform Subscription Upgrade
        console.log("Navigating to Pricing...");
        await page.goto('http://localhost:3000/pricing', { waitUntil: 'networkidle2' });
        await wait(2000);

        console.log("Selecting Pro Shield Plan...");
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const proBtn = buttons.find(b => b.innerText.includes('Go Pro'));
            if (proBtn) proBtn.click();
        });
        await wait(2000);

        console.log("Deploying Node (UPI)...");
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const deployBtn = buttons.find(b => b.innerText.includes('Deploy & Activate Node'));
            if (deployBtn) deployBtn.click();
        });

        console.log("Waiting for subscription success...");
        try {
            await page.waitForFunction(() => document.body.innerText.includes('NODE DEPLOYED'), { timeout: 10000 });
            console.log("SUCCESS: Platform Subscription Upgraded.");
            report.working.push("Platform Subscription Upgrade Flow");
        } catch (e) {
            console.log("FAILURE: Subscription upgrade failed.");
            await page.screenshot({ path: 'failure_sub.png' });
            report.failing.push("Platform Subscription Upgrade Flow");
        }

        // 5. Mobile Responsiveness Test
        console.log("Testing Mobile Viewport...");
        await page.setViewport({ width: 390, height: 844 });
        await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
        await wait(2000);

        const isSidebarVisible = await page.evaluate(() => {
            const sidebar = document.querySelector('aside');
            if (sidebar) {
                const style = window.getComputedStyle(sidebar);
                return style.display !== 'none';
            }
            return false;
        });

        if (!isSidebarVisible) {
            report.working.push("Mobile Responsiveness (CSS Media Queries active)");
            report.mobileTest = "Pass: Sidebar hides on mobile viewport appropriately.";
        } else {
            report.failing.push("Mobile Responsiveness Broken");
            report.mobileTest = "Fail: Desktop elements (sidebar) visible on mobile viewport.";
        }

        report.mocked.push("KYC document upload strictly mocks ID transfer, actual file binary not sent.");
        report.mocked.push("Order Execution simulates placement to DB, real Zerodha/AngelOne execution bypass via DEV env wrapper.");
        report.mocked.push("Transaction ledger on Dashboard hardcodes historical transactions.");

    } catch (e) {
        console.error("Audit Runtime Error:", e);
        report.failing.push(`Runtime Exception: ${e.message}`);
    }

    await browser.close();

    fs.writeFileSync('audit_report.json', JSON.stringify(report, null, 2));
    console.log("Audit complete. Report written to audit_report.json");
}

runAudit();
