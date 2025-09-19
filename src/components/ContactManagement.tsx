import React, { useState } from 'react';
import { ContactInfo, Influencer } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search, Phone } from 'lucide-react';
import { DatePicker } from './ui/date-picker';
import { TimePicker } from './ui/time-picker';
import { format, parse } from 'date-fns';

interface ContactManagementProps {
  contactInfo: ContactInfo[];
  influencers: Influencer[];
  hospital: string;
  onUpdateContact: (id: string, updates: Partial<ContactInfo>) => void;
}

export function ContactManagement({ contactInfo, influencers, hospital, onUpdateContact }: ContactManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Map Korean hospital names to English names
  const hospitalNameMap: Record<string, string> = {
    '동안센트럴의원': 'Dongan Central Clinic',
    '오블리브의원': 'Oblive Clinic',
    '벤자민의원': 'Benjamin Clinic',
    '유온느의원': 'Yuonne Clinic'
  };

  // Helper function to extract hospital and index from "hospital_number" format
  const parseContactInfluencerId = (influencerId: string) => {
    const parts = influencerId.split('_');
    const hospitalKorean = parts[0];
    const index = parseInt(parts[1]) - 1; // Convert to 0-based index
    return { hospitalKorean, index };
  };

  const campaignInfluencers = influencers.filter(inf => inf.hospital === hospital);

  // Sort campaign influencers by ID to maintain consistent ordering
  const sortedCampaignInfluencers = [...campaignInfluencers].sort((a, b) => {
    const idA = parseInt(a.id) || 0;
    const idB = parseInt(b.id) || 0;
    return idA - idB;
  });

  const campaignContacts = contactInfo.filter(contact => {
    // Parse the contact's influencer reference
    const { hospitalKorean, index } = parseContactInfluencerId(contact.influencerId);

    // Map Korean hospital name to English
    const hospitalEnglish = hospitalNameMap[hospitalKorean];

    // Check if this contact belongs to the current hospital
    if (hospitalEnglish !== hospital) {
      return false;
    }

    // Check if we have an influencer at this index
    return index >= 0 && index < sortedCampaignInfluencers.length;
  });
  
  const filteredContacts = campaignContacts.filter(contact => {
    // Get the influencer for this contact based on position
    const { index } = parseContactInfluencerId(contact.influencerId);
    const influencer = sortedCampaignInfluencers[index];

    return (
      contact.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.koreanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.instagramAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (influencer && influencer.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getDdayBadgeVariant = (dday: number) => {
    if (dday < 0) return 'destructive';
    if (dday === 0) return 'default';
    if (dday <= 3) return 'secondary';
    return 'outline';
  };

  const getDdayText = (dday: number) => {
    if (dday < 0) return `D+${Math.abs(dday)}`;
    if (dday === 0) return 'D-Day';
    return `D-${dday}`;
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{hospital} - 연락 관리</CardTitle>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 계정명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ textAlign: 'center', fontWeight: '600' }}>병원 전달</TableHead>
                  <TableHead style={{ fontWeight: '600' }}>인스타 계정</TableHead>
                  <TableHead style={{ fontWeight: '600' }}>이름</TableHead>
                  <TableHead style={{ fontWeight: '600' }}>연락처</TableHead>
                  <TableHead style={{ fontWeight: '600' }}>생년월일</TableHead>
                  <TableHead style={{ fontWeight: '600' }}>국적/언어</TableHead>
                  <TableHead style={{ fontWeight: '600' }}>예약 일시</TableHead>
                  <TableHead style={{ fontWeight: '600', minWidth: '120px' }}>추가 시술</TableHead>
                  <TableHead style={{ textAlign: 'center', fontWeight: '600' }}>예약 확정</TableHead>
                  <TableHead style={{ fontWeight: '600' }}>시술 D-day</TableHead>
                  <TableHead style={{ textAlign: 'center', fontWeight: '600' }}>리마인드</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map(contact => {
                  
                  return (
                    <TableRow key={contact.id}>
                      <TableCell style={{ padding: '8px', textAlign: 'center' }}>
                        <Checkbox
                          checked={contact.hospitalDelivered}
                          onCheckedChange={(checked: boolean) =>
                            onUpdateContact(contact.id, { hospitalDelivered: !!checked })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{contact.instagramAccount}</p>
                          <p className="text-xs text-muted-foreground">
                            {contact.followerCount.toLocaleString()} 팔로워
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{contact.englishName}</p>
                          <p className="text-sm text-muted-foreground">{contact.koreanName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{contact.phoneNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{contact.birthDate}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{contact.nationality}</p>
                          <p className="text-xs text-muted-foreground">{contact.language}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <DatePicker
                            date={contact.appointmentDate ? parse(contact.appointmentDate, 'yyyy-MM-dd', new Date()) : undefined}
                            onDateChange={(date) => {
                              if (date) {
                                onUpdateContact(contact.id, {
                                  appointmentDate: format(date, 'yyyy-MM-dd')
                                });
                              }
                            }}
                            placeholder="예약일 선택"
                            className="h-8 w-40"
                          />
                          <TimePicker
                            time={typeof contact.appointmentTime === 'number'
                              ? `${Math.floor(contact.appointmentTime * 24).toString().padStart(2, '0')}:${Math.floor((contact.appointmentTime * 24 % 1) * 60).toString().padStart(2, '0')}`
                              : contact.appointmentTime}
                            onTimeChange={(time) => {
                              onUpdateContact(contact.id, { appointmentTime: time });
                            }}
                            placeholder="시간 선택"
                            className="h-8 w-40"
                          />
                        </div>
                      </TableCell>
                      <TableCell style={{ padding: '8px', fontSize: '14px', minWidth: '120px' }}>
                        {contact.additionalProcedure || '-'}
                      </TableCell>
                      <TableCell style={{ padding: '8px', textAlign: 'center' }}>
                        <Checkbox
                          checked={contact.reservationConfirmed}
                          onCheckedChange={(checked: boolean) =>
                            onUpdateContact(contact.id, { reservationConfirmed: !!checked })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDdayBadgeVariant(contact.procedureDday)}>
                          {getDdayText(contact.procedureDday)}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ padding: '8px', textAlign: 'center' }}>
                        <Checkbox
                          checked={contact.reminded}
                          onCheckedChange={(checked: boolean) =>
                            onUpdateContact(contact.id, { reminded: !!checked })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredContacts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              연락 정보가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}