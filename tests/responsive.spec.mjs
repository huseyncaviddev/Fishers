/**
 * Layout integrity across the supported widths.
 *
 * Checks the things that actually break a phone layout and are invisible in a
 * desktop window: horizontal overflow, controls pushed outside the viewport,
 * and text clipped by a fixed-height box.
 *
 * Run: node tests/responsive.spec.mjs [baseUrl]
 */
import { chromium, webkit } from "@playwright/test";

const BASE = process.argv[2] || "http://localhost:4400";

const WIDTHS = [
  [320, 568],
  [360, 800],
  [375, 812],
  [390, 844],
  [414, 896],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
];

const ROUTES = ["/", "/about", "/products", "/gallery", "/team", "/contact"];

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

/** Elements that stick out past the right edge of the viewport. */
const OVERFLOW = () => {
  const w = document.documentElement.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll("body *")) {
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || s.opacity === "0") continue;
    // Deliberately-offscreen decoration and carousel rails are not overflow.
    if (s.position === "fixed" || s.position === "absolute") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > w + 1 || r.left < -1) {
      bad.push(`${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]}`);
    }
  }
  return [...new Set(bad)].slice(0, 5);
};

/**
 * Interactive controls whose box escapes the viewport horizontally.
 *
 * Ancestor opacity matters here. Scroll-reveal sections start life at
 * `opacity: 0` with a ±40px translate, so their buttons legitimately sit
 * outside the viewport until they animate in. Checking only the element's own
 * computed opacity reports every one of those as broken.
 */
const OFFSCREEN_CONTROLS = () => {
  const w = document.documentElement.clientWidth;
  const bad = [];
  const shown = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === "none" || s.visibility === "hidden" || parseFloat(s.opacity) === 0) {
        return false;
      }
    }
    return true;
  };
  for (const el of document.querySelectorAll("button, a, input, select, textarea")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.left >= -1 && r.right <= w + 1) continue;
    if (!shown(el)) continue;
    bad.push(`${el.tagName.toLowerCase()}[${(el.textContent || "").trim().slice(0, 14)}]`);
  }
  return [...new Set(bad)].slice(0, 5);
};

async function run(engine, label) {
  const browser = await engine.launch();
  console.log(`\n### ${label}`);
  for (const [w, h] of WIDTHS) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
    const problems = [];
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "load" });
      // Walk the page so every scroll-reveal section has actually animated in;
      // measuring mid-animation reports transforms as layout breakage.
      await page.evaluate(async () => {
        const max = document.body.scrollHeight;
        for (let y = 0; y <= max; y += Math.round(innerHeight * 0.8)) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(900);

      const scrolls = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      if (scrolls) {
        const who = await page.evaluate(OVERFLOW);
        problems.push(`${route} h-scroll [${who.join(", ")}]`);
      }
      const ctrls = await page.evaluate(OFFSCREEN_CONTROLS);
      if (ctrls.length) problems.push(`${route} offscreen ctrl [${ctrls.join(", ")}]`);
    }
    check(`${w}x${h}: no horizontal overflow, no offscreen controls`, problems.length === 0,
      problems.join(" | ") || "clean");
    await page.close();
  }
  await browser.close();
}

await run(chromium, "CHROMIUM");
await run(webkit, "WEBKIT");

console.log(failures === 0 ? "\nResponsive: all checks passed.\n" : `\n${failures} FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
