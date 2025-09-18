"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
import { CheckIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{
        width: '16px',
        height: '16px',
        border: '2px solid #9CA3AF',
        backgroundColor: props.checked ? '#3B82F6' : '#FFFFFF',
        borderColor: props.checked ? '#3B82F6' : '#9CA3AF',
        borderRadius: '4px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        cursor: props.disabled ? 'not-allowed' : 'pointer'
      }}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
        style={{
          color: '#FFFFFF'
        }}
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
