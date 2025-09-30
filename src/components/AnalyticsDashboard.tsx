import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { ChevronDown, X } from 'lucide-react';
import { VisualizationBoard } from './VisualizationBoard';
import { CampaignOverview } from './CampaignOverview';
import { StaffPerformanceBoard } from './StaffPerformanceBoard';
import { Influencer, FilterState } from '../types';
import { DateRangePicker } from './DateRangePicker';

interface AnalyticsDashboardProps {
  data: Influencer[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function AnalyticsDashboard({ data, filters, onFiltersChange }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('campaign-overview');

  console.log('[AnalyticsDashboard] Total data:', data.length);
  console.log('[AnalyticsDashboard] Sample data:', data.slice(0, 2));

  // Filter data based on filters
  const filteredData = data.filter(influencer => {
    if (!influencer.date) return true;

    const matchesDateRange = new Date(influencer.date) >= new Date(filters.dateRange.start) &&
                             new Date(influencer.date) <= new Date(filters.dateRange.end);
    const matchesStaff = filters.staff.length === 0 || (influencer.staff && filters.staff.includes(influencer.staff));
    const matchesCountry = filters.countries.length === 0 || (influencer.country && filters.countries.includes(influencer.country));
    const matchesFollowerType = filters.followerTypes.length === 0 || (influencer.followerType && filters.followerTypes.includes(influencer.followerType));
    const matchesCostType = filters.costTypes.length === 0 || (influencer.costType && filters.costTypes.includes(influencer.costType));

    // "전체" means show all campaigns, otherwise filter by selected campaigns
    const campaignsWithoutTotal = filters.campaigns.filter(c => c !== '전체');
    const matchesCampaign = filters.campaigns.includes('전체') ||
                           campaignsWithoutTotal.length === 0 ||
                           (influencer.campaign && campaignsWithoutTotal.includes(influencer.campaign));

    return matchesDateRange && matchesStaff && matchesCountry && matchesFollowerType && matchesCostType && matchesCampaign;
  });

  console.log('[AnalyticsDashboard] Filtered data:', filteredData.length);
  console.log('[AnalyticsDashboard] With analytics fields:',
    filteredData.filter(d => d.campaign && d.emv !== undefined).length
  );

  const handleCampaignSelect = (campaign: string) => {
    onFiltersChange({
      ...filters,
      campaigns: [campaign]
    });
    setActiveTab('dashboard');
  };

  // Extract unique campaigns
  const uniqueCampaigns = Array.from(new Set(data.map(item => item.campaign).filter(Boolean))).sort();
  const [campaignFilterOpen, setCampaignFilterOpen] = useState(false);

  const toggleCampaign = (campaign: string) => {
    const newCampaigns = filters.campaigns.includes(campaign)
      ? filters.campaigns.filter(c => c !== campaign)
      : [...filters.campaigns, campaign];

    onFiltersChange({
      ...filters,
      campaigns: newCampaigns
    });
  };

  const clearCampaignFilter = () => {
    onFiltersChange({
      ...filters,
      campaigns: []
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Range Picker and Campaign Filter */}
      <div className="flex justify-end gap-3">
        <Popover open={campaignFilterOpen} onOpenChange={setCampaignFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 h-auto min-w-[160px] justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {filters.campaigns.length === 0
                    ? '모든 캠페인'
                    : filters.campaigns.length === 1 && filters.campaigns[0] === '전체'
                    ? '전체'
                    : filters.campaigns.length === 1
                    ? filters.campaigns[0]
                    : `${filters.campaigns.length}개 캠페인`}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 opacity-50 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 bg-white border border-slate-200 shadow-lg" align="end">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium">캠페인 선택</span>
              {filters.campaigns.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCampaignFilter}
                  className="h-auto p-1 text-slate-500 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="p-2 max-h-[300px] overflow-y-auto">
              <div className="space-y-2">
                {/* 전체 옵션 */}
                <div className="flex items-start space-x-2 p-2 hover:bg-slate-50 rounded bg-slate-50 border border-slate-200">
                  <Checkbox
                    id="campaign-전체"
                    checked={filters.campaigns.includes('전체')}
                    onCheckedChange={() => toggleCampaign('전체')}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="campaign-전체"
                    className="text-sm text-slate-900 font-semibold cursor-pointer flex-1 leading-tight"
                  >
                    전체
                  </label>
                </div>

                {/* 개별 캠페인 */}
                {uniqueCampaigns.map((campaign) => (
                  <div key={campaign} className="flex items-start space-x-2 p-2 hover:bg-slate-50 rounded">
                    <Checkbox
                      id={`campaign-${campaign}`}
                      checked={filters.campaigns.includes(campaign)}
                      onCheckedChange={() => toggleCampaign(campaign)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`campaign-${campaign}`}
                      className="text-sm text-slate-700 cursor-pointer flex-1 leading-tight"
                      title={campaign}
                    >
                      {campaign}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {filters.campaigns.length > 0 && (
              <div className="p-2 border-t border-slate-100 bg-slate-50">
                <div className="flex flex-wrap gap-1">
                  {filters.campaigns.map((campaign) => (
                    <Badge key={campaign} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      {campaign.length > 15 ? `${campaign.substring(0, 15)}...` : campaign}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 text-blue-600 hover:text-blue-800"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          toggleCampaign(campaign);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
        <DateRangePicker
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      </div>

      {/* Tabs Card */}
      <Card className="border-0 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                인플루언서별 성과 분석
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="campaign-overview" className="mt-0">
              <CampaignOverview
                data={filteredData}
                dateRange={filters.dateRange}
                selectedCampaigns={filters.campaigns}
                onCampaignSelect={handleCampaignSelect}
              />
            </TabsContent>

            <TabsContent value="dashboard" className="mt-0">
              <VisualizationBoard
                data={filteredData}
              />
            </TabsContent>

            <TabsContent value="staff" className="mt-0">
              <StaffPerformanceBoard data={filteredData} />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}