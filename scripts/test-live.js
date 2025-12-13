const puppeteer = require('puppeteer');

(async () => {
    const url = 'https://automatizadmwhatsapp.vercel.app/';
    console.log(`Launching browser to test: ${url}`);

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Set viewport to a reasonable size
        await page.setViewport({ width: 1280, height: 800 });

        console.log('Navigating to page...');
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log(`Status Status: ${response.status()}`);

        if (response.status() !== 200) {
            console.error('Failed to load page successfully (non-200 status)');
            await browser.close();
            process.exit(1);
        }

        // Check for specific content that confirms the new deployment
        // We look for "ReaTel Pro" which is in the Navbar and Sidebar
        const pageTitle = await page.title();
        console.log(`Page Title: ${pageTitle}`);

        const textContent = await page.content();

        // precise check for the new logo or branding
        const hasBranding = textContent.includes('ReaTel Pro');
        console.log(`Contains 'ReaTel Pro': ${hasBranding}`);

        // Take a screenshot
        const screenshotPath = 'public/live_test_screenshot.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved to ${screenshotPath}`);

        await browser.close();
        console.log('Test completed successfully.');
    } catch (error) {
        console.error('An error occurred during the test:', error);
        process.exit(1);
    }
})();
