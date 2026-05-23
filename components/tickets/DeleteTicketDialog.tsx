"use client";

import API from "@/lib/axios";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

export default function DeleteTicketDialog({
  ticket,
  onSuccess,
}: {
  ticket: any;

  onSuccess: () => void;
}) {
  const handleDelete = async () => {
    try {
      await API.delete(`/tickets/${ticket._id}`);

      onSuccess();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Ticket?</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
