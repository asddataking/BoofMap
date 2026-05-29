"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export function LandingStatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
  index = 0,
}: {
  label: string;
  value: number | string;
  delta?: string;
  icon: LucideIcon;
  accent: "emerald" | "orange" | "purple" | "red";
  index?: number;
}) {
  const accents = {
    emerald: "bg-emerald-500/15 text-emerald-400",
    orange: "bg-orange-500/15 text-orange-400",
    purple: "bg-purple-500/15 text-purple-400",
    red: "bg-red-500/15 text-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="glass-card flex min-w-[160px] flex-1 flex-col gap-3 p-5 lg:min-w-0"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent]}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div>
        <p className="font-heading text-3xl font-bold tracking-tight text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-sm font-medium text-zinc-400">{label}</p>
        {delta && (
          <p className="mt-1 text-xs font-medium text-emerald-500/80">{delta}</p>
        )}
      </div>
    </motion.div>
  );
}
