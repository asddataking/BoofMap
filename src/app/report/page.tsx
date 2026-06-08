"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { FastReportForm } from "@/components/FastReportForm";
import { MeetupReportForm } from "@/components/MeetupReportForm";
import { ReportSuccess } from "@/components/ReportSuccess";
import { cn } from "@/lib/utils";
import { AlertTriangle, Store } from "lucide-react";

type ReportLane = "picker" | "product" | "meetup";

const LANES = [
  {
    id: "product" as const,
    title: "Dispensary Product",
    description:
      "Licensed dispo flower, carts, concentrates — batch quality, burn, freshness.",
    icon: Store,
    accent: "emerald",
  },
  {
    id: "meetup" as const,
    title: "Bad Meetup / Sale Warning",
    description:
      "Community safety warnings — no-shows, scams, unsafe vibes. Not a marketplace.",
    icon: AlertTriangle,
    accent: "purple",
  },
];

export default function ReportPage() {
  const [lane, setLane] = useState<ReportLane>("picker");
  const [meetupSubmitted, setMeetupSubmitted] = useState(false);

  const resetMeetup = () => {
    setMeetupSubmitted(false);
    setLane("picker");
  };

  return (
    <AppShell>
      <PageTransition>
        <div className="py-4">
          <h2 className="font-heading text-2xl font-bold text-white">
            {lane === "picker" ? "Report Boof" : "New Report"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {lane === "picker"
              ? "Find fire. Expose boof. Contribute intelligence."
              : "Sign in to submit — keeps reports accountable"}
          </p>

          {lane === "picker" && (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-zinc-300">
                What are you reporting?
              </p>
              {LANES.map(({ id, title, description, icon: Icon, accent }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLane(id)}
                  className={cn(
                    "glass-card flex w-full items-start gap-4 p-4 text-left transition hover:border-zinc-600",
                    accent === "emerald"
                      ? "hover:border-emerald-500/30"
                      : "hover:border-purple-500/30"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      accent === "emerald"
                        ? "bg-emerald-500/15"
                        : "bg-purple-500/15"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        accent === "emerald"
                          ? "text-emerald-400"
                          : "text-purple-400"
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-white">
                      {title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {lane !== "picker" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setLane("picker");
                  setMeetupSubmitted(false);
                }}
                className="mt-4 text-xs text-zinc-500 hover:text-zinc-300"
              >
                ← Change report type
              </button>

              <div className="mt-4">
                {lane === "product" && <FastReportForm />}
                {lane === "meetup" &&
                  (meetupSubmitted ? (
                    <ReportSuccess
                      variant="meetup"
                      onReportAnother={resetMeetup}
                    />
                  ) : (
                    <MeetupReportForm
                      onSuccess={() => setMeetupSubmitted(true)}
                    />
                  ))}
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
