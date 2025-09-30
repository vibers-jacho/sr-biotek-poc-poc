import { useState } from 'react';
import { VisualizationBoard } from './components/VisualizationBoard';
import { StaffPerformanceBoard } from './components/StaffPerformanceBoard';
import { CampaignOverview } from './components/CampaignOverview';
import { InfluencerManagement } from './components/InfluencerManagement';
import { DateRangePicker } from './components/DateRangePicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Users, Target, BarChart3, Settings, Bell, Search, Menu, ChevronRight } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

export type InfluencerData = {
  id: string;
  name: string;
  country: string;
  followerType: '메가' | '매크로' | '마이크로' | '나노';
  followerCount: number;
  staff: string;
  campaign: string;
  costType: '무가' | '유가';
  responseRate: number;
  views: number;
  saves: number;
  comments: number;
  likes: number;
  shares: number;
  date: string;
  emv: number; // Earned Media Value
  roas: number; // Return on Ad Spend
  cost: number; // 마케팅 비용
};

export type FilterState = {
  dateRange: { start: string; end: string };
  staff: string[];
  countries: string[];
  followerTypes: string[];
  costTypes: string[];
  campaigns: string[];
};

// EMV 계산 함수: [Views × 0.03] + [Likes × 0.1] + [Comments × 0.4]
const calculateEMV = (views: number, likes: number, comments: number): number => {
  return (views * 0.03) + (likes * 0.1) + (comments * 0.4);
};

// 비용 계산 함수 (팔로워 수와 타입에 따라)
const calculateCost = (followerCount: number, followerType: string, costType: string): number => {
  if (costType === '무가') return 0;
  
  const baseRate = followerType === '메가' ? 0.05 : 
                   followerType === '매크로' ? 0.08 : 
                   followerType === '마이크로' ? 0.12 : 0.15;
  
  return Math.floor(followerCount * baseRate);
};

// ROAS 계산 함수: (EMV / Cost) × 100, 무가의 경우 EMV 자체를 ROAS로 사용
const calculateROAS = (emv: number, cost: number): number => {
  if (cost === 0) return emv; // 무가의 경우 EMV를 ROAS로 사용
  return Math.floor((emv / cost) * 100);
};

// Mock data - 4개 클리닉 캠페인
const campaignNames = [
  'Dongan Central Clinic',
  'Oblive Clinic', 
  'Yuonne Clinic',
  'Benjamin Clinic'
];

// 기본 데이터 생성 후 EMV, ROAS 계산하는 헬퍼 함수
const createInfluencerWithMetrics = (baseData: Omit<InfluencerData, 'emv' | 'roas' | 'cost'>): InfluencerData => {
  const cost = calculateCost(baseData.followerCount, baseData.followerType, baseData.costType);
  const emv = calculateEMV(baseData.views, baseData.likes, baseData.comments);
  const roas = calculateROAS(emv, cost);
  
  return {
    ...baseData,
    cost,
    emv: Math.floor(emv),
    roas
  };
};

