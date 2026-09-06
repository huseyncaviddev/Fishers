/**
 * Mobile scroll cost under CPU throttling.
 *
 * Measures total blocking time while scrolling the homepage, which is the thing
 * that actually determines whether the page "feels frozen" on a weak phone.
 *
 * Run: node tests/perf-mobile.mjs [baseUrl]
 */
import { chromium, devices } from "@playwright/test";

const BASE = process.argv[2] || "http://localhost:4400";

async function measure(rate) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices["Pixel 5"] });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });

  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    window.__long = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__long.push(Math.round(e.duration));
    }).observe({ entryTypes: ["longtask"] });
  });

  // Traverse the document by absolute position rather than by wheel events.
  // Wheel is what a real visitor does, but it is not a comparable workload
  // across builds: a build that captures the wheel (the old hero scroll-jack)
  // never leaves the first screen, so it "wins" by never rendering the page.
  // Stepping scrollY guarantees both builds do the same amount of work.
  const STEPS = 26;
  for (let i = 1; i <= STEPS; i++) {
    await page.evaluate((frac) => {
      const max = document.body.scrollHeight - innerHeight;
      window.scrollTo(0, Math.round(max * frac));
    }, i / STEPS);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1400);

  const r = await page.evaluate(() => {
    const l = window.__long || [];
    return {
      n: l.length,
      tbt: l.reduce((a, x) => a + Math.max(0, x - 50), 0),
      worst: l.length ? Math.max(...l) : 0,
      y: Math.round(window.scrollY),
      max: Math.round(document.body.scrollHeight - innerHeight),
    };
  });
  console.log(
    `${String(rate) + "x throttle"}`.padEnd(16) +
      `longTasks=${String(r.n).padStart(3)}  TBT=${String(r.tbt).padStart(5)}ms  worst=${String(r.worst).padStart(4)}ms` +
      `  reached=${r.y}/${r.max}px`
  );
  await browser.close();
  return r;
}

console.log("\nMobile 393x851, full-page scroll\n");
for (const rate of [1, 4, 6]) await measure(rate);
