"use client";

import { useState } from "react";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import API, { getErrorMessage } from "@/lib/axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  TicketForm,
  emptyTicketForm,
  validateTicketForm,
  type TicketFormErrors,
  type TicketFormValues,
} from "@/components/tickets/TicketForm";

export default function CreateTicketDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TicketFormValues>(emptyTicketForm);
  const [errors, setErrors] = useState<TicketFormErrors>({});

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setForm(emptyTicketForm);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found = validateTicketForm(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    try {
      setLoading(true);
      const res = await API.post("/tickets", form);
      toast.success(`Ticket ${res.data.data.ticket_no} created`);
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create ticket"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-11 px-6 rounded-2xl shadow-md text-base font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TicketForm
            values={form}
            errors={errors}
            onChange={(key, value) => setForm((f) => ({ ...f, [key]: value }))}
          />

          <Button type="submit" className="w-full h-11 rounded-2xl" disabled={loading}>
            {loading ? "Creating..." : "Create Ticket"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
