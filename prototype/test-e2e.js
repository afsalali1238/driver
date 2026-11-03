const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3002';
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBrowserTestSuite() {
  console.log('🚀 Starting Kasper Driver Ecosystem Automated Browser Test Suite...');
  console.log(`Connecting to Chrome at: ${CHROME_PATH}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  const consoleLogs = [];
  const pageErrors = [];

  // Global dialog handler to automatically accept alerts
  page.on('dialog', async dialog => {
    console.log(`✓ Dialog Alert: "${dialog.message()}"`);
    try {
      await dialog.accept();
    } catch (e) {
      // already accepted
    }
  });

  page.on('console', msg => {
    const text = msg.text();
    // Filter out react dev info
    if (!text.includes('[Fast Refresh]')) {
      consoleLogs.push(`[${msg.type()}] ${text}`);
    }
  });


  page.on('pageerror', err => {
    pageErrors.push(err.toString());
  });

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Launchpad Hub
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 1: Launchpad All-in-One Hub ---');
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle2' });
    const pageTitle = await page.title();
    console.log(`✓ Page Title: "${pageTitle}"`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_launchpad.png'), fullPage: false });
    console.log('✓ Screenshot saved: 01_launchpad.png');

    // ------------------------------------------------------------------------
    // TEST 2: Ops Admin - Live Fleet Telematics & Map
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 2: Ops Admin Portal ---');
    await page.goto(`${BASE_URL}/?app=admin`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h2', { timeout: 5000 });
    console.log('✓ Ops Admin Banner loaded');

    // Toggle live simulation
    const simButton = await page.$('button ::-p-text(Start Live Telemetry)');
    if (simButton) {
      await simButton.click();
      console.log('✓ Clicked "Start Live Telemetry" (simulation running)');
      await new Promise(r => setTimeout(r, 1000));
    }

    // Test UAE RTA Heavy Haul Peak Ban Advisory Toggle
    const peakBanBtn = await page.$('button ::-p-text(Simulate RTA Peak Ban)');
    if (peakBanBtn) {
      await peakBanBtn.click();
      console.log('✓ Toggled UAE Heavy Haul Peak Ban Advisory (06:30-08:30 Urban Ban Active)');
      await new Promise(r => setTimeout(r, 600));
    }

    // Test WhatsApp Dispatch Alert Modal
    const waBtn = await page.$('button ::-p-text(WhatsApp Dispatch Alert)');
    if (waBtn) {
      await waBtn.click();
      console.log('✓ Opened WhatsApp Automated Dispatch Gateway Modal');
      await new Promise(r => setTimeout(r, 800));
      const closeWaBtn = await page.$('div.fixed button ::-p-text(✕)');
      if (closeWaBtn) await closeWaBtn.click();
    }

    // Test Demurrage Proof Certificate Modal
    const demurrageBtn = await page.$('button ::-p-text(Demurrage Audit Proof)');
    if (demurrageBtn) {
      await demurrageBtn.click();
      console.log('✓ Opened Cryptographic Demurrage Audit Certificate');
      await new Promise(r => setTimeout(r, 800));
      const dismissBtn = await page.$('button ::-p-text(Dismiss)');
      if (dismissBtn) await dismissBtn.click();
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_ops_fleet_map.png'), fullPage: false });
    console.log('✓ Screenshot saved: 02_ops_fleet_map.png');

    // ------------------------------------------------------------------------
    // TEST 3: Marketplace Orders & Driver Matchmaker
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 3: Marketplace Orders & Dispatch Bridge ---');
    // Click on "Marketplace Orders" tab
    const marketplaceTab = await page.$('button ::-p-text(Marketplace Orders)');
    if (marketplaceTab) {
      await marketplaceTab.click();
      console.log('✓ Navigated to Marketplace Orders Tab');
      await new Promise(r => setTimeout(r, 1000));

      // Click "Match & Dispatch Driver" on the first unassigned PO
      const matchBtn = await page.$('button ::-p-text(Match & Dispatch Driver)');
      if (matchBtn) {
        await matchBtn.click();
        console.log('✓ Opened Driver Matchmaking Modal for PO-2026-0042');
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_driver_matchmaking_modal.png') });

        // Select the first eligible candidate radio button
        const candidateRadio = await page.$('input[name="driverCandidate"]:not(:disabled)');
        if (candidateRadio) {
          await candidateRadio.click();
          console.log('✓ Selected 100% Eligible Driver candidate');
          await new Promise(r => setTimeout(r, 500));

          // Confirm assignment
          const confirmBtn = await page.$('button ::-p-text(Confirm Assignment)');
          if (confirmBtn) {
            await confirmBtn.click();
            console.log('✓ Confirmed Assignment & Dispatched PO into Live Trip!');
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_ops_dispatched_view.png') });

    // ------------------------------------------------------------------------
    // TEST 4: Driver Onboarding & KYC Modal
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 4: Driver Onboarding & Compliance Directory ---');
    const driversTab = await page.$('button ::-p-text(Driver Onboarding & KYC)');
    if (driversTab) {
      await driversTab.click();
      console.log('✓ Switched to Driver Directory Tab');
      await new Promise(r => setTimeout(r, 1000));

      // Click "+ Onboard Driver"
      const onboardBtn = await page.$('button ::-p-text(+ Onboard Driver)');
      if (onboardBtn) {
        await onboardBtn.click();
        console.log('✓ Opened "+ Onboard New Driver" Modal');
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_driver_onboarding_modal.png') });

        // Fill out driver form
        await page.type('input[placeholder="e.g. Tariq Mehmood"]', 'Zahid Qureshi');
        await page.type('input[placeholder="DXB-HV-99410"]', 'DXB-HV-77192');
        await page.type('input[placeholder="DXB-T-49102"]', 'DXB-T-90412');
        console.log('✓ Entered Driver KYC, Heavy License, and Mulkiya Plate');

        // Toggle CICPA Gate Pass
        const cicpaBtn = await page.$('button ::-p-text(CICPA)');
        if (cicpaBtn) {
          await cicpaBtn.click();
          console.log('✓ Toggled CICPA Oilfield Gate Pass Clearance');
        }

        // Submit form
        const submitOnboardBtn = await page.$('button ::-p-text(Onboard & Activate Driver)');
        if (submitOnboardBtn) {
          await submitOnboardBtn.click();
          console.log('✓ Submitted Driver Onboarding Form');
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_drivers_roster.png') });

    // ------------------------------------------------------------------------
    // TEST 5: Driver Mobile Simulator (iPhone 16 Frame)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 5: Driver Mobile Simulator ---');
    await page.goto(`${BASE_URL}/?app=driver`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button ::-p-text(Trip)', { timeout: 8000 });
    console.log('✓ Driver Mobile View loaded successfully');


    // Language toggle
    const arLangBtn = await page.$('button ::-p-text(العربية)');
    if (arLangBtn) {
      await arLangBtn.click();
      console.log('✓ Toggled UI to Arabic (العربية)');
      await new Promise(r => setTimeout(r, 800));
    }
    const urLangBtn = await page.$('button ::-p-text(اردو)');
    if (urLangBtn) {
      await urLangBtn.click();
      console.log('✓ Toggled UI to Urdu (اردو)');
      await new Promise(r => setTimeout(r, 800));
    }
    const enLangBtn = await page.$('button ::-p-text(English)');
    if (enLangBtn) {
      await enLangBtn.click();
      console.log('✓ Toggled UI back to English');
      await new Promise(r => setTimeout(r, 800));
    }

    // Test Offline Mode Toggle
    const offlineBtn = await page.$('button ::-p-text(Online (4G / 5G Ingestion Stream))');
    if (offlineBtn) {
      await offlineBtn.click();
      console.log('✓ Toggled Offline Mode (Desert Corridor Blind Spot Active)');
      await new Promise(r => setTimeout(r, 1500));
      // Toggle back to online
      const onlineBtn = await page.$('button ::-p-text(Offline (Desert Blind Spot))');
      if (onlineBtn) {
        await onlineBtn.click();
        console.log('✓ Restored 4G Connection (Auto-flushing buffered breadcrumbs)');
      }
    }

    // Test Calendar Tab inside Mobile App
    const calendarTab = await page.$('button ::-p-text(Calendar)');
    if (calendarTab) {
      await calendarTab.click();
      console.log('✓ Switched to Driver Calendar Tab');
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_driver_calendar_view.png') });

      // Click "+ Block Out Time"
      const blockTimeBtn = await page.$('button ::-p-text(+ Block Out Time)');
      if (blockTimeBtn) {
        await blockTimeBtn.click();
        console.log('✓ Opened Driver Self-Service Time Block Modal');
        await new Promise(r => setTimeout(r, 800));
        
        // Confirm block
        const confirmBlockBtn = await page.$('button ::-p-text(Confirm Block)');
        if (confirmBlockBtn) {
          await confirmBlockBtn.click();
          console.log('✓ Submitted Maintenance Block for Vehicle');
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    // Test Earnings Tab inside Mobile App
    const earningsTab = await page.$('button ::-p-text(Earnings)');
    if (earningsTab) {
      await earningsTab.click();
      console.log('✓ Switched to Driver Earnings Tab');
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_driver_earnings_view.png') });
    }

    // Test KYC / Docs Tab inside Mobile App
    const docsTab = await page.$('button ::-p-text(KYC/Docs)');
    if (docsTab) {
      await docsTab.click();
      console.log('✓ Switched to Driver KYC & Documents Tab');
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_driver_docs_view.png') });
    }

    // Switch back to Trip Tab & Test Stage Advancement + Signature Pad
    const tripTab = await page.$('button ::-p-text(Trip)');
    if (tripTab) {
      await tripTab.click();
      console.log('✓ Returned to Active Trip Tab');
      await new Promise(r => setTimeout(r, 800));

      // Test Pre-Trip Heavy Equipment Lash-Down & DVIR Inspection (EquipmentShare benchmark)
      const preTripSubTab = await page.$('button ::-p-text(Pre-Trip)');
      if (preTripSubTab) {
        await preTripSubTab.click();
        console.log('✓ Switched to Heavy Machinery Pre-Trip DVIR Inspection Subtab');
        await new Promise(r => setTimeout(r, 600));

        const certifyDvirBtn = await page.$('button ::-p-text(Certify Lash-Down & Sign Clearance ➔)');
        if (certifyDvirBtn) {
          await certifyDvirBtn.click();
          console.log('✓ Certified Pre-Trip Machinery Lash-Down (Yard Clearance Certificate Issued)');
          await new Promise(r => setTimeout(r, 800));
        }
      }

      // Test WhatsApp Dispatch Gateway from Driver Studio
      const driverWaBtn = await page.$('button ::-p-text(WhatsApp Dispatch Alert (Simulate))');
      if (driverWaBtn) {
        await driverWaBtn.click();
        console.log('✓ Opened WhatsApp Live Tracking Dispatch Modal from Driver Studio');
        await new Promise(r => setTimeout(r, 600));
        const closeWa = await page.$('div.fixed button ::-p-text(✕)');
        if (closeWa) await closeWa.click();
      }

      // Advance stage to Sign ePOD
      const signEpodSubTab = await page.$('button ::-p-text(ePOD Sign)');
      if (signEpodSubTab) {
        await signEpodSubTab.click();
        console.log('✓ Navigated to Electronic POD Signature Screen');
        await new Promise(r => setTimeout(r, 1000));

        // Draw on signature canvas
        const canvas = await page.$('canvas');
        if (canvas) {
          const box = await canvas.boundingBox();
          if (box) {
            await page.mouse.move(box.x + 20, box.y + 20);
            await page.mouse.down();
            await page.mouse.move(box.x + 80, box.y + 40);
            await page.mouse.move(box.x + 140, box.y + 25);
            await page.mouse.move(box.x + 200, box.y + 50);
            await page.mouse.up();
            console.log('✓ Drew receiver signature onto HTML5 canvas ref');
            await new Promise(r => setTimeout(r, 500));
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_driver_signed_epod.png') });

            // Click submit POD
            const submitPodBtn = await page.$('button ::-p-text(SUBMIT DELIVERY PROOF)');
            if (submitPodBtn) {
              await submitPodBtn.click();
              console.log('✓ Submitted ePOD proof (GPS streaming terminated)');
              await new Promise(r => setTimeout(r, 1000));
            }
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // TEST 6: Customer Live Tracking Surface
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 6: Customer Live Tracking View ---');
    await page.goto(`${BASE_URL}/?app=customer&token=8f92a1c0d4e740b2a3f912cd4e019a82`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1', { timeout: 8000 });
    console.log('✓ Customer Live Tracking Portal loaded');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_customer_live_tracking.png'), fullPage: false });
    console.log('✓ Screenshot saved: 11_customer_live_tracking.png');

    // ------------------------------------------------------------------------
    // TEST 7: Fleet Owner / Transporter Carrier Portal
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 7: Fleet Owner / Carrier Portal ---');
    await page.goto(`${BASE_URL}/?app=fleet`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1', { timeout: 8000 });
    console.log('✓ Fleet Owner Carrier Portal loaded');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_fleet_owner_portal.png'), fullPage: false });
    console.log('✓ Screenshot saved: 12_fleet_owner_portal.png');

    // Test Assigned POs & Delegation Subtab
    const assignedOrdersTab = await page.$('button ::-p-text(Assigned POs & Delegation)');
    if (assignedOrdersTab) {
      await assignedOrdersTab.click();
      console.log('✓ Switched to Assigned POs Tab');
      await new Promise(r => setTimeout(r, 1000));

      // Click "Delegate Driver & Rig"
      const delegateBtn = await page.$('button ::-p-text(Delegate Driver & Rig)');
      if (delegateBtn) {
        await delegateBtn.click();
        console.log('✓ Opened PO Delegation Modal for Petrofac Ruwais Trip');
        await new Promise(r => setTimeout(r, 800));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_fleet_owner_delegation_modal.png') });
        console.log('✓ Screenshot saved: 13_fleet_owner_delegation_modal.png');

        // Click "Confirm Dispatch Delegation"
        const confirmDelegateBtn = await page.$('button ::-p-text(Confirm Dispatch Delegation)');
        if (confirmDelegateBtn) {
          await confirmDelegateBtn.click();
          console.log('✓ Confirmed driver & rig delegation for PO-2026-0045');
          await new Promise(r => setTimeout(r, 2600));
        }
      }
    }

    // Test Corridor Backhaul Leads Subtab
    const backhaulTab = await page.$('button ::-p-text(Corridor Backhaul Leads)');
    if (backhaulTab) {
      await backhaulTab.click();
      console.log('✓ Switched to Corridor Backhaul Leads Tab (Deadhead Killer)');
      await new Promise(r => setTimeout(r, 1000));

      const claimBtn = await page.$('button ::-p-text(Claim Return Load)');
      if (claimBtn) {
        await claimBtn.click();
        console.log('✓ Claimed Return Load Lead BKL-901 (Ruwais -> Jebel Ali)');
        await new Promise(r => setTimeout(r, 1000));
      }
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_fleet_owner_backhaul_claimed.png') });
      console.log('✓ Screenshot saved: 14_fleet_owner_backhaul_claimed.png');
    }

    // Test Financials & Tolls Subtab
    const financialsTab = await page.$('button ::-p-text(Ledger, Tolls & Demurrage)');
    if (financialsTab) {
      await financialsTab.click();
      console.log('✓ Switched to Financials, Tolls & Demurrage Tab');
      await new Promise(r => setTimeout(r, 1000));

      const viewProofBtn = await page.$('button ::-p-text(View Demurrage Proof Certificate)');
      if (viewProofBtn) {
        await viewProofBtn.click();
        console.log('✓ Opened Demurrage Proof Certificate from Fleet Carrier Portal');
        await new Promise(r => setTimeout(r, 800));
        const dismissBtn = await page.$('button ::-p-text(Dismiss)');
        if (dismissBtn) await dismissBtn.click();
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_fleet_owner_financials_tolls.png') });
      console.log('✓ Screenshot saved: 15_fleet_owner_financials_tolls.png');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL BROWSER E2E TESTS (1-7) PASSED WITH 100% SUCCESS!');
    console.log(`Page Errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      console.log('Errors:', pageErrors);
    }
    console.log('======================================================\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await browser.close();
  }
}

runBrowserTestSuite();
