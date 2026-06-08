"use client";

import { motion, useDragControls, useMotionValue, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

export function BottomSheet({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 120], [1, 0.6]);

  return (
    <motion.div
      ref={sheetRef}
      style={{ y, opacity }}
      drag="y"
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.05, bottom: 0.4 }}
      className="fixed bottom-[72px] left-0 right-0 z-40 mx-auto max-w-lg"
    >
      <div className="mx-3 overflow-hidden rounded-t-3xl border border-b-0 border-[var(--border-soft)] bg-[var(--bg-panel)]/95 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div
          className="flex cursor-grab flex-col items-center py-3 active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="h-1 w-10 rounded-full bg-[var(--bg-elevated)]" />
          {title && (
            <p className="mt-2 font-heading text-sm font-semibold text-[var(--text-main)]">
              {title}
            </p>
          )}
        </div>
        <div className="max-h-[38vh] overflow-y-auto px-4 pb-4 scrollbar-thin">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
