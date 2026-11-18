"use client";

import { useState } from "react";

import { toast } from "sonner";

import API, { getErrorMessage } from "@/lib/axios";
import { STATUS_CONFIG, allowedTransitions } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, Ticket, TicketStatus } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/tickets/TicketBadges";

interface Props {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function UpdateStatusDialog({ ticket, open, onOpenChange, onSuccess }: Props) {
  return (
    <Dialog open={open && !!ticket} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Update Status</DialogTitle>
          <DialogDescription>{ticket?.ticket_no}</DialogDescription>
        </DialogHeader>

        {ticket && open && (
          <StatusForm
            key={`${ticket._id}-${ticket.status}`}
            ticket={ticket}
            onDone={() => {
              onOpenChange(false);
              onSuccess();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatusForm({ ticket, onDone }: { ticket: Ticket; onDone: () => void }) {
  const user = useAuthStore((s) => s.user);
  const options = allowedTransitions(user, ticket);

  const [status, setStatus] = useState<TicketStatus | "">(options[0] ?? "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const pickUp = user?.role === "TECHNICAL" && !ticket.assigned_to;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    try {
      setLoading(true);
      const res = await API.patch<ApiResponse<Ticket>>(`/tickets/${ticket._id}/status`, { status });

      if (note.trim()) {
        try {
          await API.post(`/tickets/${ticket._id}/comment`, { message: note.trim() });
        } catch (err) {
          toast.error(`Status updated, but the note failed: ${getErrorMessage(err)}`);
        }
      }

      const link = status === "SOLVED" ? whatsappLink(res.data.data ?? ticket) : null;

      if (link) {
        toast.success(`Status changed to ${STATUS_CONFIG[status].label}`, {
          description: "Let the customer know their issue is fixed.",
          duration: 15_000,
          action: {
            label: "Notify customer on WhatsApp",
            onClick: () => window.open(link, "_blank", "noopener,noreferrer"),
          },
        });
      } else {
        toast.success(`Status changed to ${STATUS_CONFIG[status].label}`);
      }
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update status"));
    } finally {
      setLoading(false);
    }
  };

  if (options.length === 0) {
    return <p className="text-sm text-slate-600">You can&apos;t change the status of this ticket.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        Current: <StatusBadge status={ticket.status} />
      </div>

      <Field label="New status" required>
        <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {options.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {pickUp && (
        <p className="text-xs text-slate-500">This ticket is unassigned — it will be assigned to you.</p>
      )}

      <Field label="Note (optional)" htmlFor="status-note">
        <Textarea
          id="status-note"
          placeholder="What was done? Added to the ticket timeline."
          value={note}
          maxLength={2000}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>

      <Button type="submit" className="w-full h-10 rounded-2xl" disabled={loading || !status}>
        {loading ? "Updating..." : "Update Status"}
      </Button>
    </form>
  );
}
