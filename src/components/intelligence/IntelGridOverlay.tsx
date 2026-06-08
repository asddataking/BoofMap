export function IntelGridOverlay({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="intel-grid absolute inset-0 opacity-[0.04]" />
      <div className="intel-scanline absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#39FF88]/40 to-transparent" />
    </div>
  );
}

export function RadarPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <span className="absolute inset-0 rounded-full border border-[#39FF88]/20 animate-[radar-ping_3s_ease-out_infinite]" />
      <span className="absolute inset-[15%] rounded-full border border-[#39FF88]/15 animate-[radar-ping_3s_ease-out_infinite_0.5s]" />
      <span className="absolute inset-[30%] rounded-full border border-[#39FF88]/10 animate-[radar-ping_3s_ease-out_infinite_1s]" />
    </div>
  );
}
