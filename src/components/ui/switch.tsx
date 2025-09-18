"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch@1.1.3";

import { cn } from "./utils";

function Switch({
  className,
  style,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (props.checked !== undefined) {
      setChecked(props.checked);
    }
  }, [props.checked]);

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={style || {
        backgroundColor: checked ? 'var(--primary)' : '#e5e7eb',
        borderColor: checked ? 'var(--primary)' : '#d1d5db',
      }}
      {...props}
      onCheckedChange={(newChecked) => {
        setChecked(newChecked);
        props.onCheckedChange?.(newChecked);
      }}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform"
        style={{
          transform: checked ? 'translateX(20px)' : 'translateX(2px)',
        }}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
