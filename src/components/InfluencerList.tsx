import React, { useState, useMemo } from 'react';
import { Influencer } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightSmall, MoreHorizontal, Eye, Heart, Bookmark, User } from 'lucide-react';
import { statusOptions, typeOptions, hospitals } from '../data/mockData';
import { EditableCell } from './EditableCell';
import { CampaignWorkflow } from './WorkflowProgress';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Textarea } from './ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface InfluencerListProps {
  influencers: Influencer[];
  onUpdateInfluencer: (id: string, updates: Partial<Influencer>) => void;
}

export function InfluencerList({ influencers, onUpdateInfluencer }: InfluencerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [hospitalFilter, setHospitalFilter] = useState<string>('all');
  const [roundFilter, setRoundFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof Influencer>('username');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleUpdate = (id: string, field: string, value: any) => {
    onUpdateInfluencer(id, { [field]: value });
    toast.success(`${field} 업데이트 완료`, {
      duration: 2000,
      position: 'bottom-right'
    });
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };



  const filteredAndSortedInfluencers = useMemo(() => {
    let filtered = influencers.filter(influencer => {
      const matchesSearch = influencer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           influencer.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || influencer.status === statusFilter;
      const matchesType = typeFilter === 'all' || influencer.type === typeFilter;
      const matchesHospital = hospitalFilter === 'all' || influencer.hospital === hospitalFilter;
      const matchesRound = roundFilter === 'all' || influencer.round.toString() === roundFilter;

      return matchesSearch && matchesStatus && matchesType && matchesHospital && matchesRound;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [influencers, searchTerm, statusFilter, typeFilter, hospitalFilter, roundFilter, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedInfluencers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInfluencers = filteredAndSortedInfluencers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, hospitalFilter, roundFilter, itemsPerPage]);

  const getPaginationRange = () => {
    const maxButtons = 7;
    const sideButtons = 2;

    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];

    // Always show first page
    pages.push(1);

    if (currentPage > sideButtons + 2) {
      pages.push('ellipsis');
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - sideButtons);
         i <= Math.min(totalPages - 1, currentPage + sideButtons);
         i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - sideButtons - 1) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handleSort = (column: keyof Influencer) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case '포스팅 완료': return 'success';
      case '시술 완료': return 'secondary';
      case '예약 확정': return 'outline';
      case '거절':
      case '취소': return 'destructive';
      case '대화 완료 확신대기': return 'warning';
      case '회신 수신': return 'info';
      default: return 'secondary';
    }
  };

  const rounds = [...new Set(influencers.map(i => i.round))];

  return (
    <div className="w-full">
      <Card className="border-0 shadow-none">
        <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>인플루언서 관리</CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              총 {filteredAndSortedInfluencers.length}명 중 {startIndex + 1}-{Math.min(endIndex, filteredAndSortedInfluencers.length)}명 표시
            </span>
            <Select value={itemsPerPage.toString()} onValueChange={(value: string) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25개</SelectItem>
                <SelectItem value="50">50개</SelectItem>
                <SelectItem value="100">100개</SelectItem>
                <SelectItem value="200">200개</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="인플루언서 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="유형 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 유형</SelectItem>
              {typeOptions.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="병원 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 병원</SelectItem>
              {hospitals.map(hospital => (
                <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={roundFilter} onValueChange={setRoundFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="라운드" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 라운드</SelectItem>
              {rounds.map(round => (
                <SelectItem key={round} value={round.toString()}>{round}차</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="w-full">
          <Table>
            <TableHeader className="border-b">
              <TableRow>
                <TableHead className="min-w-[200px] sticky left-0 bg-background z-20">
                  <Button variant="ghost" onClick={() => handleSort('username')} className="h-auto p-0 justify-start">
                    인플루언서 <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-36">
                  <Button variant="ghost" onClick={() => handleSort('status')} className="h-auto p-0 justify-start">
                    상태 <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-48">진행상황</TableHead>
                <TableHead className="w-32">유형</TableHead>
                <TableHead className="w-36">병원</TableHead>
                <TableHead className="w-20 text-center">
                  <Button variant="ghost" onClick={() => handleSort('round')} className="h-auto p-0">
                    회차 <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-32 text-right">
                  <Button variant="ghost" onClick={() => handleSort('views')} className="h-auto p-0">
                    참여도 <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-32 text-center">예약일</TableHead>
                <TableHead className="w-20 text-center">거절</TableHead>
                <TableHead className="w-16 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInfluencers.map(influencer => (
                <React.Fragment key={influencer.id}>
                  <TableRow className="hover:bg-muted/30 transition-colors h-12">
                    <TableCell className="font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => toggleRowExpansion(influencer.id)}
                        >
                          {expandedRows.has(influencer.id) ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRightSmall className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm text-foreground">{influencer.username}</span>
                          </div>
                          <a
                            href={influencer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-blue-600 transition-colors truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {influencer.url.replace('https://www.instagram.com/', '@').replace('/', '')}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={influencer.status}
                        type="select"
                        options={statusOptions.map(s => ({ value: s, label: s }))}
                        onSave={(value) => handleUpdate(influencer.id, 'status', value)}
                        displayFormatter={(val) => {
                          const variant = getStatusBadgeVariant(val);
                          let className = "text-xs font-medium ";

                          if (variant === 'success') className += "bg-green-100 text-green-700 hover:bg-green-200";
                          else if (variant === 'warning') className += "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
                          else if (variant === 'info') className += "bg-blue-100 text-blue-700 hover:bg-blue-200";
                          else if (variant === 'destructive') className += "bg-red-100 text-red-700 hover:bg-red-200";
                          else className += "bg-gray-100 text-gray-700 hover:bg-gray-200";

                          return (
                            <Badge className={className}>
                              {val}
                            </Badge>
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <CampaignWorkflow
                        hasReply={influencer.hasReply}
                        isRejected={influencer.isRejected}
                        googleFormSent={influencer.googleFormSent}
                        googleFormReply={influencer.googleFormReply}
                        onUpdate={(field, value) => handleUpdate(influencer.id, field, value)}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={influencer.type}
                        type="select"
                        options={typeOptions.map(t => ({ value: t, label: t }))}
                        onSave={(value) => handleUpdate(influencer.id, 'type', value)}
                        displayFormatter={(val) => (
                          <span className="text-sm text-muted-foreground">{val}</span>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={influencer.hospital}
                        type="select"
                        options={hospitals.map(h => ({ value: h, label: h }))}
                        onSave={(value) => handleUpdate(influencer.id, 'hospital', value)}
                        placeholder="미지정"
                        displayFormatter={(val) => (
                          <span className="text-sm text-muted-foreground">{val || '미지정'}</span>
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium text-muted-foreground">{influencer.round}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3 text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span className="font-medium tabular-nums">{influencer.views === 0 ? '0' : influencer.views.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Heart className="h-3 w-3" />
                          <span className="font-medium tabular-nums">{influencer.likes === 0 ? '0' : influencer.likes.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Bookmark className="h-3 w-3" />
                          <span className="font-medium tabular-nums">{influencer.saves === 0 ? '0' : influencer.saves.toLocaleString()}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <EditableCell
                        value={influencer.confirmedDate}
                        type="date"
                        onSave={(value) => handleUpdate(influencer.id, 'confirmedDate', value)}
                        placeholder="-"
                        displayFormatter={(val) => (
                          <span className="text-sm text-muted-foreground">{val || '-'}</span>
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={influencer.isRejected}
                        onCheckedChange={(checked: boolean) => handleUpdate(influencer.id, 'isRejected', checked)}
                        style={{
                          backgroundColor: influencer.isRejected ? '#ef4444' : '#e5e7eb',
                          borderColor: influencer.isRejected ? '#dc2626' : '#d1d5db',
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => window.open(influencer.url, '_blank')}>
                            프로필 보기
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const newUsername = window.prompt('새 사용자 이름을 입력하세요:', influencer.username);
                            if (newUsername && newUsername !== influencer.username) {
                              handleUpdate(influencer.id, 'username', newUsername);
                            }
                          }}>
                            이름 편집
                          </DropdownMenuItem>
                          <DropdownMenuItem>연락처 관리</DropdownMenuItem>
                          <DropdownMenuItem>히스토리 보기</DropdownMenuItem>
                          <DropdownMenuItem>노트 추가</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(influencer.id) && (
                    <TableRow style={{ backgroundColor: '#fafbfc' }}>
                      <TableCell colSpan={10} style={{
                        padding: '40px 30px',
                        borderLeft: '3px solid #3b82f6',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                          {/* Row 1: Three columns for URLs and Date */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '24px',
                            paddingBottom: '20px',
                            borderBottom: '1px solid #e5e7eb'
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <label style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                프로필 URL
                              </label>
                              <EditableCell
                                value={influencer.url}
                                type="url"
                                onSave={(value) => handleUpdate(influencer.id, 'url', value)}
                                className="text-sm"
                                style={{
                                  backgroundColor: 'white',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  padding: '8px 12px'
                                }}
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <label style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                포스팅 링크
                              </label>
                              <EditableCell
                                value={influencer.postLink}
                                type="url"
                                onSave={(value) => handleUpdate(influencer.id, 'postLink', value)}
                                placeholder="포스팅 링크 입력"
                                className="text-sm"
                                style={{
                                  backgroundColor: 'white',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  padding: '8px 12px'
                                }}
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <label style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                포스팅 예정일
                              </label>
                              <EditableCell
                                value={influencer.scheduledPostDate}
                                type="date"
                                onSave={(value) => handleUpdate(influencer.id, 'scheduledPostDate', value)}
                                placeholder="날짜 선택"
                                className="text-sm"
                                style={{
                                  backgroundColor: 'white',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  padding: '8px 12px'
                                }}
                              />
                            </div>
                          </div>

                          {/* Row 2: Guidelines and Metrics */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '30px'
                          }}>
                            {/* Guidelines Section */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <label style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                가이드라인
                              </label>
                              <Textarea
                                value={influencer.guidelines || ''}
                                onChange={(e) => handleUpdate(influencer.id, 'guidelines', e.target.value)}
                                placeholder="가이드라인을 입력하세요..."
                                style={{
                                  width: '100%',
                                  minHeight: '120px',
                                  fontSize: '14px',
                                  backgroundColor: 'white',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  padding: '12px',
                                  resize: 'vertical'
                                }}
                                rows={5}
                              />
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '4px'
                              }}>
                                <Switch
                                  checked={influencer.contentGuideSent}
                                  onCheckedChange={(checked: boolean) => handleUpdate(influencer.id, 'contentGuideSent', checked)}
                                />
                                <label style={{ fontSize: '14px', color: '#4b5563' }}>
                                  가이드 전송 완료
                                </label>
                              </div>
                            </div>

                            {/* Metrics Section */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '16px',
                              alignContent: 'start'
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: '#6b7280',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  좋아요
                                </label>
                                <div style={{
                                  backgroundColor: 'white',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  padding: '12px',
                                  textAlign: 'center'
                                }}>
                                  <EditableCell
                                    value={influencer.likes}
                                    type="number"
                                    onSave={(value) => handleUpdate(influencer.id, 'likes', Number(value))}
                                    displayFormatter={(val) => val?.toLocaleString() || '0'}
                                    className="text-xl font-bold"
                                    style={{ color: '#1f2937' }}
                                  />
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: '#6b7280',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  저장
                                </label>
                                <div style={{
                                  backgroundColor: 'white',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  padding: '12px',
                                  textAlign: 'center'
                                }}>
                                  <EditableCell
                                    value={influencer.saves}
                                    type="number"
                                    onSave={(value) => handleUpdate(influencer.id, 'saves', Number(value))}
                                    displayFormatter={(val) => val?.toLocaleString() || '0'}
                                    className="text-xl font-bold"
                                    style={{ color: '#1f2937' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>


        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              페이지 {currentPage} / {totalPages}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>

              {getPaginationRange().map((page, index) => (
                <React.Fragment key={index}>
                  {page === 'ellipsis' ? (
                    <span className="px-1 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page as number)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  )}
                </React.Fragment>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 ml-6">
              <Input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (!isNaN(page) && page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-16 text-center h-8"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">페이지로 이동</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}