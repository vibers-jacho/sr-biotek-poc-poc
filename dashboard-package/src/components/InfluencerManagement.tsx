import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { 
  Search, 
  Edit,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { InfluencerData } from '../App';

// 확장된 인플루언서 데이터 타입
type ExtendedInfluencerData = InfluencerData & {
  lastUpdate: string;
  isSubscribed: boolean;
  contentType: string;
  interviewTag: string;
  reviewCount: number;
  latestScore: number;
  rank: number;
};

interface InfluencerManagementProps {
  data: InfluencerData[];
}

export function InfluencerManagement({ data }: InfluencerManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [rangeFilter, setRangeFilter] = useState('all');
  const [contentFilter, setContentFilter] = useState('all');
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);

  // 실제 데이터에 새로운 필드 추가 (Mock)
  const extendedData: ExtendedInfluencerData[] = data.map((item, index) => ({
    ...item,
    lastUpdate: `2024년 ${8 + Math.floor(Math.random() * 2)}월 ${1 + Math.floor(Math.random() * 28)}일`,
    isSubscribed: Math.random() > 0.3,
    contentType: ['인스타 피드', '인스타 스토리', '유튜브 쇼츠', '틱톡'][Math.floor(Math.random() * 4)],
    interviewTag: Math.random() > 0.7 ? 'interview' : '',
    reviewCount: Math.floor(Math.random() * 50),
    latestScore: Math.floor(70 + Math.random() * 30),
    rank: index + 1
  }));

  // 필터링
  const filteredData = extendedData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'subscribed' ? item.isSubscribed : !item.isSubscribed);
    const matchesType = typeFilter === 'all' || item.followerType === typeFilter;
    const matchesRange = rangeFilter === 'all' || item.costType === rangeFilter;
    const matchesContent = contentFilter === 'all' || item.contentType === contentFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesRange && matchesContent;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInfluencers(filteredData.map(item => item.id));
    } else {
      setSelectedInfluencers([]);
    }
  };

  const handleSelectInfluencer = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedInfluencers(prev => [...prev, id]);
    } else {
      setSelectedInfluencers(prev => prev.filter(item => item !== id));
    }
  };

  return (
    <div className="bg-white">
      {/* 헤더 */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">인플루언서 관리</h1>
          <div className="text-sm text-gray-500">총 {filteredData.length}명 · 1-50명 표시 · 50명</div>
        </div>

        {/* 필터 섹션 */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="인플루언서 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="모든 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="subscribed">구독중</SelectItem>
              <SelectItem value="unsubscribed">구독안함</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="모든 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 유형</SelectItem>
              <SelectItem value="메가">메가</SelectItem>
              <SelectItem value="매크로">매크로</SelectItem>
              <SelectItem value="마이크로">마이크로</SelectItem>
              <SelectItem value="나노">나노</SelectItem>
            </SelectContent>
          </Select>

          <Select value={rangeFilter} onValueChange={setRangeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="모든 범위" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 범위</SelectItem>
              <SelectItem value="유가">유가</SelectItem>
              <SelectItem value="무가">무가</SelectItem>
            </SelectContent>
          </Select>

          <Select value={contentFilter} onValueChange={setContentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="모든 컨텐츠" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 컨텐츠</SelectItem>
              <SelectItem value="인스타 피드">인스타 피드</SelectItem>
              <SelectItem value="인스타 스토리">인스타 스토리</SelectItem>
              <SelectItem value="유튜브 쇼츠">유튜브 쇼츠</SelectItem>
              <SelectItem value="틱톡">틱톡</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 p-3 text-left">
                <Checkbox 
                  checked={selectedInfluencers.length === filteredData.length && filteredData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">인플루언서</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">최신 업데이트</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">구독 여부</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">모든 일괄</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">모든 컨텐츠</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">인터뷰</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">병원</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">리뷰</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">최신수</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">리더보드</th>
              <th className="w-12 p-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((influencer) => (
              <tr key={influencer.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <Checkbox 
                    checked={selectedInfluencers.includes(influencer.id)}
                    onCheckedChange={(checked) => handleSelectInfluencer(influencer.id, checked as boolean)}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{influencer.name}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                        https://instagram.com/{influencer.name.replace('@', '')}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{influencer.lastUpdate}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                    {influencer.isSubscribed && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  </div>
                </td>
                <td className="p-3">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white"></div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-600">{influencer.contentType}</span>
                    <Edit className="w-3 h-3 text-gray-400" />
                  </div>
                </td>
                <td className="p-3">
                  {influencer.interviewTag && (
                    <Badge className="bg-green-100 text-green-800 text-xs">인터뷰</Badge>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{influencer.campaign}</span>
                    <Edit className="w-3 h-3 text-gray-400" />
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-sm text-gray-600">1</span>
                </td>
                <td className="p-3">
                  <span className="text-sm text-gray-600">-</span>
                </td>
                <td className="p-3">
                  <span className="text-sm text-gray-600">1</span>
                </td>
                <td className="p-3">
                  <span className="text-sm text-gray-600">-</span>
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" className="p-1">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}