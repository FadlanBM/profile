"use client";

import React from "react";
import { ArrowUp, Heart } from "lucide-react";
import { Button } from "./ui/Button";
import { useI18n } from "@/lib/i18n";

export const Footer: React.FC = () => {
  const { t } = useI18n();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#1A1A1A] text-[#FEFBF6] py-12 border-t-4 border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <a href="#" className="font-display text-3xl text-[#FDE047] tracking-wider">
            FADLAN.DEV
          </a>
          <p className="font-mono text-xs text-[#FEFBF6]/80 mt-1">
            © {new Date().getFullYear()} Fadlan Buwono Mukti. {t("footer.built_with")}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#FEFBF6]/90">
          <span>{t("footer.made_with")}</span>
          <Heart className="w-4 h-4 fill-[#F472B6] text-[#F472B6]" />
          <span>{t("footer.in_jakarta")}</span>
        </div>

        <Button variant="secondary" size="sm" onClick={scrollToTop}>
          {t("footer.back_to_top")} <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </footer>
  );
};