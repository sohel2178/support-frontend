"use client";

import { useState } from "react";

import { toast } from "sonner";

import API, { getErrorMessage } from "@/lib/axios";
import { useFetch } from "@/hooks/useFetch";
import type { ApiResponse, Ticket, User } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AssignTicketDialog({ ticket, open, onOpenChange, onSuccess }: Props) {
  return (
    <Dialog open={open && !!ticket} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {ticket?.assigned_to ? "Reassign Ticket" : "Assign Ticket"}
          </DialogTitle>
          <DialogDescription>
            {ticket?.ticket_no}
            {ticket?.assigned_to && ` · currently ${ticket.assigned_to.name}`}
          </DialogDescription>
        </DialogHeader>

        {ticket && open && (
          <AssignForm
            key={ticket._id}
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

function AssignForm({ ticket, onDone }: { ticket: Ticket; onDone: () => void }) {
  const { data, loading: loadingTechs, error } = useFetch<ApiResponse<User[]>>("/users/technicians");
  const technicians = data?.data ?? [];

  const [assignee, setAssignee] = useState(ticket.assigned_to?._id ?? "");
  const [loading, setLoading] = useState(false);

  const closed = ticket.status === "SOLVED" || ticket.status === "CLOSED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignee) return;

    try {
      setLoading(true);
      const res = await API.patch<ApiResponse<Ticket>>(`/tickets/${ticket._id}/assign`, {
        assigned_to: assignee,
      });
      toast.success(`Assigned to ${res.data.data.assigned_to?.name ?? "technician"}`);
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to assign ticket"));
    } finally {
      setLoading(false);
    }
  };

  if (closed) {
    return (
      <p className="text-sm text-slate-600">
        This ticket is {ticket.status.toLowerCase()}. Reopen it (set status to In Progress) before reassigning.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Technician" required error={error ?? undefined}>
        <Select value={assignee} onValueChange={setAssignee} disabled={loadingTechs}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loadingTechs ? "Loading technicians..." : "Select a technician"} />
          </SelectTrigger>
          <SelectContent>
            {technicians.map((t) => (
              <SelectItem key={t._id} value={t._id}>
                {t.name} <span className="text-slate-400">@{t.username}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {!loadingTechs && technicians.length === 0 && !error && (
        <p className="text-sm text-slate-500">No active technicians. Create one on the Users page.</p>
      )}

      <p className="text-xs text-slate-500">Assigning moves the ticket to In Progress.</p>

      <Button
        type="submit"
        className="w-full h-10 rounded-2xl"
        disabled={loading || !assignee || assignee === ticket.assigned_to?._id}
      >
        {loading ? "Assigning..." : "Assign"}
      </Button>
    </form>
  );
}
