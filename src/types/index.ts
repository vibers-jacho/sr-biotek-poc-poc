export interface Influencer {
  id: string;
  username: string;
  url: string;
  firstTagging: string;
  type: '인스타 크롤링' | '틱톡 크롤링' | '인바운드 (메타)' | '추가 수동 서치업' | '재태핑' | '인바운드 (DM)';
  status: '태핑 완료 회신대기' | '회신 수신' | '구글폼 전송' | '구글폼 회신' | '예약 확정' | '시술 완료' | '포스팅 완료' | '거절' | '포스팅 지연' | '취소';
  hasReply: boolean;
  isRejected: boolean;
  googleFormSent: boolean;
  googleFormReply: boolean;
  confirmedDate?: string;
  hospital?: string;
  contentGuideSent: boolean;
  procedureCompleted: boolean;
  postLink?: string;
  scheduledPostDate?: string;
  guidelines: string;
  views: number;
  likes: number;
  saves: number;
  round: number;
}

export interface ContactInfo {
  id: string;
  influencerId: string;
  hospitalDelivered: boolean;
  instagramAccount: string;
  followerCount: number;
  englishName: string;
  koreanName: string;
  phoneNumber: string;
  birthDate: string;
  nationality: string;
  language: string;
  appointmentDate: string;
  appointmentTime: string;
  additionalProcedure: string;
  reservationConfirmed: boolean;
  procedureDday: number;
  reminded: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  hospital: string;
  influencerIds: string[];
}