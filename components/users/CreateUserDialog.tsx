"use client";

import { useState } from "react";

import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import API, { getErrorMessage } from "@/lib/axios";
import type { Role } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import UserRoleSelect from "@/components/users/UserRoleSelect";

const empty = { name: "", phone: "", username: "", password: "", role: "CUSTOMER_CARE" as Role };
type Form = typeof empty;
type Errors = Partial<Record<keyof Form, string>>;

function validate(f: Form): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Name is required";
  if (!f.phone.trim()) e.phone = "Phone is required";
  if (f.username.trim().length < 3) e.username = "At least 3 characters";
  else if (!/^[a-zA-Z0-9_.-]+$/.test(f.username.trim())) e.username = "Letters, numbers, _ . - only";
  if (f.password.length < 6) e.password = "At least 6 characters";
  return e;
}

export default function CreateUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setForm(empty);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    try {
      setLoading(true);
      await API.post("/users", { ...form, username: form.username.trim() });
      toast.success(`User ${form.username.trim()} created`);
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create user"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-11 px-6 rounded-2xl shadow-md">
          <UserPlus className="h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name" htmlFor="cu-name" required error={errors.name}>
            <Input id="cu-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Phone" htmlFor="cu-phone" required error={errors.phone}>
            <Input id="cu-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Username" htmlFor="cu-username" required error={errors.username}>
            <Input id="cu-username" autoComplete="off" value={form.username} onChange={(e) => set("username", e.target.value)} />
          </Field>
          <Field label="Password" htmlFor="cu-password" required error={errors.password}>
            <Input id="cu-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => set("password", e.target.value)} />
          </Field>
          <Field label="Role" required>
            <UserRoleSelect value={form.role} onChange={(r) => set("role", r)} />
          </Field>

          <Button type="submit" className="w-full h-10 rounded-2xl" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
