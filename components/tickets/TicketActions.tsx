"use client";

import { useState } from "react";

import Link from "next/link";

import { Eye, MoreHorizontal, Pencil, RefreshCw, Trash2, UserPlus } from "lucide-react";

import { allowedTransitions, isManager } from "@/lib/constants";
import { useAuthStore } from "@/store/auth.store";
import type { Ticket } from "@/types";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AssignTicketDialog from "@/components/tickets/AssignTicketDialog";
import DeleteTicketDialog from "@/components/tickets/DeleteTicketDialog";
import EditTicketDialog from "@/components/tickets/EditTicketDialog";
import UpdateStatusDialog from "@/components/tickets/UpdateStatusDialog";
import WhatsAppButton from "@/components/tickets/WhatsAppButton";
import { canNotifyOnWhatsApp } from "@/lib/whatsapp";

type Action = "status" | "assign" | "edit" | "delete" | null;

/** Role-aware ticket actions, rendered as a row dropdown ("menu") or a button bar ("buttons"). */
export default function TicketActions({
  ticket,
  onChanged,
  onDeleted,
  variant = "menu",
}: {
  ticket: Ticket;
  onChanged: () => void;
  onDeleted?: () => void;
  variant?: "menu" | "buttons";
}) {
  const user = useAuthStore((s) => s.user);
  const [action, setAction] = useState<Action>(null);

  const manager = isManager(user);
  const canStatus = allowedTransitions(user, ticket).length > 0;
  const canAssign = manager && !["SOLVED", "CLOSED"].includes(ticket.status);
  const canNotify = canNotifyOnWhatsApp(ticket);

  const dialogs = (
    <>
      <UpdateStatusDialog
        ticket={ticket}
        open={action === "status"}
        onOpenChange={(o) => !o && setAction(null)}
        onSuccess={onChanged}
      />
      {manager && (
        <>
          <AssignTicketDialog
            ticket={ticket}
            open={action === "assign"}
            onOpenChange={(o) => !o && setAction(null)}
            onSuccess={onChanged}
          />
          <EditTicketDialog
            ticket={ticket}
            open={action === "edit"}
            onOpenChange={(o) => !o && setAction(null)}
            onSuccess={onChanged}
          />
          <DeleteTicketDialog
            ticket={ticket}
            open={action === "delete"}
            onOpenChange={(o) => !o && setAction(null)}
            onSuccess={onDeleted ?? onChanged}
          />
        </>
      )}
    </>
  );

  if (variant === "buttons") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {canNotify && <WhatsAppButton ticket={ticket} />}
        {canStatus && (
          <Button onClick={() => setAction("status")} className="rounded-xl">
            <RefreshCw className="h-4 w-4" />
            {user?.role === "TECHNICAL" && !ticket.assigned_to ? "Pick Up" : "Update Status"}
          </Button>
        )}
        {canAssign && (
          <Button variant="outline" onClick={() => setAction("assign")} className="rounded-xl">
            <UserPlus className="h-4 w-4" />
            {ticket.assigned_to ? "Reassign" : "Assign"}
          </Button>
        )}
        {manager && (
          <>
            <Button variant="outline" onClick={() => setAction("edit")} className="rounded-xl">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setAction("delete")} className="rounded-xl">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </>
        )}
        {dialogs}
      </div>
    );
  }

  return (
    <>
      {/* modal={false} avoids Radix leaving pointer-events:none on <body> when a dialog opens from the menu */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="ghost" aria-label="Ticket actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/tickets/${ticket._id}`}>
              <Eye className="h-4 w-4" />
              View details
            </Link>
          </DropdownMenuItem>
          {canNotify && <WhatsAppButton ticket={ticket} variant="menu" />}
          {canStatus && (
            <DropdownMenuItem onSelect={() => setAction("status")}>
              <RefreshCw className="h-4 w-4" />
              {user?.role === "TECHNICAL" && !ticket.assigned_to ? "Pick up" : "Update status"}
            </DropdownMenuItem>
          )}
          {canAssign && (
            <DropdownMenuItem onSelect={() => setAction("assign")}>
              <UserPlus className="h-4 w-4" />
              {ticket.assigned_to ? "Reassign" : "Assign"}
            </DropdownMenuItem>
          )}
          {manager && (
            <>
              <DropdownMenuItem onSelect={() => setAction("edit")}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setAction("delete")}>
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogs}
    </>
  );
}
