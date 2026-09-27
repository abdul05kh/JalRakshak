import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactsDir = path.resolve(__dirname, "..", "artifacts", "browser_audit_evidence");

if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

async function runBrowserAudit() {
  console.log("=== STARTING JALRAKSHAK BROWSER ACCEPTANCE AUDIT ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const errors = [];
  page.on("console", (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on("pageerror", (err) => errors.push(err.message));

  const results = {
    central: {},
    maximum: {},
    minimum: {},
    rapid_switch: {},
    t00_hydraulic: {},
    mobile_390x844: {},
    simulation_view: {},
    errors: []
  };

  try {
    console.log("1. Navigating to http://localhost:5173/ ...");
    await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(4000); // Allow ArcGIS SceneView WebGL to initialize

    // ==========================================
    // TEST 1: CENTRAL SCENARIO (T+60)
    // ==========================================
    console.log("\n2. Executing TEST 1 — CENTRAL Scenario (T+60)...");
    const scenarioSelect = page.locator("select").first();
    await scenarioSelect.selectOption("SCENARIO_CENTRAL");
    await page.waitForTimeout(1000);

    // Read Decision Card Values
    const cardText = await page.locator("body").innerText();
    const centralDecision = {
      scenario: "SCENARIO_CENTRAL",
      hasT60Arrival: cardText.includes("T+60:00") || cardText.includes("3600"),
      hasT44Deadline: cardText.includes("T+44:21") || cardText.includes("2661"),
      has1239Travel: cardText.includes("12:39") || cardText.includes("759"),
      has0300Buffer: cardText.includes("03:00") || cardText.includes("180"),
      hasLimitingE07: cardText.includes("R02-E07")
    };
    results.central = centralDecision;
    console.log("Central Decision Card Findings:", centralDecision);

    const shot1Path = path.join(artifactsDir, "01_central_scenario_t60.png");
    await page.screenshot({ path: shot1Path, fullPage: true });
    console.log(`Saved screenshot: ${shot1Path}`);

    // ==========================================
    // TEST 2: MAXIMUM SCENARIO (T+45)
    // ==========================================
    console.log("\n3. Executing TEST 2 — MAXIMUM Scenario (T+45)...");
    await scenarioSelect.selectOption("SCENARIO_MAXIMUM");
    await page.waitForTimeout(1500);

    const cardTextMax = await page.locator("body").innerText();
    const maxDecision = {
      scenario: "SCENARIO_MAXIMUM",
      hasT45Arrival: cardTextMax.includes("T+45:00") || cardTextMax.includes("2700"),
      hasT29Deadline: cardTextMax.includes("T+29:21") || cardTextMax.includes("1761"),
      has1239Travel: cardTextMax.includes("12:39") || cardTextMax.includes("759"),
      has0300Buffer: cardTextMax.includes("03:00") || cardTextMax.includes("180"),
      hasLimitingE07: cardTextMax.includes("R02-E07"),
      noStaleCentralArrival: !cardTextMax.includes("T+60:00")
    };
    results.maximum = maxDecision;
    console.log("Maximum Decision Card Findings:", maxDecision);

    const shot2Path = path.join(artifactsDir, "02_maximum_scenario_t45.png");
    await page.screenshot({ path: shot2Path, fullPage: true });
    console.log(`Saved screenshot: ${shot2Path}`);

    // ==========================================
    // TEST 3: MINIMUM SCENARIO (T+95)
    // ==========================================
    console.log("\n4. Executing TEST 3 — MINIMUM Scenario (T+95)...");
    await scenarioSelect.selectOption("SCENARIO_MINIMUM");
    await page.waitForTimeout(1500);

    const cardTextMin = await page.locator("body").innerText();
    const minDecision = {
      scenario: "SCENARIO_MINIMUM",
      hasT95Arrival: cardTextMin.includes("T+95:00") || cardTextMin.includes("5700"),
      hasT79Deadline: cardTextMin.includes("T+79:21") || cardTextMin.includes("4761"),
      has1239Travel: cardTextMin.includes("12:39") || cardTextMin.includes("759"),
      has0300Buffer: cardTextMin.includes("03:00") || cardTextMin.includes("180"),
      hasLimitingE07: cardTextMin.includes("R02-E07")
    };
    results.minimum = minDecision;
    console.log("Minimum Decision Card Findings:", minDecision);

    const shot3Path = path.join(artifactsDir, "03_minimum_scenario_t95.png");
    await page.screenshot({ path: shot3Path, fullPage: true });
    console.log(`Saved screenshot: ${shot3Path}`);

    // ==========================================
    // TEST 4: RAPID TRANSITION (EVIL TEST)
    // ==========================================
    console.log("\n5. Executing TEST 4 — Rapid Transitions (Evil Test)...");
    const sequence = [
      "SCENARIO_MAXIMUM",
      "SCENARIO_CENTRAL",
      "SCENARIO_MINIMUM",
      "SCENARIO_CENTRAL",
      "SCENARIO_MAXIMUM"
    ];
    for (const sc of sequence) {
      await scenarioSelect.selectOption(sc);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(1000);
    const finalCardText = await page.locator("body").innerText();
    const rapidResult = {
      finalTarget: "SCENARIO_MAXIMUM",
      settledCorrectlyOnMax: finalCardText.includes("T+45:00") && finalCardText.includes("T+29:21"),
      zeroErrors: errors.length === 0
    };
    results.rapid_switch = rapidResult;
    console.log("Rapid Switch Findings:", rapidResult);

    // ==========================================
    // TEST 5: P1-2 (T+00 HYDRAULIC EXTENT)
    // ==========================================
    console.log("\n6. Executing TEST 5 — P1-2 T+00 Hydraulic Filtering...");
    await scenarioSelect.selectOption("SCENARIO_CENTRAL");
    await page.waitForTimeout(1000);

    // Timeline Slider steps: T+00, T+15, T+30, T+60, T+120
    const shotT00Path = path.join(artifactsDir, "04_hydraulic_timestep_T00.png");
    await page.screenshot({ path: shotT00Path, fullPage: true });
    console.log(`Saved screenshot at T+00: ${shotT00Path}`);

    // ==========================================
    // TEST 6: P2 MOBILE VIEWPORT (390x844)
    // ==========================================
    console.log("\n7. Executing TEST 6 — P2 Mobile Viewport (390x844)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1500);

    const shotMobilePath = path.join(artifactsDir, "05_mobile_390x844.png");
    await page.screenshot({ path: shotMobilePath, fullPage: true });
    console.log(`Saved screenshot for mobile 390x844: ${shotMobilePath}`);

    // Reset viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);

    // ==========================================
    // TEST 7: /simulation VIEW
    // ==========================================
    console.log("\n8. Executing TEST 7 — /simulation View...");
    const simNavBtn = page.locator("button:has-text('SIMULATION')");
    if (await simNavBtn.count() > 0) {
      await simNavBtn.first().click();
      await page.waitForTimeout(2500);
      const shotSimPath = path.join(artifactsDir, "06_flood_simulation_view.png");
      await page.screenshot({ path: shotSimPath, fullPage: true });
      console.log(`Saved screenshot for Simulation view: ${shotSimPath}`);
    }

  } catch (err) {
    console.error("Browser audit runtime error:", err);
    results.errors.push(err.message);
  } finally {
    results.pageErrors = errors;
    fs.writeFileSync(
      path.join(artifactsDir, "audit_summary.json"),
      JSON.stringify(results, null, 2)
    );
    await browser.close();
    console.log("\n=== BROWSER AUDIT COMPLETE. SUMMARY WRITTEN TO artifacts/browser_audit_evidence/audit_summary.json ===");
  }
}

runBrowserAudit();
