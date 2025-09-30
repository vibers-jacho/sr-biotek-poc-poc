import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from './components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible';
import { Users, Building, BarChart3, MessageSquare, ChevronDown, TrendingUp } from 'lucide-react';
import { InfluencerList } from './components/InfluencerList';
import { CampaignKanban } from './components/CampaignKanban';
import { ContactManagement } from './components/ContactManagement';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { mockInfluencers, mockContactInfo, mockCampaigns } from './data/mockData';
import { Influencer, ContactInfo, FilterState } from './types';
import { Toaster } from './components/ui/sonner';

type ViewType = 'influencers' | 'campaign-status' | 'campaign-contact' | 'analytics' | 'campaign-management';

interface AppState {
  currentView: ViewType;
  selectedHospital?: string;
  influencers: Influencer[];
  contactInfo: ContactInfo[];
  filters: FilterState;
}

export default function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'analytics',
    selectedHospital: undefined,
    influencers: mockInfluencers,
    contactInfo: mockContactInfo,
    filters: {
      dateRange: {
        start: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 지난 30일
        end: new Date().toISOString().split('T')[0]
      },
      staff: [],
      countries: [],
      followerTypes: [],
      costTypes: [],
      campaigns: ['전체']
    }
  });

  const handleUpdateInfluencer = (id: string, updates: Partial<Influencer>) => {
    setState(prev => ({
      ...prev,
      influencers: prev.influencers.map(inf => 
        inf.id === id ? { ...inf, ...updates } : inf
      )
    }));
  };

  const handleUpdateContact = (id: string, updates: Partial<ContactInfo>) => {
    setState(prev => ({
      ...prev,
      contactInfo: prev.contactInfo.map(contact =>
        contact.id === id ? { ...contact, ...updates } : contact
      )
    }));
  };

  const handleFiltersChange = (filters: FilterState) => {
    setState(prev => ({
      ...prev,
      filters
    }));
  };

  const handleNavigation = (view: ViewType, hospital?: string) => {
    setState(prev => ({
      ...prev,
      currentView: view,
      selectedHospital: hospital
    }));
  };

  const renderMainContent = () => {
    switch (state.currentView) {
      case 'influencers':
        return (
          <InfluencerList 
            influencers={state.influencers}
            onUpdateInfluencer={handleUpdateInfluencer}
          />
        );
      
      case 'campaign-status':
        if (!state.selectedHospital) return null;
        return (
          <CampaignKanban
            influencers={state.influencers}
            hospital={state.selectedHospital}
            onUpdateInfluencer={handleUpdateInfluencer}
          />
        );
      
      case 'campaign-contact':
        if (!state.selectedHospital) return null;
        return (
          <ContactManagement
            contactInfo={state.contactInfo}
            influencers={state.influencers}
            hospital={state.selectedHospital}
            onUpdateContact={handleUpdateContact}
          />
        );

      case 'analytics':
        return (
          <AnalyticsDashboard
            data={state.influencers}
            filters={state.filters}
            onFiltersChange={handleFiltersChange}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <Toaster position="bottom-right" />
      <div className="flex h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <img
                src="/sr-biotek-logo.jpeg"
                alt="SR Biotek"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="font-medium text-lg">V-Manager</h1>
                <p className="text-sm text-muted-foreground">인플루언서 마케팅 관리</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('analytics')}
                  isActive={state.currentView === 'analytics'}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  성과 분석
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('influencers')}
                  isActive={state.currentView === 'influencers'}
                >
                  <Users className="mr-2 h-4 w-4" />
                  인플루언서 관리
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible defaultOpen>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Building className="mr-2 h-4 w-4" />
                      캠페인
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {mockCampaigns.map(campaign => (
                        <Collapsible key={campaign.id}>
                          <SidebarMenuSubItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton>
                                {campaign.hospital}
                                <ChevronDown className="ml-auto h-4 w-4" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton 
                                    onClick={() => handleNavigation('campaign-status', campaign.hospital)}
                                    isActive={state.currentView === 'campaign-status' && state.selectedHospital === campaign.hospital}
                                  >
                                    <BarChart3 className="mr-2 h-3 w-3" />
                                    상태 관리
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton 
                                    onClick={() => handleNavigation('campaign-contact', campaign.hospital)}
                                    isActive={state.currentView === 'campaign-contact' && state.selectedHospital === campaign.hospital}
                                  >
                                    <MessageSquare className="mr-2 h-3 w-3" />
                                    연락 관리
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuSubItem>
                        </Collapsible>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="border-b bg-background p-4 flex items-center gap-4 flex-shrink-0">
            <SidebarTrigger />
            <div className="flex-1">
              {state.currentView === 'influencers' && (
                <h2>인플루언서 전체 관리</h2>
              )}
              {state.currentView === 'analytics' && (
                <h2>성과 분석 대시보드</h2>
              )}
              {state.currentView === 'campaign-status' && state.selectedHospital && (
                <h2>{state.selectedHospital} - 상태 관리</h2>
              )}
              {state.currentView === 'campaign-contact' && state.selectedHospital && (
                <h2>{state.selectedHospital} - 연락 관리</h2>
              )}
            </div>
          </header>

          <main className="flex-1 bg-muted/20 p-6">
            {renderMainContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}