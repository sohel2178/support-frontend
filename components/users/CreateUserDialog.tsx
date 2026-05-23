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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

export default function CreateUserDialog({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    username: "",
    password: "",
    role: "CUSTOMER_CARE",
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await API.post("/users", form);

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
        <Button>Create User</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          <Input
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value,
              })
            }
          />

          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <Select
            value={form.role}
            onValueChange={(value) =>
              setForm({
                ...form,
                role: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ADMIN">ADMIN</SelectItem>

              <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>

              <SelectItem value="CUSTOMER_CARE">CUSTOMER CARE</SelectItem>

              <SelectItem value="TECHNICAL">TECHNICAL</SelectItem>
            </SelectContent>
          </Select>

          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
