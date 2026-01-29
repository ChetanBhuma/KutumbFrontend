const puppeteer = require('puppeteer');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Mock file for upload
const MOCK_IMAGE_PATH = path.join(__dirname, 'mock_profile.jpg');
// Create a simple dummy image file if not exists
if (!fs.existsSync(MOCK_IMAGE_PATH)) {
    // 1x1 pixel grey jpg (base64)
    const buffer = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AP/Z', 'base64');
    fs.writeFileSync(MOCK_IMAGE_PATH, buffer);
}

(async () => {
    console.log('🚀 Starting End-to-End Profile Test...');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--window-size=1920,1080']
    });

    const page = await browser.newPage();

    let extractedOtp = null;
    // Capture browser console logs
    page.on('console', msg => {
        const text = msg.text();
        console.log('PAGE LOG:', text);
        // Try to capture OTP
        // Log format: %c🔢 OTP Code: 123456
        const match = text.match(/OTP Code:\s*(\d+)/);
        if (match && match[1]) {
            extractedOtp = match[1];
            console.log(`🔓 CAPTURED OTP: ${extractedOtp}`);
        }
    });

    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    // Login Flow
    console.log('📍 Navigating to Login...');
    await page.goto('http://localhost:3000/citizen-portal/login', { waitUntil: 'networkidle0' });

    // Allow CLI args: node script.js <mobile> <otp>
    const cliMobile = process.argv[2];
    const cliOtp = process.argv[3];

    // Assuming user needs to register/login
    const mobile = cliMobile || await askQuestion('📱 Enter Mobile Number for Login: ');

    // Type mobile
    try {
        const mobileSelector = 'input[placeholder="Enter 10-digit mobile number"]';
        await page.waitForSelector(mobileSelector, { timeout: 5000 });
        await page.type(mobileSelector, mobile, { delay: 100 }); // Type slower
    } catch (e) {
        console.log('⚠️ Could not find mobile input with placeholder. Trying generic input...');
        await page.type('input[type="tel"]', mobile);
    }

    // Click Send OTP
    try {
        console.log('⏳ Waiting for Send OTP button to be enabled...');
        const btnSelector = 'button[type="submit"]';
        await page.waitForSelector(`${btnSelector}:not([disabled])`, { timeout: 5000 });
        await page.click(btnSelector);
        console.log('✅ Clicked Send OTP');
    } catch (e) {
        console.log('⚠️ Could not click Send OTP button', e.message);
    }

    console.log('⏳ Waiting for OTP to be sent...');
    // Give time for backend execution
    await new Promise(r => setTimeout(r, 2000));

    // Wait for OTP to be captured if not provided via CLI
    if (!cliOtp) {
        let retries = 0;
        while (!extractedOtp && retries < 10) {
            console.log('⏳ Waiting for OTP capture...');
            await new Promise(r => setTimeout(r, 500));
            retries++;
        }
    }

    const otp = cliOtp || extractedOtp || await askQuestion('🔑 Enter OTP shown in backend console: ');

    // Type OTP
    try {
        const otpSelector = 'input[placeholder="Enter 6-digit OTP"]';
        console.log('⏳ Waiting for OTP input...');
        await page.waitForSelector(otpSelector, { timeout: 5000 });
        await page.type(otpSelector, otp, { delay: 100 });
    } catch (e) {
        console.log('⚠️ Could not find OTP input container, trying standard input...');
         // Fallback might fail if step didn't change
         try {
             await page.type('input[type="text"]', otp);
         } catch(e2) {}
    }

    // Click Verify
    try {
        const verifySelector = 'button[type="submit"]';
        await page.waitForSelector(`${verifySelector}:not([disabled])`, { timeout: 5000 });
        console.log('⏳ Clicking Verify & Login...');

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click(verifySelector)
        ]);
        console.log('✅ Login completed. Checking LocalStorage...');
        await new Promise(r => setTimeout(r, 2000));
        const userData = await page.evaluate(() => localStorage.getItem('kutumb-app-user'));
        console.log('📦 LocalStorage User:', userData);

        if (userData) {
            const user = JSON.parse(userData);
            console.log('\n==========================================');
            console.log(`👤 LOGGED IN USER ID: ${user.id}`);
            console.log('==========================================\n');
            process.exit(0);
        }

    } catch (e) {
       console.log('⚠️ Verify button click or Navigation failed', e.message);
    }

    // Stop here for now
    return;

    // Navigate to Profile Complete
    console.log('📍 Navigating to Profile Completion...');
    await page.goto('http://localhost:3000/citizen-portal/profile/complete', { waitUntil: 'networkidle0' });

    // --- STEP 1: PERSONAL ---
    console.log('📝 Filling Step 1: Personal Info...');

    // Upload Photo
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
        await fileInput.uploadFile(MOCK_IMAGE_PATH);
        console.log('📸 Photo Uploaded');
        await new Promise(r => setTimeout(r, 2000)); // Wait for upload
    }

    // Fill Basic Fields
    // Using explicit specific selectors based on labels or placeholders if possible
    // Note: Puppeteer typing is fast. using standard selectors

    // Full Name (might be prefilled)
    const nameInput = await page.$('input[id=":r4:"]'); // Dynamic ID risk. Better use Label
    // Strategy: Click label, type in focused element?

    // Let's use generic "Fill if empty" logic or overwrite
    // Assuming labels are associated correctly

    // Helper to fill by label text (requires label -> id -> input logic or xpath)
    const fillByLabel = async (labelText, value) => {
        const [element] = await page.$x(`//label[contains(text(), "${labelText}")]/following-sibling::input`);
        if (element) {
            await element.click({ clickCount: 3 });
            await element.type(value);
        } else {
             // Try containing div structure
             const [el2] = await page.$x(`//label[contains(text(), "${labelText}")]/..//input`);
             if (el2) {
                await el2.click({ clickCount: 3 });
                await el2.type(value);
             } else {
                 console.log(`⚠️ Could not find input for "${labelText}"`);
             }
        }
    };

    // Select dropdown helper
    const selectOption = async (labelText, optionText) => {
         // Click trigger
         const [trigger] = await page.$x(`//label[contains(text(), "${labelText}")]/..//button[@role="combobox"]`);
         if (trigger) {
             await trigger.click();
             await new Promise(r => setTimeout(r, 500));
             // finding option
             const [option] = await page.$x(`//div[@role="option"]//span[contains(text(), "${optionText}")]`);
             if (option) await option.click();
             else {
                  // Fallback: try finding text directly
                  const [opt2] = await page.$x(`//div[@role="option"][contains(., "${optionText}")]`);
                  if (opt2) await opt2.click();
             }
         }
    };

    await fillByLabel('Full Name', 'Test Citizen');
    await fillByLabel('Date of Birth', '01011960'); // ddmmyyyy for date input usually

    // Religion: Other for now or Hindu if available in master
    await selectOption('Religion', 'Hindu');
    await selectOption('Gender', 'Male');

    await fillByLabel('Specialization', 'Engineering');
    await selectOption('Occupation', 'Retired');
    await fillByLabel('Retired From', 'Government Service');
    await fillByLabel('Year of Retirement', '2020');

    await page.click('button ::-p-text("Next")');
    await new Promise(r => setTimeout(r, 1000));

    // --- STEP 2: CONTACT ---
    console.log('📝 Filling Step 2: Contact...');

    await fillByLabel('Landline', '01123456789');

    // Residing With: Alone
    const [aloneRadio] = await page.$x('//label[contains(text(), "Alone")]/preceding-sibling::button | //label[contains(text(), "Alone")]/preceding-sibling::input');  // Radix UI radio group is button? Or native input?
    // In code: input type="radio"
    const [radioInput] = await page.$x('//input[@name="residingWith"][@id="res-Alone"]');
    if (radioInput) await radioInput.click();

    await fillByLabel('Address Line 1', 'H-123, Saket');
    // Address Line 2
    await fillByLabel('Address Line 2', 'Block H');

    // District & PS
    // Need to trigger District Load
    await selectOption('District', 'South');
    await new Promise(r => setTimeout(r, 1000)); // Wait for PS load
    await selectOption('Police Station', 'Saket');

    await page.click('button ::-p-text("Next")');
    await new Promise(r => setTimeout(r, 1000));

    // --- STEP 3: FAMILY ---
    console.log('📝 Filling Step 3: Family...');
    // Only if married or spouse details
    // Skip adding members for speed, or add one
    await page.click('button ::-p-text("Next")');
    await new Promise(r => setTimeout(r, 1000));

    // --- STEP 4: STAFF ---
    console.log('📝 Filling Step 4: Staff...');
    // Add Staff
    await page.click('button ::-p-text("Add Staff")');
    await new Promise(r => setTimeout(r, 500));

    // Fill row 0
    // Staff Type
    // Select is tricky in row loop. Assuming it's the last added one.
    // Need generic way to find inputs in the staff card.
    // Simplifying: Just skip filling or fill first found.

    // Let's assume user wants to SEE it works, so just clicking Next is fine if validation allows.
    // But let's try to upload ID proof.
    const uploadBtn = await page.$('button ::-p-text("Upload ID Proof")');
    if (uploadBtn) {
        await uploadBtn.click();
        // The hidden input should be active?
        // Logic: onClick triggers fileInputRef.current.click()
        // Puppeteer needs to intercept the file chooser.
        const [fileChooser] = await Promise.all([
            page.waitForFileChooser(),
            uploadBtn.click(),
        ]);
        await fileChooser.accept([MOCK_IMAGE_PATH]);
        console.log('📄 Staff ID Proof Uploaded');
    }

    await page.click('button ::-p-text("Next")');
    await new Promise(r => setTimeout(r, 1000));

    // --- STEP 5: HEALTH ---
    console.log('📝 Filling Step 5: Health...');
    await selectOption('Blood Group', 'O+');
    await page.click('button ::-p-text("Next")');
    await new Promise(r => setTimeout(r, 1000));

    // --- STEP 6: REVIEW ---
    console.log('📝 Review Step...');
    console.log('✅ Form Filled. You can now Review and Submit manually.');

    // Keep browser open
    // rl.close();
    // browser.close();
})();
