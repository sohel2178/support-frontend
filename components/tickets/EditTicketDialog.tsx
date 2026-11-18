"use client";

import { useState } from "react";

import { toast } from "sonner";

import API, { getErrorMessage } from "@/lib/axios";
import type { Ticket } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  TicketForm,
  ticketToForm,
  validateTicketForm,
  type TicketFormErrors,
  type TicketFormValues,
} from "@/components/tickets/TicketForm";

interface Props {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditTicketDialog({ ticket, open, onOpenChange, onSuccess }: Props) {
  return (
    <Dialog open={open && !!ticket} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Ticket</DialogTitle>
          <DialogDescription>{ticket?.ticket_no}</DialogDescription>
        </DialogHeader>

        {/* Keyed so the form re-initialises from the latest ticket each time it opens. */}
        {ticket && open && (
          <EditForm
            key={`${ticket._id}-${ticket.updatedAt}`}
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

function EditForm({ ticket, onDone }: { ticket: Ticket; onDone: () => void }) {
  const [form, setForm] = useState<TicketFormValues>(() => ticketToForm(ticket));
  const [errors, setErrors] = useState<TicketFormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found = validateTicketForm(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    // Only send changed fields.
    const original = ticketToForm(ticket);
    const changes = Object.fromEntries(
      Object.entries(form).filter(([k, v]) => original[k as keyof TicketFormValues] !== v),
    );

    if (Object.keys(changes).length === 0) {
      onDone();
      return;
    }

    try {
      setLoading(true);
      await API.patch(`/tickets/${ticket._id}`, changes);
      toast.success("Ticket updated");
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update ticket"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TicketForm
        values={form}
        errors={errors}
        onChange={(key, value) => setForm((f) => ({ ...f, [key]: value }))}
      />

      <Button type="submit" className="w-full h-11 rounded-2xl" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
