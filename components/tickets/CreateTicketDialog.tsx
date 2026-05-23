"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

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

export default function CreateTicketDialog({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",

    vehicle_reg: "",

    customer_phone: "",

    device_id: "",

    problem_type: "",

    problem_description: "",

    platform: "TIKTIKI",

    priority: "MEDIUM",
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await API.post("/tickets", form);

      setOpen(false);

      setForm({
        customer_name: "",

        vehicle_reg: "",

        customer_phone: "",

        device_id: "",

        problem_type: "",

        problem_description: "",

        platform: "TIKTIKI",

        priority: "MEDIUM",
      });

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
        <Button className="h-11 px-6 rounded-2xl shadow-md text-base font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Ticket</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Customer Name"
            value={form.customer_name}
            onChange={(e) =>
              setForm({
                ...form,
                customer_name: e.target.value,
              })
            }
          />

          <Input
            placeholder="Vehicle Registration"
            value={form.vehicle_reg}
            onChange={(e) =>
              setForm({
                ...form,
                vehicle_reg: e.target.value,
              })
            }
          />

          <Input
            placeholder="Customer Phone *"
            value={form.customer_phone}
            onChange={(e) =>
              setForm({
                ...form,
                customer_phone: e.target.value,
              })
            }
          />

          <Input
            placeholder="Device ID *"
            value={form.device_id}
            onChange={(e) =>
              setForm({
                ...form,
                device_id: e.target.value,
              })
            }
          />

          <Input
            placeholder="Problem Type *"
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
              <SelectValue placeholder="Platform" />
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
              <SelectValue placeholder="Priority" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="LOW">LOW</SelectItem>

              <SelectItem value="MEDIUM">MEDIUM</SelectItem>

              <SelectItem value="HIGH">HIGH</SelectItem>

              <SelectItem value="URGENT">URGENT</SelectItem>
            </SelectContent>
          </Select>

          <div className="md:col-span-2">
            <Textarea
              placeholder="Problem Description *"
              className="min-h-[140px]"
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
              onClick={handleSubmit}
            >
              {loading ? "Creating..." : "Create Ticket"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
