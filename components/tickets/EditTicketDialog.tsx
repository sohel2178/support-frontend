"use client";

import { useState } from "react";

import API from "@/lib/axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditTicketDialog({
  ticket,
  onSuccess,
}: {
  ticket: any;

  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customer_name: ticket.customer_name || "",

    vehicle_reg: ticket.vehicle_reg || "",

    customer_phone: ticket.customer_phone || "",

    device_id: ticket.device_id || "",

    problem_type: ticket.problem_type || "",

    problem_description: ticket.problem_description || "",

    platform: ticket.platform || "TIKTIKI",

    priority: ticket.priority || "MEDIUM",

    status: ticket.status || "PENDING",
  });

  const handleUpdate = async () => {
    try {
      setLoading(true);

      await API.patch(`/tickets/${ticket._id}`, form);

      setOpen(false);

      onSuccess();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-xl">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Ticket</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Device ID"
            value={form.device_id}
            onChange={(e) =>
              setForm({
                ...form,
                device_id: e.target.value,
              })
            }
          />

          <Input
            placeholder="Customer Phone"
            value={form.customer_phone}
            onChange={(e) =>
              setForm({
                ...form,
                customer_phone: e.target.value,
              })
            }
          />

          <Input
            placeholder="Problem Type"
            value={form.problem_type}
            onChange={(e) =>
              setForm({
                ...form,
                problem_type: e.target.value,
              })
            }
          />

          <Select
            value={form.platform}
            onValueChange={(value) =>
              setForm({
                ...form,
                platform: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="TIKTIKI">TIKTIKI</SelectItem>

              <SelectItem value="RETAIL">RETAIL</SelectItem>

              <SelectItem value="RANGS">RANGS</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={form.priority}
            onValueChange={(value) =>
              setForm({
                ...form,
                priority: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="LOW">LOW</SelectItem>

              <SelectItem value="MEDIUM">MEDIUM</SelectItem>

              <SelectItem value="HIGH">HIGH</SelectItem>

              <SelectItem value="URGENT">URGENT</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={form.status}
            onValueChange={(value) =>
              setForm({
                ...form,
                status: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="PENDING">PENDING</SelectItem>

              <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>

              <SelectItem value="SOLVED">SOLVED</SelectItem>

              <SelectItem value="CLOSED">CLOSED</SelectItem>
            </SelectContent>
          </Select>

          <div className="md:col-span-2">
            <Textarea
              className="min-h-[140px]"
              placeholder="Problem Description"
              value={form.problem_description}
              onChange={(e) =>
                setForm({
                  ...form,
                  problem_description: e.target.value,
                })
              }
            />
          </div>

          <div className="md:col-span-2">
            <Button
              className="w-full h-11 rounded-2xl"
              disabled={loading}
              onClick={handleUpdate}
            >
              {loading ? "Updating..." : "Update Ticket"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
