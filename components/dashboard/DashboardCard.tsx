"use client";

import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";

export default function DashboardCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;

  value: string;

  icon?: any;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <Card className="relative overflow-hidden border-0 rounded-3xl shadow-lg bg-white p-4">
        {/* glow effect */}
        <div className="absolute top-0 right-0 h-32 w-32 bg-slate-100 rounded-full blur-3xl opacity-60 -mr-10 -mt-10" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>

            <h1 className="text-4xl font-bold tracking-tight mt-3 text-slate-900">
              {value}
            </h1>
          </div>

          {Icon && (
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner">
              <Icon className="h-7 w-7 text-slate-700" />
            </div>
          )}
        </div>

        {/* bottom line */}
        <div className="mt-6 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: "70%",
            }}
            transition={{
              duration: 1,
            }}
            className="h-full rounded-full bg-black"
          />
        </div>
      </Card>
    </motion.div>
  );
}
