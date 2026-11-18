"use client";

import { io, type Socket } from "socket.io-client";

import { API_URL } from "@/lib/config";

let socket: Socket | null = null;

/** Lazily creates one authenticated socket per session. */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!socket) {
    socket = io(API_URL, {
      transports: ["websocket"],
      auth: { token },
    });
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
