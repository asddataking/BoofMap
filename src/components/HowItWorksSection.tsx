"use client";

import { motion } from "framer-motion";
import { Flame, MapPin, Pencil, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Browse Reports",
    description: "See community signals on the live map",
    color: "text-emerald-400 bg-emerald-500/15",
  },
  {
    icon: Pencil,
    title: "Submit Quality Reports",
    description: "Flag boof, taxed product, or fire finds",
    color: "text-orange-400 bg-orange-500/15",
  },
  {
    icon: ShieldCheck,
    title: "Community Verifies",
    description: "Crowd-confirm reports for trusted intel",
    color: "text-red-400 bg-red-500/15",
  },
  {
    icon: Flame,
    title: "Find Fire",
    description: "Buy smarter with real buyer data",
    color: "text-emerald-400 bg-emerald-500/15",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24" aria-label="How it works">
      <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
        How BoofMap Works
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500">
        Cannabis intelligence powered by the community — transparency,
        accountability, and real user reports for legal markets.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative text-center"
          >
            {i < steps.length - 1 && (
              <div
                className="absolute left-[calc(50%+2rem)] top-8 hidden h-px w-[calc(100%-4rem)] border-t border-dashed border-zinc-700 lg:block"
                aria-hidden
              />
            )}
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${step.color}`}
            >
              <step.icon className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 font-heading text-base font-semibold text-white">
              {step.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
