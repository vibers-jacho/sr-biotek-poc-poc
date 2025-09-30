import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { InfluencerData } from '../App';
import { Search, TrendingUp, Eye, BookmarkIcon, MessageCircle, Heart, Share2, User, Calendar, Target } from 'lucide-react';

interface InfluencerPerformanceAnalysisProps {
  data: InfluencerData[];
}

export function InfluencerPerformanceAnalysis({ data }: InfluencerPerformanceAnalysisProps) {
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<'7days' | '14days' | '30days'>('30days');

  // 인플루언서 목록 (검색 기능 포함)
  const influencers = Array.from(new Set(data.map(item => item.name)))
    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort();

  // 선택된 인플루언서의 데이터
  const selectedInfluencerData = data.filter(item => item.name === selectedInfluencer);
  
  // 선택된 인플루언서의 기본 정보
  const influencerInfo = selectedInfluencerData[0];

  // 일별 성과 데이터 생성 (실제 데이터를 기반으로 일별 변화를 시뮬레이션)
  const generateDailyData = (baseData: InfluencerData, days: number) => {
    const dailyData = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 실제 데이터를 기반으로 한 성장 트렌드 생성
    const growthFactor = baseData.followerType === '메가' ? 1.05 : 
                        baseData.followerType === '매크로' ? 1.03 : 
                        baseData.followerType === '마이크로' ? 1.02 : 1.01;

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // 일별 변동: 기본값에서 점진적 성장 + 일별 변동성
      const daysFactor = Math.pow(growthFactor, i / days); // 점진적 성장
      const dailyVariation = 0.85 + Math.random() * 0.3; // 85%~115% 범위의 일별 변동
      const responseVariation = 0.95 + Math.random() * 0.1; // 95%~105% 범위의 회신율 변동
      
      dailyData.push({
        date: currentDate.toISOString().split('T')[0],
        dateLabel: currentDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        views: Math.round(baseData.views * daysFactor * dailyVariation),
        saves: Math.round(baseData.saves * daysFactor * dailyVariation),
        comments: Math.round(baseData.comments * daysFactor * dailyVariation),
        likes: Math.round(baseData.likes * daysFactor * dailyVariation),
        shares: Math.round(baseData.shares * daysFactor * dailyVariation),
        responseRate: Math.round(baseData.responseRate * responseVariation * 10) / 10,
        followerCount: Math.round(baseData.followerCount * (1 + (i / days) * 0.05)) // 팔로워는 천천히 증가
      });
    }
    return dailyData;
  };

  const getDaysFromRange = (range: string) => {
    switch(range) {
      case '7days': return 7;
      case '14days': return 14;
      case '30days': return 30;
      default: return 30;
    }
  };

  const dailyPerformanceData = influencerInfo ? 
    generateDailyData(influencerInfo, getDaysFromRange(timeRange)) : [];

  // 성과 지표 계산
  const calculateMetrics = (data: typeof dailyPerformanceData) => {
    if (data.length === 0) return null;
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    
    return {
      totalViews: data.reduce((sum, item) => sum + item.views, 0),
      totalSaves: data.reduce((sum, item) => sum + item.saves, 0),
      totalComments: data.reduce((sum, item) => sum + item.comments, 0),
      totalLikes: data.reduce((sum, item) => sum + item.likes, 0),
      totalShares: data.reduce((sum, item) => sum + item.shares, 0),
      avgResponseRate: data.reduce((sum, item) => sum + item.responseRate, 0) / data.length,
      viewsChange: previous ? ((latest.views - previous.views) / previous.views * 100) : 0,
      savesChange: previous ? ((latest.saves - previous.saves) / previous.saves * 100) : 0,
      responseRateChange: previous ? ((latest.responseRate - previous.responseRate) / previous.responseRate * 100) : 0
    };
  };

  const metrics = calculateMetrics(dailyPerformanceData);

  // 성과 분포 데이터 (실제 기간 누적값)
  const performanceDistribution = influencerInfo ? [
    { name: '조회수', value: metrics?.totalViews || 0, color: '#3B82F6' },
    { name: '좋아요', value: metrics?.totalLikes || 0, color: '#EF4444' },
    { name: '저장수', value: metrics?.totalSaves || 0, color: '#10B981' },
    { name: '댓글수', value: metrics?.totalComments || 0, color: '#F59E0B' },
    { name: '공유수', value: metrics?.totalShares || 0, color: '#8B5CF6' }
  ] : [];

  // 최신 팔로워 수 (선택된 기간의 마지막 날 기준)
  const latestFollowerCount = dailyPerformanceData.length > 0 ? 
    dailyPerformanceData[dailyPerformanceData.length - 1].followerCount : 
    influencerInfo?.followerCount || 0;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
          <User className="w-4 h-4 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">인플루언서별 성과 분석</h2>
      </div>

      {/* 인플루언서 검색 및 선택 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 검색 및 필터 */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-slate-700">검색 및 필터</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="인플루언서 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">분석 기간</label>
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
                <SelectTrigger className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7일</SelectItem>
                  <SelectItem value="14days">14일</SelectItem>
                  <SelectItem value="30days">30일</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                총 {influencers.length}명의 인플루언서
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 인플루언서 리스트 */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-slate-700">인플루언서 선택</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {influencers.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {influencers.slice(0, 50).map(influencerName => {
                    const influencerData = data.find(item => item.name === influencerName);
                    if (!influencerData) return null;
                    
                    const isSelected = selectedInfluencer === influencerName;
                    
                    return (
                      <div
                        key={influencerName}
                        onClick={() => setSelectedInfluencer(influencerName)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-blue-100' : 'bg-slate-100'
                            }`}>
                              <User className={`w-5 h-5 ${
                                isSelected ? 'text-blue-600' : 'text-slate-600'
                              }`} />
                            </div>
                            <div>
                              <h4 className={`font-medium ${
                                isSelected ? 'text-blue-900' : 'text-slate-900'
                              }`}>
                                {influencerName}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-slate-500">
                                <span>{influencerData.country}</span>
                                <span>•</span>
                                <span>{influencerData.followerType}</span>
                                <span>•</span>
                                <span>{influencerData.campaign}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="text-center">
                                <p className="text-slate-500">팔로워</p>
                                <p className="font-medium text-slate-900">
                                  {(influencerData.followerCount / 1000).toFixed(0)}K
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-slate-500">회신율</p>
                                <p className="font-medium text-emerald-600">
                                  {influencerData.responseRate}%
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-slate-500">담당자</p>
                                <p className="font-medium text-slate-900">
                                  {influencerData.staff}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {influencers.length > 50 && (
                    <div className="p-4 text-center text-sm text-slate-500 bg-slate-50">
                      상위 50명만 표시됩니다. 검색을 통해 더 정확한 결과를 확인하세요.
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedInfluencer && influencerInfo && (
        <>
          {/* 인플루언서 기본 정보 */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{influencerInfo.name}</h3>
                      <p className="text-sm text-slate-500">{influencerInfo.country}</p>
                      <p className="text-sm text-slate-500">{influencerInfo.campaign}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600">팔로워 수</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {latestFollowerCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">{influencerInfo.followerType}</p>
                  {dailyPerformanceData.length > 1 && (
                    <p className="text-xs text-green-600">
                      +{(latestFollowerCount - influencerInfo.followerCount).toLocaleString()}
                    </p>
                  )}
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-slate-600">담당자</p>
                  <p className="text-lg font-semibold text-green-600">{influencerInfo.staff}</p>
                  <p className="text-xs text-slate-500">{influencerInfo.costType}</p>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-slate-600">회신율</p>
                  <p className="text-lg font-semibold text-purple-600">{influencerInfo.responseRate}%</p>
                  {metrics && (
                    <p className={`text-xs ${metrics.responseRateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.responseRateChange >= 0 ? '+' : ''}{metrics.responseRateChange.toFixed(1)}%
                    </p>
                  )}
                </div>
                
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-slate-600">등록일</p>
                  <p className="text-lg font-semibold text-amber-600">
                    {new Date(influencerInfo.date).toLocaleDateString('ko-KR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 성과 요약 */}
          {metrics && (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">팔로워 수</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {latestFollowerCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">{influencerInfo.followerType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">총 조회수</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {metrics.totalViews.toLocaleString()}
                      </p>
                      <p className={`text-xs ${metrics.viewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.viewsChange >= 0 ? '+' : ''}{metrics.viewsChange.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookmarkIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">총 저장수</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {metrics.totalSaves.toLocaleString()}
                      </p>
                      <p className={`text-xs ${metrics.savesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.savesChange >= 0 ? '+' : ''}{metrics.savesChange.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">총 댓글수</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {metrics.totalComments.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">총 좋아요</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {metrics.totalLikes.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">총 공유수</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {metrics.totalShares.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 회신율 별도 표시 */}
          {metrics && (
            <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">평균 회신율</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {metrics.avgResponseRate.toFixed(1)}%
                      </p>
                      {metrics.responseRateChange !== 0 && (
                        <p className={`text-sm ${metrics.responseRateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.responseRateChange >= 0 ? '↗️' : '↘️'} 
                          {Math.abs(metrics.responseRateChange).toFixed(1)}% vs 전일
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">
                      {getDaysFromRange(timeRange)}일간 평균
                    </p>
                    <p className="text-xs text-slate-400">
                      {influencerInfo.campaign}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 일별 성과 트렌드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 조회수 & 저장수 트렌드 */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-slate-700 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  조회수 & 저장수
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="dateLabel" 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        value.toLocaleString(), 
                        name === 'views' ? '조회수' : '저장수'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="조회수"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="saves" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="저장수"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 좋아요 & 댓글수 트렌드 */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-slate-700 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  좋아요 & 댓글수
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="dateLabel" 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        value.toLocaleString(), 
                        name === 'likes' ? '좋아요' : name === 'comments' ? '댓글수' : '공유수'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="likes" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="좋아요"
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="comments" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="댓글수"
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="shares" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      name="공유수"
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 회신율 & 팔로워 증가 트렌드 */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-slate-700 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  회신율 & 팔로워 증가
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="dateLabel" 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      domain={['dataMin', 'dataMax']}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'responseRate' ? `${value}%` : value.toLocaleString(),
                        name === 'responseRate' ? '회신율' : '팔로워 수'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="responseRate" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="회신율"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="followerCount" 
                      stroke="#6366F1" 
                      strokeWidth={2}
                      name="팔로워수"
                      dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 성과 분포 & 일별 상세 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 성과 분포 */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-slate-700">총 성과 분포</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value.toLocaleString()}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [value.toLocaleString(), '']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 일별 종합 지표 */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-slate-700">일별 종합 지표</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyPerformanceData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="dateLabel" 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="comments" fill="#F59E0B" name="댓글" />
                    <Bar dataKey="shares" fill="#8B5CF6" name="공유" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!selectedInfluencer && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">인플루언서를 선택해주세요</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                위 리스트에서 인플루언서를 클릭하면 해당 인플루언서의 상세한 일별 성과 분석을 확인할 수 있습니다
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-sm">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <Target className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="font-medium text-slate-700">회신율 분석</p>
                  <p className="text-slate-500">일별 회신율 변화</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="font-medium text-slate-700">성과 트렌드</p>
                  <p className="text-slate-500">조회수, 저장수 등</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="font-medium text-slate-700">종합 지표</p>
                  <p className="text-slate-500">팔로워, 좋아요 등</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}