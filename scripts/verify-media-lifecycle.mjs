/**
 * Runtime verification of the viewport-driven video lifecycle.
 *
 * Asserts the behaviour that is easy to regress and impossible to see in a
 * build log: that nothing decodes off screen, that everything genuinely
 * visible plays, and that sources are released once far away.
 *
 * Usage:  node scripts/verify-media-lifecycle.mjs [baseUrl]
 * Needs a running server (next start) and `npx playwright` available.
 */
import { chromium } from "playwright";

const BASE = process.argv[2] || process.env.BASE || "http://localhost:3000";

let failures = 0;
function check(name, ok, detail = "") {
  const mark = ok ? "PASS" : "FAIL";
  if (!ok) failures++;
  console.log(`  [${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
}

/** Per-<video> snapshot: what is on screen, what is playing, what is attached. */
const SNAPSHOT = () => {
  const pct = (el) => {
    const r = el.getBoundingClientRect();
    const vh = innerHeight;
    const vw = innerWidth;
    if (r.height <= 0 || r.width <= 0) return 0;
    const vis =
      Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) *
      Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
    return +(vis / (r.height * r.width)).toFixed(2);
  };
  return [...document.querySelectorAll("video")].map((v) => {
    const hero = !!v.closest("[data-hero-container]");
    const gallery = !!v.closest("#gallery");
    return {
      section: hero ? "hero" : gallery ? "gallery" : "section",
      visible: pct(v),
      playing: !v.paused && !!v.getAttribute("src"),
      attached: !!v.getAttribute("src"),
      src: (v.getAttribute("src") || "").split("/").pop(),
    };
  });
};

/**
 * Scroll and wait for the page to actually come to rest.
 *
 * The site sets `scroll-behavior: smooth`, so scrollIntoView animates. Sampling
 * on a fixed timeout catches tiles mid-flight and reports them as "playing
 * while off screen" when they are simply still on their way out.
 */
async function settle(page) {
  await page.waitForFunction(
    () => {
      const y = window.scrollY;
      if (window.__lastY === y) return (window.__stable = (window.__stable || 0) + 1) > 2;
      window.__lastY = y;
      window.__stable = 0;
      return false;
    },
    null,
    { timeout: 15000, polling: 100 }
  );
  // Let the observers fire and the scheduler's microtask flush.
  await page.waitForTimeout(1200);
}

async function scrollTo(page, selector, block = "center") {
  await page.evaluate(
    ([sel, b]) => document.querySelector(sel)?.scrollIntoView({ block: b }),
    [selector, block]
  );
  await settle(page);
}

async function run(label, viewport, isMobile) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport,
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: isMobile ? 2 : 1,
  });
  const page = await ctx.newPage();
  console.log(`\n### ${label} (${viewport.width}x${viewport.height})`);

  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(2500);

  // --- Scenario A: initial load -------------------------------------------
  let s = await page.evaluate(SNAPSHOT);
  const heroPlaying = s.filter((v) => v.section === "hero" && v.playing);
  const galleryAttached = s.filter((v) => v.section === "gallery" && v.attached);
  check("A: exactly one hero video plays", heroPlaying.length === 1, `${heroPlaying.length} playing`);
  check("A: no gallery source attached", galleryAttached.length === 0, `${galleryAttached.length} attached`);

  // --- Scenario C: gallery visible ----------------------------------------
  await scrollTo(page, "#gallery");
  s = await page.evaluate(SNAPSHOT);
  const visibleTiles = s.filter((v) => v.section === "gallery" && v.visible >= 0.35);
  const playingTiles = s.filter((v) => v.section === "gallery" && v.playing);
  const hiddenPlaying = s.filter((v) => v.playing && v.visible < 0.2);
  check(
    "C: every genuinely visible tile plays",
    visibleTiles.length > 0 && visibleTiles.every((v) => v.playing),
    `${visibleTiles.filter((v) => v.playing).length}/${visibleTiles.length} visible tiles playing`
  );
  check("C: more than one tile can play at once", playingTiles.length >= 2, `${playingTiles.length} playing`);
  check("C: hero stopped while gallery is on screen", !s.some((v) => v.section === "hero" && v.playing));
  check(
    "C: nothing off screen is playing",
    hiddenPlaying.length === 0,
    hiddenPlaying.length
      ? hiddenPlaying.map((v) => `${v.src}[${v.section} vis=${v.visible}]`).join(" ")
      : "0 hidden playing"
  );

  // --- Scenario D: scrolled below the gallery ------------------------------
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await settle(page);
  s = await page.evaluate(SNAPSHOT);
  const stillPlaying = s.filter((v) => v.playing && v.visible < 0.2);
  const farAttached = s.filter((v) => v.section === "gallery" && v.attached && v.visible === 0);
  check(
    "D: no off-screen video still playing",
    stillPlaying.length === 0,
    stillPlaying.length
      ? stillPlaying.map((v) => `${v.src}[${v.section} vis=${v.visible}]`).join(" ")
      : "0 playing"
  );
  check("D: far gallery sources released", farAttached.length <= 3, `${farAttached.length} still attached`);

  // --- Scenario E: scroll back up to the gallery ---------------------------
  await scrollTo(page, "#gallery");
  s = await page.evaluate(SNAPSHOT);
  const backVisible = s.filter((v) => v.section === "gallery" && v.visible >= 0.35);
  check(
    "E: returning tiles resume",
    backVisible.length > 0 && backVisible.every((v) => v.playing),
    `${backVisible.filter((v) => v.playing).length}/${backVisible.length} resumed`
  );
  check("E: nothing off screen resumed", !s.some((v) => v.playing && v.visible < 0.2));

  // --- Scenario F: background tab ------------------------------------------
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(1200);
  s = await page.evaluate(SNAPSHOT);
  check("F: all videos paused in a hidden tab", !s.some((v) => v.playing), `${s.filter((v) => v.playing).length} playing`);

  await browser.close();
}

await run("DESKTOP", { width: 1440, height: 900 }, false);
await run("MOBILE", { width: 390, height: 844 }, true);

console.log(failures === 0 ? "\nAll media-lifecycle checks passed.\n" : `\n${failures} check(s) FAILED.\n`);
process.exit(failures === 0 ? 0 : 1);
