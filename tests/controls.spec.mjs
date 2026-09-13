/**
 * Interactive controls must actually do something.
 *
 * These all previously existed as convincing-looking affordances that did
 * nothing when used: a search box with no handler, a contact form whose submit
 * was `preventDefault()` and nothing else, and social icons pointing at "#".
 *
 * Run: node tests/controls.spec.mjs [baseUrl]
 */
import { chromium, devices } from "@playwright/test";

const BASE = process.argv[2] || "http://localhost:4400";

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();

// --- Search -----------------------------------------------------------------
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(1200);

  await page.getByRole("button", { name: /axtar/i }).first().click();
  await page.waitForTimeout(400);
  const input = page.locator("#site-search");
  check("search: overlay exposes a real input", await input.count() === 1);

  // Typed without local diacritics — folding must still match "Çəki".
  await input.fill("ceki");
  await page.waitForTimeout(400);
  const results = page.locator("[data-search-results] a");
  const hits = await results.count();
  check("search: 'ceki' finds the carp product (diacritic folding)", hits > 0, `${hits} results`);

  await input.fill("qalereya");
  await page.waitForTimeout(400);
  const galleryHref = await results.first().getAttribute("href");
  check("search: page results link to a real route", galleryHref === "/gallery", String(galleryHref));

  await results.first().click();
  await page.waitForURL("**/gallery", { timeout: 5000 }).catch(() => {});
  check("search: selecting a result navigates", new URL(page.url()).pathname === "/gallery", page.url());
  await page.close();
}

// --- Contact form -----------------------------------------------------------
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  // A mailto: navigation is an external protocol; capture it rather than follow.
  let mailto = null;
  await page.route("**/*", (r) => r.continue());
  page.on("request", (r) => {
    if (r.url().startsWith("mailto:")) mailto = r.url();
  });
  await page.goto(BASE + "/contact", { waitUntil: "load" });
  await page.waitForTimeout(800);

  await page.fill('input[name="name"]', "Test Person");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('textarea[name="message"]', "Salam, bu bir testdir.");
  await page.selectOption('select[name="subject"]', "partnership");

  // Capture the anchor click that carries the handoff, so no real mail client
  // opens and we can inspect exactly what would have been sent.
  await page.evaluate(() => {
    window.__mailto = null;
    const real = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.href.startsWith("mailto:")) { window.__mailto = this.href; return; }
      return real.call(this);
    };
  });
  await page.getByRole("button", { name: /göndər/i }).first().click();
  await page.waitForTimeout(500);

  const url = await page.evaluate(() => window.__mailto);
  check("contact: submit composes a message (not a silent no-op)", Boolean(url), String(url).slice(0, 60));
  check("contact: addressed to the published company address",
    String(url).startsWith("mailto:azerbaijanaquaculture@gmail.com"));
  const decoded = decodeURIComponent(String(url));
  check("contact: carries the typed message", decoded.includes("bu bir testdir"));
  check("contact: carries the chosen subject", decoded.includes("subject=") && !decoded.includes("subject=&"));
  void mailto;
  await page.close();
}

// --- No dead links ----------------------------------------------------------
{
  const page = await (await browser.newContext({ ...devices["Pixel 5"] })).newPage();
  for (const route of ["/", "/contact", "/gallery"]) {
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.waitForTimeout(500);
    const dead = await page.evaluate(() =>
      [...document.querySelectorAll('a[href="#"], a:not([href])')].map(
        (a) => a.getAttribute("aria-label") || (a.textContent || "").trim().slice(0, 20)
      )
    );
    check(`no dead anchors on ${route}`, dead.length === 0, dead.join(", ") || "none");
  }
  await page.close();
}

await browser.close();
console.log(failures === 0 ? "\nControls: all checks passed.\n" : `\n${failures} FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
