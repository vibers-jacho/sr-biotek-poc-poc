import { Influencer } from '../types';
import { mockInfluencers as originalInfluencers } from './realData';
import { calculateAllMetrics } from '../utils/metrics';

// Sample data for analytics fields
const countries = ['한국', '미국', '일본', '독일', '중국', '영국', '프랑스', '호주', '인도', '캐나다', '브라질', '태국', '싱가포르', '멕시코', '스페인'];
const followerTypes: Array<'메가' | '매크로' | '마이크로' | '나노'> = ['메가', '매크로', '마이크로', '나노'];
const staffMembers = ['김민주', '박영수', '이서연', '최민수', '정유진', '한상호'];
const campaigns = ['Dongan Central Clinic', 'Oblive Clinic', 'Yuonne Clinic', 'Benjamin Clinic'];
const costTypes: Array<'무가' | '유가'> = ['무가', '유가'];

// Helper function to get random item from array
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random number in range
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get random date in the past 60 days
const getRandomDate = (): string => {
  const daysAgo = getRandomInt(0, 60);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Helper function to generate follower count based on type
const generateFollowerCount = (type: '메가' | '매크로' | '마이크로' | '나노'): number => {
  switch (type) {
    case '메가':
      return getRandomInt(500000, 2000000);
    case '매크로':
      return getRandomInt(100000, 500000);
    case '마이크로':
      return getRandomInt(30000, 100000);
    case '나노':
      return getRandomInt(5000, 30000);
  }
};

/**
 * Enhance influencer data with analytics fields
 */
export const enhanceInfluencerWithMetrics = (influencer: Influencer, index: number): Influencer => {
  // Generate analytics fields
  const followerType = getRandomItem(followerTypes);
  const followerCount = generateFollowerCount(followerType);
  const country = getRandomItem(countries);
  const staff = getRandomItem(staffMembers);
  const campaign = getRandomItem(campaigns);
  const costType = getRandomItem(costTypes);
  const responseRate = parseFloat((40 + Math.random() * 50).toFixed(1));
  const date = getRandomDate();

  // Generate engagement metrics based on follower count
  const engagementRate = 0.02 + Math.random() * 0.08; // 2-10% engagement
  const views = Math.floor(followerCount * (0.1 + Math.random() * 0.4)); // 10-50% of followers
  const likes = Math.floor(views * engagementRate);
  const comments = Math.floor(likes * (0.01 + Math.random() * 0.05)); // 1-5% of likes
  const shares = Math.floor(views * 0.005 * Math.random()); // ~0.5% of views
  const saves = Math.floor(likes * (0.1 + Math.random() * 0.2)); // 10-30% of likes

  // Calculate metrics
  const metrics = calculateAllMetrics({
    views,
    likes,
    comments,
    followerCount,
    followerType,
    costType
  });

  return {
    ...influencer,
    // Update existing engagement fields
    views,
    likes,
    saves,
    // Add new analytics fields
    country,
    followerType,
    followerCount,
    staff,
    campaign,
    costType,
    responseRate,
    comments,
    shares,
    date,
    emv: metrics.emv,
    roas: metrics.roas,
    cost: metrics.cost
  };
};

/**
 * Enhanced influencer data with analytics metrics
 */
export const mockInfluencersWithMetrics: Influencer[] = originalInfluencers.map((influencer, index) =>
  enhanceInfluencerWithMetrics(influencer, index)
);