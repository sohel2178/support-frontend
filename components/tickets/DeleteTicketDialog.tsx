"use client";

import { useState } from "react";

import { toast } from "sonner";

import API, { getErrorMessage } from "@/lib/axios";
import type { Ticket } from "@/types";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Props {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function DeleteTicketDialog({ ticket, open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!ticket) return;
    try {
      setLoading(true);
      await API.delete(`/tickets/${ticket._id}`);
      toast.success(`Ticket ${ticket.ticket_no} deleted`);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete ticket"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open && !!ticket} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete ticket {ticket?.ticket_no}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the ticket and its full timeline. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={loading} onClick={handleDelete}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
