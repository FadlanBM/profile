import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["id", "en"] as const;
const DEFAULT_LOCALE = "id";

// Routes that must never receive a locale prefix.
const NON_LOCALIZED = ["/admin", "/login", "/api", "/uploads", "/_next", "/favicon.ico"];

function isNonLocalized(pathname: string): boolean {
  return NON_LOCALIZED.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function hasLocalePrefix(pathname: string): boolean {
  return LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

/** Pick a locale from Accept-Language, falling back to the default. */
function detectLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (tag.startsWith("id")) return "id";
    if (tag.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isNonLocalized(pathname) || hasLocalePrefix(pathname)) {
    return NextResponse.next();
  }

  // Static assets and files keep their own paths.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except Next.js internals and static files.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
