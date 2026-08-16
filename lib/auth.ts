import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "neobrutalism_portfolio_admin_secret_key_2026";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

export function verifyAdminCredentials(user: string, pass: string): boolean {
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

export function createAdminToken(): string {
  return jwt.sign({ role: "admin", user: ADMIN_USER }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;

    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    return decoded?.role === "admin";
  } catch {
    return false;
  }
}
