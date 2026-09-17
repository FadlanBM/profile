/**
 * Decide whether the admin session cookie must be flagged `Secure`.
 *
 * A cookie marked Secure is only sent by the browser over HTTPS. We must not
 * blindly tie this to NODE_ENV === "production": production builds are often
 * served over plain HTTP (local `next start`, Docker behind an HTTP-only
 * ingress, etc.), which would make the browser silently refuse to store the
 * session and break every admin write as a 401.
 *
 * The correct signal is the *request's* effective protocol, honoring a trusted
 * reverse proxy's `x-forwarded-proto` header.
 */
export function shouldUseSecureCookie(request: Request): boolean {
  try {
    if (new URL(request.url).protocol === "https:") return true;
  } catch {
    // fall through to header check
  }
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim().toLowerCase() === "https";
  }
  return false;
}
