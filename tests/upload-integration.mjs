// Integration test: a file uploaded through /api/upload must return a URL that
// the browser can actually fetch. Historically the route returned a bare
// /uploads/... path, which Next.js in production mode 404s because public/ is
// snapshotted at build time — the image never renders even though upload
// "succeeded".
//
// Requires a running server: TEST_BASE_URL (default http://localhost:3456)
import assert from "node:assert/strict";
import test from "node:test";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3456";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

// 1x1 transparent PNG
const PNG = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6300010000050001000d0a2db40000000049454e44ae426082",
  "hex"
);

async function loginCookie() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  assert.equal(res.status, 200, "admin login must succeed");
  const raw = res.headers.get("set-cookie") || "";
  const cookie = raw.split(";")[0];
  assert.ok(cookie.includes("admin_session="), "session cookie must be issued");
  return cookie;
}

async function upload(cookie, filename, type, bytes) {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type }), filename);
  const res = await fetch(`${BASE}/api/upload`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

test("uploaded image URL is fetchable and serves image bytes", async () => {
  const cookie = await loginCookie();
  const { status, body } = await upload(cookie, "regression.png", "image/png", PNG);
  assert.equal(status, 200, `upload should succeed, got ${status}: ${JSON.stringify(body)}`);
  assert.ok(body.url, "upload response must include a url");

  const res = await fetch(new URL(body.url, BASE));
  assert.equal(res.status, 200, `returned url ${body.url} must be fetchable`);
  const contentType = res.headers.get("content-type") || "";
  assert.ok(contentType.startsWith("image/"), `content-type should be an image, got ${contentType}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  assert.ok(bytes.length > 0, "served image must not be empty");
});

test("uploaded PDF (CV) URL is fetchable", async () => {
  const cookie = await loginCookie();
  const pdf = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n", "utf8");
  const { status, body } = await upload(cookie, "regression.pdf", "application/pdf", pdf);
  assert.equal(status, 200, `pdf upload should succeed, got ${status}: ${JSON.stringify(body)}`);

  const res = await fetch(new URL(body.url, BASE));
  assert.equal(res.status, 200, `returned url ${body.url} must be fetchable`);
});

test("legacy /uploads/ paths still resolve for existing database rows", async () => {
  const cookie = await loginCookie();
  const { body } = await upload(cookie, "legacy.png", "image/png", PNG);
  // Existing rows in the database store the bare static path.
  const legacyPath = new URL(body.url, BASE).searchParams.get("url") || body.url;
  const res = await fetch(new URL(legacyPath, BASE));
  assert.equal(res.status, 200, `legacy path ${legacyPath} must still resolve`);
});

test("rejects non-image, non-pdf files", async () => {
  const cookie = await loginCookie();
  const { status } = await upload(cookie, "evil.txt", "text/plain", Buffer.from("nope"));
  assert.equal(status, 400, "text file must be rejected");
});

test("rejects unauthenticated uploads", async () => {
  const form = new FormData();
  form.append("file", new Blob([PNG], { type: "image/png" }), "anon.png");
  const res = await fetch(`${BASE}/api/upload`, { method: "POST", body: form });
  assert.equal(res.status, 401, "anonymous upload must be rejected");
});
