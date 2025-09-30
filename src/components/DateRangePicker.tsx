import { useState } from 'react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FilterState } from '../types';

interface DateRangePickerProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const presets = [
  {
    label: '오늘',
    getValue: () => {
      const today = new Date();
      return {
        start: format(today, 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd')
      };
    }
  },
  {
    label: '지난 7일',
    getValue: () => {
      const end = new Date();
      const start = subDays(end, 6);
      return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd')
      };
    }
  },
  {
    label: '지난 14일',
    getValue: () => {
      const end = new Date();
      const start = subDays(end, 13);
      return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd')
      };
    }
  },
  {
    label: '지난 30일',
    getValue: () => {
      const end = new Date();
      const start = subDays(end, 29);
      return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd')
      };
    }
  },
  {
    label: '이번 달',
    getValue: () => {
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd')
      };
    }
  },
  {
    label: '지난 3개월',
    getValue: () => {
      const end = new Date();
      const start = subMonths(end, 3);
      return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd')
      };
    }
  }
];

export function DateRangePicker({ filters, onFiltersChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [tempStart, setTempStart] = useState<Date | undefined>();
  const [tempEnd, setTempEnd] = useState<Date | undefined>();

  const handlePresetSelect = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    onFiltersChange({
      ...filters,
      dateRange: range
    });
    setIsOpen(false);
    setCustomMode(false);
  };

  const handleCustomDateSelect = () => {
    if (tempStart && tempEnd) {
      onFiltersChange({
        ...filters,
        dateRange: {
          start: format(tempStart, 'yyyy-MM-dd'),
          end: format(tempEnd, 'yyyy-MM-dd')
        }
      });
      setIsOpen(false);
      setCustomMode(false);
      setTempStart(undefined);
      setTempEnd(undefined);
    }
  };

  const getCurrentLabel = () => {
    const { start, end } = filters.dateRange;
    if (!start || !end) return '기간 선택';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // 프리셋과 일치하는지 확인
    const matchingPreset = presets.find(preset => {
      const presetRange = preset.getValue();
      return presetRange.start === start && presetRange.end === end;
    });
    
    if (matchingPreset) {
      return matchingPreset.label;
    }
    
    // 커스텀 범위 표시
    if (start === end) {
      return format(startDate, 'MM월 dd일', { locale: ko });
    }
    
    return `${format(startDate, 'MM월 dd일', { locale: ko })} - ${format(endDate, 'MM월 dd일', { locale: ko })}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 h-auto min-w-[140px] justify-between"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-sm">{getCurrentLabel()}</span>
          </div>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-white border border-slate-200 shadow-lg" 
        align="end"
      >
        {!customMode ? (
          <div className="p-2">
            <div className="space-y-1">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className="w-full justify-start text-left text-sm font-normal hover:bg-slate-50"
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </Button>
              ))}
              <div className="border-t border-slate-100 pt-1 mt-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left text-sm font-normal hover:bg-slate-50"
                  onClick={() => setCustomMode(true)}
                >
                  사용자 지정
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-slate-900">사용자 지정 기간</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCustomMode(false);
                  setTempStart(undefined);
                  setTempEnd(undefined);
                }}
                className="h-auto p-1 text-slate-500 hover:text-slate-700"
              >
                ← 뒤로
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">시작일</label>
                <Calendar
                  mode="single"
                  selected={tempStart}
                  onSelect={setTempStart}
                  className="rounded-md border border-slate-200"
                />
              </div>
              
              {tempStart && (
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">종료일</label>
                  <Calendar
                    mode="single"
                    selected={tempEnd}
                    onSelect={setTempEnd}
                    disabled={(date) => date < tempStart}
                    className="rounded-md border border-slate-200"
                  />
                </div>
              )}
            </div>
            
            {tempStart && tempEnd && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCustomMode(false);
                    setTempStart(undefined);
                    setTempEnd(undefined);
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleCustomDateSelect}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  적용
                </Button>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}