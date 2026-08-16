"use client";

import React, { useState } from "react";
import { Mail, Send, MessageSquare, CheckCircle, MapPin, Loader2 } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { useI18n } from "@/lib/i18n";

export const ContactSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        setErrorMsg(data.error || "Gagal mengirim email.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#FEFBF6] border-b-4 border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Info Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <Badge variant="pink" className="mb-3">
                <MessageSquare className="w-3.5 h-3.5" /> {t("contact.header_badge")}
              </Badge>
              <h2 className="font-display text-4xl md:text-6xl text-[#1A1A1A] uppercase tracking-tight">
                {t("contact.heading")}
              </h2>
            </div>

            <p className="font-sans text-base font-medium text-[#1A1A1A] leading-relaxed">
              {t("contact.desc")}
            </p>

            <div className="flex flex-col gap-4 pt-2">
              <Card bgColor="bg-[#FDE047]" shadowSize="sm" className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-[#1A1A1A] text-[#FEFBF6] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-[#1A1A1A]">{t("contact.email_label")}</p>
                  <a href="mailto:fadlanbuwono@gmail.com" className="font-sans text-sm font-extrabold text-[#1A1A1A] hover:underline">
                    fadlanbuwono@gmail.com
                  </a>
                </div>
              </Card>

              <Card bgColor="bg-[#60A5FA]" shadowSize="sm" className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-[#1A1A1A] text-[#FEFBF6] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-[#1A1A1A]">{t("contact.location_label")}</p>
                  <p className="font-sans text-sm font-extrabold text-[#1A1A1A]">
                    {t("contact.location_value")}
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7">
            <Card bgColor="bg-[#FFFFFF]" shadowSize="xl" className="p-8">
              {submitted ? (
                <div className="py-12 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#86EFAC] border-3 border-[#1A1A1A] shadow-brutal flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#1A1A1A]" />
                  </div>
                  <h3 className="font-display text-3xl text-[#1A1A1A]">{t("contact.thanks_title")}</h3>
                  <p className="font-sans text-base font-medium text-[#1A1A1A] max-w-md">
                    {t("contact.thanks_desc")}
                  </p>
                  <Button variant="secondary" size="md" onClick={() => setSubmitted(false)}>
                    {t("contact.send_another")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <h3 className="font-display text-2xl text-[#1A1A1A] border-b-3 border-[#1A1A1A] pb-3">
                    {t("contact.form_title")}
                  </h3>

                  {errorMsg && (
                    <div className="p-3 bg-[#F472B6] border-2 border-[#1A1A1A] rounded-md font-sans text-xs font-bold text-[#1A1A1A]">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs font-bold text-[#1A1A1A] uppercase">
                      {t("contact.name_label")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t("contact.name_placeholder")}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 border-3 border-[#1A1A1A] rounded-md font-sans text-sm font-medium bg-[#FEFBF6] focus:outline-none focus:bg-[#FFFFFF] shadow-brutal-sm text-[#1A1A1A]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs font-bold text-[#1A1A1A] uppercase">
                      {t("contact.email_form_label")}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={t("contact.email_placeholder")}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 border-3 border-[#1A1A1A] rounded-md font-sans text-sm font-medium bg-[#FEFBF6] focus:outline-none focus:bg-[#FFFFFF] shadow-brutal-sm text-[#1A1A1A]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs font-bold text-[#1A1A1A] uppercase">
                      {t("contact.message_label")}
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder={t("contact.message_placeholder")}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 border-3 border-[#1A1A1A] rounded-md font-sans text-sm font-medium bg-[#FEFBF6] focus:outline-none focus:bg-[#FFFFFF] shadow-brutal-sm text-[#1A1A1A] resize-none"
                    />
                  </div>

                  <Button variant="primary" size="lg" type="submit" disabled={loading} className="w-full mt-2">
                    {loading ? (
                      <>
                        MENGIRIM... <Loader2 className="w-4 h-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        {t("contact.submit")} <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};