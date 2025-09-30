import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from './ui/pagination';
import { InfluencerData } from '../App';
import { TrendingUp, Users, Eye, BookmarkIcon, MessageCircle, Calendar, DollarSign, Search, Filter, Grid3X3, List, ArrowUpDown, Info, Star, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface CampaignOverviewProps {
  data: InfluencerData[];
  onCampaignSelect?: (campaign: string) => void;
}

export function CampaignOverview({ data, onCampaignSelect }: CampaignOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'influencers' | 'views' | 'emv' | 'roas'>('emv');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 캠페인별 데이터 그룹핑
  const campaignGroups = data.reduce((acc, influencer) => {
    if (!acc[influencer.campaign]) {
      acc[influencer.campaign] = [];
    }
    acc[influencer.campaign].push(influencer);
    return acc;
  }, {} as Record<string, InfluencerData[]>);

  // 캠페인별 통계 계산
  const getCampaignStats = (campaignData: InfluencerData[]) => {
    const influencerCount = campaignData.length;
    const views = campaignData.reduce((sum, item) => sum + item.views, 0);
    const saves = campaignData.reduce((sum, item) => sum + item.saves, 0);
    const avgResponseRate = campaignData.length > 0 ? 
      campaignData.reduce((sum, item) => sum + item.responseRate, 0) / campaignData.length : 0;
    const comments = campaignData.reduce((sum, item) => sum + item.comments, 0);
    const likes = campaignData.reduce((sum, item) => sum + item.likes, 0);
    const paidCount = campaignData.filter(item => item.costType === '유가').length;
    const countries = Array.from(new Set(campaignData.map(item => item.country))).length;
    const followerTypes = campaignData.reduce((acc, item) => {
      acc[item.followerType] = (acc[item.followerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // EMV 및 ROAS 계산
    const totalEMV = campaignData.reduce((sum, item) => sum + item.emv, 0);
    const avgEMV = influencerCount > 0 ? totalEMV / influencerCount : 0;
    const totalCost = campaignData.reduce((sum, item) => sum + item.cost, 0);
    const avgROAS = campaignData.length > 0 ? 
      campaignData.reduce((sum, item) => sum + item.roas, 0) / campaignData.length : 0;

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
  const totalViews = data.reduce((sum, item) => sum + item.views, 0);
  const totalSaves = data.reduce((sum, item) => sum + item.saves, 0);
  const averageResponseRate = data.length > 0 ? data.reduce((sum, item) => sum + item.responseRate, 0) / data.length : 0;
  const totalComments = data.reduce((sum, item) => sum + item.comments, 0);
  const totalLikes = data.reduce((sum, item) => sum + item.likes, 0);
  const paidInfluencers = data.filter(item => item.costType === '유가').length;
  const activeCampaigns = Object.keys(campaignGroups).length;
  
  // EMV 및 ROAS 전체 통계
  const totalEMV = data.reduce((sum, item) => sum + item.emv, 0);
  const averageEMV = data.length > 0 ? totalEMV / data.length : 0;
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const averageROAS = data.length > 0 ? data.reduce((sum, item) => sum + item.roas, 0) / data.length : 0;

  // 팔로워 유형별 색상
  const followerTypeColors = {
    '메가': '#8B5CF6',
    '매크로': '#3B82F6', 
    '마이크로': '#10B981',
    '나노': '#F59E0B'
  };

  return (
    <div className="space-y-8">
      {/* 전체 요약 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">전체 캠페인 요약</h2>
          <Badge className="bg-blue-100 text-blue-800 border-0 font-medium">
            {activeCampaigns}개 캠페인
          </Badge>
        </div>
        
        {/* EMV & ROAS 핵심 지표 우선 배치 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm text-blue-700 font-medium">총 EMV</p>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-blue-600 hover:text-blue-800" title="EMV = [조회수 × 0.03] + [좋아요 × 0.1] + [댓글 × 0.4]">
                      <Info className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    ${totalEMV > 1000000 ? `${(totalEMV/1000000).toFixed(1)}M` : 
                       totalEMV > 1000 ? `${(totalEMV/1000).toFixed(1)}K` : 
                       Math.floor(totalEMV).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
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

          <Card className="border-orange-200 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
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

          <Card className="border-purple-200 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
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

        {/* 기본 성과 지표 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          
          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-2 lg:w-auto">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="active">활성</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
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
          {currentCampaigns.map(({ campaign, data: campaignData, stats }) => {
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
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                        className="cursor-pointer"
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
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
    </div>
  );
}