"use client";

import * as React from "react";
import Image from "next/image";
import { Briefcase, Calendar, Quote, Layers, ExternalLink } from "lucide-react";
import { DashboardPortfolioItem } from "@/types/dashboard";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface ProfilePortfolioProps {
  portfolio: DashboardPortfolioItem[];
}

export function ProfilePortfolio({ portfolio }: ProfilePortfolioProps) {
  const { t } = useTranslation();
  const [activeItem, setActiveItem] = React.useState<DashboardPortfolioItem | null>(null);

  return (
    <div className="rounded-md bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-forest/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-forest" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
              {t.profile?.portfolio || "Craft Project Showcase"}
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Photographic evidence of completed works uploaded directly to the sovereign registry.
          </p>
        </div>
        <span className="font-mono text-xs text-forest/70 font-semibold bg-forest/5 px-2.5 py-1 rounded-md border border-forest/15">
          {portfolio.length} Projects Anchored
        </span>
      </div>

      {portfolio.length === 0 ? (
        <div className="text-center py-10 text-xs text-charcoal-muted">
          {t.profile?.noPortfolio || "No portfolio photos uploaded yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolio.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group rounded-md overflow-hidden border border-forest/15 bg-card hover:border-forest/35 shadow-sovereign-xs hover:shadow-sovereign-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-48 w-full bg-forest-900 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2.5 left-2.5 bg-forest-950 text-sand px-2.5 py-0.5 rounded text-[10px] font-mono border border-sand/30">
                  {item.category || "Craft Project"}
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-forest line-clamp-1 group-hover:text-forest-600 transition-colors">
                    {item.title}
                  </h4>

                  {item.projectDate && (
                    <div className="flex items-center gap-1.5 text-[11px] text-charcoal-muted font-mono mt-1">
                      <Calendar className="w-3.5 h-3.5 text-forest/60" />
                      {item.projectDate}
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs text-charcoal-muted line-clamp-2 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-forest/10 flex items-center justify-between text-[11px] text-forest font-semibold">
                  <span>View Evidence</span>
                  <ExternalLink className="w-3 h-3 text-forest/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
