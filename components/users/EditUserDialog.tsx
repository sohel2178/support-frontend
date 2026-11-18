"use client";

import { useState } from "react";

import { Pencil } from "lucide-react";
import { toast } from "sonner";

import API, { getErrorMessage } from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import type { Role, User } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import UserRoleSelect from "@/components/users/UserRoleSelect";

export default function EditUserDialog({ user, onSuccess }: { user: User; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit User</DialogTitle>
          <DialogDescription>@{user.username}</DialogDescription>
        </DialogHeader>

        {open && (
          <EditUserForm
            user={user}
            onDone={() => {
              setOpen(false);
              onSuccess();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditUserForm({ user, onDone }: { user: User; onDone: () => void }) {
  const me = useAuthStore((s) => s.user);
  const isSelf = me?._id === user._id;

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [role, setRole] = useState<Role>(user.role);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found: Record<string, string> = {};
    if (!name.trim()) found.name = "Name is required";
    if (!phone.trim()) found.phone = "Phone is required";
    if (password && password.length < 6) found.password = "At least 6 characters";
    setErrors(found);
    if (Object.keys(found).length) return;

    const body: Record<string, string> = {};
    if (name.trim() !== user.name) body.name = name.trim();
    if (phone.trim() !== user.phone) body.phone = phone.trim();
    if (role !== user.role) body.role = role;
    if (password) body.password = password;

    if (Object.keys(body).length === 0) {
      onDone();
      return;
    }

    try {
      setLoading(true);
      await API.patch(`/users/${user._id}`, body);
      toast.success("User updated");
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update user"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full name" htmlFor="eu-name" required error={errors.name}>
        <Input id="eu-name" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Phone" htmlFor="eu-phone" required error={errors.phone}>
        <Input id="eu-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field label="Role">
        <UserRoleSelect value={role} onChange={setRole} disabled={isSelf} />
        {isSelf && <p className="text-xs text-slate-500">You can&apos;t change your own role.</p>}
      </Field>
      <Field label="New password" htmlFor="eu-password" error={errors.password}>
        <Input
          id="eu-password"
          type="password"
          autoComplete="new-password"
          placeholder="Leave blank to keep current password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Button type="submit" className="w-full h-10 rounded-2xl" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
