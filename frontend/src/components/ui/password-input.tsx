"use client";

import { useState, type ChangeEventHandler } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function PasswordInput({
  id = "password",
  value,
  onChange,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  required,
  disabled,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground ring-offset-background focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted-foreground dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
