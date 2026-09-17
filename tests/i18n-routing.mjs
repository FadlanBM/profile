// SEO i18n routing regression tests.
// Requires a running server: TEST_BASE_URL (default http://localhost:3456)
import assert from "node:assert/strict";
import test from "node:test";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3456";

test("root URL redirects to the default locale", async () => {
  const res = await fetch(`${BASE}/`, { redirect: "manual" });
  assert.ok(res.status >= 300 && res.status < 400, `expected a redirect, got ${res.status}`);
  const location = res.headers.get("location") || "";
  assert.ok(/\/id$/.test(location), `expected redirect to /id, got ${location}`);
});

test("/id renders Indonesian page with lang and hreflang alternates", async () => {
  const res = await fetch(`${BASE}/id`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /<html[^>]+lang="id"/, "html lang must be id");
  assert.match(html, /hreflang="en"/i, "must advertise the en alternate");
  assert.match(html, /hreflang="id"/i, "must advertise the id alternate");
  assert.match(html, /hreflang="x-default"/i, "must advertise x-default");
  assert.match(html, /rel="canonical"[^>]*\/id/, "canonical must point at /id");
  assert.match(html, /PROYEK PILIHAN/, "Indonesian copy must be server-rendered");
});

test("/en renders English page with localized content", async () => {
  const res = await fetch(`${BASE}/en`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /<html[^>]+lang="en"/, "html lang must be en");
  assert.match(html, /rel="canonical"[^>]*\/en/, "canonical must point at /en");
  assert.match(html, /SELECTED PROJECTS/, "English copy must be server-rendered");
});

test("both locales are discoverable via in-page links", async () => {
  const html = await (await fetch(`${BASE}/id`)).text();
  assert.match(html, /href="\/en"/, "Indonesian page must link to /en");
  const enHtml = await (await fetch(`${BASE}/en`)).text();
  assert.match(enHtml, /href="\/id"/, "English page must link to /id");
});

test("unknown locales return 404", async () => {
  const res = await fetch(`${BASE}/de`);
  assert.equal(res.status, 404);
});

test("admin and login pages keep working outside the locale prefix", async () => {
  assert.equal((await fetch(`${BASE}/admin`)).status, 200);
  assert.equal((await fetch(`${BASE}/login`)).status, 200);
});

test("API routes are not affected by locale routing", async () => {
  const res = await fetch(`${BASE}/api/projects`);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(await res.json()));
});

test("sitemap.xml advertises both locales", async () => {
  const res = await fetch(`${BASE}/sitemap.xml`);
  assert.equal(res.status, 200);
  const xml = await res.text();
  assert.match(xml, /\/id</, "sitemap must include /id");
  assert.match(xml, /\/en</, "sitemap must include /en");
});

test("robots.txt allows crawling and points at the sitemap", async () => {
  const res = await fetch(`${BASE}/robots.txt`);
  assert.equal(res.status, 200);
  const txt = await res.text();
  assert.match(txt, /Sitemap:/i, "robots.txt must reference the sitemap");
  assert.match(txt, /\/api\//, "robots.txt should disallow the API");
});
