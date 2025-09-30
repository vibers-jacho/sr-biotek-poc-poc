import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { InfluencerData } from '../App';
import { Eye, Heart, MessageCircle, Bookmark, Share, Users } from 'lucide-react';

interface PerformanceModalProps {
  influencer: InfluencerData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PerformanceModal({ influencer, isOpen, onClose }: PerformanceModalProps) {
  if (!influencer) return null;

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getFollowerTypeBadgeColor = (type: string) => {
    switch (type) {
      case '메가': return 'bg-purple-100 text-purple-800';
      case '매크로': return 'bg-blue-100 text-blue-800';
      case '마이크로': return 'bg-green-100 text-green-800';
      case '나노': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const performanceMetrics = [
    {
      icon: Users,
      label: '팔로워수',
      value: formatNumber(influencer.followerCount),
      color: 'text-blue-600'
    },
    {
      icon: Eye,
      label: '조회수',
      value: formatNumber(influencer.views),
      color: 'text-green-600'
    },
    {
      icon: Bookmark,
      label: '저장수',
      value: formatNumber(influencer.saves),
      color: 'text-purple-600'
    },
    {
      icon: MessageCircle,
      label: '댓글수',
      value: formatNumber(influencer.comments),
      color: 'text-orange-600'
    },
    {
      icon: Heart,
      label: '좋아요수',
      value: formatNumber(influencer.likes),
      color: 'text-red-600'
    },
    {
      icon: Share,
      label: '공유수',
      value: formatNumber(influencer.shares),
      color: 'text-indigo-600'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{influencer.name} 성과 분석</span>
            <Badge className={getFollowerTypeBadgeColor(influencer.followerType)}>
              {influencer.followerType}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">국가</p>
                <p className="font-medium">{influencer.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">담당자</p>
                <p className="font-medium">{influencer.staff}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">캠페인</p>
                <p className="font-medium">{influencer.campaign}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">비용 유형</p>
                <Badge className={influencer.costType === '유가' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {influencer.costType}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 회신율 */}
          <Card>
            <CardHeader>
              <CardTitle>회신율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span>회신율</span>
                    <span className="font-medium">{influencer.responseRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${influencer.responseRate}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{influencer.responseRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">응답률</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 성과 지표 */}
          <Card>
            <CardHeader>
              <CardTitle>성과 지표</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {performanceMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full bg-white ${metric.color}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{metric.label}</p>
                        <p className="text-xl font-bold">{metric.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 상세 분석 */}
          <Card>
            <CardHeader>
              <CardTitle>참여도 분석</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">참여도 지표</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">참여율 (좋아요/조회수)</span>
                      <span className="font-medium">
                        {((influencer.likes / influencer.views) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">저장율 (저장수/조회수)</span>
                      <span className="font-medium">
                        {((influencer.saves / influencer.views) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">댓글율 (댓글수/조회수)</span>
                      <span className="font-medium">
                        {((influencer.comments / influencer.views) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">공유율 (공유수/조회수)</span>
                      <span className="font-medium">
                        {((influencer.shares / influencer.views) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">팔로워 대비 성과</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">조회수/팔로워</span>
                      <span className="font-medium">
                        {((influencer.views / influencer.followerCount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">좋아요/팔로워</span>
                      <span className="font-medium">
                        {((influencer.likes / influencer.followerCount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">저장수/팔로워</span>
                      <span className="font-medium">
                        {((influencer.saves / influencer.followerCount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">댓글수/팔로워</span>
                      <span className="font-medium">
                        {((influencer.comments / influencer.followerCount) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">종합 평가</h4>
                <p className="text-sm text-gray-700">
                  이 인플루언서는 {influencer.followerType} 인플루언서로서 
                  {influencer.responseRate >= 80 ? ' 우수한' : influencer.responseRate >= 60 ? ' 양호한' : ' 개선이 필요한'} 
                  회신율({influencer.responseRate.toFixed(1)}%)을 보이고 있으며, 
                  총 {formatNumber(influencer.views)}회의 조회수와 {formatNumber(influencer.saves)}건의 저장수를 기록했습니다.
                  참여율은 {((influencer.likes / influencer.views) * 100).toFixed(1)}%로 
                  {((influencer.likes / influencer.views) * 100) >= 5 ? '높은' : '평균적인'} 수준입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}