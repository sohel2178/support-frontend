"use client";

import { useState } from "react";

import { motion } from "motion/react";
import { toast } from "sonner";
import { KeyRound, UserCircle } from "lucide-react";

import API, { getErrorMessage } from "@/lib/axios";
import { FALLBACK_ROLE, ROLE_CONFIG, formatDate } from "@/lib/constants";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, User } from "@/types";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  const role = ROLE_CONFIG[user.role] ?? FALLBACK_ROLE;

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account details and password</p>
      </motion.div>

      <Card className="rounded-3xl border-0 shadow-xl p-6 flex flex-wrap items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <UserCircle className="h-8 w-8 text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-semibold">{user.name}</p>
          <p className="text-sm text-slate-500">@{user.username}</p>
        </div>
        <div className="text-right space-y-1">
          <Badge className={`rounded-full border px-3 py-1 ${role.className}`}>{role.label}</Badge>
          <p className="text-xs text-slate-400">Member since {formatDate(user.createdAt)}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailsForm key={user.updatedAt} user={user} />
        <PasswordForm />
      </div>
    </div>
  );
}

function DetailsForm({ user }: { user: User }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [loading, setLoading] = useState(false);

  const dirty = name.trim() !== user.name || phone.trim() !== user.phone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }

    try {
      setLoading(true);
      const res = await API.patch<ApiResponse<User>>("/users/me", { name: name.trim(), phone: phone.trim() });
      setUser(res.data.data);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl border-0 shadow-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-slate-500" />
          <h2 className="text-xl font-semibold">Personal details</h2>
        </div>
        <Field label="Full name" htmlFor="p-name" required>
          <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Phone" htmlFor="p-phone" required>
          <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Username">
          <Input value={user.username} disabled />
        </Field>
        <Button type="submit" className="w-full h-10 rounded-2xl" disabled={loading || !dirty}>
          {loading ? "Saving..." : "Save details"}
        </Button>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found: Record<string, string> = {};
    if (!current) found.current = "Enter your current password";
    if (next.length < 6) found.next = "At least 6 characters";
    else if (next === current) found.next = "Must differ from the current password";
    if (confirm !== next) found.confirm = "Passwords do not match";
    setErrors(found);
    if (Object.keys(found).length) return;

    try {
      setLoading(true);
      await API.patch("/users/me/password", { current_password: current, new_password: next });
      toast.success("Password changed");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to change password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl border-0 shadow-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-slate-500" />
          <h2 className="text-xl font-semibold">Change password</h2>
        </div>
        <Field label="Current password" htmlFor="p-current" required error={errors.current}>
          <Input id="p-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <Field label="New password" htmlFor="p-new" required error={errors.next}>
          <Input id="p-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field label="Confirm new password" htmlFor="p-confirm" required error={errors.confirm}>
          <Input id="p-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <Button type="submit" className="w-full h-10 rounded-2xl" disabled={loading}>
          {loading ? "Updating..." : "Change password"}
        </Button>
      </form>
    </Card>
  );
}
