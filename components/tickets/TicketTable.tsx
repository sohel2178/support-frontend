"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TicketTable({ tickets }: { tickets: any[] }) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>

            <TableHead>Device</TableHead>

            <TableHead>Platform</TableHead>

            <TableHead>Problem</TableHead>

            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket._id}>
              <TableCell>{ticket.ticket_no}</TableCell>

              <TableCell>{ticket.device_id}</TableCell>

              <TableCell>{ticket.platform}</TableCell>

              <TableCell>{ticket.problem_type}</TableCell>

              <TableCell>{ticket.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
