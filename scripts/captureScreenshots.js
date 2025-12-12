// scripts/captureScreenshots.js
// Run with: npm run capture:screens
// This script uses Puppeteer to open the local ReaTel Pro app, navigate to key pages, and save full‑screen screenshots.
// Screenshots are stored in the public/screenshots folder (auto‑created if missing).

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    // Ensure output directory exists
    const outDir = path.resolve(__dirname, '..', 'public', 'screenshots');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null,
    });
    const page = await browser.newPage();

    // Helper to capture a page
    const capture = async (url, filename) => {
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        // Give any animations a moment to settle
        await page.waitForTimeout(1500);
        const filePath = path.join(outDir, filename);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`Saved screenshot: ${filePath}`);
    };

    // 1️⃣ Home page (landing)
    await capture('http://localhost:3000/', 'home.png');

    // 2️⃣ Dashboard (requires auth). We'll try to open it directly; if it redirects to login, the screenshot will show that state.
    await capture('http://localhost:3000/dashboard', 'dashboard.png');

    // 3️⃣ Campaigns tab (still inside dashboard, but we can navigate after login manually). For demo we just capture the dashboard page.

    await browser.close();
    console.log('All screenshots captured.');
})();
