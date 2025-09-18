import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Check, X, CalendarIcon, Edit2 } from 'lucide-react';
import { cn } from './ui/utils';

interface EditableCellProps {
  value: any;
  type: 'text' | 'select' | 'date' | 'number' | 'url';
  options?: { value: string; label: string }[];
  onSave: (value: any) => void;
  className?: string;
  placeholder?: string;
  displayFormatter?: (value: any) => React.ReactNode;
}

export function EditableCell({
  value,
  type,
  options = [],
  onSave,
  className,
  placeholder = '-',
  displayFormatter
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    // Validation
    if (type === 'url' && editValue) {
      try {
        new URL(editValue);
      } catch {
        setError('올바른 URL을 입력하세요');
        return;
      }
    }

    if (type === 'number' && editValue && isNaN(Number(editValue))) {
      setError('숫자를 입력하세요');
      return;
    }

    onSave(editValue);
    setIsEditing(false);
    setError('');
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = displayFormatter ? displayFormatter(value) : value;

  if (!isEditing) {
    // Special handling for date type - show as popover trigger directly
    if (type === 'date') {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <div
              className={cn(
                "group relative inline-flex items-center gap-1 rounded transition-colors cursor-pointer",
                "hover:bg-muted/20",
                className
              )}
              style={{ cursor: 'pointer' }}
            >
              <span className={cn(!value && "text-muted-foreground", "text-sm")}>
                {displayValue || placeholder}
              </span>
              <CalendarIcon className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={(date: Date | undefined) => {
                if (date) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const formattedDate = `${year}-${month}-${day}`;
                  onSave(formattedDate);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <div
        className={cn(
          "group relative inline-flex items-center gap-1 rounded transition-colors",
          "hover:bg-muted/20",
          className
        )}
        style={{ cursor: 'pointer' }}
        onClick={() => setIsEditing(true)}
      >
        <span className={cn(!value && "text-muted-foreground", "text-sm")}>
          {displayValue || placeholder}
        </span>
        <Edit2
          className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          style={{ cursor: 'pointer' }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-1">
      {type === 'text' || type === 'url' || type === 'number' ? (
        <>
          <Input
            ref={inputRef}
            type={type === 'number' ? 'number' : 'text'}
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm"
            placeholder={placeholder}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleSave}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </>
      ) : type === 'select' ? (
        <>
          <Select
            value={editValue}
            onValueChange={(val: string) => {
              setEditValue(val);
              onSave(val);
              setIsEditing(false);
            }}
          >
            <SelectTrigger className="h-7 text-sm">
              <SelectValue placeholder="선택..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </>
      ) : type === 'date' ? (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-7 justify-start text-left font-normal text-sm",
                  !editValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {editValue ? editValue : placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={editValue ? new Date(editValue) : undefined}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}`;
                    setEditValue(formattedDate);
                    onSave(formattedDate);
                    setIsEditing(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </>
      ) : null}

      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}