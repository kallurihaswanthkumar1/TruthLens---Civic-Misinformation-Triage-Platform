export type Platform = 
  | 'WhatsApp' 
  | 'Telegram'
  | 'Signal'
  | 'WeChat'
  | 'SMS / Text'
  | 'X' 
  | 'Instagram' 
  | 'TikTok' 
  | 'YouTube' 
  | 'Facebook' 
  | 'Reddit' 
  | 'Threads' 
  | 'Discord'
  | 'LinkedIn'
  | 'Community Boards (Nextdoor/Citizen)'
  | 'News / Web'
  | 'Email / Newsletter'
  | 'Podcast / Audio'
  | 'Physical Flyer'
  | 'Other';

export type Category = 
  | 'Public Health & Medical'
  | 'Financial Scams & Banking'
  | 'Disasters & Severe Weather'
  | 'Civic, Taxes & Govt Benefits'
  | 'Elections & Voting'
  | 'Workplace & Employment'
  | 'Education & Schools'
  | 'Food & Consumer Safety'
  | 'AI & Deepfake Media'
  | 'Local Crime & Public Safety'
  | 'Cyber Threats & Phishing'
  | 'Science & Climate'
  | 'War & Geopolitical Conflict'
  | 'Politics'
  | 'Health'
  | 'Finance'
  | 'Other Real-Life Situation'
  | 'Other';

export type ClaimStatus = 'Unverified' | 'Verified True' | 'Verified False' | 'Misleading';

export type RiskFlagType = 'Sensational' | 'Shouting' | 'Unsourced';

export interface PossibleIssuesDetected {
  absoluteStatement: boolean;
  absoluteTerms: string[];
  emotionalWording: boolean;
  emotionalTerms: string[];
  missingSource: boolean;
}

export interface ClaimAnalysis {
  possibleIssues: PossibleIssuesDetected;
  suggestedSteps: string[];
  aiNotice: string; // "AI does not make the final decision."
}

export interface RiskFlags {
  sensational: boolean;
  shouting: boolean;
  unsourced: boolean;
  detectedKeywords: string[];
  capsPercentage: number;
  flagCount: number;
  isHighRisk: boolean; // 2+ flags
  analysis?: ClaimAnalysis;
}

export interface EditRecord {
  editedAt: string;
  previousText: string;
  newText: string;
  previousSourceUrl?: string;
  newSourceUrl?: string;
  reason?: string;
  previousFlags: RiskFlags;
  newFlags: RiskFlags;
}

export interface TeamComment {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  createdAt: string;
  text: string;
  taggedMembers?: string[];
  pinned?: boolean;
  category?: 'investigation' | 'source-verification' | 'legal' | 'editorial' | 'general';
}

export interface Claim {
  id: string;
  text: string;
  platform: Platform;
  category: Category;
  sourceUrl?: string;
  submittedAt: string;
  submitterName?: string;
  flags: RiskFlags;
  status: ClaimStatus;
  reviewerNote?: string;
  reviewerName?: string;
  reviewedAt?: string;
  evidenceUrls?: string[];
  evidenceAnalysis?: string[];
  analysis?: ClaimAnalysis;
  thumbnailTheme?: 'earthquake' | 'health' | 'finance' | 'politics' | 'forest' | 'flood' | 'generic';
  editHistory?: EditRecord[];
  teamComments?: TeamComment[];
}


export type ActiveView = 'dashboard' | 'feed' | 'triage' | 'submit' | 'detail' | 'guide';

export type FeedOrderPolicy = 'risk-first' | 'recency' | 'status-triage';
export type VisibilityPolicy = 'public-quarantine' | 'hold-unverified' | 'transparent-all';
export type EditPolicy = 'audit-reflag' | 'immutable-lock';

export interface DecisionPointsState {
  feedOrder: FeedOrderPolicy;
  visibility: VisibilityPolicy;
  editPolicy: EditPolicy;
}

