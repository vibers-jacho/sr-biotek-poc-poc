import * as XLSX from 'xlsx';
import { Influencer, ContactInfo, Campaign } from '../types';
import * as path from 'path';
import * as fs from 'fs';

// Hospital name mapping
const hospitalNameMap: Record<string, string> = {
  '동안센트럴의원': 'Dongan Central Clinic',
  '오블리브의원': 'Oblive Clinic',
  '유온느의원': 'Yuonne Clinic',
  '벤자민의원': 'Benjamin Clinic'
};

// Status mapping from Korean to application values
const statusMap: Record<string, Influencer['status']> = {
  '태핑완료': '태핑 완료 회신대기',
  '회신수신': '회신 수신',
  '구글폼전송': '구글폼 전송',
  '구글폼회신': '구글폼 회신',
  '예약확정': '예약 확정',
  '시술완료': '시술 완료',
  '포스팅완료': '포스팅 완료',
  '거절': '거절',
  '포스팅지연': '포스팅 지연',
  '취소': '취소'
};

// Type mapping
const typeMap: Record<string, Influencer['type']> = {
  '인스타크롤링': '인스타 크롤링',
  '틱톡크롤링': '틱톡 크롤링',
  '인바운드메타': '인바운드 (메타)',
  '추가수동서치': '추가 수동 서치업',
  '재태핑': '재태핑',
  '인바운드DM': '인바운드 (DM)'
};

// Helper function to safely get cell value
function getCellValue(row: any, key: string, defaultValue: any = ''): any {
  return row[key] !== undefined && row[key] !== null ? row[key] : defaultValue;
}

// Helper function to parse date
function parseDate(dateValue: any): string {
  if (!dateValue) return '';

  // Excel stores dates as numbers
  if (typeof dateValue === 'number') {
    const date = XLSX.SSF.parse_date_code(dateValue);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }

  // If already a string, return as is
  if (typeof dateValue === 'string') {
    return dateValue;
  }

  return '';
}

// Parse overall.xlsx for main influencer data
export function parseOverallExcel(filePath: string): Influencer[] {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log('Parsing overall.xlsx - found', jsonData.length, 'rows');

    return jsonData.map((row: any, index: number) => {
      // Map Excel columns to Influencer interface
      const username = getCellValue(row, 'username', `@user_${index + 1}`);
      const status = getCellValue(row, 'status', '태핑 완료 회신대기');
      const type = getCellValue(row, 'type', '인스타 크롤링');

      return {
        id: String(index + 1),
        username: username.startsWith('@') ? username : `@${username}`,
        url: getCellValue(row, 'url', `https://instagram.com/${username.replace('@', '')}`),
        firstTagging: parseDate(getCellValue(row, 'firstTagging', null)) || '2024-01-01',
        type: typeMap[type] || '인스타 크롤링',
        status: statusMap[status] || '태핑 완료 회신대기',
        hasReply: getCellValue(row, 'hasReply', false) === true || getCellValue(row, 'hasReply', '') === 'Y',
        isRejected: status === '거절',
        googleFormSent: getCellValue(row, 'googleFormSent', false) === true || getCellValue(row, 'googleFormSent', '') === 'Y',
        googleFormReply: getCellValue(row, 'googleFormReply', false) === true || getCellValue(row, 'googleFormReply', '') === 'Y',
        confirmedDate: parseDate(getCellValue(row, 'confirmedDate', null)),
        hospital: getCellValue(row, 'hospital', ''),
        contentGuideSent: getCellValue(row, 'contentGuideSent', false) === true || getCellValue(row, 'contentGuideSent', '') === 'Y',
        procedureCompleted: getCellValue(row, 'procedureCompleted', false) === true || getCellValue(row, 'procedureCompleted', '') === 'Y',
        postLink: getCellValue(row, 'postLink', ''),
        scheduledPostDate: parseDate(getCellValue(row, 'scheduledPostDate', null)),
        guidelines: getCellValue(row, 'guidelines', ''),
        views: Number(getCellValue(row, 'views', 0)),
        likes: Number(getCellValue(row, 'likes', 0)),
        saves: Number(getCellValue(row, 'saves', 0)),
        round: Number(getCellValue(row, 'round', 1))
      };
    });
  } catch (error) {
    console.error('Error parsing overall.xlsx:', error);
    return [];
  }
}