const mockInfluencers: InfluencerData[] = [
  // 8월 데이터
  createInfluencerWithMetrics({
    id: '1',
    name: '@beauty_guru_kr',
    country: '한국',
    followerType: '매크로',
    followerCount: 147832,
    staff: '김민주',
    campaign: 'Dongan Central Clinic',
    costType: '유가',
    responseRate: 73.2,
    views: 39547,
    saves: 1847,
    comments: 312,
    likes: 6234,
    shares: 187,
    date: '2025-08-25'
  }),
  createInfluencerWithMetrics({
    id: '2',
    name: '@lifestyle_jane',
    country: '미국',
    followerType: '메가',
    followerCount: 834726,
    staff: '박영수',
    campaign: 'Oblive Clinic',
    costType: '유가',
    responseRate: 48.7,
    views: 97834,
    saves: 2947,
    comments: 623,
    likes: 15689,
    shares: 334,
    date: '2025-08-28'
  }),
  createInfluencerWithMetrics({
    id: '3',
    name: '@micro_health',
    country: '일본',
    followerType: '마이크로',
    followerCount: 43291,
    staff: '이서연',
    campaign: 'Dongan Central Clinic',
    costType: '무가',
    responseRate: 84.1,
    views: 18476,
    saves: 1273,
    comments: 456,
    likes: 2847,
    shares: 93,
    date: '2025-08-30'
  }),
  createInfluencerWithMetrics({
    id: '4',
    name: '@nano_wellness',
    country: '정보없음',
    followerType: '나노',
    followerCount: 8347,
    staff: '최민수',
    campaign: 'Yuonne Clinic',
    costType: '무가',
    responseRate: 91.6,
    views: 4128,
    saves: 387,
    comments: 89,
    likes: 592,
    shares: 21,
    date: '2025-08-26'
  }),
  createInfluencerWithMetrics({
    id: '5',
    name: '@fitness_pro_usa',
    country: '미국',
    followerType: '매크로',
    followerCount: 198563,
    staff: '박영수',
    campaign: 'Benjamin Clinic',
    costType: '유가',
    responseRate: 67.9,
    views: 51247,
    saves: 2184,
    comments: 398,
    likes: 7921,
    shares: 156,
    date: '2025-08-29'
  }),
  // 9월 첫째 주
  createInfluencerWithMetrics({
    id: '6',
    name: '@beauty_queen_jp',
    country: '일본',
    followerType: '메가',
    followerCount: 923847,
    staff: '이서연',
    campaign: 'Oblive Clinic',
    costType: '유가',
    responseRate: 52.3,
    views: 143726,
    saves: 4293,
    comments: 847,
    likes: 21456,
    shares: 567,
    date: '2025-09-02'
  }),
  createInfluencerWithMetrics({
    id: '7',
    name: '@wellness_micro',
    country: '한국',
    followerType: '마이크로',
    followerCount: 51894,
    staff: '김민주',
    campaign: 'Yuonne Clinic',
    costType: '무가',
    responseRate: 79.4,
    views: 24387,
    saves: 1562,
    comments: 421,
    likes: 3847,
    shares: 127,
    date: '2025-09-03'
  }),
  createInfluencerWithMetrics({
    id: '8',
    name: '@health_nano_de',
    country: '독일',
    followerType: '나노',
    followerCount: 11743,
    staff: '최민수',
    campaign: 'Benjamin Clinic',
    costType: '무가',
    responseRate: 87.3,
    views: 6284,
    saves: 493,
    comments: 134,
    likes: 847,
    shares: 37,
    date: '2025-09-04'
  }),
  createInfluencerWithMetrics({
    id: '9',
    name: '@macro_influencer_cn',
    country: '중국',
    followerType: '매크로',
    followerCount: 176239,
    staff: '이서연',
    campaign: 'Dongan Central Clinic',
    costType: '유가',
    responseRate: 71.8,
    views: 62847,
    saves: 2734,
    comments: 523,
    likes: 9847,
    shares: 234,
    date: '2025-09-05'
  }),
  // 9월 둘째 주
  createInfluencerWithMetrics({
    id: '10',
    name: '@skincare_expert',
    country: '한국',
    followerType: '메가',
    followerCount: 1194736,
    staff: '김민주',
    campaign: 'Oblive Clinic',
    costType: '유가',
    responseRate: 41.9,
    views: 287493,
    saves: 8472,
    comments: 1293,
    likes: 34872,
    shares: 847,
    date: '2025-09-09'
  }),
  createInfluencerWithMetrics({
    id: '11',
    name: '@health_blogger_uk',
    country: '영국',
    followerType: '마이크로',
    followerCount: 37482,
    staff: '박영수',
    campaign: 'Benjamin Clinic',
    costType: '무가',
    responseRate: 82.6,
    views: 19472,
    saves: 1284,
    comments: 347,
    likes: 2739,
    shares: 89,
    date: '2025-09-10'
  }),
  createInfluencerWithMetrics({
    id: '12',
    name: '@nano_beauty_fr',
    country: '프랑스',
    followerType: '나노',
    followerCount: 9284,
    staff: '최민수',
    campaign: 'Yuonne Clinic',
    costType: '무가',
    responseRate: 93.7,
    views: 5847,
    saves: 572,
    comments: 127,
    likes: 784,
    shares: 34,
    date: '2025-09-11'
  }),
  createInfluencerWithMetrics({
    id: '13',
    name: '@macro_wellness_au',
    country: '호주',
    followerType: '매크로',
    followerCount: 162847,
    staff: '이서연',
    campaign: 'Dongan Central Clinic',
    costType: '유가',
    responseRate: 69.2,
    views: 48372,
    saves: 2184,
    comments: 456,
    likes: 7234,
    shares: 178,
    date: '2025-09-12'
  }),
  // 9월 셋째 주
  createInfluencerWithMetrics({
    id: '14',
    name: '@mega_health_in',
    country: '인도',
    followerType: '메가',
    followerCount: 782394,
    staff: '박영수',
    campaign: 'Oblive Clinic',
    costType: '유가',
    responseRate: 46.3,
    views: 124736,
    saves: 3847,
    comments: 729,
    likes: 18472,
    shares: 423,
    date: '2025-09-16'
  }),
  createInfluencerWithMetrics({
    id: '15',
    name: '@micro_lifestyle_ca',
    country: '캐나다',
    followerType: '마이크로',
    followerCount: 40847,
    staff: '김민주',
    campaign: 'Yuonne Clinic',
    costType: '무가',
    responseRate: 76.8,
    views: 21847,
    saves: 1456,
    comments: 389,
    likes: 3472,
    shares: 112,
    date: '2025-09-17'
  }),
  createInfluencerWithMetrics({
    id: '16',
    name: '@nano_health_br',
    country: '브라질',
    followerType: '나노',
    followerCount: 7139,
    staff: '최민수',
    campaign: 'Benjamin Clinic',
    costType: '무가',
    responseRate: 88.4,
    views: 4372,
    saves: 428,
    comments: 97,
    likes: 647,
    shares: 23,
    date: '2025-09-18'
  }),
  createInfluencerWithMetrics({
    id: '17',
    name: '@beauty_macro_th',
    country: '태국',
    followerType: '매크로',
    followerCount: 143729,
    staff: '이서연',
    campaign: 'Dongan Central Clinic',
    costType: '유가',
    responseRate: 64.7,
    views: 44738,
    saves: 1947,
    comments: 356,
    likes: 6847,
    shares: 134,
    date: '2025-09-19'
  }),
  // 9월 넷째 주
  createInfluencerWithMetrics({
    id: '18',
    name: '@wellness_mega_sg',
    country: '싱가포르',
    followerType: '메가',
    followerCount: 678493,
    staff: '박영수',
    campaign: 'Oblive Clinic',
    costType: '유가',
    responseRate: 49.6,
    views: 134729,
    saves: 4182,
    comments: 847,
    likes: 19384,
    shares: 456,
    date: '2025-09-23'
  }),
  createInfluencerWithMetrics({
    id: '19',
    name: '@health_micro_mx',
    country: '멕시코',
    followerType: '마이크로',
    followerCount: 47239,
    staff: '김민주',
    campaign: 'Benjamin Clinic',
    costType: '무가',
    responseRate: 81.3,
    views: 22847,
    saves: 1639,
    comments: 423,
    likes: 3947,
    shares: 127,
    date: '2025-09-24'
  }),
  createInfluencerWithMetrics({
    id: '20',
    name: '@nano_skincare_es',
    country: '스페인',
    followerType: '나노',
    followerCount: 11293,
    staff: '최민수',
    campaign: 'Yuonne Clinic',
    costType: '무가',
    responseRate: 85.9,
    views: 6728,
    saves: 634,
    comments: 147,
    likes: 923,
    shares: 41,
    date: '2025-09-25'
  }),
  // 추가 캠페인 데이터 (21-100)
  ...Array.from({ length: 80 }, (_, index) => {
    const id = (21 + index).toString();
    const campaignIndex = (index + 3) % campaignNames.length;
    const countries = ['한국', '미국', '일본', '독일', '중국', '영국', '프랑스', '호주', '인도', '캐나다', '브라질', '태국', '싱가포르', '멕시코', '스페인'];
    const followerTypes: ('메가' | '매크로' | '마이크로' | '나노')[] = ['메가', '매크로', '마이크로', '나노'];
    const staffs = ['김민주', '박영수', '이서연', '최민수', '정유진', '한상호'];
    const costTypes: ('무가' | '유가')[] = ['무가', '유가'];
    
    const followerType = followerTypes[index % 4];
    const baseFollowerCount = followerType === '메가' ? 500000 : 
                             followerType === '매크로' ? 100000 : 
                             followerType === '마이크로' ? 30000 : 8000;
    
    return createInfluencerWithMetrics({
      id,
      name: `@influencer_${id}`,
      country: countries[index % countries.length],
      followerType,
      followerCount: Math.floor(baseFollowerCount * (0.8 + Math.random() * 0.4)),
      staff: staffs[index % staffs.length],
      campaign: campaignNames[campaignIndex],
      costType: costTypes[index % 2],
      responseRate: Math.floor(40 + Math.random() * 50 * 10) / 10,
      views: Math.floor((baseFollowerCount * 0.1) * (0.5 + Math.random())),
      saves: Math.floor((baseFollowerCount * 0.01) * (0.5 + Math.random())),
      comments: Math.floor((baseFollowerCount * 0.005) * (0.5 + Math.random())),
      likes: Math.floor((baseFollowerCount * 0.05) * (0.5 + Math.random())),
      shares: Math.floor((baseFollowerCount * 0.001) * (0.5 + Math.random())),
      date: `2025-0${8 + Math.floor(Math.random() * 2)}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`
    });
  })
];

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState('performance-tracking');
  const [activePerformanceTab, setActivePerformanceTab] = useState('campaign-overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '2025-08-23', end: '2025-09-23' },
    staff: [],
    countries: [],
    followerTypes: [],
    costTypes: [],
    campaigns: []
  });

  const filteredInfluencers = mockInfluencers.filter(influencer => {
    const matchesDateRange = new Date(influencer.date) >= new Date(filters.dateRange.start) &&
                             new Date(influencer.date) <= new Date(filters.dateRange.end);
    const matchesStaff = filters.staff.length === 0 || filters.staff.includes(influencer.staff);
    const matchesCountry = filters.countries.length === 0 || filters.countries.includes(influencer.country);
    const matchesFollowerType = filters.followerTypes.length === 0 || filters.followerTypes.includes(influencer.followerType);
    const matchesCostType = filters.costTypes.length === 0 || filters.costTypes.includes(influencer.costType);
    const matchesCampaign = filters.campaigns.length === 0 || filters.campaigns.includes(influencer.campaign);

    return matchesDateRange && matchesStaff && matchesCountry && matchesFollowerType && matchesCostType && matchesCampaign;
  });

  const handleCampaignSelect = (campaign: string) => {
    setFilters(prev => ({
      ...prev,
      campaigns: [campaign]
    }));
    setActivePerformanceTab('dashboard');
  };

  const menuItems = [
    {
      id: 'influencer-management',
      label: '인플루언서 관리',
      icon: Users,
      active: activeMainTab === 'influencer-management'
    },
    {
      id: 'campaigns',
      label: '캠페인',
      icon: Target,
      active: activeMainTab === 'campaigns'
    },
    {
      id: 'performance-tracking',
      label: '성과 트래킹',
      icon: BarChart3,
      active: activeMainTab === 'performance-tracking'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SR</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">SR바이오텍</h1>
                <p className="text-sm text-gray-500">관리자 대시보드</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveMainTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      item.active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${item.active ? 'text-blue-700' : 'text-gray-400'}`} />
                    {sidebarOpen && (
                      <>
                        <span className="font-medium">{item.label}</span>
                        {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">관</span>
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-medium text-gray-900">관리자</p>
                <p className="text-xs text-gray-500">마케팅팀</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeMainTab === 'performance-tracking' && '성과 트래킹'}
                  {activeMainTab === 'influencer-management' && '인플루언서 관리'}
                  {activeMainTab === 'campaigns' && '캠페인'}
                </h2>
                <p className="text-sm text-gray-500">
                  {activeMainTab === 'performance-tracking' && '인플루언서 마케팅 성과 분석 및 모니터링'}
                  {activeMainTab === 'influencer-management' && '인플루언서 정보 및 관계 관리'}
                  {activeMainTab === 'campaigns' && '마케팅 캠페인 계획 및 실행'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {activeMainTab === 'performance-tracking' && (
                <DateRangePicker 
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="검색..."
                  className="pl-10 w-64 bg-gray-50 border-gray-200"
                />
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {activeMainTab === 'performance-tracking' && (
            <div className="p-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                  <Tabs value={activePerformanceTab} onValueChange={setActivePerformanceTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
                      <TabsTrigger 
                        value="campaign-overview" 
                        className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                      >
                        캠페인 개요
                      </TabsTrigger>
                      <TabsTrigger 
                        value="dashboard" 
                        className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                      >
                        성과 분석
                      </TabsTrigger>
                      <TabsTrigger 
                        value="staff"
                        className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                      >
                        담당자별 성과
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="p-6">
                  <Tabs value={activePerformanceTab} onValueChange={setActivePerformanceTab} className="w-full">
                    <TabsContent value="campaign-overview" className="mt-0">
                      <CampaignOverview 
                        data={filteredInfluencers}
                        onCampaignSelect={handleCampaignSelect}
                      />
                    </TabsContent>

                    <TabsContent value="dashboard" className="mt-0">
                      <VisualizationBoard 
                        data={filteredInfluencers}
                      />
                    </TabsContent>
                    
                    <TabsContent value="staff" className="mt-0">
                      <StaffPerformanceBoard data={mockInfluencers} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}

          {activeMainTab === 'campaigns' && (
            <CampaignManagement data={mockInfluencers} />
          )}
        </main>
      </div>
    </div>
  );
}