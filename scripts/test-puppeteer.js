const puppeteer = require('puppeteer');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: true });
    console.log('Browser launched!');
    await browser.close();
    console.log('Closed.');
})();
