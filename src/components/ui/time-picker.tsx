"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface TimePickerProps {
  time?: string;
  onTimeChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  time,
  onTimeChange,
  placeholder = "Select time",
  disabled = false,
  className
}: TimePickerProps) {
  const [hour, setHour] = React.useState<string>("");
  const [minute, setMinute] = React.useState<string>("");

  React.useEffect(() => {
    if (time && typeof time === 'string') {
      const [h, m] = time.split(":");
      setHour(h);
      setMinute(m);
    }
  }, [time]);

  const handleTimeChange = (newHour: string, newMinute: string) => {
    if (newHour && newMinute) {
      const formattedTime = `${newHour.padStart(2, "0")}:${newMinute.padStart(2, "0")}`;
      onTimeChange?.(formattedTime);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => (i % 5 === 0 ? i.toString().padStart(2, "0") : null)).filter(Boolean) as string[];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !time && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {time ? time : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 rounded-lg border shadow-md" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium text-center text-muted-foreground">시간 선택</div>
          <div className="flex items-center gap-3">
            <Select
              value={hour}
              onValueChange={(value) => {
                setHour(value);
                if (minute) handleTimeChange(value, minute);
              }}
            >
              <SelectTrigger className="w-24 h-10">
                <SelectValue placeholder="시" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {hours.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}시
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xl font-light text-muted-foreground">:</span>
            <Select
              value={minute}
              onValueChange={(value) => {
                setMinute(value);
                if (hour) handleTimeChange(hour, value);
              }}
            >
              <SelectTrigger className="w-24 h-10">
                <SelectValue placeholder="분" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {minutes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}분
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}