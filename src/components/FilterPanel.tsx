import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Influencer, FilterState } from '../types';
import { Filter, X, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterPanelProps {
  data: Influencer[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterPanel({ data, filters, onFiltersChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 고유값 추출
  const uniqueStaff = Array.from(new Set(data.map(item => item.staff))).sort();
  const uniqueCountries = Array.from(new Set(data.map(item => item.country))).sort();
  const uniqueFollowerTypes = Array.from(new Set(data.map(item => item.followerType)));
  const uniqueCostTypes = Array.from(new Set(data.map(item => item.costType)));
  const uniqueCampaigns = Array.from(new Set(data.map(item => item.campaign))).sort();

  // 필터 업데이트 헬퍼 함수
  const updateFilter = (filterType: keyof FilterState, value: string | string[]) => {
    if (filterType === 'dateRange') return; // 날짜는 별도 처리
    
    onFiltersChange({
      ...filters,
      [filterType]: Array.isArray(value) ? value : [value]
    });
  };

  // 체크박스 토글
  const toggleFilter = (filterType: keyof FilterState, value: string) => {
    if (filterType === 'dateRange') return;
    
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [filterType]: newValues
    });
  };

  // 필터 초기화
  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: filters.dateRange, // 날짜는 유지
      staff: [],
      countries: [],
      followerTypes: [],
      costTypes: [],
      campaigns: []
    });
  };

  // 활성 필터 개수
  const activeFilterCount = 
    filters.staff.length + 
    filters.countries.length + 
    filters.followerTypes.length + 
    filters.costTypes.length + 
    filters.campaigns.length;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            필터 조건
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFilterCount}개 적용
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4 mr-1" />
                초기화
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-500 hover:text-slate-700"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-6">
            {/* 검색 */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                인플루언서 검색
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="인플루언서명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* 담당 직원 */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">
                  담당 직원
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueStaff.map((staff) => (
                    <div key={staff} className="flex items-center space-x-2">
                      <Checkbox
                        id={`staff-${staff}`}
                        checked={filters.staff.includes(staff)}
                        onCheckedChange={() => toggleFilter('staff', staff)}
                      />
                      <label
                        htmlFor={`staff-${staff}`}
                        className="text-sm text-slate-600 cursor-pointer"
                      >
                        {staff}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 국가 */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">
                  국가
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueCountries.map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country}`}
                        checked={filters.countries.includes(country)}
                        onCheckedChange={() => toggleFilter('countries', country)}
                      />
                      <label
                        htmlFor={`country-${country}`}
                        className="text-sm text-slate-600 cursor-pointer"
                      >
                        {country}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 팔로워 유형 */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">
                  팔로워 유형
                </label>
                <div className="space-y-2">
                  {uniqueFollowerTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`follower-${type}`}
                        checked={filters.followerTypes.includes(type)}
                        onCheckedChange={() => toggleFilter('followerTypes', type)}
                      />
                      <label
                        htmlFor={`follower-${type}`}
                        className="text-sm text-slate-600 cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 비용 구간 */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">
                  비용 구간
                </label>
                <div className="space-y-2">
                  {uniqueCostTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cost-${type}`}
                        checked={filters.costTypes.includes(type)}
                        onCheckedChange={() => toggleFilter('costTypes', type)}
                      />
                      <label
                        htmlFor={`cost-${type}`}
                        className="text-sm text-slate-600 cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 캠페인 */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">
                  캠페인
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueCampaigns.map((campaign) => (
                    <div key={campaign} className="flex items-center space-x-2">
                      <Checkbox
                        id={`campaign-${campaign}`}
                        checked={filters.campaigns.includes(campaign)}
                        onCheckedChange={() => toggleFilter('campaigns', campaign)}
                      />
                      <label
                        htmlFor={`campaign-${campaign}`}
                        className="text-sm text-slate-600 cursor-pointer text-xs"
                        title={campaign}
                      >
                        {campaign.length > 15 ? `${campaign.substring(0, 15)}...` : campaign}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 적용된 필터 요약 */}
            {activeFilterCount > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-medium text-slate-700 mb-2">적용된 필터:</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.staff.map((staff) => (
                    <Badge key={`staff-${staff}`} variant="secondary" className="bg-blue-100 text-blue-800">
                      담당자: {staff}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 text-blue-600 hover:text-blue-800"
                        onClick={() => toggleFilter('staff', staff)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {filters.countries.map((country) => (
                    <Badge key={`country-${country}`} variant="secondary" className="bg-green-100 text-green-800">
                      국가: {country}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 text-green-600 hover:text-green-800"
                        onClick={() => toggleFilter('countries', country)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {filters.followerTypes.map((type) => (
                    <Badge key={`follower-${type}`} variant="secondary" className="bg-purple-100 text-purple-800">
                      팔로워: {type}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 text-purple-600 hover:text-purple-800"
                        onClick={() => toggleFilter('followerTypes', type)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {filters.costTypes.map((type) => (
                    <Badge key={`cost-${type}`} variant="secondary" className="bg-orange-100 text-orange-800">
                      비용: {type}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 text-orange-600 hover:text-orange-800"
                        onClick={() => toggleFilter('costTypes', type)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {filters.campaigns.map((campaign) => (
                    <Badge key={`campaign-${campaign}`} variant="secondary" className="bg-rose-100 text-rose-800">
                      캠페인: {campaign.length > 10 ? `${campaign.substring(0, 10)}...` : campaign}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 text-rose-600 hover:text-rose-800"
                        onClick={() => toggleFilter('campaigns', campaign)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}