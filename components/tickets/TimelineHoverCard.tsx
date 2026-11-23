"use client";

import Link from "next/link";

import { useFetch } from "@/hooks/useFetch";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, Ticket, TimelineEntry } from "@/types";

import { StatusBadge } from "@/components/tickets/TicketBadges";
import TimelineList from "@/components/tickets/TimelineList";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

/** Status badge that shows the ticket's recent timeline on hover. */
export default function TimelineHoverCard({ ticket }: { ticket: Ticket }) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label={`Show timeline for ${ticket.ticket_no}`}
          className="cursor-help rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <StatusBadge status={ticket.status} className="underline decoration-dotted underline-offset-2" />
        </button>
      </HoverCardTrigger>

      <HoverCardContent side="left" align="start" className="w-95 rounded-2xl border shadow-2xl p-0">
        {/* Mounted only while open, so the timeline is fetched on demand. */}
        <TimelinePreview ticket={ticket} />
      </HoverCardContent>
    </HoverCard>
  );
}

function TimelinePreview({ ticket }: { ticket: Ticket }) {
  const user = useAuthStore((s) => s.user);
  const { data, loading, error } = useFetch<ApiResponse<TimelineEntry[]>>(
    `/tickets/${ticket._id}/timeline`,
  );
  const entries = data?.data ?? [];

  return (
    <div>
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-semibold">{ticket.ticket_no}</p>
          <p className="text-xs text-slate-500 truncate">
            {ticket.assigned_to ? `Assigned to ${ticket.assigned_to.name}` : "Unassigned"}
          </p>
        </div>
        <StatusBadge status={ticket.status} className="px-2 py-0.5 text-xs shrink-0" />
      </div>

      <div className="max-h-80 overflow-y-auto px-4 py-3">
        {loading && !data ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <TimelineList entries={entries} currentUserId={user?._id} compact />
        )}
      </div>

      <div className="border-t px-4 py-2 text-right">
        <Link
          href={`/dashboard/tickets/${ticket._id}`}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Open ticket →
        </Link>
      </div>
    </div>
  );
}
