import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from './ui/pagination';
import { Influencer } from '../types';
import { TrendingUp, Users, Eye, BookmarkIcon, MessageCircle, Calendar, DollarSign, Search, Grid3X3, List, ArrowUpDown, Info, Star, Target, ChevronDown, ChevronUp, BarChart3, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend, BarChart, Bar } from 'recharts';

interface CampaignOverviewProps {
  data: Influencer[];
  onCampaignSelect?: (campaign: string) => void;
  dateRange?: { start: string; end: string };
  selectedCampaigns?: string[];
}

export function CampaignOverview({ data, onCampaignSelect, dateRange, selectedCampaigns = [] }: CampaignOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'influencers' | 'views' | 'emv' | 'roas'>('emv');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMetric, setSelectedMetric] = useState<'emv' | 'roas' | 'avgEmv' | 'cost' | null>('emv');
  const [expandedAnalysisSection, setExpandedAnalysisSection] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Helper function to toggle analysis sections
  const toggleAnalysisSection = (section: string) => {
    setExpandedAnalysisSection(expandedAnalysisSection === section ? null : section);
  };

  // 캠페인별 데이터 그룹핑
  const campaignGroups = data.reduce((acc, influencer) => {
    if (!influencer.campaign) return acc;
    if (!acc[influencer.campaign]) {
      acc[influencer.campaign] = [];
    }
    acc[influencer.campaign].push(influencer);
    return acc;
  }, {} as Record<string, Influencer[]>);

  // 캠페인별 통계 계산
  const getCampaignStats = (campaignData: Influencer[]) => {
    const influencerCount = campaignData.length;
    const views = campaignData.reduce((sum, item) => sum + (item.views || 0), 0);
    const saves = campaignData.reduce((sum, item) => sum + (item.saves || 0), 0);
    const avgResponseRate = campaignData.length > 0 ?
      campaignData.reduce((sum, item) => sum + (item.responseRate || 0), 0) / campaignData.length : 0;
    const comments = campaignData.reduce((sum, item) => sum + (item.comments || 0), 0);
    const likes = campaignData.reduce((sum, item) => sum + (item.likes || 0), 0);
    const paidCount = campaignData.filter(item => item.costType === '유가').length;
    const countries = Array.from(new Set(campaignData.map(item => item.country).filter(Boolean))).length;
    const followerTypes = campaignData.reduce((acc, item) => {
      if (item.followerType) {
        acc[item.followerType] = (acc[item.followerType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // EMV 및 ROAS 계산
    const totalEMV = campaignData.reduce((sum, item) => sum + (item.emv || 0), 0);
    const avgEMV = influencerCount > 0 ? totalEMV / influencerCount : 0;
    const totalCost = campaignData.reduce((sum, item) => sum + (item.cost || 0), 0);
    const avgROAS = campaignData.length > 0 ?
      campaignData.reduce((sum, item) => sum + (item.roas || 0), 0) / campaignData.length : 0;

    return {
      influencerCount,
      views,
      saves,
      avgResponseRate,
      comments,
      likes,
      paidCount,
      countries,
      followerTypes,
      totalEMV,
      avgEMV,
      totalCost,
      avgROAS,
      performance: Math.round((avgResponseRate * 0.4 + (views / influencerCount) * 0.0001 + (saves / influencerCount) * 0.01) * 10) / 10
    };
  };

  const campaignStatsArray = Object.entries(campaignGroups).map(([campaign, campaignData]) => ({
    campaign,
    data: campaignData,
    stats: getCampaignStats(campaignData)
  }));

  // 필터링 및 검색
  const filteredCampaigns = campaignStatsArray.filter(({ campaign, stats }) => {
    const matchesSearch = campaign.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && stats.influencerCount >= 3);
    
    return matchesSearch && matchesStatus;
  });

  // 검색어나 필터가 변경될 때 현재 페이지를 1로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // 정렬
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.campaign.localeCompare(b.campaign);
      case 'performance': return b.stats.performance - a.stats.performance;
      case 'influencers': return b.stats.influencerCount - a.stats.influencerCount;
      case 'views': return b.stats.views - a.stats.views;
      case 'emv': return b.stats.totalEMV - a.stats.totalEMV;
      case 'roas': return b.stats.avgROAS - a.stats.avgROAS;
      default: return 0;
    }
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(sortedCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = sortedCampaigns.slice(startIndex, endIndex);

  // 페이지 변경 시 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 전체 통계
  const totalInfluencers = data.length;
  const totalViews = data.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalSaves = data.reduce((sum, item) => sum + (item.saves || 0), 0);
  const averageResponseRate = data.length > 0 ? data.reduce((sum, item) => sum + (item.responseRate || 0), 0) / data.length : 0;
  const totalComments = data.reduce((sum, item) => sum + (item.comments || 0), 0);
  const totalLikes = data.reduce((sum, item) => sum + (item.likes || 0), 0);
  const paidInfluencers = data.filter(item => item.costType === '유가').length;
  const activeCampaigns = Object.keys(campaignGroups).length;

  // EMV 및 ROAS 전체 통계
  const totalEMV = data.reduce((sum, item) => sum + (item.emv || 0), 0);
  const averageEMV = data.length > 0 ? totalEMV / data.length : 0;
  const totalCost = data.reduce((sum, item) => sum + (item.cost || 0), 0);
  const averageROAS = data.length > 0 ? data.reduce((sum, item) => sum + (item.roas || 0), 0) / data.length : 0;

  // 시간대별 데이터 생성 (선택된 날짜 범위 및 캠페인 기반)
  const timelineData = React.useMemo(() => {
    if (!dateRange) return [];

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // 날짜 범위에 따라 적절한 간격 결정
    let intervalDays: number;
    let datePoints: Date[] = [];

    if (daysDiff <= 7) {
      intervalDays = 1;
    } else if (daysDiff <= 31) {
      intervalDays = 7;
    } else if (daysDiff <= 90) {
      intervalDays = 14;
    } else {
      intervalDays = 30;
    }

    // 날짜 포인트 생성
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + intervalDays)) {
      datePoints.push(new Date(d));
    }

    // 마지막 날짜가 endDate가 아니면 추가
    if (datePoints.length === 0 || datePoints[datePoints.length - 1].getTime() !== endDate.getTime()) {
      datePoints.push(new Date(endDate));
    }

    const numPoints = datePoints.length;

    // 시드 값을 사용하여 일관된 랜덤 값 생성
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // 모든 캠페인에 대한 통계 계산
    const allCampaigns = Object.keys(campaignGroups);

    return datePoints.map((date, index) => {
      const dataPoint: any = {
        month: `${date.getMonth() + 1}/${date.getDate()}`,
      };

      // 모든 캠페인 데이터 생성 (선택 여부와 관계없이)
      allCampaigns.forEach((campaign, campaignIndex) => {
        const campaignData = campaignGroups[campaign] || [];
        const stats = getCampaignStats(campaignData);

        const seedBase = index * 1000 + campaignIndex * 100;
        const campaignVariance = 0.7 + seededRandom(seedBase) * 0.6;
        const campaignTrend = 1 + (index * 0.03);

        dataPoint[`${campaign}_emv`] = Math.floor((stats.totalEMV / numPoints) * campaignVariance * campaignTrend);
        dataPoint[`${campaign}_roas`] = Number((stats.avgROAS * (0.85 + seededRandom(seedBase + 1) * 0.3) * campaignTrend).toFixed(1));
        dataPoint[`${campaign}_avgEmv`] = Math.floor(stats.avgEMV * campaignVariance * campaignTrend);
        dataPoint[`${campaign}_cost`] = Math.floor((stats.totalCost / numPoints) * campaignVariance * campaignTrend);
      });

      // "전체" 데이터 계산 - 모든 캠페인의 합계
      let totalEMVSum = 0;
      let totalROASSum = 0;
      let totalAvgEMVSum = 0;
      let totalCostSum = 0;
      let campaignCount = 0;

      allCampaigns.forEach((campaign) => {
        totalEMVSum += dataPoint[`${campaign}_emv`] || 0;
        totalROASSum += dataPoint[`${campaign}_roas`] || 0;
        totalAvgEMVSum += dataPoint[`${campaign}_avgEmv`] || 0;
        totalCostSum += dataPoint[`${campaign}_cost`] || 0;
        campaignCount++;
      });

      dataPoint['전체_emv'] = Math.floor(totalEMVSum);
      dataPoint['전체_roas'] = campaignCount > 0 ? Number((totalROASSum / campaignCount).toFixed(1)) : 0;
      dataPoint['전체_avgEmv'] = campaignCount > 0 ? Math.floor(totalAvgEMVSum / campaignCount) : 0;
      dataPoint['전체_cost'] = Math.floor(totalCostSum);

      return dataPoint;
    });
  }, [dateRange, totalEMV, totalCost, averageROAS, averageEMV, campaignGroups]);
  const campaignsToDisplay = selectedCampaigns.filter(c => c !== '전체');

  // 메트릭별 설정
  const metricConfig = {
    emv: {
      label: '총 EMV',
      color: '#3b82f6',
      dataKey: 'emv',
      format: (value: number) => value > 1000000 ? `$${(value/1000000).toFixed(1)}M` : value > 1000 ? `$${(value/1000).toFixed(1)}K` : `$${value.toLocaleString()}`
    },
    roas: {
      label: '평균 ROAS',
      color: '#10b981',
      dataKey: 'roas',
      format: (value: number) => `${value.toFixed(1)}%`
    },
    avgEmv: {
      label: '평균 EMV',
      color: '#f59e0b',
      dataKey: 'avgEmv',
      format: (value: number) => value > 1000 ? `$${(value/1000).toFixed(1)}K` : `$${value.toLocaleString()}`
    },
    cost: {
      label: '총 마케팅 비용',
      color: '#8b5cf6',
      dataKey: 'cost',
      format: (value: number) => value > 1000000 ? `$${(value/1000000).toFixed(1)}M` : value > 1000 ? `$${(value/1000).toFixed(1)}K` : `$${value.toLocaleString()}`
    }
  };

  // 팔로워 유형별 색상
  const followerTypeColors = {
    '메가': '#8B5CF6',
    '매크로': '#3B82F6',
    '마이크로': '#10B981',
    '나노': '#F59E0B'
  };

  // Chart colors for analysis sections
  const chartColors = {
    blue: '#3b82f6',
    emerald: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    purple: '#8b5cf6',
    slate: '#64748b',
    green: '#22c55e'
  };

  // Helper functions for data processing
  const processCountryData = (metric: 'responseRate' | 'views' | 'emv' | 'roas') => {
    return data.reduce((acc, item) => {
      if (!item.country || item[metric] === undefined) return acc;
      const existing = acc.find(x => x.name === item.country);
      if (existing) {
        if (metric === 'responseRate' || metric === 'roas') {
          existing.values.push(item[metric]);
        } else {
          existing.value += item[metric];
        }
      } else {
        acc.push({
          name: item.country,
          value: (metric === 'responseRate' || metric === 'roas') ? 0 : item[metric],
          values: (metric === 'responseRate' || metric === 'roas') ? [item[metric]] : []
        });
      }
      return acc;
    }, [] as { name: string; value: number; values: number[] }[])
    .map(item => ({
      name: item.name,
      value: (metric === 'responseRate' || metric === 'roas')
        ? item.values.reduce((sum, val) => sum + val, 0) / item.values.length
        : item.value
    }));
  };

  const processFollowerTypeData = (metric: 'responseRate' | 'views' | 'emv' | 'roas') => {
    return data.reduce((acc, item) => {
      if (!item.followerType || item[metric] === undefined) return acc;
      const existing = acc.find(x => x.name === item.followerType);
      if (existing) {
        if (metric === 'responseRate' || metric === 'roas') {
          existing.values.push(item[metric]);
        } else {
          existing.value += item[metric];
        }
      } else {
        acc.push({
          name: item.followerType,
          value: (metric === 'responseRate' || metric === 'roas') ? 0 : item[metric],
          values: (metric === 'responseRate' || metric === 'roas') ? [item[metric]] : []
        });
      }
      return acc;
    }, [] as { name: string; value: number; values: number[] }[])
    .map(item => ({
      name: item.name,
      value: (metric === 'responseRate' || metric === 'roas')
        ? item.values.reduce((sum, val) => sum + val, 0) / item.values.length
        : item.value
    }));
  };

  // Analysis data
  const responseRateByCountry = processCountryData('responseRate');
  const viewsByCountry = processCountryData('views');
  const emvByCountry = processCountryData('emv');
  const roasByCountry = processCountryData('roas');

  const responseRateByFollowerType = processFollowerTypeData('responseRate');
  const viewsByFollowerType = processFollowerTypeData('views');
  const emvByFollowerType = processFollowerTypeData('emv');
  const roasByFollowerType = processFollowerTypeData('roas');

  const savesData = Object.entries(campaignGroups).map(([campaign, influencers]) => ({
    name: campaign,
    value: influencers.reduce((sum, inf) => sum + (inf.saves || 0), 0)
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8">
      {/* 전체 요약 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            {selectedCampaigns.length === 0
              ? '전체 캠페인 요약'
              : selectedCampaigns.length === 1
              ? `캠페인 요약 - ${selectedCampaigns[0]}`
              : `캠페인 요약 - ${selectedCampaigns.length}개 선택`}
          </h2>
          <Badge className="bg-blue-100 text-blue-800 border-0 font-medium">
            {activeCampaigns}개 캠페인
          </Badge>
        </div>
        
        {/* EMV & ROAS 핵심 지표 우선 배치 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card
            className={`border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 cursor-pointer transition-all hover:shadow-md ${selectedMetric === 'emv' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedMetric(selectedMetric === 'emv' ? null : 'emv')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">총 EMV</p>
                  <p className="text-lg font-bold text-blue-900">
                    ${totalEMV > 1000000 ? `${(totalEMV/1000000).toFixed(1)}M` :
                       totalEMV > 1000 ? `${(totalEMV/1000).toFixed(1)}K` :
                       Math.floor(totalEMV).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border-green-200 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 cursor-pointer transition-all hover:shadow-md ${selectedMetric === 'roas' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setSelectedMetric(selectedMetric === 'roas' ? null : 'roas')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">평균 ROAS</p>
                  <p className="text-lg font-bold text-green-900">
                    {averageROAS > 1000 ? `${Math.floor(averageROAS).toLocaleString()}%` : `${averageROAS.toFixed(1)}%`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border-orange-200 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50 cursor-pointer transition-all hover:shadow-md ${selectedMetric === 'avgEmv' ? 'ring-2 ring-orange-500' : ''}`}
            onClick={() => setSelectedMetric(selectedMetric === 'avgEmv' ? null : 'avgEmv')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-700 font-medium">평균 EMV</p>
                  <p className="text-lg font-bold text-orange-900">
                    ${averageEMV > 1000 ? `${(averageEMV/1000).toFixed(1)}K` : Math.floor(averageEMV).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border-purple-200 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 cursor-pointer transition-all hover:shadow-md ${selectedMetric === 'cost' ? 'ring-2 ring-purple-500' : ''}`}
            onClick={() => setSelectedMetric(selectedMetric === 'cost' ? null : 'cost')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium">총 마케팅 비용</p>
                  <p className="text-lg font-bold text-purple-900">
                    ${totalCost > 1000000 ? `${(totalCost/1000000).toFixed(1)}M` :
                       totalCost > 1000 ? `${(totalCost/1000).toFixed(1)}K` :
                       totalCost.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 선택된 메트릭의 시계열 그래프 */}
        {selectedMetric && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{metricConfig[selectedMetric].label} 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value: number) => metricConfig[selectedMetric].format(value)}
                  />
                  <Tooltip
                    formatter={(value: number) => metricConfig[selectedMetric].format(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend />

                  {/* 선택된 캠페인 라인 (전체 포함) */}
                  {selectedCampaigns.map((campaign, index) => {
                    // "전체"는 검은색 굵은 선
                    if (campaign === '전체') {
                      return (
                        <Line
                          key="전체"
                          type="monotone"
                          dataKey={`전체_${metricConfig[selectedMetric].dataKey}`}
                          stroke="#000000"
                          strokeWidth={3}
                          dot={{ fill: '#000000', r: 5 }}
                          activeDot={{ r: 7 }}
                          name="전체"
                        />
                      );
                    }

                    // 개별 캠페인은 색상 지정
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6'];
                    const color = colors[index % colors.length];

                    return (
                      <Line
                        key={campaign}
                        type="monotone"
                        dataKey={`${campaign}_${metricConfig[selectedMetric].dataKey}`}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, r: 4 }}
                        activeDot={{ r: 6 }}
                        name={campaign}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 기본 성과 지표 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">활성 캠페인</p>
                  <p className="text-lg font-semibold text-slate-900">{activeCampaigns}개</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">총 인플루언서</p>
                  <p className="text-lg font-semibold text-slate-900">{totalInfluencers}명</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">총 조회수</p>
                  <p className="text-lg font-semibold text-slate-900">{totalViews.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">평균 회신율</p>
                  <p className="text-lg font-semibold text-slate-900">{averageResponseRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 보조 성과 지표 (좋아요, 댓글 등) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">총 좋아요</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {totalLikes > 1000000 ? `${(totalLikes/1000000).toFixed(1)}M` : 
                     totalLikes > 1000 ? `${(totalLikes/1000).toFixed(1)}K` : 
                     totalLikes.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">총 댓글</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {totalComments > 1000000 ? `${(totalComments/1000000).toFixed(1)}M` : 
                     totalComments > 1000 ? `${(totalComments/1000).toFixed(1)}K` : 
                     totalComments.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BookmarkIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">총 저장수</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {totalSaves > 1000000 ? `${(totalSaves/1000000).toFixed(1)}M` : 
                     totalSaves > 1000 ? `${(totalSaves/1000).toFixed(1)}K` : 
                     totalSaves.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">유료 인플루언서</p>
                  <p className="text-lg font-semibold text-gray-900">{paidInfluencers}명</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 캠페인 리스트 제어 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">캠페인별 성과</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="캠페인 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as 'all' | 'active')}>
            <TabsList className="grid w-full grid-cols-2 lg:w-auto">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="active">활성</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as 'name' | 'performance' | 'influencers' | 'views' | 'emv' | 'roas')}>
            <SelectTrigger className="w-40">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emv">EMV순</SelectItem>
              <SelectItem value="roas">ROAS순</SelectItem>
              <SelectItem value="performance">성과순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="influencers">인플루언서수순</SelectItem>
              <SelectItem value="views">조회수순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 결과 요약 */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{filteredCampaigns.length}개 캠페인이 조회되었습니다</span>
          <span>페이지 {currentPage} / {totalPages} • 총 {totalInfluencers}명의 인플루언서</span>
        </div>
      </div>

      {/* 캠페인 목록 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {currentCampaigns.map(({ campaign, stats }) => {
            // 팔로워 유형별 데이터 (도넛 차트용)
            const followerTypeData = Object.entries(stats.followerTypes).map(([type, count]) => ({
              name: type,
              value: count,
              color: followerTypeColors[type as keyof typeof followerTypeColors]
            }));

            return (
              <Card key={campaign} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-slate-900 text-base truncate" title={campaign}>
                        {campaign}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        {stats.influencerCount}명 • {stats.countries}개국
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* EMV & ROAS 핵심 지표 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <p className="text-xs text-blue-700 font-medium">EMV</p>
                          <Button variant="ghost" size="sm" className="h-3 w-3 p-0 text-blue-600" title="EMV = [조회수 × 0.03] + [좋아요 × 0.1] + [댓글 × 0.4]">
                            <Info className="w-2 h-2" />
                          </Button>
                        </div>
                        <p className="text-sm font-semibold text-blue-600">
                          ${stats.totalEMV > 1000000 ? `${(stats.totalEMV/1000000).toFixed(1)}M` : 
                             stats.totalEMV > 1000 ? `${(stats.totalEMV/1000).toFixed(1)}K` : 
                             Math.floor(stats.totalEMV).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-700 font-medium">ROAS</p>
                        <p className="text-sm font-semibold text-green-600">
                          {stats.avgROAS > 1000 ? `${Math.floor(stats.avgROAS).toLocaleString()}%` : `${stats.avgROAS.toFixed(1)}%`}
                        </p>
                      </div>
                    </div>

                    {/* 기본 지표 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-emerald-50 rounded-lg">
                        <p className="text-xs text-slate-600">조회수</p>
                        <p className="text-sm font-semibold text-emerald-600">
                          {stats.views > 1000000 ? `${(stats.views/1000000).toFixed(1)}M` : 
                           stats.views > 1000 ? `${(stats.views/1000).toFixed(1)}K` : 
                           stats.views.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded-lg">
                        <p className="text-xs text-slate-600">회신율</p>
                        <p className="text-sm font-semibold text-orange-600">
                          {stats.avgResponseRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* 보조 지표 (좋아요, 댓글) */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <p className="text-xs text-gray-600">좋아요</p>
                        <p className="text-sm font-semibold text-red-600">
                          {stats.likes > 1000000 ? `${(stats.likes/1000000).toFixed(1)}M` : 
                           stats.likes > 1000 ? `${(stats.likes/1000).toFixed(1)}K` : 
                           stats.likes.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-amber-50 rounded-lg">
                        <p className="text-xs text-gray-600">댓글</p>
                        <p className="text-sm font-semibold text-amber-600">
                          {stats.comments > 1000000 ? `${(stats.comments/1000000).toFixed(1)}M` : 
                           stats.comments > 1000 ? `${(stats.comments/1000).toFixed(1)}K` : 
                           stats.comments.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* 팔로워 유형 분포 */}
                    <div>
                      <h4 className="text-xs font-medium text-slate-700 mb-2">팔로워 유형</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={followerTypeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={15}
                                outerRadius={30}
                                paddingAngle={1}
                                dataKey="value"
                              >
                                {followerTypeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-1">
                          {followerTypeData.slice(0, 2).map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-xs text-slate-600">{item.name}</span>
                              </div>
                              <span className="text-xs font-medium text-slate-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 액션 */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onCampaignSelect?.(campaign)}
                      className="w-full bg-white hover:bg-slate-50 border-slate-200"
                    >
                      상세 분석
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* 리스트 뷰 */
        <Card className="border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left p-4 font-medium text-slate-700">캠페인</th>
                  <th className="text-center p-4 font-medium text-slate-700">EMV</th>
                  <th className="text-center p-4 font-medium text-slate-700">ROAS</th>
                  <th className="text-center p-4 font-medium text-slate-700">인플루언서</th>
                  <th className="text-center p-4 font-medium text-slate-700">조회수</th>
                  <th className="text-center p-4 font-medium text-slate-700">회신율</th>
                  <th className="text-center p-4 font-medium text-slate-700">좋아요</th>
                  <th className="text-center p-4 font-medium text-slate-700">댓글</th>
                  <th className="text-center p-4 font-medium text-slate-700">액션</th>
                </tr>
              </thead>
              <tbody>
                {currentCampaigns.map(({ campaign, stats }, index) => (
                  <tr key={campaign} className={`border-b border-slate-100 hover:bg-slate-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-slate-900">{campaign}</div>
                        <div className="text-sm text-slate-500">{stats.countries}개국</div>
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <div className="font-medium text-blue-600">
                        ${stats.totalEMV > 1000 ? `${(stats.totalEMV/1000).toFixed(1)}K` : Math.floor(stats.totalEMV).toLocaleString()}
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <div className="font-medium text-green-600">
                        {stats.avgROAS > 1000 ? `${Math.floor(stats.avgROAS).toLocaleString()}%` : `${stats.avgROAS.toFixed(1)}%`}
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <div className="font-medium text-slate-900">{stats.influencerCount}명</div>
                      <div className="text-xs text-slate-500">유료: {stats.paidCount}명</div>
                    </td>
                    <td className="text-center p-4 font-medium text-slate-900">
                      {stats.views.toLocaleString()}
                    </td>
                    <td className="text-center p-4">
                      <span className="font-medium text-slate-900">{stats.avgResponseRate.toFixed(1)}%</span>
                    </td>
                    <td className="text-center p-4">
                      <div className="font-medium text-red-600">
                        {stats.likes > 1000000 ? `${(stats.likes/1000000).toFixed(1)}M` : 
                         stats.likes > 1000 ? `${(stats.likes/1000).toFixed(1)}K` : 
                         stats.likes.toLocaleString()}
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <div className="font-medium text-amber-600">
                        {stats.comments > 1000000 ? `${(stats.comments/1000000).toFixed(1)}M` : 
                         stats.comments > 1000 ? `${(stats.comments/1000).toFixed(1)}K` : 
                         stats.comments.toLocaleString()}
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onCampaignSelect?.(campaign)}
                        className="bg-white hover:bg-slate-50 border-slate-200"
                      >
                        분석
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 페이지네이션 */}
      {filteredCampaigns.length > itemsPerPage && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(Math.max(1, currentPage - 1));
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  size="default"
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // 현재 페이지 주변 페이지만 표시
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={page === currentPage}
                        className="cursor-pointer"
                        size="icon"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(Math.min(totalPages, currentPage + 1));
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  size="default"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 빈 상태 */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-lg font-medium">검색 결과가 없습니다</p>
          <p className="text-slate-400 text-sm mt-1">다른 검색어나 필터를 사용해보세요</p>
        </div>
      )}

      {/* 세부 분석 섹션들 */}
      <div className="space-y-6 mt-8">
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
                onClick={() => toggleAnalysisSection('responseRate')}
                className="gap-2"
              >
                {expandedAnalysisSection === 'responseRate' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expandedAnalysisSection === 'responseRate' ? '접기' : '펼치기'}
              </Button>
            </div>
          </CardHeader>

          {expandedAnalysisSection === 'responseRate' && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            <Cell key={`cell-${index}`} fill={Object.values(chartColors)[index % Object.values(chartColors).length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '회신율']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

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
                        <Bar dataKey="value" fill={chartColors.emerald} radius={[4, 4, 0, 0]} />
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
                onClick={() => toggleAnalysisSection('views')}
                className="gap-2"
              >
                {expandedAnalysisSection === 'views' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expandedAnalysisSection === 'views' ? '접기' : '펼치기'}
              </Button>
            </div>
          </CardHeader>

          {expandedAnalysisSection === 'views' && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <Bar dataKey="value" fill={chartColors.purple} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

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
                        <Bar dataKey="value" fill={chartColors.slate} radius={[4, 4, 0, 0]} />
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
                onClick={() => toggleAnalysisSection('emv')}
                className="gap-2"
              >
                {expandedAnalysisSection === 'emv' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expandedAnalysisSection === 'emv' ? '접기' : '펼치기'}
              </Button>
            </div>
          </CardHeader>

          {expandedAnalysisSection === 'emv' && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <Bar dataKey="value" fill={chartColors.blue} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

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
                        <Bar dataKey="value" fill={chartColors.blue} radius={[4, 4, 0, 0]} />
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
                onClick={() => toggleAnalysisSection('roas')}
                className="gap-2"
              >
                {expandedAnalysisSection === 'roas' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expandedAnalysisSection === 'roas' ? '접기' : '펼치기'}
              </Button>
            </div>
          </CardHeader>

          {expandedAnalysisSection === 'roas' && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <Bar dataKey="value" fill={chartColors.emerald} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

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
                        <Bar dataKey="value" fill={chartColors.emerald} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* 저장수 분석 */}
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
                onClick={() => toggleAnalysisSection('saves')}
                className="gap-2"
              >
                {expandedAnalysisSection === 'saves' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expandedAnalysisSection === 'saves' ? '접기' : '펼치기'}
              </Button>
            </div>
          </CardHeader>

          {expandedAnalysisSection === 'saves' && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
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
                        <Bar dataKey="value" fill={chartColors.green} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}