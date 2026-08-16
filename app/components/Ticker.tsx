"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";

export const Ticker: React.FC = () => {
  const { t } = useI18n();

  const tickerItems = [
    t("ticker.fullstack"),
    "✦",
    t("ticker.creative"),
    "✦",
    t("ticker.problem_solver"),
    "✦",
    t("ticker.open_collab"),
    "✦",
    t("ticker.nextjs_expert"),
    "✦",
    t("ticker.uiux_enthusiast"),
    "✦",
  ];

  return (
    <div className="w-full bg-[#1A1A1A] border-y-4 border-[#1A1A1A] py-4 overflow-hidden select-none">
      <div className="animate-marquee whitespace-nowrap">
        {/* Render twice for seamless infinite marquee */}
        {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
          <span
            key={index}
            className={`inline-block font-display text-2xl md:text-3xl mx-3 tracking-wider ${
              item === "✦" ? "text-[#F472B6]" : "text-[#FDE047]"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};