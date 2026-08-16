"use client";

import React, { useState, useEffect } from "react";
import { Award, ExternalLink, Calendar, ZoomIn, X } from "lucide-react";
import { Badge } from "./ui/Badge";
import { useI18n } from "@/lib/i18n";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issued_date: string;
  description: string;
  image_url: string;
  credential_url: string;
  title_en: string;
  description_en: string;
}

export const CertificatesSection: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { lang, t } = useI18n();

  useEffect(() => {
    fetch("/api/certificates")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCertificates(data);
      })
      .catch(() => { });
  }, []);

  // Close preview with Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (certificates.length === 0) return null;

  return (
    <>
      <section className="relative py-16 md:py-24 bg-[#FEFBF6] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-12">
            <Badge variant="yellow" className="mb-4 px-4 py-1.5 text-sm">
              <Award className="w-4 h-4" /> {t("certificates.badge") || "SERTIFIKAT"}
            </Badge>
            <h2 className="font-display text-4xl md:text-5xl font-black text-[#1A1A1A] uppercase tracking-tight">
              {t("certificates.heading") || "CERTIFICATIONS"}
            </h2>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((cert) => {
              const title = lang === "en" && cert.title_en ? cert.title_en : cert.title;
              const desc = lang === "en" && cert.description_en ? cert.description_en : cert.description;

              return (
                <div
                  key={cert.id}
                  className="group bg-white border-3 border-[#1A1A1A] rounded-xl shadow-brutal hover:shadow-brutal-lg transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* Certificate Image */}
                  <button
                    type="button"
                    onClick={() => setPreviewImage(cert.image_url)}
                    aria-label={`Preview ${title}`}
                    className="relative aspect-[4/3] w-full bg-[#F3F4F6] overflow-hidden border-b-3 border-[#1A1A1A] cursor-zoom-in text-left"
                  >
                    <img
                      src={cert.image_url}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#1A1A1A] bg-[#FDE047] border-2 border-[#1A1A1A] rounded px-3 py-1.5 shadow-brutal-sm">
                        <ZoomIn className="w-4 h-4" /> PREVIEW
                      </span>
                    </div>
                  </button>

                  {/* Card Body */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    {/* Title + Issuer */}
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold text-[#1A1A1A] leading-tight mb-1">
                        {title}
                      </h3>
                      <p className="font-mono text-sm font-semibold text-[#60A5FA]">
                        {cert.issuer}
                      </p>
                    </div>

                    {/* Date */}
                    {cert.issued_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        <span className="font-mono text-xs font-medium text-[#9CA3AF]">
                          {cert.issued_date}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {desc && (
                      <p className="font-sans text-sm text-[#4B5563] leading-relaxed line-clamp-2">
                        {desc}
                      </p>
                    )}

                    {/* Credential Link */}
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#1A1A1A] bg-[#FDE047] border-2 border-[#1A1A1A] rounded px-3 py-1.5 self-start hover:bg-[#FACC15] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {t("certificates.verify") || "VERIFY"}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-[#1A1A1A]/90 flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-5xl w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              aria-label="Close preview"
              className="absolute -top-4 -right-4 z-10 bg-[#FDE047] border-3 border-[#1A1A1A] rounded-md p-2 shadow-brutal hover:bg-[#FACC15] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Certificate preview"
              className="w-full max-h-[85vh] object-contain bg-white border-3 border-[#1A1A1A] rounded-lg shadow-brutal"
            />
          </div>
        </div>
      )}
    </>
  );
};
