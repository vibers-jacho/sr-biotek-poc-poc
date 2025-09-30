import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Influencer } from '../types';
import { Users, TrendingUp, Eye, MessageCircle, DollarSign, Award, Star, Target, Info } from 'lucide-react';

interface StaffPerformanceBoardProps {
  data: Influencer[];
}

export function StaffPerformanceBoard({ data }: StaffPerformanceBoardProps) {
  // 담당자별 성과 집계 (EMV, ROAS 포함)
  const staffPerformance = data.reduce((acc, item) => {
    const existing = acc.find(x => x.staff === item.staff);
    if (existing) {
      existing.totalViews += item.views;
      existing.totalSaves += item.saves;
      existing.totalLikes += item.likes;
      existing.totalComments += item.comments;
      existing.totalShares += item.shares;
      existing.totalEMV += item.emv;
      existing.totalCost += item.cost;
      existing.responseRates.push(item.responseRate);
      existing.roasValues.push(item.roas);
      existing.influencerCount += 1;
      existing.paidCount += item.costType === '유가' ? 1 : 0;
    } else {
      acc.push({
        staff: item.staff,
        totalViews: item.views,
        totalSaves: item.saves,
        totalLikes: item.likes,
        totalComments: item.comments,
        totalShares: item.shares,
        totalEMV: item.emv,
        totalCost: item.cost,
        responseRates: [item.responseRate],
        roasValues: [item.roas],
        influencerCount: 1,
        paidCount: item.costType === '유가' ? 1 : 0
      });
    }
    return acc;
  }, [] as {
    staff: string;
    totalViews: number;
    totalSaves: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalEMV: number;
    totalCost: number;
    responseRates: number[];
    roasValues: number[];
    influencerCount: number;
    paidCount: number;
  }[]);

  // 평균 회신율 및 ROAS 계산
  const staffWithAvg = staffPerformance.map(staff => ({
    ...staff,
    avgResponseRate: staff.responseRates.reduce((sum, rate) => sum + rate, 0) / staff.responseRates.length,
    avgROAS: staff.roasValues.reduce((sum, roas) => sum + roas, 0) / staff.roasValues.length,
    avgEMV: staff.totalEMV / staff.influencerCount
  }));

  // 담당자별 캠페인 다양성
  const staffCampaigns = data.reduce((acc, item) => {
    if (!acc[item.staff]) {
      acc[item.staff] = new Set();
    }
    acc[item.staff].add(item.campaign);
    return acc;
  }, {} as Record<string, Set<string>>);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // 최고 성과자 찾기 (EMV 기준)
  const topPerformerByEMV = staffWithAvg.reduce((best, current) => 
    current.totalEMV > best.totalEMV ? current : best
  );
  
  const topPerformerByROAS = staffWithAvg.reduce((best, current) => 
    current.avgROAS > best.avgROAS ? current : best
  );
  
  const topPerformerByResponseRate = staffWithAvg.reduce((best, current) => 
    current.avgResponseRate > best.avgResponseRate ? current : best
  );

  return (
    <div className="space-y-8">
      {/* 전체 요약 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">담당자별 성과 분석</h2>
          <Badge className="bg-blue-100 text-blue-800 border-0 font-medium">
            {staffWithAvg.length}명 담당자
          </Badge>
        </div>

        {/* 하이라이트 카드 - EMV & ROAS 중심 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-blue-200 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm font-medium text-blue-700">EMV 최고 성과자</p>
                    <Info className="w-3 h-3 text-blue-600" title="EMV = [조회수 × 0.03] + [좋아요 × 0.1] + [댓글 × 0.4]" />
                  </div>
                  <p className="text-xl font-bold text-blue-800">{topPerformerByEMV.staff}</p>
                  <p className="text-sm text-blue-600">총 EMV ${topPerformerByEMV.totalEMV.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-sm bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">ROAS 최고 성과자</p>
                  <p className="text-xl font-bold text-green-800">{topPerformerByROAS.staff}</p>
                  <p className="text-sm text-green-600">평균 ROAS {topPerformerByROAS.avgROAS.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 shadow-sm bg-gradient-to-r from-emerald-50 to-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">회신율 최고 성과자</p>
                  <p className="text-xl font-bold text-emerald-800">{topPerformerByResponseRate.staff}</p>
                  <p className="text-sm text-emerald-600">평균 회신율 {topPerformerByResponseRate.avgResponseRate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 담당자별 상세 카드 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">담당자별 상세 성과</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {staffWithAvg.map((staff, index) => (
            <Card key={staff.staff} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-700">
                        {staff.staff.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-slate-900">{staff.staff}</CardTitle>
                      <p className="text-sm text-slate-500">{staffCampaigns[staff.staff]?.size || 0}개 캠페인</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* EMV & ROAS 핵심 지표 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <p className="text-xs text-blue-700 font-medium">총 EMV</p>
                        <Info className="w-2 h-2 text-blue-600" title="EMV = [조회수 × 0.03] + [좋아요 × 0.1] + [댓글 × 0.4]" />
                      </div>
                      <p className="text-lg font-semibold text-blue-600">
                        ${staff.totalEMV > 1000 ? `${(staff.totalEMV/1000).toFixed(1)}K` : Math.floor(staff.totalEMV).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700 font-medium">평균 ROAS</p>
                      <p className="text-lg font-semibold text-green-600">
                        {staff.avgROAS > 1000 ? `${Math.floor(staff.avgROAS).toLocaleString()}%` : `${staff.avgROAS.toFixed(1)}%`}
                      </p>
                    </div>
                  </div>

                  {/* 기본 지표 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">관리 인플루언서</p>
                      <p className="text-lg font-semibold text-slate-700">{staff.influencerCount}명</p>
                    </div>
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">평균 회신율</p>
                      <p className="text-lg font-semibold text-slate-700">{staff.avgResponseRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* 상세 지표 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-600">평균 EMV</span>
                      </div>
                      <span className="font-medium text-slate-900">
                        ${staff.avgEMV > 1000 ? `${(staff.avgEMV/1000).toFixed(1)}K` : Math.floor(staff.avgEMV).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-600">총 조회수</span>
                      </div>
                      <span className="font-medium text-slate-900">{staff.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-600">총 비용</span>
                      </div>
                      <span className="font-medium text-slate-900">
                        ${staff.totalCost > 1000 ? `${(staff.totalCost/1000).toFixed(1)}K` : staff.totalCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-600">유료 협업</span>
                      </div>
                      <span className="font-medium text-slate-900">{staff.paidCount}건</span>
                    </div>
                  </div>


                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 비교 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 담당자별 총 조회수 */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-slate-700 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              담당자별 총 조회수
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffWithAvg}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="staff" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value) => [value.toLocaleString(), '조회수']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="totalViews" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 담당자별 평균 회신율 */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              담당자별 평균 회신율
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffWithAvg}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="staff" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(1)}%`, '회신율']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="avgResponseRate" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 담당자별 분포 차트 */}
      <div className="grid grid-cols-1 gap-6">
        {/* 인플루언서 분포 */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-slate-700 flex items-center gap-2">
              <Users className="w-5 h-5" />
              담당자별 인플루언서 분포
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={staffWithAvg}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.staff}: ${entry.influencerCount}명`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="influencerCount"
                >
                  {staffWithAvg.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
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


      </div>
    </div>
  );
}