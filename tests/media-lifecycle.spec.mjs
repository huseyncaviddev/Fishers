/**
 * Media lifecycle contract, asserted against real browser state.
 *
 * The important discipline here: never trust application state as proof of
 * playback. Every "is it playing" assertion samples `currentTime` twice and
 * requires it to have moved. A clip whose `paused` is false but whose time is
 * frozen is a failure, not a pass — that is exactly the mobile symptom this
 * suite exists to catch.
 *
 * Run: node tests/media-lifecycle.spec.mjs [baseUrl]
 */
import { chromium, webkit, devices } from "@playwright/test";

const BASE = process.argv[2] || "http://localhost:4400";

// Must match mediaPolicy: retention budget for just-offscreen sources.
const MAX_WARM_MOBILE = 1;
const MAX_WARM_DESKTOP = 3;

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

const PROBE = () =>
  [...document.querySelectorAll("video")].map((v) => {
    const r = v.getBoundingClientRect();
    const vis =
      r.height > 0 && r.width > 0
        ? +(
            (Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) *
              Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0))) /
            (r.height * r.width)
          ).toFixed(2)
        : 0;
    return {
      sec: v.closest("[data-hero-container]") ? "hero" : v.closest("#gallery") ? "gallery" : "section",
      src: (v.getAttribute("src") || "").split("/").pop() || null,
      paused: v.paused,
      ct: v.currentTime,
      vis,
    };
  });

async function settle(page) {
  await page
    .waitForFunction(
      () => {
        const y = window.scrollY;
        if (window.__y === y) return (window.__n = (window.__n || 0) + 1) > 2;
        window.__y = y;
        window.__n = 0;
        return false;
      },
      null,
      { polling: 100, timeout: 15000 }
    )
    .catch(() => {});
  await page.waitForTimeout(1800);
}

/** Two samples 1.4s apart; a clip counts as playing only if its time moved. */
async function sample(page) {
  const a = await page.evaluate(PROBE);
  await page.waitForTimeout(1400);
  const b = await page.evaluate(PROBE);
  // Clips loop (~4s), so a wrap back toward zero is progress too.
  const advancing = b.filter((v, i) => v.src && !v.paused && a[i] && Math.abs(v.ct - a[i].ct) > 0.05);
  return {
    all: b,
    advancing,
    claimPlaying: b.filter((v) => v.src && !v.paused),
    visible: b.filter((v) => v.vis >= 0.35),
    hiddenPlaying: b.filter((v) => v.src && !v.paused && v.vis < 0.2),
    attachedOffscreen: b.filter((v) => v.src && v.vis === 0),
  };
}

/**
 * Guard the reveal invariant: never fade the poster out over a surface that has
 * nothing decoded to paint. That would show the user an empty box for the second
 * or two before frames arrive — the "video is frozen" symptom.
 *
 * This has to be watched CONTINUOUSLY. The window is transient, so a check that
 * samples after the page settles cannot see it: reintroducing a reveal-on-play()
 * -resolve scheduler and running a settle-then-sample assertion against it
 * passed vacuously, which is why that approach was abandoned for this one.
 *
 * Note this guard does not currently fail on either engine even with the paint
 * gate removed — on localhost the tiles reach readyState 4 before play()
 * resolves, so the window never opens here. It is a regression guard for slower
 * real-world conditions, not a reproduction of an observed local failure.
 */
async function startRevealWatch(page) {
  await page.evaluate(() => {
    window.__violations = [];
    const tick = () => {
      for (const v of document.querySelectorAll("video")) {
        const revealed = v.classList.contains("sv-loaded") || v.classList.contains("is-ready");
        if (!revealed) continue;
        const r = v.getBoundingClientRect();
        const onScreen = r.height > 0 && r.bottom > 0 && r.top < innerHeight;
        if (!onScreen) continue;
        // readyState < 2 means there is no current frame at all.
        if (v.readyState < 2) {
          window.__violations.push({
            src: (v.getAttribute("src") || "").split("/").pop(),
            rs: v.readyState,
          });
        }
      }
      window.__revealWatch = setTimeout(tick, 100);
    };
    tick();
  });
}

async function stopRevealWatch(page) {
  return page.evaluate(() => {
    clearTimeout(window.__revealWatch);
    const v = window.__violations || [];
    const bySrc = {};
    for (const x of v) bySrc[x.src] = (bySrc[x.src] || 0) + 1;
    return bySrc;
  });
}

