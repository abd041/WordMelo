/**
 * WordMelo pre-launch audit — run against a local production server.
 *
 * Usage:
 *   1. npm run build && npm run start
 *   2. node scripts/audit-prelaunch.mjs [baseUrl]
 *
 * Defaults to http://localhost:3000
 * Exit code 1 on launch-blocking failures.
 */

import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const baseUrl = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const PRODUCTION_ORIGIN = "https://wordmelo.com";

const failures = [];
const warnings = [];
const notes = [];

function fail(msg) {
  failures.push(msg);
  console.error(`FAIL  ${msg}`);
}
function warn(msg) {
  warnings.push(msg);
  console.warn(`WARN  ${msg}`);
}
function pass(msg) {
  notes.push(msg);
  console.log(`PASS  ${msg}`);
}

async function fetchText(pathname) {
  const url = `${baseUrl}${pathname}`;
  const res = await fetch(url, { redirect: "manual" });
  const text = await res.text();
  return { url, status: res.status, text, headers: res.headers };
}

function extractCanonical(html) {
  const m = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
  );
  if (m) return m[1];
  const m2 = html.match(
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i,
  );
  return m2 ? m2[1] : null;
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

function extractMetaDescription(html) {
  const m = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
  );
  if (m) return m[1];
  const m2 = html.match(
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
  );
  return m2 ? m2[1] : null;
}

function countH1(html) {
  const matches = html.match(/<h1\b/gi);
  return matches ? matches.length : 0;
}

function hasNoIndex(html) {
  return /name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

function parseSitemapUrls(xml) {
  const urls = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml))) {
    urls.push(m[1].trim());
  }
  return urls;
}

