import type { Ticket } from "@/types";

/**
 * Converts a customer phone to WhatsApp's international format (digits only).
 * Local Bangladeshi numbers (01XXXXXXXXX) get the 880 country code.
 */
export function normalizePhone(raw: string | undefined | null): string | null {
  let digits = (raw ?? "").replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("01")) digits = `880${digits.slice(1)}`;

  return digits.length >= 10 ? digits : null;
}

export function solvedMessage(
  ticket: Pick<Ticket, "customer_name" | "ticket_no" | "problem_type" | "device_id">,
) {
  return [
    `Dear ${ticket.customer_name?.trim() || "Customer"},`,
    `Your support ticket ${ticket.ticket_no} (${ticket.problem_type}) for device ${ticket.device_id} has been solved.`,
    "If you still face any issue, please reply to this message.",
    "— Sultan Support",
  ].join("\n");
}

/** WhatsApp Web link with the solved message pre-filled, or null if the phone is invalid. */
export function whatsappLink(
  ticket: Pick<Ticket, "customer_phone" | "customer_name" | "ticket_no" | "problem_type" | "device_id">,
): string | null {
  const phone = normalizePhone(ticket.customer_phone);
  if (!phone) return null;

  return `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(solvedMessage(ticket))}`;
}

export const canNotifyOnWhatsApp = (ticket: Pick<Ticket, "status">) =>
  ticket.status === "SOLVED" || ticket.status === "CLOSED";
