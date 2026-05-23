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

export default function EditUserDialog({
  user,
  onSuccess,
}: {
  user: any;

  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
  });

  const handleUpdate = async () => {
    try {
      setLoading(true);

      await API.patch(`/users/${user._id}`, form);

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
        <Button variant="outline">Edit</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <Input
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          <Button className="w-full" disabled={loading} onClick={handleUpdate}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
