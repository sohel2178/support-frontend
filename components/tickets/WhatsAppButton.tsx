"use client";

import { MessageCircle } from "lucide-react";

import { whatsappLink } from "@/lib/whatsapp";
import type { Ticket } from "@/types";

import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

/** Opens WhatsApp Web with a "ticket solved" message for the customer. */
export default function WhatsAppButton({
  ticket,
  variant = "button",
}: {
  ticket: Ticket;
  variant?: "button" | "menu";
}) {
  const href = whatsappLink(ticket);
  const label = "Notify on WhatsApp";

  if (variant === "menu") {
    return href ? (
      <DropdownMenuItem asChild>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          {label}
        </a>
      </DropdownMenuItem>
    ) : (
      <DropdownMenuItem disabled title="Invalid customer phone">
        <MessageCircle className="h-4 w-4" />
        {label}
      </DropdownMenuItem>
    );
  }

  if (!href) {
    return (
      <Button disabled title="Invalid customer phone" className="rounded-xl">
        <MessageCircle className="h-4 w-4" />
        {label}
      </Button>
    );
  }

  return (
    <Button asChild className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" />
        {label}
      </a>
    </Button>
  );
}