async function loadRegistrySlugs() {
  // Prefer reading registry source with a simple regex — no TS transpile required.
  const fs = await import("node:fs/promises");
  const src = await fs.readFile(
    path.join(root, "src/lib/tools/registry.ts"),
    "utf8",
  );
  const published = [];
  const blocks = src.split(/\{\s*\n\s*id:/);
  for (const block of blocks.slice(1)) {
    const id = block.match(/^\s*["']([^"']+)["']/)?.[1];
    const status = block.match(/status:\s*["']([^"']+)["']/)?.[1];
    const href = block.match(/href:\s*["']([^"']+)["']/)?.[1];
    if (id && status === "published" && href) {
      published.push({ id, href });
    }
  }
  return published;
}

async function main() {
  console.log(`\nWordMelo pre-launch audit → ${baseUrl}\n`);

  const published = await loadRegistrySlugs();
  if (published.length !== 10) {
    fail(`Expected 10 published tools in registry, found ${published.length}`);
  } else {
    pass(`Registry has ${published.length} published tools`);
  }

  const corePaths = ["/", "/about", "/contact", "/privacy", "/terms"];
  const toolPaths = published.map((t) => t.href);
  const assetPaths = [
    "/robots.txt",
    "/sitemap.xml",
    "/favicon.ico",
    "/icon",
    "/opengraph-image",
  ];

  // robots.txt
  const robots = await fetchText("/robots.txt");
  if (robots.status !== 200) fail(`robots.txt status ${robots.status}`);
  else pass("robots.txt HTTP 200");
  if (!/Sitemap:\s*https:\/\/wordmelo\.com\/sitemap\.xml/i.test(robots.text)) {
    fail("robots.txt missing Sitemap: https://wordmelo.com/sitemap.xml");
  } else {
    pass("robots.txt sitemap URL is production domain");
  }
  if (/Disallow:\s*\/\s*$/m.test(robots.text) && !/Allow:\s*\//.test(robots.text)) {
    fail("robots.txt appears to disallow all routes");
  }
  if (/localhost|vercel\.app|example\.com/i.test(robots.text)) {
    fail("robots.txt contains non-production host");
  }

  // sitemap
  const sitemap = await fetchText("/sitemap.xml");
  if (sitemap.status !== 200) fail(`sitemap.xml status ${sitemap.status}`);
  else pass("sitemap.xml HTTP 200");
  if (!sitemap.text.includes("<urlset") || !sitemap.text.includes("<loc>")) {
    fail("sitemap.xml is not valid-looking XML");
  }
  const locs = parseSitemapUrls(sitemap.text);
  console.log(`\nSitemap URLs (${locs.length}):`);
  for (const u of locs) console.log(`  - ${u}`);

  const dupes = locs.filter((u, i) => locs.indexOf(u) !== i);
  if (dupes.length) fail(`Duplicate sitemap URLs: ${[...new Set(dupes)].join(", ")}`);
  else pass("No duplicate sitemap URLs");

  for (const u of locs) {
    if (!u.startsWith(PRODUCTION_ORIGIN)) {
      fail(`Sitemap URL not on production origin: ${u}`);
    }
    if (u.endsWith("/") && u !== `${PRODUCTION_ORIGIN}/`) {
      warn(`Trailing slash on non-home sitemap URL: ${u}`);
    }
  }

  const expectedPaths = new Set([
    ...corePaths.map((p) => (p === "/" ? "/" : p)),
    ...toolPaths,
  ]);
  const sitemapPaths = new Set(
    locs.map((u) => {
      const pathOnly = u.replace(PRODUCTION_ORIGIN, "") || "/";
      return pathOnly;
    }),
  );

  for (const p of expectedPaths) {
    if (!sitemapPaths.has(p)) fail(`Sitemap missing expected path: ${p}`);
  }
  for (const p of sitemapPaths) {
    if (!expectedPaths.has(p)) {
      warn(`Sitemap includes unexpected path: ${p}`);
    }
  }
  if (failures.filter((f) => f.includes("Sitemap missing")).length === 0) {
    pass(`Sitemap covers all ${expectedPaths.size} expected indexable paths`);
  }

  // Route HTTP checks + metadata
  const titles = new Map();
  const descriptions = new Map();
  const pagePaths = [...corePaths, ...toolPaths];

  for (const p of pagePaths) {
    const r = await fetchText(p);
    if (r.status !== 200) {
      fail(`${p} returned ${r.status}`);
      continue;
    }
    pass(`${p} HTTP 200`);

    const title = extractTitle(r.text);
    const desc = extractMetaDescription(r.text);
    const canonical = extractCanonical(r.text);
    const h1 = countH1(r.text);

    if (!title) fail(`${p} missing <title>`);
    else {
      if (titles.has(title)) fail(`Duplicate title shared by ${titles.get(title)} and ${p}: ${title}`);
      else titles.set(title, p);
    }
    if (!desc) fail(`${p} missing meta description`);
    else if (descriptions.has(desc)) {
      fail(
        `Duplicate description shared by ${descriptions.get(desc)} and ${p}`,
      );
    } else descriptions.set(desc, p);

    if (h1 !== 1) fail(`${p} has ${h1} H1 elements (expected 1)`);
    if (hasNoIndex(r.text)) fail(`${p} is noindex`);

    const expectedCanonical =
      p === "/" ? PRODUCTION_ORIGIN : `${PRODUCTION_ORIGIN}${p}`;
    if (!canonical) fail(`${p} missing canonical`);
    else if (canonical !== expectedCanonical && !(p === "/" && canonical === `${PRODUCTION_ORIGIN}/`)) {
      fail(`${p} canonical mismatch: got ${canonical}, expected ${expectedCanonical}`);
    } else if (/localhost|vercel\.app|example\.com/i.test(canonical || "")) {
      fail(`${p} canonical uses non-production host: ${canonical}`);
    }

    if (/localhost:|127\.0\.0\.1|example\.com/i.test(r.text) && !p.includes("about")) {
      // allow mention only if not in meta — soft check on head
      const head = r.text.slice(0, 4000);
      if (/localhost|127\.0\.0\.1|example\.com/i.test(head)) {
        fail(`${p} head HTML contains localhost/example domain`);
      }
    }

    // sitemap listed URL must match
    const listed =
      locs.includes(expectedCanonical) ||
      (p === "/" && locs.includes(`${PRODUCTION_ORIGIN}/`));
    if (!listed) fail(`${p} not listed in sitemap with production URL`);
  }

  // Assets
  for (const p of assetPaths) {
    if (p === "/favicon.ico") {
      // Next may serve /icon instead; try both
      const fav = await fetchText("/favicon.ico");
      const icon = await fetchText("/icon");
      if (fav.status === 200 || icon.status === 200) {
        pass(`Icon available (favicon=${fav.status}, /icon=${icon.status})`);
      } else {
        fail(`Neither /favicon.ico nor /icon returned 200`);
      }
      continue;
    }
    const r = await fetchText(p);
    if (r.status !== 200) fail(`${p} returned ${r.status}`);
    else pass(`${p} HTTP 200`);
  }

  // 404 page
  const notFound = await fetchText("/this-route-should-not-exist-wordmelo");
  if (notFound.status !== 404) {
    warn(`Custom missing path returned ${notFound.status} (expected 404)`);
  } else {
    pass("Unknown path returns 404");
  }

  // Contact email present on contact page
  const contact = await fetchText("/contact");
  if (!contact.text.includes("abdullahrauf440@gmail.com")) {
    fail("Contact page missing official email abdullahrauf440@gmail.com");
  } else {
    pass("Contact page includes official email");
  }

  // Structured data smoke on homepage
  const home = await fetchText("/");
  if (!home.text.includes("application/ld+json")) {
    fail("Homepage missing JSON-LD");
  } else if (!home.text.includes('"@type":"WebSite"') && !home.text.includes('"@type": "WebSite"')) {
    warn("Homepage JSON-LD may be missing WebSite type");
  } else {
    pass("Homepage includes WebSite JSON-LD");
  }
  if (/AggregateRating|reviewCount|"ratingValue"/i.test(home.text)) {
    fail("Homepage JSON-LD contains ratings/reviews claims");
  }

  console.log("\n--- Summary ---");
  console.log(`Indexable URLs in sitemap: ${locs.length}`);
  console.log(`PASS notes: ${notes.length}`);
  console.log(`WARNINGS: ${warnings.length}`);
  console.log(`FAILURES: ${failures.length}`);

  if (failures.length) {
    console.error("\nLaunch-blocking failures:");
    for (const f of failures) console.error(`  • ${f}`);
    process.exit(1);
  }
  if (warnings.length) {
    console.warn("\nWarnings:");
    for (const w of warnings) console.warn(`  • ${w}`);
  }
  console.log("\nPre-launch audit completed with no launch-blocking failures.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
