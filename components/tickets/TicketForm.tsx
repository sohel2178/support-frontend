"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLATFORMS, PLATFORM_CONFIG, PRIORITIES, PRIORITY_CONFIG } from "@/lib/constants";
import type { Platform, Priority, Ticket } from "@/types";

export interface TicketFormValues {
  customer_name: string;
  vehicle_reg: string;
  customer_phone: string;
  device_id: string;
  problem_type: string;
  problem_description: string;
  platform: Platform;
  priority: Priority;
}

export type TicketFormErrors = Partial<Record<keyof TicketFormValues, string>>;

export const emptyTicketForm: TicketFormValues = {
  customer_name: "",
  vehicle_reg: "",
  customer_phone: "",
  device_id: "",
  problem_type: "",
  problem_description: "",
  platform: "TIKTIKI",
  priority: "MEDIUM",
};

export const ticketToForm = (t: Ticket): TicketFormValues => ({
  customer_name: t.customer_name ?? "",
  vehicle_reg: t.vehicle_reg ?? "",
  customer_phone: t.customer_phone ?? "",
  device_id: t.device_id ?? "",
  problem_type: t.problem_type ?? "",
  problem_description: t.problem_description ?? "",
  platform: t.platform,
  priority: t.priority,
});

export function validateTicketForm(v: TicketFormValues): TicketFormErrors {
  const errors: TicketFormErrors = {};
  if (!v.device_id.trim()) errors.device_id = "Device ID is required";
  if (!v.customer_phone.trim()) errors.customer_phone = "Customer phone is required";
  else if (!/^[+\d\s-]{6,20}$/.test(v.customer_phone.trim()))
    errors.customer_phone = "Enter a valid phone number";
  if (!v.problem_type.trim()) errors.problem_type = "Problem type is required";
  if (!v.problem_description.trim()) errors.problem_description = "Description is required";
  return errors;
}

export function TicketForm({
  values,
  errors,
  onChange,
}: {
  values: TicketFormValues;
  errors: TicketFormErrors;
  onChange: <K extends keyof TicketFormValues>(key: K, value: TicketFormValues[K]) => void;
}) {
  const text = (key: keyof TicketFormValues, label: string, required = false, placeholder?: string) => (
    <Field label={label} htmlFor={`tf-${key}`} required={required} error={errors[key]}>
      <Input
        id={`tf-${key}`}
        placeholder={placeholder}
        value={values[key]}
        aria-invalid={!!errors[key]}
        onChange={(e) => onChange(key, e.target.value)}
      />
    </Field>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {text("device_id", "Device ID", true, "IMEI / device number")}
      {text("customer_phone", "Customer Phone", true, "01XXXXXXXXX")}
      {text("customer_name", "Customer Name")}
      {text("vehicle_reg", "Vehicle Registration", false, "e.g. DHAKA METRO-GA 11-1234")}
      {text("problem_type", "Problem Type", true, "e.g. Device offline")}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Platform" required>
          <Select value={values.platform} onValueChange={(v) => onChange("platform", v as Platform)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PLATFORM_CONFIG[p].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Priority">
          <Select value={values.priority} onValueChange={(v) => onChange("priority", v as Priority)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_CONFIG[p].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label="Problem Description"
        htmlFor="tf-problem_description"
        required
        error={errors.problem_description}
        className="md:col-span-2"
      >
        <Textarea
          id="tf-problem_description"
          className="min-h-35"
          value={values.problem_description}
          aria-invalid={!!errors.problem_description}
          onChange={(e) => onChange("problem_description", e.target.value)}
        />
      </Field>
    </div>
  );
}
