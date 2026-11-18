"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

/** Stat card. `percent` (0–100) fills the bottom bar; omit it for an empty track. */
export default function DashboardCard({
  title,
  value,
  icon: Icon,
  percent,
  hint,
}: {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  percent?: number;
  hint?: string;
}) {
  const width = percent === undefined ? 0 : Math.max(0, Math.min(100, percent));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="relative h-full flex flex-col overflow-hidden border-0 rounded-3xl shadow-lg bg-white p-4">
        <div className="absolute top-0 right-0 h-32 w-32 bg-slate-100 rounded-full blur-3xl opacity-60 -mr-10 -mt-10" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h1 className="text-4xl font-bold tracking-tight mt-3 text-slate-900">
              {value}
            </h1>
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
          </div>

          {Icon && (
            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner">
              <Icon className="h-7 w-7 text-slate-700" />
            </div>
          )}
        </div>

        {/* Track always rendered so cards line up; filled only when a percent is given. */}
        <div className="mt-auto pt-6">
          <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
            {percent !== undefined && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-black"
              />
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
