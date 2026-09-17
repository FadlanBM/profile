import { redirect } from "next/navigation";
import { DEFAULT_LANGUAGE } from "@/lib/languages";

// Bare `/` has no language signal. The proxy redirects real browser traffic to
// a locale based on Accept-Language; this fallback keeps the route valid for
// prerendering and for clients that send no preference.
export default function RootPage() {
  redirect(`/${DEFAULT_LANGUAGE}`);
}
