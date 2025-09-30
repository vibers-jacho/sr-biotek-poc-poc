import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { InfluencerData } from '../App';
import { TrendingUp, BarChart3, ChevronDown, ChevronUp, User, DollarSign, Star, Target, Info, CalendarIcon, ArrowUpDown, Eye, Settings2, Filter } from 'lucide-react';
import { InfluencerPerformanceAnalysis } from './InfluencerPerformanceAnalysis';

interface VisualizationBoardProps {
  data: InfluencerData[];
}

export function VisualizationBoard({ data }: VisualizationBoardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showPeriodComparison, setShowPeriodComparison] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'overall' | 'campaign'>('overall');
  const [selectedCampaignForComparison, setSelectedCampaignForComparison] = useState<string>('');
  const [periodA, setPeriodA] = useState({ start: new Date('2025-08-01'), end: new Date('2025-08-31') });
  const [periodB, setPeriodB] = useState({ start: new Date('2025-09-01'), end: new Date('2025-09-30') });
  const [periodAStartOpen, setPeriodAStartOpen] = useState(false);
  const [periodAEndOpen, setPeriodAEndOpen] = useState(false);
  const [periodBStartOpen, setPeriodBStartOpen] = useState(false);
  const [periodBEndOpen, setPeriodBEndOpen] = useState(false);
  
  // 캠페인 선택 관련 상태
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [campaignSelectionOpen, setCampaignSelectionOpen] = useState(false);
  
  // 모든 캠페인 목록 추출
  const allCampaigns = Array.from(new Set(data.map(item => item.campaign))).sort();
  
  // 기본적으로 최근 10개 캠페인 선택 (날짜 기준으로 최신순)
  useEffect(() => {
    if (selectedCampaigns.length === 0 && allCampaigns.length > 0) {
      // 각 캠페인의 최신 날짜 기준으로 정렬
      const campaignWithLatestDate = allCampaigns.map(campaign => {
        const campaignData = data.filter(item => item.campaign === campaign);
        const latestDate = campaignData.reduce((latest, item) => {
          return new Date(item.date) > new Date(latest.date) ? item : latest;
        }).date;
        return { campaign, latestDate };
      }).sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
      
      const recent10Campaigns = campaignWithLatestDate.slice(0, 10).map(item => item.campaign);
      setSelectedCampaigns(recent10Campaigns);
    }
  }, [data, allCampaigns, selectedCampaigns.length]);

  // 선택된 캠페인에 따른 필터링된 데이터
  const filteredData = data.filter(item => selectedCampaigns.includes(item.campaign));

  // 캠페인 선택 핸들러들
  const handleCampaignToggle = (campaign: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaign) 
        ? prev.filter(c => c !== campaign)
        : [...prev, campaign]
    );
  };

  const handleSelectAllCampaigns = () => {
    setSelectedCampaigns(allCampaigns);
  };

  const handleSelectRecent10 = () => {
    const campaignWithLatestDate = allCampaigns.map(campaign => {
      const campaignData = data.filter(item => item.campaign === campaign);
      const latestDate = campaignData.reduce((latest, item) => {
        return new Date(item.date) > new Date(latest.date) ? item : latest;
      }).date;
      return { campaign, latestDate };
    }).sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
    
    const recent10Campaigns = campaignWithLatestDate.slice(0, 10).map(item => item.campaign);
    setSelectedCampaigns(recent10Campaigns);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  // 캠페인별 데이터 처리
  const processCampaignData = (inputData: InfluencerData[], metric: 'responseRate' | 'views' | 'saves' | 'emv' | 'roas') => {
    const campaignData = inputData.reduce((acc, item) => {
      const existing = acc.find(x => x.name === item.campaign);
      if (existing) {
        if (metric === 'responseRate' || metric === 'roas') {
          existing.values.push(item[metric]);
        } else {
          existing.value += item[metric];
          existing.count += 1;
        }
      } else {
        acc.push({ 
          name: item.campaign, 
          value: (metric === 'responseRate' || metric === 'roas') ? 0 : item[metric],
          values: (metric === 'responseRate' || metric === 'roas') ? [item[metric]] : [],
          count: (metric === 'responseRate' || metric === 'roas') ? 1 : 1
        });
      }
      return acc;
    }, [] as { name: string; value: number; values: number[]; count: number }[]);

    // 평균 계산
    if (metric === 'responseRate' || metric === 'roas') {
      campaignData.forEach(item => {
        item.value = item.values.reduce((sum, val) => sum + val, 0) / item.values.length;
      });
    }

    // 정렬
    const sorted = campaignData.sort((a, b) => b.value - a.value);
    return sorted;
  };

  // 국가별 데이터 처리
  const processCountryData = (metric: 'responseRate' | 'views' | 'emv' | 'roas', inputData: InfluencerData[]) => {
    return inputData.reduce((acc, item) => {
      const existing = acc.find(x => x.name === item.country);
      if (existing) {
        if (metric === 'responseRate' || metric === 'roas') {
          existing.values.push(item[metric]);
        } else {
          existing.value += item[metric];
          existing.count += 1;
        }
      } else {
        acc.push({ 
          name: item.country, 
          value: (metric === 'responseRate' || metric === 'roas') ? 0 : item[metric],
          values: (metric === 'responseRate' || metric === 'roas') ? [item[metric]] : [],
          count: (metric === 'responseRate' || metric === 'roas') ? 1 : 1
        });
      }
      return acc;
    }, [] as { name: string; value: number; values: number[]; count: number }[])
    .map(item => ({
      name: item.name,
      value: (metric === 'responseRate' || metric === 'roas')
        ? item.values.reduce((sum, val) => sum + val, 0) / item.values.length 
        : item.value
    }));
  };

  const processFollowerTypeData = (metric: 'responseRate' | 'views' | 'emv' | 'roas', inputData: InfluencerData[]) => {
    return inputData.reduce((acc, item) => {
      const existing = acc.find(x => x.name === item.followerType);
      if (existing) {
        if (metric === 'responseRate' || metric === 'roas') {
          existing.values.push(item[metric]);
        } else {
          existing.value += item[metric];
          existing.count += 1;
        }
      } else {
        acc.push({ 
          name: item.followerType, 
          value: (metric === 'responseRate' || metric === 'roas') ? 0 : item[metric],
          values: (metric === 'responseRate' || metric === 'roas') ? [item[metric]] : [],
          count: (metric === 'responseRate' || metric === 'roas') ? 1 : 1
        });
      }
      return acc;
    }, [] as { name: string; value: number; values: number[]; count: number }[])
    .map(item => ({
      name: item.name,
      value: (metric === 'responseRate' || metric === 'roas')
        ? item.values.reduce((sum, val) => sum + val, 0) / item.values.length 
        : item.value
    }));
  };

  // 기간별 데이터 필터링 함수 (선택된 캠페인 기반)
  const getDataByPeriod = (startDate: Date, endDate: Date, campaign?: string) => {
    return filteredData.filter(item => {
      const itemDate = new Date(item.date);
      const matchesDate = itemDate >= startDate && itemDate <= endDate;
      const matchesCampaign = campaign ? item.campaign === campaign : true;
      return matchesDate && matchesCampaign;
    });
  };

  // 캠페인 목록 가져오기 (선택된 캠페인들 기반)
  const availableCampaigns = Array.from(new Set(filteredData.map(item => item.campaign)));

  // 기간별 통계 계산 함수
  const calculatePeriodStats = (periodData: InfluencerData[]) => {
    if (periodData.length === 0) {
      return {
        totalInfluencers: 0,
        totalViews: 0,
        totalSaves: 0,
        averageResponseRate: 0,
        totalEMV: 0,
        averageROAS: 0,
        totalCost: 0
      };
    }

    return {
      totalInfluencers: periodData.length,
      totalViews: periodData.reduce((sum, item) => sum + item.views, 0),
      totalSaves: periodData.reduce((sum, item) => sum + item.saves, 0),
      averageResponseRate: Number((periodData.reduce((sum, item) => sum + item.responseRate, 0) / periodData.length).toFixed(1)),
      totalEMV: Number(periodData.reduce((sum, item) => sum + item.emv, 0).toFixed(1)),
      averageROAS: Number((periodData.reduce((sum, item) => sum + item.roas, 0) / periodData.length).toFixed(1)),
      totalCost: Number(periodData.reduce((sum, item) => sum + item.cost, 0).toFixed(1))
    };
  };

  // 기간별 비교 데이터 준비
  const campaignFilter = comparisonMode === 'campaign' ? selectedCampaignForComparison : undefined;
  const periodAData = getDataByPeriod(periodA.start, periodA.end, campaignFilter);
  const periodBData = getDataByPeriod(periodB.start, periodB.end, campaignFilter);
  const periodAStats = calculatePeriodStats(periodAData);
  const periodBStats = calculatePeriodStats(periodBData);

  // 증감율 계산 함수
  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // 기간별 비교 차트 데이터
  const periodComparisonData = [
    {
      metric: '총 인플루언서',
      periodA: periodAStats.totalInfluencers,
      periodB: periodBStats.totalInfluencers,
      growth: calculateGrowthRate(periodBStats.totalInfluencers, periodAStats.totalInfluencers)
    },
    {
      metric: '총 조회수',
      periodA: periodAStats.totalViews,
      periodB: periodBStats.totalViews,
      growth: calculateGrowthRate(periodBStats.totalViews, periodAStats.totalViews)
    },
    {
      metric: '총 저장수',
      periodA: periodAStats.totalSaves,
      periodB: periodBStats.totalSaves,
      growth: calculateGrowthRate(periodBStats.totalSaves, periodAStats.totalSaves)
    },
    {
      metric: '평균 회신율',
      periodA: periodAStats.averageResponseRate,
      periodB: periodBStats.averageResponseRate,
      growth: calculateGrowthRate(periodBStats.averageResponseRate, periodAStats.averageResponseRate)
    },
    {
      metric: '총 EMV',
      periodA: periodAStats.totalEMV,
      periodB: periodBStats.totalEMV,
      growth: calculateGrowthRate(periodBStats.totalEMV, periodAStats.totalEMV)
    }
  ];

  // 데이터 준비 (선택된 캠페인 데이터 사용)
  const responseRateData = processCampaignData(filteredData, 'responseRate');
  const viewsData = processCampaignData(filteredData, 'views');
  const savesData = processCampaignData(filteredData, 'saves');
  const emvData = processCampaignData(filteredData, 'emv');
  const roasData = processCampaignData(filteredData, 'roas');

  // 국가별 데이터 (선택된 캠페인 데이터 사용)
  const responseRateByCountry = processCountryData('responseRate', filteredData);
  const viewsByCountry = processCountryData('views', filteredData);
  const emvByCountry = processCountryData('emv', filteredData);
  const roasByCountry = processCountryData('roas', filteredData);

  // 팔로워 유형별 데이터 (선택된 캠페인 데이터 사용)
  const responseRateByFollowerType = processFollowerTypeData('responseRate', filteredData);
  const viewsByFollowerType = processFollowerTypeData('views', filteredData);
  const emvByFollowerType = processFollowerTypeData('emv', filteredData);
  const roasByFollowerType = processFollowerTypeData('roas', filteredData);

  const colors = {
    blue: '#3b82f6',
    emerald: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    purple: '#8b5cf6',
    slate: '#64748b',
    green: '#22c55e'
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-8">
      {/* 기간별 비교 분석 */}
      <div className="space-y-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <CardTitle className="text-lg font-semibold">기간별 비교 분석</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPeriodComparison(!showPeriodComparison)}
                className="gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                {showPeriodComparison ? '숨기기' : '비교 분석'}
              </Button>
            </div>
          </CardHeader>
          
          {showPeriodComparison && (
            <CardContent className="space-y-6">
              {/* 비교 모드 선택 */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium text-slate-700">비교 모드</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={comparisonMode === 'overall' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setComparisonMode('overall')}
                    >
                      전체 비교
                    </Button>
                    <Button
                      variant={comparisonMode === 'campaign' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setComparisonMode('campaign')}
                    >
                      캠페인별 비교
                    </Button>
                  </div>
                </div>

                {/* 캠페인 선택 (캠페인별 비교 모드일 때만) */}
                {comparisonMode === 'campaign' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">비교할 캠페인</Label>
                    <Select 
                      value={selectedCampaignForComparison} 
                      onValueChange={setSelectedCampaignForComparison}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="캠페인을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCampaigns.map((campaign) => (
                          <SelectItem key={campaign} value={campaign}>
                            {campaign}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* 기간 설정 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">기간 A</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">시작일</Label>
                      <Popover open={periodAStartOpen} onOpenChange={setPeriodAStartOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal text-sm h-9"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDate(periodA.start)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={periodA.start}
                            onSelect={(date) => {
                              if (date) {
                                setPeriodA(prev => ({ ...prev, start: date }));
                                setPeriodAStartOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">종료일</Label>
                      <Popover open={periodAEndOpen} onOpenChange={setPeriodAEndOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal text-sm h-9"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDate(periodA.end)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={periodA.end}
                            onSelect={(date) => {
                              if (date) {
                                setPeriodA(prev => ({ ...prev, end: date }));
                                setPeriodAEndOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">기간 B</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">시작일</Label>
                      <Popover open={periodBStartOpen} onOpenChange={setPeriodBStartOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal text-sm h-9"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDate(periodB.start)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={periodB.start}
                            onSelect={(date) => {
                              if (date) {
                                setPeriodB(prev => ({ ...prev, start: date }));
                                setPeriodBStartOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">종료일</Label>
                      <Popover open={periodBEndOpen} onOpenChange={setPeriodBEndOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal text-sm h-9"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDate(periodB.end)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={periodB.end}
                            onSelect={(date) => {
                              if (date) {
                                setPeriodB(prev => ({ ...prev, end: date }));
                                setPeriodBEndOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>

              {/* 비교 차트 */}
              {(comparisonMode === 'overall' || (comparisonMode === 'campaign' && selectedCampaignForComparison)) ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={periodComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="metric" 
                        stroke="#64748b" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'periodA') return [value.toLocaleString(), '기간 A'];
                          if (name === 'periodB') return [value.toLocaleString(), '기간 B'];
                          return [value, name];
                        }}
                      />
                      <Bar dataKey="periodA" fill="#6366f1" name="기간 A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="periodB" fill="#10b981" name="기간 B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">캠페인을 선택해주세요</p>
                    <p className="text-gray-400 text-sm mt-1">비교 분석을 위해 캠페인을 선택하세요</p>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* 통합 성과 분석 */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
              </div>
              <CardTitle className="text-lg font-semibold">통합 성과 분석</CardTitle>
            </div>
          </div>
          
          {/* 캠페인 선택 필터 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">캠페인 필터</span>
                <span className="text-xs text-gray-500">
                  ({selectedCampaigns.length}/{allCampaigns.length}개 선택)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectRecent10}
                  className="text-xs h-7"
                >
                  최근 10개
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllCampaigns}
                  className="text-xs h-7"
                >
                  전체 선택
                </Button>
                <Popover open={campaignSelectionOpen} onOpenChange={setCampaignSelectionOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-7">
                      <Filter className="w-4 h-4" />
                      캠페인 선택
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">캠페인 선택</h4>
                          <span className="text-sm text-gray-500">
                            {selectedCampaigns.length}/{allCampaigns.length}개
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={handleSelectAllCampaigns}
                             className="flex-1 text-xs"
                           >
                             전체 선택
                           </Button>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={handleSelectRecent10}
                             className="flex-1 text-xs"
                           >
                             최근 10개
                           </Button>
                         </div>
                        
                        <ScrollArea className="h-64">
                          <div className="space-y-2">
                            {allCampaigns.map((campaign) => (
                              <div
                                key={campaign}
                                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                              >
                                <Checkbox
                                  id={campaign}
                                  checked={selectedCampaigns.includes(campaign)}
                                  onCheckedChange={() => handleCampaignToggle(campaign)}
                                />
                                <label
                                  htmlFor={campaign}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                >
                                  {campaign}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* 선택된 캠페인 표시 */}
            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                선택된 캠페인: {selectedCampaigns.length === 0 ? '없음' : selectedCampaigns.length === allCampaigns.length ? '전체' : `${selectedCampaigns.length}개`}
              </div>
              {selectedCampaigns.length > 0 && selectedCampaigns.length <= 10 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedCampaigns.map((campaign) => (
                    <div
                      key={campaign}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {campaign}
                      <button
                        onClick={() => handleCampaignToggle(campaign)}
                        className="ml-1 hover:bg-blue-200 rounded p-0.5"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {selectedCampaigns.length > 10 && (
                <div className="text-xs text-gray-500">
                  {selectedCampaigns.slice(0, 3).join(', ')} 외 {selectedCampaigns.length - 3}개
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 캠페인별 통합 성과 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* EMV 차트 */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-600" />
                  캠페인별 EMV
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-blue-600" title="EMV = [조회수 × 0.03] + [좋아요 × 0.1] + [댓글 × 0.4]">
                    <Info className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emvData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'EMV']}
                      />
                      <Bar dataKey="value" fill={colors.blue} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ROAS 차트 */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  캠페인별 ROAS
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-emerald-600" title="ROAS = (EMV / Cost) × 100, 무가의 경우 EMV 값 표시">
                    <Info className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roasData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'ROAS']}
                      />
                      <Bar dataKey="value" fill={colors.emerald} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 회신율 차트 */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  캠페인별 회신율
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={responseRateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, '회신율']}
                      />
                      <Bar dataKey="value" fill={colors.amber} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 조회수 차트 */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  캠페인별 조회수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={viewsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number) => [value.toLocaleString(), '조회수']}
                      />
                      <Bar dataKey="value" fill={colors.purple} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 세부 분석 섹션들 */}
      <div className="space-y-6">
        {/* 회신율 분석 */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                회신율 분석
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleSection('responseRate')}
                className="gap-2"
              >
                {expandedSection === 'responseRate' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expandedSection === 'responseRate' ? '접기' : '펼치기'}
              </Button>
            </div>
          </CardHeader>
          
          {expandedSection === 'responseRate' && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 국가별 회신율 */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    국가별 평균 회신율
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={responseRateByCountry}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        >
                          {responseRateByCountry.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={Object.values(colors)[index % Object.values(colors).length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '회신율']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 팔로워 유형별 회신율 */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    팔로워 유형별 평균 회신율
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={responseRateByFollowerType}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)}%`, '회신율']}
                        />
                        <Bar dataKey="value" fill={colors.emerald} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* 조회수 분석 */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                조회수 분석
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleSection('views')}
                className="gap-2"
              >
                {expandedSection === 'views' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expandedSection === 'views' ? '접기' : '펼치기'}
              </Button>
            </div>
          </CardHeader>
          
          {expandedSection === 'views' && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 국가별 조회수 */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-600" />
                    국가별 총 조회수
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={viewsByCountry}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: number) => [value.toLocaleString(), '조회수']}
                        />
                        <Bar dataKey="value" fill={colors.purple} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 팔로워 유형별 조회수 */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-600" />
                    팔로워 유형별 총 조회수
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={viewsByFollowerType}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: number) => [value.toLocaleString(), '조회수']}
                        />
                        <Bar dataKey="value" fill={colors.slate} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* EMV 분석 */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                EMV 분석
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleSection('emv')}
                className="gap-2"
              >
                {expandedSection === 'emv' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expandedSection === 'emv' ? '접기' : '펼치기'}
              </Button>
            </div>
          </CardHeader>
          
          {expandedSection === 'emv' && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 국가별 EMV */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    국가별 총 EMV
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={emvByCountry}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'EMV']}
                        />
                        <Bar dataKey="value" fill={colors.blue} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 팔로워 유형별 EMV */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    팔로워 유형별 총 EMV
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={emvByFollowerType}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'EMV']}
                        />
                        <Bar dataKey="value" fill={colors.blue} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* ROAS 분석 */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                ROAS 분석
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleSection('roas')}
                className="gap-2"
              >
                {expandedSection === 'roas' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expandedSection === 'roas' ? '접기' : '펼치기'}
              </Button>
            </div>
          </CardHeader>
          
          {expandedSection === 'roas' && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 국가별 ROAS */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    국가별 평균 ROAS
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roasByCountry}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: number) => [value.toLocaleString(), 'ROAS']}
                        />
                        <Bar dataKey="value" fill={colors.emerald} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 팔로워 유형별 ROAS */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    팔로워 유형별 평균 ROAS
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roasByFollowerType}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: number) => [value.toLocaleString(), 'ROAS']}
                        />
                        <Bar dataKey="value" fill={colors.emerald} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* 저장수 분석 (캠페인별만) */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                저장수 분석
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleSection('saves')}
                className="gap-2"
              >
                {expandedSection === 'saves' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expandedSection === 'saves' ? '접기' : '펼치기'}
              </Button>
            </div>
          </CardHeader>
          
          {expandedSection === 'saves' && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* 캠페인별 저장수 */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                    캠페인별 총 저장수
                  </h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={savesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#64748b"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: number) => [value.toLocaleString(), '저장수']}
                        />
                        <Bar dataKey="value" fill={colors.green} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* 인플루언서별 성과 분석 */}
      <InfluencerPerformanceAnalysis data={filteredData} />
    </div>
  );
}