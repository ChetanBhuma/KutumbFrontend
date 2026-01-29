const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\shiva\\.gemini\\antigravity\\brain\\acd8c412-be81-4ebd-bfe2-4b1b896395ef';

const urls = [
    { name: 'landing_page', url: 'http://localhost:3000/' },
    { name: 'citizen_register', url: 'http://localhost:3000/citizen-portal/register' },
    { name: 'citizen_login', url: 'http://localhost:3000/citizen-portal/login' },
    { name: 'admin_login', url: 'http://localhost:3000/admin/login' },
    { name: 'privacy_policy', url: 'http://localhost:3000/privacy' },
    { name: 'terms_of_service', url: 'http://localhost:3000/terms' }
];

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log('Starting screenshot capture...');

        for (const item of urls) {
            console.log(`Navigating to ${item.url}...`);
            try {
                await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 30000 });
                // Slight delay to ensure animations finish
                await new Promise(r => setTimeout(r, 2000));

                const filePath = path.join(outputDir, `${item.name}.png`);
                await page.screenshot({ path: filePath, fullPage: false });
                console.log(`Saved screenshot to ${filePath}`);
            } catch (error) {
                console.error(`Error capturing ${item.name}:`, error.message);
            }
        }

        await browser.close();
        console.log('Screenshot capture complete.');
    } catch (e) {
        console.error('Script failed:', e);
    }
})();
