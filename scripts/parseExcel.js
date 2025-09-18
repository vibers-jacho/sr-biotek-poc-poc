const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Hospital name mapping
const hospitalNameMap = {
  '동안센트럴의원': 'Dongan Central Clinic',
  '오블리브의원': 'Oblive Clinic',
  '유온느의원': 'Yuonne Clinic',
  '벤자민의원': 'Benjamin Clinic',
  // Map actual values from Excel
  'Benjamin Clinic (Gangnam)': 'Benjamin Clinic',
  'Obliv Clinic (Incheon)': 'Oblive Clinic',
  'Dongahncentral Clinic (Yongsan)': 'Dongan Central Clinic',
  'Uonne Clinic (Mapo)': 'Yuonne Clinic',
  'Benjamin Clinic (Gangnam), Obliv Clinic (Incheon)': 'Benjamin Clinic' // Default to first hospital
};

// Status mapping from Korean to application values
const statusMap = {
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
const typeMap = {
  '인스타크롤링': '인스타 크롤링',
  '틱톡크롤링': '틱톡 크롤링',
  '인바운드메타': '인바운드 (메타)',
  '추가수동서치': '추가 수동 서치업',
  '재태핑': '재태핑',
  '인바운드DM': '인바운드 (DM)'
};

// Helper function to safely get cell value
function getCellValue(row, key, defaultValue = '') {
  return row[key] !== undefined && row[key] !== null ? row[key] : defaultValue;
}

// Helper function to parse date
function parseDate(dateValue) {
  if (!dateValue) return '';

  // Excel stores dates as numbers
  if (typeof dateValue === 'number') {
    // Excel date serial number to JS date
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 86400000;
    const date = new Date(excelEpoch.getTime() + dateValue * msPerDay);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // If already a string, return as is
  if (typeof dateValue === 'string') {
    return dateValue;
  }

  return '';
}

// Parse overall.xlsx for main influencer data
function parseOverallExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log('Parsing overall.xlsx - Sheet:', sheetName);
    console.log('Found', jsonData.length, 'rows');

    // Log first row to understand column names
    if (jsonData.length > 0) {
      console.log('Column names:', Object.keys(jsonData[0]));
      console.log('First row sample:', jsonData[0]);
    }

    return jsonData.map((row, index) => {
      // Try different possible column names - based on actual Excel columns
      const username = getCellValue(row, '1열',
                      getCellValue(row, 'username', `@user_${index + 1}`));

      const status = getCellValue(row, '상태',
                    getCellValue(row, 'status', '태핑 완료 회신대기'));

      const type = getCellValue(row, '유형',
                  getCellValue(row, 'type', '인스타 크롤링'));

      return {
        id: String(index + 1),
        username: username.startsWith('@') ? username : `@${username}`,
        url: getCellValue(row, '인플루언서 URL', `https://instagram.com/${username.replace('@', '')}`),
        firstTagging: parseDate(getCellValue(row, '최초태깅',
                      getCellValue(row, '첫태깅날짜', null))) || '2024-01-01',
        type: typeMap[type] || type || '인스타 크롤링',
        status: statusMap[status] || status || '태핑 완료 회신대기',
        hasReply: getCellValue(row, '회신 여부', false) === true ||
                 getCellValue(row, '회신 여부', '') === 'Y' ||
                 getCellValue(row, '회신 여부', '') === 'O',
        isRejected: getCellValue(row, '거절 여부', false) === true ||
                   getCellValue(row, '거절 여부', '') === 'Y',
        googleFormSent: getCellValue(row, '구글폼 전송', false) === true ||
                       getCellValue(row, '구글폼 전송', '') === 'Y' ||
                       getCellValue(row, '구글폼 전송', '') === 'O',
        googleFormReply: getCellValue(row, '구글폼 회신', false) === true ||
                        getCellValue(row, '구글폼 회신', '') === 'Y' ||
                        getCellValue(row, '구글폼 회신', '') === 'O',
        confirmedDate: parseDate(getCellValue(row, '확정날짜', null)),
        hospital: hospitalNameMap[getCellValue(row, '병원', '')] || getCellValue(row, '병원', ''),
        contentGuideSent: getCellValue(row, '콘텐츠가이드 전송', false) === true ||
                         getCellValue(row, '콘텐츠가이드 전송', '') === 'Y' ||
                         getCellValue(row, '콘텐츠가이드 전송', '') === 'O',
        procedureCompleted: getCellValue(row, '시술완료', false) === true ||
                           getCellValue(row, '시술완료', '') === 'Y' ||
                           getCellValue(row, '시술완료', '') === 'O',
        postLink: getCellValue(row, '포스팅링크', ''),
        scheduledPostDate: parseDate(getCellValue(row, '포스팅 예정일', null)),
        guidelines: getCellValue(row, '가이드라인', ''),
        views: Number(getCellValue(row, '조회수', 0)),
        likes: Number(getCellValue(row, '좋아요', 0)),
        saves: Number(getCellValue(row, '저장', 0)),
        round: Number(getCellValue(row, '회차', 1))
      };
    });
  } catch (error) {
    console.error('Error parsing overall.xlsx:', error);
    return [];
  }
}

