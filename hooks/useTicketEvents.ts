"use client";

import { useEffect, useRef } from "react";

import { getSocket } from "@/lib/socket";

export type TicketEvent = "ticket:new" | "ticket:updated" | "ticket:assigned" | "ticket:deleted";

const EVENTS: TicketEvent[] = ["ticket:new", "ticket:updated", "ticket:assigned", "ticket:deleted"];

/** Subscribes to realtime ticket events; the latest handler is always used. */
export function useTicketEvents(handler: (event: TicketEvent, payload: unknown) => void) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const listeners = EVENTS.map((event) => {
      const listener = (payload: unknown) => handlerRef.current(event, payload);
      socket.on(event, listener);
      return [event, listener] as const;
    });

    return () => {
      listeners.forEach(([event, listener]) => socket.off(event, listener));
    };
  }, []);
}
