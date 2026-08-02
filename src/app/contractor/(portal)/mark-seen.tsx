"use client";

import { useEffect } from "react";
import { markJobsSeen } from "@/app/actions/contractor-portal";

/** Fires once on mount so the "N new" nav badge clears after a real visit
 * to the Jobs page (not just any portal page). Renders nothing. */
export function MarkSeenOnMount() {
  useEffect(() => {
    markJobsSeen();
  }, []);
  return null;
}