// Parse hospital-specific Excel files
function parseHospitalExcel(filePath, hospitalName) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`\nParsing ${hospitalName} - Sheet:`, sheetName);
    console.log('Found', jsonData.length, 'rows');

    // Log first row to understand column names
    if (jsonData.length > 0) {
      console.log('Column names:', Object.keys(jsonData[0]));
    }

    const influencers = [];
    const contacts = [];

    jsonData.forEach((row, index) => {
      const influencerId = `${hospitalName}_${index + 1}`;

      // Try different possible column names - handles columns with line breaks
      const instaAccountField = Object.keys(row).find(key => key.includes('인스타 계정')) || '인스타 계정';
      const accountData = getCellValue(row, instaAccountField, '');

      // Extract username and follower count if they're combined
      let username = accountData;
      let followerCount = 0;
      if (typeof accountData === 'string' && accountData.includes('(')) {
        const match = accountData.match(/(.+)\((\d+)\)/);
        if (match) {
          username = match[1].trim();
          followerCount = Number(match[2]);
        }
      }

      username = username || `@user_${index + 1}`;

      const status = getCellValue(row, '상태',
                    getCellValue(row, 'status', '태핑 완료 회신대기'));

      const type = getCellValue(row, '유형',
                  getCellValue(row, 'type', '인스타 크롤링'));

      // Create Influencer record
      influencers.push({
        id: influencerId,
        username: username.startsWith('@') ? username : `@${username}`,
        url: getCellValue(row, 'url',
            getCellValue(row, 'URL',
            getCellValue(row, '링크', `https://instagram.com/${username.replace('@', '')}`))),
        firstTagging: parseDate(getCellValue(row, 'firstTagging',
                      getCellValue(row, '최초태깅',
                      getCellValue(row, '첫태깅날짜', null)))) || '2024-01-01',
        type: typeMap[type] || '인스타 크롤링',
        status: statusMap[status] || '태핑 완료 회신대기',
        hasReply: getCellValue(row, 'hasReply', false) === true ||
                 getCellValue(row, '회신여부', '') === 'Y' ||
                 getCellValue(row, '회신', '') === 'O',
        isRejected: status === '거절',
        googleFormSent: getCellValue(row, 'googleFormSent', false) === true ||
                       getCellValue(row, '구글폼전송', '') === 'Y' ||
                       getCellValue(row, '구글폼전송', '') === 'O',
        googleFormReply: getCellValue(row, 'googleFormReply', false) === true ||
                        getCellValue(row, '구글폼회신', '') === 'Y' ||
                        getCellValue(row, '구글폼회신', '') === 'O',
        confirmedDate: parseDate(getCellValue(row, 'confirmedDate',
                      getCellValue(row, '확정날짜', null))),
        hospital: hospitalNameMap[hospitalName] || hospitalName,
        contentGuideSent: getCellValue(row, 'contentGuideSent', false) === true ||
                         getCellValue(row, '콘텐츠가이드', '') === 'Y' ||
                         getCellValue(row, '가이드전송', '') === 'O',
        procedureCompleted: getCellValue(row, 'procedureCompleted', false) === true ||
                           getCellValue(row, '시술완료', '') === 'Y' ||
                           getCellValue(row, '시술완료', '') === 'O',
        postLink: getCellValue(row, 'postLink',
                 getCellValue(row, '포스팅링크', '')),
        scheduledPostDate: parseDate(getCellValue(row, 'scheduledPostDate',
                          getCellValue(row, '포스팅예정', null))),
        guidelines: getCellValue(row, 'guidelines',
                   getCellValue(row, '가이드라인', '')),
        views: Number(getCellValue(row, 'views',
               getCellValue(row, '조회수', 0))),
        likes: Number(getCellValue(row, 'likes',
               getCellValue(row, '좋아요', 0))),
        saves: Number(getCellValue(row, 'saves',
               getCellValue(row, '저장', 0))),
        round: Number(getCellValue(row, 'round',
               getCellValue(row, '회차', 1)))
      });

      // Create ContactInfo record if contact data exists
      // Find columns that might have line breaks
      const nameField = Object.keys(row).find(key => key.includes('이름')) || '이름';
      const phoneField = Object.keys(row).find(key => key.includes('전화번호')) || '전화번호';
      const birthDateField = Object.keys(row).find(key => key.includes('생년월일')) || '생년월일';
      const nationalityField = Object.keys(row).find(key => key.includes('국적')) || '국적';
      const languageField = Object.keys(row).find(key => key.includes('언어')) || '언어';
      const dateField = Object.keys(row).find(key => key.includes('날짜')) || '날짜';
      const timeField = Object.keys(row).find(key => key.includes('시간')) || '시간';
      const additionalField = Object.keys(row).find(key => key.includes('추가 시술')) || '추가 시술';
      const confirmField = Object.keys(row).find(key => key.includes('예약 확정')) || '예약 확정 여부';
      const ddayField = Object.keys(row).find(key => key.includes('Dday')) || '시술 Dday';
      const remindField = Object.keys(row).find(key => key.includes('리마인드')) || '리마인드';
      const hospitalDeliveredField = Object.keys(row).find(key => key.includes('병원')) || '병원 전달';

      const phoneNumber = getCellValue(row, phoneField, '');
      const koreanName = getCellValue(row, nameField, '');
      const englishName = '';

      if (phoneNumber || englishName || koreanName) {
        contacts.push({
          id: `contact_${influencerId}`,
          influencerId: influencerId,
          hospitalDelivered: getCellValue(row, hospitalDeliveredField, false) === true ||
                           getCellValue(row, hospitalDeliveredField, '') === 'Y' ||
                           getCellValue(row, hospitalDeliveredField, '') === 'O',
          instagramAccount: username.startsWith('@') ? username : `@${username}`,
          followerCount: followerCount || Number(getCellValue(row, '팔로워', 0)),
          englishName: englishName,
          koreanName: koreanName,
          phoneNumber: phoneNumber,
          birthDate: parseDate(getCellValue(row, birthDateField, null)),
          nationality: getCellValue(row, nationalityField, '한국'),
          language: getCellValue(row, languageField, '한국어'),
          appointmentDate: parseDate(getCellValue(row, dateField, null)),
          appointmentTime: getCellValue(row, timeField, ''),
          additionalProcedure: getCellValue(row, additionalField, ''),
          reservationConfirmed: getCellValue(row, confirmField, false) === true ||
                              getCellValue(row, confirmField, '') === 'Y' ||
                              getCellValue(row, confirmField, '') === 'O',
          procedureDday: Number(getCellValue(row, ddayField, 0)),
          reminded: getCellValue(row, remindField, false) === true ||
                   getCellValue(row, remindField, '') === 'Y' ||
                   getCellValue(row, remindField, '') === 'O'
        });
      }
    });

    return { influencers, contacts };
  } catch (error) {
    console.error(`Error parsing ${hospitalName}:`, error);
    return { influencers: [], contacts: [] };
  }
}

