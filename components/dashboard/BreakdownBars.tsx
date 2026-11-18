"use client";

import { motion } from "motion/react";

/** Horizontal labelled bars, e.g. tickets per status. */
export default function BreakdownBars({
  rows,
  total,
}: {
  rows: { key: string; label: string; value: number; bar: string }[];
  total: number;
}) {
  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const pct = total ? Math.round((row.value / total) * 100) : 0;
        return (
          <div key={row.key}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-medium text-slate-700">{row.label}</span>
              <span className="text-slate-500 tabular-nums">
                {row.value} <span className="text-slate-400">· {pct}%</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${row.bar}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
