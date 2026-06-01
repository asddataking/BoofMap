"use client";

import { useState } from "react";
import { ReportForm } from "./ReportForm";
import { ReportSuccess } from "./ReportSuccess";

/** Low-friction dispensary product report with quick boof flags and post-submit success */
export function FastReportForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <ReportSuccess
        variant="product"
        onReportAnother={() => setSubmitted(false)}
      />
    );
  }

  return (
    <ReportForm useQuickFlags onSuccess={() => setSubmitted(true)} />
  );
}