// Main function to load all Excel data
function loadAllExcelData() {
  const docsPath = path.join(__dirname, '..', 'docs');
  const allInfluencers = [];
  const allContacts = [];
  const campaigns = [];
  const hospitals = [];

  try {
    // First, load overall.xlsx if it exists - this contains ALL influencers
    const overallPath = path.join(docsPath, 'overall.xlsx');
    if (fs.existsSync(overallPath)) {
      console.log('\n=== Processing overall.xlsx ===');
      const overallInfluencers = parseOverallExcel(overallPath);
      allInfluencers.push(...overallInfluencers);
    } else {
      console.log('overall.xlsx not found');
    }

    // Then load hospital-specific files for CONTACT INFO ONLY
    const hospitalFiles = {
      '동안센트럴의원': '동안센트럴의원.xlsx',
      '오블리브의원': '오블리브의원.xlsx',
      '유온느의원': '유온느의원.xlsx',
      '벤자민의원': '벤자민의원.xlsx'
    };

    Object.entries(hospitalFiles).forEach(([hospitalKey, fileName]) => {
      const filePath = path.join(docsPath, fileName);

      if (fs.existsSync(filePath)) {
        console.log(`\n=== Processing ${fileName} for contact info ===`);
        const { influencers, contacts } = parseHospitalExcel(filePath, hospitalKey);
        const hospitalName = hospitalNameMap[hospitalKey] || hospitalKey;

        // Only add CONTACTS, not influencers (to avoid duplicates)
        // allInfluencers.push(...influencers); // COMMENTED OUT - don't add duplicates
        allContacts.push(...contacts);

        if (!hospitals.includes(hospitalName)) {
          hospitals.push(hospitalName);
        }

        // Create campaign for this hospital - but don't add influencerIds yet
        campaigns.push({
          id: `campaign_${hospitalKey}`,
          name: `${hospitalName} Campaign`,
          hospital: hospitalName,
          influencerIds: [] // Will be populated after all data is loaded
        });
      } else {
        console.log(`${fileName} not found`);
      }
    });

    // Now populate influencerIds in campaigns based on hospital field
    campaigns.forEach(campaign => {
      campaign.influencerIds = allInfluencers
        .filter(inf => inf.hospital === campaign.hospital)
        .map(inf => inf.id);
      console.log(`Campaign ${campaign.hospital}: ${campaign.influencerIds.length} influencers`);
    });

    console.log(`\n=== Summary ===`);
    console.log(`Loaded ${allInfluencers.length} influencers`);
    console.log(`Loaded ${allContacts.length} contacts`);
    console.log(`Created ${campaigns.length} campaigns`);

    // Generate the TypeScript file with the loaded data
    const outputContent = `// Auto-generated from Excel files
import { Influencer, ContactInfo, Campaign } from '../types';

export const mockInfluencers: Influencer[] = ${JSON.stringify(allInfluencers, null, 2)};

export const mockContactInfo: ContactInfo[] = ${JSON.stringify(allContacts, null, 2)};

export const mockCampaigns: Campaign[] = ${JSON.stringify(campaigns, null, 2)};

export const hospitals = ${JSON.stringify(hospitals, null, 2)};

export const statusOptions = [
  '태핑 완료 회신대기',
  '회신 수신',
  '구글폼 전송',
  '구글폼 회신',
  '예약 확정',
  '시술 완료',
  '포스팅 완료',
  '거절',
  '포스팅 지연',
  '취소'
];

export const typeOptions = [
  '인스타 크롤링',
  '틱톡 크롤링',
  '인바운드 (메타)',
  '추가 수동 서치업',
  '재태핑',
  '인바운드 (DM)'
];
`;

    // Write to the mockData.ts file
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'realData.ts');
    fs.writeFileSync(outputPath, outputContent, 'utf8');
    console.log(`\nData written to ${outputPath}`);

    return {
      influencers: allInfluencers,
      contactInfo: allContacts,
      campaigns,
      hospitals
    };
  } catch (error) {
    console.error('Error loading Excel data:', error);
    return {
      influencers: [],
      contactInfo: [],
      campaigns: [],
      hospitals: []
    };
  }
}

// Run the script
console.log('Starting Excel parsing...');
loadAllExcelData();