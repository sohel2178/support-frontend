"use client";

import { useState } from "react";

import { motion } from "motion/react";
import { AlertCircle, Loader2 } from "lucide-react";

import API, { getErrorMessage } from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, User } from "@/types";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // On success AuthProvider redirects to the role's landing page.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("Enter your username and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post<ApiResponse<{ user: User; token: string }>>("/auth/login", {
        username: username.trim(),
        password,
      });

      setAuth(res.data.data.user, res.data.data.token);
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-100">
        <Card className="p-6 rounded-3xl shadow-2xl border-0">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-bold">GPS Support</h1>
              <p className="text-sm text-slate-500">Sign in to your account</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Field label="Username" htmlFor="username">
              <Input
                id="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
