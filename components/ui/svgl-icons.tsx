"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

interface SVG {
  id: number;
  title: string;
  category: string | string[];
  route: string | { light: string; dark: string };
  url: string;
  wordmark?: string | { light: string; dark: string };
  brandUrl?: string;
}

// Curated list of tech logos for the landing page
const TECH_LOGO_IDS = [
  506, // Vercel
  441, // Supabase
  434, // Next.js
  36,  // React
  107, // TypeScript
  72,  // Tailwind CSS
  261, // OpenAI
  526, // GitHub
  118, // Railway
  220, // Cloudflare
  53,  // Figma
  411, // Notion
  250, // Linear
  437, // Node.js
  132, // Docker
  175, // PostgreSQL
];

export default function SvglTechLogos() {
  const [svgs, setSvgs] = useState<SVG[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSvgs() {
      try {
        const response = await fetch("https://api.svgl.app");
        const data: SVG[] = await response.json();
        
        // Filter to only our curated tech logos
        const filtered = data.filter((svg) => TECH_LOGO_IDS.includes(svg.id));
        setSvgs(filtered);
      } catch (error) {
        console.error("Failed to fetch svgl icons:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSvgs();
  }, []);

  const activeSvg = svgs.find((s) => s.id === hoveredId);

  const getSvgUrl = (svg: SVG) => {
    if (typeof svg.route === "string") {
      return svg.route;
    }
    // Use dark variant for dark mode compatibility
    return svg.route.dark || svg.route.light;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-16 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex-shrink-0 w-full sm:w-auto text-center sm:text-left">
          <p className="text-sm sm:text-base text-muted-foreground font-medium mb-0 tracking-tight">
            compatible with
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-none sm:leading-tight tracking-tight">
            all your favorite tools
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-16 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Left: text */}
      <div className="flex-shrink-0 w-full sm:w-auto text-center sm:text-left">
        <p className="text-sm sm:text-base text-muted-foreground font-medium mb-0 tracking-tight">
          compatible with
        </p>
        <div className="relative">
          <p
            aria-hidden
            className="text-3xl lg:text-3xl font-bold tracking-tight whitespace-nowrap opacity-0 pointer-events-none select-none leading-none sm:leading-tight"
          >
            all your favorite tools
          </p>
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={hoveredId ?? "default"}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-none sm:leading-tight tracking-tight whitespace-nowrap"
              >
                {activeSvg?.title ?? "all your favorite tools"}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right: icon grid */}
      <div className="grid grid-cols-6 sm:flex sm:flex-wrap items-center justify-center sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto md:mt-6 sm:mt-0">
        {svgs.map((svg) => {
          const isActive = hoveredId === svg.id;
          const isDimmed = hoveredId !== null && !isActive;
          const svgUrl = getSvgUrl(svg);

          return (
            <a
              key={svg.id}
              href={svg.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={svg.title}
              className={[
                "flex items-center justify-center p-2.5 sm:p-3 lg:p-3.5 rounded-lg border transition-all duration-200",
                isActive
                  ? "border-foreground/30 text-foreground bg-foreground/5"
                  : "border-transparent text-foreground/30 hover:text-foreground/50",
                isDimmed ? "opacity-40" : "",
              ].join(" ")}
              onMouseEnter={() => setHoveredId(svg.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Image
                src={svgUrl}
                alt={svg.title}
                width={24}
                height={24}
                className="w-6 h-6 sm:w-5 sm:h-5 object-contain"
                unoptimized
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}
