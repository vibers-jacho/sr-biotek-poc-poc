import React from 'react';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from './ui/utils';

interface WorkflowStep {
  id: string;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  variant?: 'compact' | 'expanded';
}

export function WorkflowProgress({ steps, variant = 'compact' }: WorkflowProgressProps) {
  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-0.5">
        <TooltipProvider>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "p-0 rounded-full transition-all",
                      step.value
                        ? "text-green-500 hover:text-green-600"
                        : "text-gray-300 hover:text-gray-400"
                    )}
                    onClick={() => !step.disabled && step.onChange(!step.value)}
                    disabled={step.disabled}
                  >
                    {step.value ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-3.5 w-3.5" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <div className="font-medium">{step.label}</div>
                    {step.description && (
                      <div className="text-muted-foreground">{step.description}</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
              {index < steps.length - 1 && (
                <svg className="w-3 h-3 text-gray-300" viewBox="0 0 12 12">
                  <path d="M3 6 L9 6" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <path d="M7 3 L9 6 L7 9" stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
              )}
            </React.Fragment>
          ))}
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isCompleted = step.value;
        const isPending = !isCompleted && steps.slice(0, index).every(s => s.value);

        return (
          <div
            key={step.id}
            className={cn(
              "flex items-start gap-3 p-2 rounded-lg transition-colors",
              isCompleted && "bg-green-50",
              isPending && "bg-blue-50",
              !isCompleted && !isPending && "bg-muted/30"
            )}
          >
            <div className="flex items-center mt-0.5">
              <Switch
                checked={step.value}
                onCheckedChange={step.onChange}
                disabled={step.disabled}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  isCompleted && "text-green-700",
                  isPending && "text-blue-700"
                )}>
                  {step.label}
                </span>
                {isCompleted && (
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                    완료
                  </Badge>
                )}
                {isPending && (
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                    진행 중
                  </Badge>
                )}
              </div>
              {step.description && (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
            <div className="flex items-center">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : isPending ? (
                <AlertCircle className="h-5 w-5 text-blue-600 animate-pulse" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Specialized component for the common workflow
export function CampaignWorkflow({
  hasReply,
  isRejected,
  googleFormSent,
  googleFormReply,
  onUpdate
}: {
  hasReply: boolean;
  isRejected: boolean;
  googleFormSent: boolean;
  googleFormReply: boolean;
  onUpdate: (field: string, value: boolean) => void;
}) {
  if (isRejected) {
    return (
      <Badge variant="destructive" className="text-xs">
        거절됨
      </Badge>
    );
  }

  const steps: WorkflowStep[] = [
    {
      id: 'hasReply',
      label: '회신',
      description: '인플루언서 회신 수신',
      value: hasReply,
      onChange: (val) => onUpdate('hasReply', val),
      disabled: false
    },
    {
      id: 'googleFormSent',
      label: '구글폼 전송',
      description: '구글폼 전송 완료',
      value: googleFormSent,
      onChange: (val) => onUpdate('googleFormSent', val),
      disabled: !hasReply
    },
    {
      id: 'googleFormReply',
      label: '구글폼 회신',
      description: '구글폼 응답 수신',
      value: googleFormReply,
      onChange: (val) => onUpdate('googleFormReply', val),
      disabled: !googleFormSent
    }
  ];

  return <WorkflowProgress steps={steps} variant="compact" />;
}