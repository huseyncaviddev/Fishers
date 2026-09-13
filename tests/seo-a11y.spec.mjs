/**
 * Crawl-surface and accessibility regressions.
 *
 * Each check here guards something that was actually broken in production:
 * robots.txt pointing its sitemap at a foreign domain, pages with no canonical
 * (and the homepage's og:url on every route), two H1s per product page, a
 * contact form with no label associations, overlays that ignored Escape, and
 * the About-page certificate card that hung past the viewport edge and could
 * never be brought forward on a touch screen.
 *
 * Run: node tests/seo-a11y.spec.mjs [baseUrl]
 */
import { chromium } from "@playwright/test";

const BASE = process.argv[2] || "http://localhost:4400";
const ROUTES = ["/", "/about", "/products", "/products/ceki", "/team", "/gallery", "/contact"];

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();

// --- robots + sitemap ---------------------------------------------------------
{
  console.log("\n### Crawl surface");
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  const sitemapLine = robots.split("\n").find((l) => l.startsWith("Sitemap:")) || "";
  const sitemapUrl = sitemapLine.replace("Sitemap:", "").trim();
  const sitemapXml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const hosts = new Set([sitemapUrl, ...locs].map((u) => new URL(u).origin));
  check("robots.txt: sitemap and every sitemap URL share one canonical origin", hosts.size === 1, [...hosts].join(", "));
  check("sitemap: no localhost/staging entries", locs.every((u) => !/localhost|vercel\.app|staging/.test(u)));
  // Every sitemap path must resolve on the server under test.
  let broken = 0;
  for (const u of locs) {
    const path = new URL(u).pathname;
    const res = await fetch(`${BASE}${path}`, { method: "HEAD" });
    if (res.status !== 200) broken++;
  }
  check(`sitemap: all ${locs.length} paths return 200`, broken === 0, broken ? `${broken} broken` : "");

  const nf = await fetch(`${BASE}/definitely-not-a-route`);
  check("unknown route returns HTTP 404", nf.status === 404, String(nf.status));

  const home = await fetch(`${BASE}/`);
  for (const h of ["content-security-policy", "x-content-type-options", "referrer-policy", "permissions-policy"]) {
    check(`security header: ${h}`, !!home.headers.get(h));
  }
  check("no X-Powered-By leak", !home.headers.get("x-powered-by"));
}

// --- per-route metadata + document structure ----------------------------------
{
  console.log("\n### Metadata and structure");
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
  const failedAssets = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && r.request().resourceType() !== "document") failedAssets.push(`${r.status()} ${r.url()}`);
  });
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.waitForTimeout(600);
    const m = await page.evaluate(() => ({
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? "",
      ogUrl: document.querySelector('meta[property="og:url"]')?.content ?? "",
      ogTitle: document.querySelector('meta[property="og:title"]')?.content ?? "",
      title: document.title,
      h1: document.querySelectorAll("h1").length,
      lang: document.documentElement.lang,
      skip: !!document.querySelector('a.skip-link[href="#main"]') && !!document.getElementById("main"),
      unlabeled: [...document.querySelectorAll("input, select, textarea")].filter(
        (el) => !(el.labels?.length || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby"))
      ).length,
      jsonLdValid: [...document.querySelectorAll('script[type="application/ld+json"]')].every((s) => {
        try { JSON.parse(s.textContent); return true; } catch { return false; }
      }),
    }));
    const path = route === "/" ? "" : route;
    check(`${route}: canonical ends with route path`, m.canonical.endsWith(path) && m.canonical.startsWith("https://"), m.canonical);
    check(`${route}: og:url matches canonical`, new URL(m.ogUrl).href === new URL(m.canonical).href, m.ogUrl);
    check(`${route}: og:title matches <title>`, m.ogTitle === m.title, m.ogTitle);
    check(`${route}: exactly one H1`, m.h1 === 1, String(m.h1));
    check(`${route}: html lang set`, m.lang === "az");
    check(`${route}: skip link present`, m.skip);
    check(`${route}: every form control has a label`, m.unlabeled === 0, `${m.unlabeled} unlabeled`);
    check(`${route}: JSON-LD parses`, m.jsonLdValid);
  }
  check("no failed asset requests across routes", failedAssets.length === 0, failedAssets.slice(0, 5).join(" | "));
  await page.close();
}

// --- overlays: keyboard + focus -----------------------------------------------
{
  console.log("\n### Overlays");
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const menuBtn = page.getByRole("button", { name: /menyu/i });
  check("menu button: aria-expanded=false when closed", (await menuBtn.getAttribute("aria-expanded")) === "false");
  await menuBtn.click();
  await page.waitForTimeout(600);
  check("menu: opens as a dialog", (await page.locator('[role="dialog"][aria-modal="true"]').count()) === 1);
  check("menu: aria-expanded=true when open", (await menuBtn.getAttribute("aria-expanded")) === "true");
  check("menu: focus moved inside", await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  check("menu: Escape closes it", (await page.locator('[role="dialog"]').count()) === 0);
  check("menu: focus returns to the trigger", await page.evaluate(() => document.activeElement?.getAttribute("aria-label") === "Menyu"));

  await page.getByRole("button", { name: /axtar/i }).first().click();
  await page.waitForTimeout(500);
  check("search: input focused on open", await page.evaluate(() => document.activeElement?.id === "site-search"));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  check("search: Escape closes it", (await page.locator("#site-search").count()) === 0);
  await page.close();
}

// --- About certificates --------------------------------------------------------
{
  console.log("\n### Certificates");
  for (const [w, h, touch] of [[1280, 800, false], [390, 844, true]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage();
    await page.goto(BASE + "/about", { waitUntil: "load" });
    const back = page.locator('button[aria-label^="Fəxri"]');
    await back.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const box = await back.boundingBox();
    check(`${w}px: back certificate stays inside the viewport`, box && box.x >= 0 && box.x + box.width <= w + 1, box ? `right=${Math.round(box.x + box.width)}` : "no box");
    check(`${w}px: back certificate starts behind the front one`, (await back.getAttribute("aria-pressed")) === "false");
    // Tap/click the exposed right-hand slice — the only part a real user can
    // hit. Mid-height, inset from the (rotated) bounding box edge.
    const px = box.x + box.width - 20;
    const py = box.y + box.height / 2;
    if (touch) await page.touchscreen.tap(px, py);
    else await page.mouse.click(px, py);
    await page.waitForTimeout(600);
    check(`${w}px: activating the slice brings it to the front`, (await back.getAttribute("aria-pressed")) === "true");
    await ctx.close();
  }
  // Keyboard: the front card's control is reachable and Enter swaps.
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await page.goto(BASE + "/about", { waitUntil: "load" });
  const back = page.locator('button[aria-label^="Fəxri"]');
  await back.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await back.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  check("keyboard: Enter on the back certificate brings it forward", (await back.getAttribute("aria-pressed")) === "true");
  await page.close();
}

await browser.close();
console.log(failures === 0 ? "\nSEO/a11y: all checks passed.\n" : `\n${failures} FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
