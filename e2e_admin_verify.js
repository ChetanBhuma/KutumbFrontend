const puppeteer = require('puppeteer');

(async () => {
    console.log('🚀 Starting e2e_admin_verify.js');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();
    // Allow large timeout
    page.setDefaultTimeout(30000);

    try {
        // 1. Admin Login
        console.log('🔑 Login as Admin...');
        await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0' });

        await page.type('input[id="identifier"]', 'admin@delhipolice.gov.in');
        await page.type('input[id="password"]', 'Admin@123');

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button[type="submit"]')
        ]);
        console.log('✅ Admin Logged In');

        // 2. Navigate to Edit Citizen
        const citizenId = 'cmjtunnhv000jhgkkp5ws2gvk';
        const editUrl = `http://localhost:3000/citizens/${citizenId}/edit`;
        console.log(`✏️ Navigating to Edit Citizen: ${editUrl}`);

        await page.goto(editUrl, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 3000)); // Wait for API and Render

        // Debug: Check if PAN Label exists
        const pageContent = await page.content();
        if (!pageContent.includes('PAN Number')) {
            console.log('❌ PAN Number label NOT FOUND in page content. Dumping first 500 chars:');
            console.log(await page.evaluate(() => document.body.innerText.substring(0, 500)));
            throw new Error('Page not loaded or PAN Label missing');
        } else {
            console.log('✅ Found PAN Number text in page.');
        }

        // Helper to focus input by label
        const focusInputByLabel = async (labelText) => {
            await page.evaluate((txt) => {
                const labels = Array.from(document.querySelectorAll('label'));
                const target = labels.find(l => l.textContent.trim().includes(txt));
                if (target && target.nextElementSibling) {
                    target.nextElementSibling.focus();
                } else if (target && target.parentElement) {
                    // Try looking inside parent if structure is different
                    const input = target.parentElement.querySelector('input');
                    if (input) input.focus();
                }
            }, labelText);
        };

        const clickTab = async (tabText) => {
             await page.evaluate((txt) => {
                const buttons = Array.from(document.querySelectorAll('button[role="tab"]'));
                const btn = buttons.find(b => b.textContent && b.textContent.includes(txt));
                if (btn) btn.click();
             }, tabText);
             await new Promise(r => setTimeout(r, 500)); // Animation wait
        };

        // 3. Fill Personal Details (Step 1 - Default Tab)
        console.log('📝 Filling Personal Details...');
        await focusInputByLabel('PAN Number');
        await page.keyboard.type('ABCDE1234F');

        await focusInputByLabel('Passport Number');
        await page.keyboard.type('P1234567');

        // 4. Fill Health Details
        console.log('📑 Switching to Health Details...');
        await clickTab('Health Details'); // Check exact text in UI

        console.log('➕ Adding Medical Condition...');
        // Find Add button
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const btn = buttons.find(b => b.textContent && b.textContent.includes('Add Condition'));
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 200));

        await page.type('input[placeholder="Condition"]', 'TestDiabetes');
        await page.type('input[placeholder="Since (e.g. 5 years)"]', '2 yrs');

        // 5. Save
        console.log('💾 Saving...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button[type="submit"]')
        ]);
        console.log('✅ Saved. Redirected to View.');

        // 6. Verify Content
        const content = await page.content();
        if (content.includes('TestDiabetes') && content.includes('ABCDE1234F')) {
            console.log('✅ VERIFICATION SUCCESS: Data matches.');
        } else {
            console.log('❌ VERIFICATION FAILED: Data mismatch.');
            if (!content.includes('TestDiabetes')) console.log('   - Missing TestDiabetes');
            if (!content.includes('ABCDE1234F')) console.log('   - Missing PAN');
        }

    } catch (e) {
        console.error('❌ TEST FAILED:', e);
        // Capture screenshot?
    } finally {
        await browser.close();
    }
})();
