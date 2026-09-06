/**
 * Hero carousel interaction contract.
 *
 * The hero is a HORIZONTAL carousel: sideways gestures change slides, and
 * vertical gestures belong to the page. These assertions exist because the
 * previous build did the opposite — it converted vertical scrolling into slide
 * changes, so the page appeared frozen until the user had swiped through every
 * slide.
 *
 * Engine split is deliberate:
 *   - synthetic touch swipes need the `Touch` constructor, which WebKit lacks
 *   - `mouse.wheel` is unsupported in mobile WebKit, and wheel is a desktop
 *     input anyway, so the wheel contract is asserted on desktop contexts
 *
 * Run: node tests/hero-carousel.spec.mjs [baseUrl]
 */
import { chromium, webkit, devices } from "@playwright/test";

const BASE = process.argv[2] || "http://localhost:4400";

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

/** Index of the slide the hero currently marks active. */
const slideIndex = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".hero-slide")].findIndex((s) =>
      s.classList.contains("is-active")
    )
  );

/**
 * Dispatch a synthetic swipe. Deliberately does NOT tap first — a tap at these
 * coordinates lands on the hero CTA and navigates away, which silently
 * invalidated every later assertion.
 */
async function swipe(page, fromX, fromY, toX, toY) {
  await page.evaluate(
    ([fx, fy, tx, ty]) => {
      const mk = (type, x, y) => {
        const t = new Touch({ identifier: 1, target: document.body, clientX: x, clientY: y });
        return new TouchEvent(type, {
          touches: type === "touchend" ? [] : [t],
          changedTouches: [t],
          bubbles: true,
          cancelable: true,
        });
      };
      window.dispatchEvent(mk("touchstart", fx, fy));
      for (let i = 1; i <= 6; i++) {
        window.dispatchEvent(mk("touchmove", fx + ((tx - fx) * i) / 6, fy + ((ty - fy) * i) / 6));
      }
      window.dispatchEvent(mk("touchend", tx, ty));
    },
    [fromX, fromY, toX, toY]
  );
  await page.waitForTimeout(1500);
}

async function touchContract(engine, name) {
  const browser = await engine.launch();
  const page = await (await browser.newContext({ ...devices["iPhone 13"] })).newPage();
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  console.log(`\n### ${name} — touch`);

  check("hero slides present", (await slideIndex(page)) >= 0);

  const before = await slideIndex(page);
  await swipe(page, 320, 420, 60, 420); // right-to-left => next
  const afterLeft = await slideIndex(page);
  check("swipe LEFT advances a slide", afterLeft !== before, `${before} -> ${afterLeft}`);

  await swipe(page, 60, 420, 320, 420); // left-to-right => previous
  const afterRight = await slideIndex(page);
  check("swipe RIGHT goes back", afterRight !== afterLeft, `${afterLeft} -> ${afterRight}`);

  // Vertical gesture must be scroll and nothing else.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  const beforeV = await slideIndex(page);
  await swipe(page, 200, 640, 200, 220); // straight up
  const afterV = await slideIndex(page);
  check("vertical swipe does NOT change slide", afterV === beforeV && beforeV >= 0, `${beforeV} -> ${afterV}`);

  await browser.close();
}

async function wheelContract(engine, name) {
  const browser = await engine.launch();
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  console.log(`\n### ${name} — wheel`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const slideBefore = await slideIndex(page);
  await page.mouse.move(640, 400);
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 240);
    await page.waitForTimeout(110);
  }
  await page.waitForTimeout(1000);
  const scrolled = await page.evaluate(() => window.scrollY);
  const slideAfter = await slideIndex(page);

  check("vertical wheel scrolls the PAGE", scrolled > 200, `scrollY=${scrolled}`);
  check("vertical wheel does NOT change slide", slideAfter === slideBefore, `${slideBefore} -> ${slideAfter}`);

  await browser.close();
}

await touchContract(chromium, "CHROMIUM iPhone 13");
await wheelContract(chromium, "CHROMIUM desktop");
await wheelContract(webkit, "WEBKIT desktop");

console.log(failures === 0 ? "\nHero carousel: all checks passed.\n" : `\n${failures} FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
