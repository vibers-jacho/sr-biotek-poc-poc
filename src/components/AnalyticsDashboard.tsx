import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
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
    const matchesCampaign = filters.campaigns.length === 0 || (influencer.campaign && filters.campaigns.includes(influencer.campaign));

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

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex justify-end">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="campaign-overview" className="mt-0">
              <CampaignOverview
                data={filteredData}
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