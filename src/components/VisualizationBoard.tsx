import React from 'react';
import { useState, useEffect } from 'react';
import { Influencer } from '../types';
import { InfluencerPerformanceAnalysis } from './InfluencerPerformanceAnalysis';

interface VisualizationBoardProps {
  data: Influencer[];
}

export function VisualizationBoard({ data }: VisualizationBoardProps) {
  console.log('[VisualizationBoard] Received data:', data.length);
  console.log('[VisualizationBoard] Sample:', data.slice(0, 1));

  // 캠페인 선택 관련 상태
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  
  // 모든 캠페인 목록 추출 (only campaigns with valid analytics data)
  const allCampaigns = Array.from(
    new Set(
      data
        .filter(item => item.campaign && item.emv !== undefined && item.date)
        .map(item => item.campaign!)
    )
  ).sort();
  
  // 기본적으로 최근 10개 캠페인 선택 (날짜 기준으로 최신순)
  useEffect(() => {
    if (selectedCampaigns.length === 0 && allCampaigns.length > 0) {
      // 각 캠페인의 최신 날짜 기준으로 정렬
      const campaignWithLatestDate = allCampaigns.map(campaign => {
        const campaignData = data.filter(item => item.campaign === campaign && item.date);
        if (campaignData.length === 0) return null;
        const latestDate = campaignData.reduce((latest, item) => {
          return item.date && new Date(item.date!) > new Date(latest.date!) ? item : latest;
        }).date;
        return { campaign, latestDate: latestDate! };
      }).filter((item): item is { campaign: string; latestDate: string } => item !== null)
        .sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());

      const recent10Campaigns = campaignWithLatestDate.slice(0, 10).map(item => item.campaign);
      setSelectedCampaigns(recent10Campaigns);
    }
  }, [data, allCampaigns, selectedCampaigns.length]);

  // 선택된 캠페인에 따른 필터링된 데이터
  // Filter out items without required analytics fields
  const filteredData = data.filter(item =>
    item.campaign &&
    selectedCampaigns.includes(item.campaign) &&
    item.emv !== undefined &&
    item.roas !== undefined
  );

  console.log('[VisualizationBoard] Selected campaigns:', selectedCampaigns);
  console.log('[VisualizationBoard] Filtered data:', filteredData.length);
  console.log('[VisualizationBoard] All campaigns:', allCampaigns);

  // Show message if no data
  if (filteredData.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-gray-600">데이터가 없습니다.</p>
        <p className="text-sm text-gray-400 mt-2">선택된 캠페인: {selectedCampaigns.length}</p>
        <p className="text-sm text-gray-400">사용 가능한 캠페인: {allCampaigns.length}</p>
        <p className="text-sm text-gray-400">총 데이터: {data.length}</p>
      </div>
    );
  }

  // 캠페인 선택 핸들러들
  const handleCampaignToggle = (campaign: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaign) 
        ? prev.filter(c => c !== campaign)
        : [...prev, campaign]
    );
  };

  const handleSelectAllCampaigns = () => {
    setSelectedCampaigns(allCampaigns);
  };

  const handleSelectRecent10 = () => {
    const campaignWithLatestDate = allCampaigns.map(campaign => {
      const campaignData = data.filter(item => item.campaign === campaign && item.date);
      if (campaignData.length === 0) return null;
      const latestDate = campaignData.reduce((latest, item) => {
        return item.date && new Date(item.date!) > new Date(latest.date!) ? item : latest;
      }).date;
      return { campaign, latestDate: latestDate! };
    }).filter((item): item is { campaign: string; latestDate: string } => item !== null)
      .sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());

    const recent10Campaigns = campaignWithLatestDate.slice(0, 10).map(item => item.campaign);
    setSelectedCampaigns(recent10Campaigns);
  };

  return (
    <div className="space-y-8">
      {/* 인플루언서별 성과 분석 */}
      <InfluencerPerformanceAnalysis data={filteredData} />
    </div>
  );
}