import React from "react";
import { type Language } from "@/lib/languages";
import type { Dictionary } from "@/lib/dictionary";
import { SITE_URL } from "@/lib/site";

export const JsonLd: React.FC<{ lang: Language; dict: Dictionary }> = ({
  lang,
  dict,
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: dict.meta.author,
    jobTitle: dict.structuredData.jobTitle,
    url: `${SITE_URL}/${lang}`,
    sameAs: [
      "https://github.com/FadlanBM",
      "https://www.linkedin.com/in/fadlandev",
    ],
    knowsAbout: dict.structuredData.knowsAbout,
    description: dict.meta.description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
