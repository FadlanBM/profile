"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, LogIn, ArrowLeft } from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal login admin");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFBF6] bg-grid-pattern flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="max-w-md mx-auto w-full pt-4">
        <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#1A1A1A] hover:underline">
          <ArrowLeft className="w-4 h-4" /> KEMBALI KE PORTFOLIO
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <Card bgColor="bg-[#FFFFFF]" shadowSize="xl" className="p-8">
          <div className="text-center mb-6">
            <Badge variant="yellow" className="mb-3">
              <Lock className="w-3.5 h-3.5" /> ADMIN ACCESS ONLY
            </Badge>
            <h1 className="font-display text-4xl text-[#1A1A1A]">LOGIN ADMIN</h1>
            <p className="font-sans text-xs font-bold text-[#1A1A1A]/70 mt-1">
              Kelola data proyek & pengalaman kerja secara real-time.
            </p>
          </div>

          {error && (
            <div className="bg-[#F472B6] border-2 border-[#1A1A1A] text-[#1A1A1A] font-mono text-xs font-bold p-3 rounded-md mb-6 shadow-brutal-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold text-[#1A1A1A] uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> USERNAME
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-mono text-sm bg-[#FEFBF6] focus:outline-none focus:bg-[#FFFFFF] shadow-brutal-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold text-[#1A1A1A] uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border-3 border-[#1A1A1A] rounded-md font-mono text-sm bg-[#FEFBF6] focus:outline-none focus:bg-[#FFFFFF] shadow-brutal-sm"
              />
            </div>

            <Button variant="primary" size="lg" type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "MEMPROSES..." : "LOGIN SEKARANG"} <LogIn className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>

      <div className="text-center font-mono text-xs font-bold text-[#1A1A1A]/60 pb-4">
        FADLAN BUWONO MUKTI PORTFOLIO ADMIN
      </div>
    </div>
  );
}
