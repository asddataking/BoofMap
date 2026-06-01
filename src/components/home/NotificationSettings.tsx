"use client";

import { useState } from "react";
import { Bell, Flame, Leaf, ShieldAlert } from "lucide-react";
import { useAlertPreviewSettings } from "@/hooks/useHomeData";
import { BoofAlertCard } from "./BoofAlertCard";

export function NotificationSettings() {
  const seed = useAlertPreviewSettings();
  const [settings, setSettings] = useState(seed);

  const toggle = (key: keyof typeof settings) => {
    if (key === "city") return;
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const anyEnabled =
    settings.boof_alerts ||
    settings.taxed_alerts ||
    settings.fire_finds ||
    settings.meetup_warnings;

  return (
    <section id="settings" className="scroll-mt-24" aria-label="Notification settings">
      <div className="mb-5">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-500">
          Stay Ahead
        </p>
        <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Boof Alert Settings
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Preview — full push notifications coming soon.
        </p>
      </div>

      <div className="glass-card space-y-4 p-5 sm:p-6">
        <BoofAlertCard enabled={anyEnabled} city={settings.city} />

        <ul className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800/60">
          <ToggleRow
            icon={Leaf}
            label="Boof alerts"
            description="New low-score reports in your area"
            checked={settings.boof_alerts}
            onChange={() => toggle("boof_alerts")}
          />
          <ToggleRow
            icon={ShieldAlert}
            label="Taxed alerts"
            description="Overpriced and fake sale flags"
            checked={settings.taxed_alerts}
            onChange={() => toggle("taxed_alerts")}
          />
          <ToggleRow
            icon={Flame}
            label="Fire finds"
            description="High-score community picks"
            checked={settings.fire_finds}
            onChange={() => toggle("fire_finds")}
          />
          <ToggleRow
            icon={Bell}
            label="Meetup warnings"
            description="Seller flags from meetup reports"
            checked={settings.meetup_warnings}
            onChange={() => toggle("meetup_warnings")}
          />
        </ul>

        <div>
          <label htmlFor="alert-city" className="form-label">
            Watch city
          </label>
          <input
            id="alert-city"
            type="text"
            value={settings.city}
            onChange={(e) =>
              setSettings((s) => ({ ...s, city: e.target.value }))
            }
            className="form-input mt-2"
            placeholder="Detroit, MI"
          />
        </div>

        <button type="button" className="btn-primary w-full py-3.5" disabled>
          Save alert preferences (coming soon)
        </button>
      </div>
    </section>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Bell;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-emerald-500" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </li>
  );
}
