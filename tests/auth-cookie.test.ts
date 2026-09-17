import assert from "node:assert/strict";
import test from "node:test";
import { shouldUseSecureCookie } from "../lib/cookie-security.ts";

test("HTTP production request does not receive a Secure-only cookie", () => {
  const request = new Request("http://portfolio.example.com/api/auth/login");
  assert.equal(shouldUseSecureCookie(request), false);
});

test("HTTPS request receives a Secure cookie", () => {
  const request = new Request("https://portfolio.example.com/api/auth/login");
  assert.equal(shouldUseSecureCookie(request), true);
});

test("trusted reverse proxy protocol controls cookie security", () => {
  const request = new Request("http://127.0.0.1/api/auth/login", {
    headers: { "x-forwarded-proto": "https" },
  });
  assert.equal(shouldUseSecureCookie(request), true);
});