/**
 * Startup is allowed to take time — WebKit needs a couple of seconds to bring
 * several clips up — but it is NOT allowed to take forever, and it is never
 * allowed to reveal a frozen surface while it waits. Retries the sample until
 * every visible tile in `sec` advances, up to a hard budget, and fails the
 * budget rather than silently accepting a stall.
 */
const STARTUP_BUDGET_MS = 8000;
async function sampleUntilPlaying(page, sec) {
  const deadline = Date.now() + STARTUP_BUDGET_MS;
  let s = await sample(page);
  for (;;) {
    const vis = s.visible.filter((v) => v.sec === sec);
    const ok = vis.length > 0 && vis.every((v) => s.advancing.some((x) => x.src === v.src));
    if (ok || Date.now() > deadline) return s;
    s = await sample(page);
  }
}

async function run(engine, label, ctxOpts, maxWarm) {
  const browser = await engine.launch();
  const page = await (await browser.newContext(ctxOpts)).newPage();
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(3500);
  console.log(`\n### ${label}`);

  // A — initial load
  let s = await sample(page);
  const heroAdvancing = s.advancing.filter((v) => v.sec === "hero");
  check("A: exactly one hero clip is genuinely advancing", heroAdvancing.length === 1, `${heroAdvancing.length}`);
  check("A: no gallery source attached", s.all.filter((v) => v.sec === "gallery" && v.src).length === 0);
  check("A: no state lies (claimed == advancing)", s.claimPlaying.length === s.advancing.length,
    `claimed=${s.claimPlaying.length} advancing=${s.advancing.length}`);

  // D — gallery. The watch must be armed BEFORE the scroll, because the window
  // it is looking for opens the instant the tiles are told to play.
  await startRevealWatch(page);
  await page.evaluate(() => document.querySelector("#gallery")?.scrollIntoView({ block: "center" }));
  await settle(page);
  s = await sampleUntilPlaying(page, "gallery");
  const violations = await stopRevealWatch(page);
  const vKeys = Object.keys(violations);
  check("D: poster never faded out over an undecoded surface", vKeys.length === 0,
    vKeys.map((k) => `${k} x${violations[k]}`).join(", ") || "none");
  const visTiles = s.visible.filter((v) => v.sec === "gallery");
  check(`D: every visible tile advancing within ${STARTUP_BUDGET_MS}ms`,
    visTiles.length > 0 && visTiles.every((v) => s.advancing.some((x) => x.src === v.src)),
    `${visTiles.filter((v) => s.advancing.some((x) => x.src === v.src)).length}/${visTiles.length}`);
  check("D: hero stopped while gallery is on screen", !s.all.some((v) => v.sec === "hero" && !v.paused && v.src));
  check("D: nothing hidden is playing", s.hiddenPlaying.length === 0, `${s.hiddenPlaying.length}`);

  // E — below the gallery: retention budget must hold
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await settle(page);
  s = await sample(page);
  check("E: nothing offscreen is playing", s.hiddenPlaying.length === 0, `${s.hiddenPlaying.length}`);
  check(`E: offscreen retained sources <= maxWarm (${maxWarm})`,
    s.attachedOffscreen.length <= maxWarm, `${s.attachedOffscreen.length} attached`);

  // F — back up
  await page.evaluate(() => document.querySelector("#gallery")?.scrollIntoView({ block: "center" }));
  await settle(page);
  s = await sampleUntilPlaying(page, "gallery");
  const back = s.visible.filter((v) => v.sec === "gallery");
  check("F: returning tiles resume and advance",
    back.length > 0 && back.every((v) => s.advancing.some((x) => x.src === v.src)),
    `${back.filter((v) => s.advancing.some((x) => x.src === v.src)).length}/${back.length}`);

  // G — hidden tab
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(1400);
  const hiddenState = await page.evaluate(PROBE);
  check("G: all media paused in a hidden tab",
    !hiddenState.some((v) => v.src && !v.paused), `${hiddenState.filter((v) => v.src && !v.paused).length} playing`);

  await browser.close();
}

await run(chromium, "CHROMIUM mobile (Pixel 5)", { ...devices["Pixel 5"] }, MAX_WARM_MOBILE);
await run(webkit, "WEBKIT mobile (iPhone 13)", { ...devices["iPhone 13"] }, MAX_WARM_MOBILE);
await run(chromium, "CHROMIUM desktop 1440x900", { viewport: { width: 1440, height: 900 } }, MAX_WARM_DESKTOP);
await run(webkit, "WEBKIT desktop 1440x900", { viewport: { width: 1440, height: 900 } }, MAX_WARM_DESKTOP);

console.log(failures === 0 ? "\nMedia lifecycle: all checks passed.\n" : `\n${failures} FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
