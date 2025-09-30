import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { InfluencerData } from '../App';
import { Users } from 'lucide-react';

interface InfluencerTableProps {
  data: InfluencerData[];
  onPerformanceClick: (influencer: InfluencerData) => void;
}

export function InfluencerTable({ data, onPerformanceClick }: InfluencerTableProps) {
  const getFollowerTypeBadgeColor = (type: string) => {
    switch (type) {
      case '메가': return 'bg-purple-100 text-purple-800';
      case '매크로': return 'bg-blue-100 text-blue-800';
      case '마이크로': return 'bg-green-100 text-green-800';
      case '나노': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCostTypeBadgeColor = (type: string) => {
    return type === '유가' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900">인플루언서 목록</CardTitle>
              <p className="text-sm text-slate-500 mt-1">{data.length}명의 인플루언서가 조회되었습니다</p>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-0 font-medium">
            총 {data.length}명
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/30">
                <TableHead className="text-slate-600 font-medium pl-6">인플루언서</TableHead>
                <TableHead className="text-slate-600 font-medium">국가</TableHead>
                <TableHead className="text-slate-600 font-medium">팔로워 유형</TableHead>
                <TableHead className="text-slate-600 font-medium">팔로워 수</TableHead>
                <TableHead className="text-slate-600 font-medium">담당자</TableHead>
                <TableHead className="text-slate-600 font-medium">캠페인</TableHead>
                <TableHead className="text-slate-600 font-medium">비용</TableHead>
                <TableHead className="text-slate-600 font-medium">조회수</TableHead>
                <TableHead className="text-slate-600 font-medium">저장수</TableHead>
                <TableHead className="text-slate-600 font-medium">날짜</TableHead>
                <TableHead className="text-slate-600 font-medium">성과</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((influencer, index) => (
                <TableRow 
                  key={influencer.id} 
                  className={`border-slate-100 hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-700">
                          {influencer.name.charAt(1).toUpperCase()}
                        </span>
                      </div>
                      <div className="font-medium text-slate-900">{influencer.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`border-slate-200 ${influencer.country === '정보없음' ? 'text-slate-400 bg-slate-50' : 'text-slate-600 bg-white'}`}
                    >
                      {influencer.country}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getFollowerTypeBadgeColor(influencer.followerType)} border-0 font-medium`}>
                      {influencer.followerType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-900 font-medium">{formatNumber(influencer.followerCount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-600">
                          {influencer.staff.charAt(0)}
                        </span>
                      </div>
                      <span className="text-slate-700">{influencer.staff}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-32 truncate text-slate-700" title={influencer.campaign}>
                    {influencer.campaign}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getCostTypeBadgeColor(influencer.costType)} border-0 font-medium`}>
                      {influencer.costType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-900 font-medium">{formatNumber(influencer.views)}</TableCell>
                  <TableCell className="text-slate-900 font-medium">{formatNumber(influencer.saves)}</TableCell>
                  <TableCell className="text-slate-500 font-mono text-sm">{influencer.date}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onPerformanceClick(influencer)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                    >
                      성과 보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-lg font-medium">필터 조건에 맞는 인플루언서가 없습니다</p>
            <p className="text-slate-400 text-sm mt-1">다른 조건으로 검색해보세요</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}