// Parse hospital-specific Excel files
export function parseHospitalExcel(filePath: string, hospitalName: string): {
  influencers: Influencer[],
  contacts: ContactInfo[]
} {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Parsing ${hospitalName} - found`, jsonData.length, 'rows');

    const influencers: Influencer[] = [];
    const contacts: ContactInfo[] = [];

    jsonData.forEach((row: any, index: number) => {
      const influencerId = `${hospitalName}_${index + 1}`;
      const username = getCellValue(row, 'username', `@user_${index + 1}`);
      const status = getCellValue(row, 'status', '태핑 완료 회신대기');
      const type = getCellValue(row, 'type', '인스타 크롤링');

      // Create Influencer record
      influencers.push({
        id: influencerId,
        username: username.startsWith('@') ? username : `@${username}`,
        url: getCellValue(row, 'url', `https://instagram.com/${username.replace('@', '')}`),
        firstTagging: parseDate(getCellValue(row, 'firstTagging', null)) || '2024-01-01',
        type: typeMap[type] || '인스타 크롤링',
        status: statusMap[status] || '태핑 완료 회신대기',
        hasReply: getCellValue(row, 'hasReply', false) === true || getCellValue(row, 'hasReply', '') === 'Y',
        isRejected: status === '거절',
        googleFormSent: getCellValue(row, 'googleFormSent', false) === true || getCellValue(row, 'googleFormSent', '') === 'Y',
        googleFormReply: getCellValue(row, 'googleFormReply', false) === true || getCellValue(row, 'googleFormReply', '') === 'Y',
        confirmedDate: parseDate(getCellValue(row, 'confirmedDate', null)),
        hospital: hospitalNameMap[hospitalName] || hospitalName,
        contentGuideSent: getCellValue(row, 'contentGuideSent', false) === true || getCellValue(row, 'contentGuideSent', '') === 'Y',
        procedureCompleted: getCellValue(row, 'procedureCompleted', false) === true || getCellValue(row, 'procedureCompleted', '') === 'Y',
        postLink: getCellValue(row, 'postLink', ''),
        scheduledPostDate: parseDate(getCellValue(row, 'scheduledPostDate', null)),
        guidelines: getCellValue(row, 'guidelines', ''),
        views: Number(getCellValue(row, 'views', 0)),
        likes: Number(getCellValue(row, 'likes', 0)),
        saves: Number(getCellValue(row, 'saves', 0)),
        round: Number(getCellValue(row, 'round', 1))
      });

      // Create ContactInfo record if contact data exists
      if (getCellValue(row, 'phoneNumber', '') || getCellValue(row, 'englishName', '') || getCellValue(row, 'koreanName', '')) {
        contacts.push({
          id: `contact_${influencerId}`,
          influencerId: influencerId,
          hospitalDelivered: getCellValue(row, 'hospitalDelivered', false) === true || getCellValue(row, 'hospitalDelivered', '') === 'Y',
          instagramAccount: username.startsWith('@') ? username : `@${username}`,
          followerCount: Number(getCellValue(row, 'followerCount', 0)),
          englishName: getCellValue(row, 'englishName', ''),
          koreanName: getCellValue(row, 'koreanName', ''),
          phoneNumber: getCellValue(row, 'phoneNumber', ''),
          birthDate: parseDate(getCellValue(row, 'birthDate', null)),
          nationality: getCellValue(row, 'nationality', '한국'),
          language: getCellValue(row, 'language', '한국어'),
          appointmentDate: parseDate(getCellValue(row, 'appointmentDate', null)),
          appointmentTime: getCellValue(row, 'appointmentTime', ''),
          additionalProcedure: getCellValue(row, 'additionalProcedure', ''),
          reservationConfirmed: getCellValue(row, 'reservationConfirmed', false) === true || getCellValue(row, 'reservationConfirmed', '') === 'Y',
          procedureDday: Number(getCellValue(row, 'procedureDday', 0)),
          reminded: getCellValue(row, 'reminded', false) === true || getCellValue(row, 'reminded', '') === 'Y'
        });
      }
    });

    return { influencers, contacts };
  } catch (error) {
    console.error(`Error parsing ${hospitalName}:`, error);
    return { influencers: [], contacts: [] };
  }
}

// Load all Excel data
export function loadAllExcelData(): {
  influencers: Influencer[],
  contactInfo: ContactInfo[],
  campaigns: Campaign[],
  hospitals: string[]
} {
  const docsPath = path.join(process.cwd(), 'docs');
  const allInfluencers: Influencer[] = [];
  const allContacts: ContactInfo[] = [];
  const campaigns: Campaign[] = [];
  const hospitals: string[] = [];

  try {
    // First, load overall.xlsx if it exists
    const overallPath = path.join(docsPath, 'overall.xlsx');
    if (fs.existsSync(overallPath)) {
      const overallInfluencers = parseOverallExcel(overallPath);
      allInfluencers.push(...overallInfluencers);
    }

    // Then load hospital-specific files
    const hospitalFiles = {
      '동안센트럴의원': '동안센트럴의원.xlsx',
      '오블리브의원': '오블리브의원.xlsx',
      '유온느의원': '유온느의원.xlsx',
      '벤자민의원': '벤자민의원.xlsx'
    };

    Object.entries(hospitalFiles).forEach(([hospitalKey, fileName]) => {
      const filePath = path.join(docsPath, fileName);

      if (fs.existsSync(filePath)) {
        const { influencers, contacts } = parseHospitalExcel(filePath, hospitalKey);
        const hospitalName = hospitalNameMap[hospitalKey] || hospitalKey;

        // Add to lists
        allInfluencers.push(...influencers);
        allContacts.push(...contacts);
        hospitals.push(hospitalName);

        // Create campaign for this hospital
        campaigns.push({
          id: `campaign_${hospitalKey}`,
          name: `${hospitalName} Campaign`,
          hospital: hospitalName,
          influencerIds: influencers.map(inf => inf.id)
        });
      }
    });

    console.log(`Loaded ${allInfluencers.length} influencers, ${allContacts.length} contacts, ${campaigns.length} campaigns`);

    return {
      influencers: allInfluencers,
      contactInfo: allContacts,
      campaigns,
      hospitals
    };
  } catch (error) {
    console.error('Error loading Excel data:', error);
    // Return empty data as fallback
    return {
      influencers: [],
      contactInfo: [],
      campaigns: [],
      hospitals: []
    };
  }
}