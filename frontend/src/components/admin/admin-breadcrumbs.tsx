"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type AdminBreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
  const router = useRouter();

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-amber-300/80 hover:text-amber-200 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-white font-medium" : "text-white/70"}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="w-4 h-4 text-white/35" />}
            </div>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={() => router.forward()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 transition-colors"
        >
          Forward
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
