"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";

import API, { getErrorMessage } from "@/lib/axios";
import { getSocket } from "@/lib/socket";
import { formatDate } from "@/lib/constants";
import { useFetch } from "@/hooks/useFetch";
import { useTicketEvents } from "@/hooks/useTicketEvents";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, Ticket, TimelineEntry } from "@/types";

import TicketActions from "@/components/tickets/TicketActions";
import TimelineList from "@/components/tickets/TimelineList";
import { PlatformBadge, PriorityBadge, StatusBadge } from "@/components/tickets/TicketBadges";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";


export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const ticketQuery = useFetch<ApiResponse<{ ticket: Ticket }>>(`/tickets/${id}`);
  const timelineQuery = useFetch<ApiResponse<TimelineEntry[]>>(`/tickets/${id}/timeline`);

  const ticket = ticketQuery.data?.data.ticket;
  const timeline = timelineQuery.data?.data ?? [];

  const reloadAll = () => {
    ticketQuery.reload();
    timelineQuery.reload();
  };

  // Realtime: ticket changes + comments for this ticket.
  useTicketEvents((event, payload) => {
    const p = payload as { _id?: string };
    if (p?._id !== id) return;

    if (event === "ticket:deleted") {
      toast.warning("This ticket was deleted");
      router.replace("/dashboard/tickets");
      return;
    }
    reloadAll();
  });

  const reloadTimelineRef = useRef(timelineQuery.reload);
  useEffect(() => {
    reloadTimelineRef.current = timelineQuery.reload;
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const join = () => socket.emit("join_ticket", id);
    const onComment = (p: { ticket_id: string }) => {
      if (p.ticket_id === id) reloadTimelineRef.current();
    };

    join();
    socket.on("connect", join);
    socket.on("ticket:comment", onComment);

    return () => {
      socket.emit("leave_ticket", id);
      socket.off("connect", join);
      socket.off("ticket:comment", onComment);
    };
  }, [id]);

  if (ticketQuery.error && !ticket) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Card className="rounded-3xl border-0 shadow-xl p-10 text-center">
          <h2 className="text-xl font-semibold">Ticket unavailable</h2>
          <p className="text-slate-500 mt-2">{ticketQuery.error}</p>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="h-40 rounded-3xl bg-white animate-pulse" />
        <div className="h-80 rounded-3xl bg-white animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{ticket.ticket_no}</h1>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <PlatformBadge platform={ticket.platform} />
          </div>
          <p className="text-slate-500 mt-2 text-lg">{ticket.problem_type}</p>
        </div>

        <TicketActions
          ticket={ticket}
          variant="buttons"
          onChanged={reloadAll}
          onDeleted={() => router.replace("/dashboard/tickets")}
        />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="rounded-3xl border-0 shadow-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Customer & Device</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Detail label="Customer" value={ticket.customer_name} />
              <Detail label="Phone" value={ticket.customer_phone} />
              <Detail label="Device ID" value={ticket.device_id} />
              <Detail label="Vehicle Reg." value={ticket.vehicle_reg} />
            </dl>
          </Card>

          <Card className="rounded-3xl border-0 shadow-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Handling</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Detail label="Created by" value={ticket.created_by?.name} />
              <Detail label="Created" value={formatDate(ticket.createdAt)} />
              <Detail label="Assigned to" value={ticket.assigned_to?.name ?? "Unassigned"} />
              <Detail label="Last update" value={formatDate(ticket.updatedAt)} />
              {ticket.solved_by && (
                <>
                  <Detail label="Solved by" value={ticket.solved_by.name} />
                  <Detail label="Solved at" value={formatDate(ticket.solved_at)} />
                </>
              )}
            </dl>
          </Card>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <Card className="rounded-3xl border-0 shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-3">Problem Description</h2>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.problem_description}</p>
          </Card>

          <Card className="rounded-3xl border-0 shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-5">Timeline</h2>

            {timelineQuery.loading && !timelineQuery.data ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <TimelineList entries={timeline} currentUserId={user?._id} />
            )}

            <CommentBox ticketId={ticket._id} onPosted={timelineQuery.reload} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function CommentBox({ ticketId, onPosted }: { ticketId: string; onPosted: () => void }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = message.trim();
    if (!text) return;

    try {
      setSending(true);
      await API.post(`/tickets/${ticketId}/comment`, { message: text });
      setMessage("");
      onPosted();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add comment"));
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 border-t pt-5 space-y-3">
      <Textarea
        placeholder="Add a comment… (Ctrl+Enter to send)"
        value={message}
        maxLength={2000}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
        }}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={sending || !message.trim()} className="rounded-xl">
          <Send className="h-4 w-4" />
          {sending ? "Sending..." : "Comment"}
        </Button>
      </div>
    </form>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium wrap-break-word">{value || "—"}</dd>
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/dashboard/tickets" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
      <ArrowLeft className="h-4 w-4" />
      Back to tickets
    </Link>
  );
}
