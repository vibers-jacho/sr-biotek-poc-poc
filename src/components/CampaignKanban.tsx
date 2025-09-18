import React from 'react';
import { Influencer } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

interface CampaignKanbanProps {
  influencers: Influencer[];
  hospital: string;
  onUpdateInfluencer: (id: string, updates: Partial<Influencer>) => void;
}

const kanbanStatuses = [
  '구글폼 회신',
  '예약 확정',
  '시술 완료',
  '포스팅 완료',
  '포스팅 지연',
  '거절/취소'
] as const;

export function CampaignKanban({ influencers, hospital, onUpdateInfluencer }: CampaignKanbanProps) {
  const campaignInfluencers = influencers.filter(inf => inf.hospital === hospital);

  const getInfluencersByStatus = (status: string) => {
    // Handle combined status for 거절/취소
    if (status === '거절/취소') {
      return campaignInfluencers.filter(inf => inf.status === '거절' || inf.status === '취소');
    }
    return campaignInfluencers.filter(inf => inf.status === status);
  };

  const handleDragStart = (e: React.DragEvent, influencer: Influencer) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: influencer.id,
      currentStatus: influencer.status
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    // For 거절/취소, default to 거절 when dropping
    const actualStatus = newStatus === '거절/취소' ? '거절' : newStatus;
    if (data.currentStatus !== actualStatus) {
      onUpdateInfluencer(data.id, { status: actualStatus as Influencer['status'] });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '구글폼 회신': return 'bg-indigo-100 border-indigo-300';
      case '예약 확정': return 'bg-green-100 border-green-300';
      case '시술 완료': return 'bg-emerald-100 border-emerald-300';
      case '포스팅 완료': return 'bg-gray-100 border-gray-300';
      case '포스팅 지연': return 'bg-orange-100 border-orange-300';
      case '거절/취소': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <h2 className="mb-6">{hospital} - 상태 관리</h2>

      <div className="w-full">
        <div className="flex gap-4 w-full">
        {kanbanStatuses.map(status => {
          const statusInfluencers = getInfluencersByStatus(status);

          return (
            <div
              key={status}
              className={`min-h-[500px] flex-1 rounded-lg border-2 border-dashed p-4 ${getStatusColor(status)}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="mb-4 text-center">
                <h3 className="font-medium text-sm">{status}</h3>
                <Badge variant="secondary" className="mt-1">
                  {statusInfluencers.length}명
                </Badge>
              </div>
              
              <div className="space-y-2">
                {statusInfluencers.map(influencer => (
                  <Card
                    key={influencer.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, influencer)}
                  >
                    <CardContent className="p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {influencer.username.slice(1, 3).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate">{influencer.username}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {influencer.round}차
                        </Badge>
                      </div>

                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>{influencer.views.toLocaleString()} views</span>
                        {(influencer.confirmedDate || influencer.scheduledPostDate) && (
                          <span>
                            {influencer.confirmedDate || influencer.scheduledPostDate}
                          </span>
                        )}
                      </div>

                      {(influencer.hasReply || influencer.googleFormSent || influencer.contentGuideSent) && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {influencer.hasReply && (
                            <Badge variant="secondary" className="text-xs h-4 px-1">회신</Badge>
                          )}
                          {influencer.googleFormSent && (
                            <Badge variant="secondary" className="text-xs h-4 px-1">폼</Badge>
                          )}
                          {influencer.contentGuideSent && (
                            <Badge variant="secondary" className="text-xs h-4 px-1">가이드</Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}