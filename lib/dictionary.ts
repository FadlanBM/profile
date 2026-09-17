import { type Language } from "./languages";

export interface Dictionary {
  meta: {
    title: string;
    description: string;
    author: string;
  };
  structuredData: {
    jobTitle: string;
    knowsAbout: string[];
  };
}

export const dictionaries: Record<Language, Dictionary> = {
  id: {
    meta: {
      title: "Fadlan Buwono Mukti — Full-Stack Developer & Creative Coder",
      description:
        "Portfolio digital Fadlan Buwono Mukti, Full-stack developer yang mengubah ide kompleks menjadi produk digital yang cepat, jelas, dan memorable.",
      author: "Fadlan Buwono Mukti",
    },
    structuredData: {
      jobTitle: "Senior Full-Stack Engineer",
      knowsAbout: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Tailwind CSS"],
    },
  },
  en: {
    meta: {
      title: "Fadlan Buwono Mukti — Full-Stack Developer & Creative Coder",
      description:
        "Digital portfolio of Fadlan Buwono Mukti, a Full-stack developer turning complex ideas into fast, clear, and memorable digital products.",
      author: "Fadlan Buwono Mukti",
    },
    structuredData: {
      jobTitle: "Senior Full-Stack Engineer",
      knowsAbout: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Tailwind CSS"],
    },
  },
};

export function getDictionary(lang: Language): Dictionary {
  return dictionaries[lang] || dictionaries.id;
}
