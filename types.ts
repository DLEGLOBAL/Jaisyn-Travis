import React from 'react';

export type Role = 'PICKER' | 'CONTESTANT' | 'SPECTATOR';
export type SubscriptionTier = 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type EntranceTheme = 'NONE' | 'GOLD_SPARKLE' | 'NEON_BLAST' | 'DARK_MIST' | 'BUBBLES';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  credits: number;
  earnings: number; // Real cash value
  bio?: string;
  followers?: number;
  following?: number;
  profileViews: number;
  customProfileHtml?: string;
  profileMusicUrl?: string; // New: Profile Anthem MP3
  isIdVerified: boolean;
  stripeConnected: boolean;
  subscriptionTier: SubscriptionTier;
  badges: string[]; // e.g. ['VERIFIED', 'OG', 'TOP_GIFTER']
  entranceTheme: EntranceTheme;
  hasCompletedOnboarding: boolean;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  mediaUrl?: string; // Generalized for Image or Video
  mediaType?: 'IMAGE' | 'VIDEO'; // New field
  content: string;
  likes: number;
  comments: number;
  timestamp: number;
  type: 'GAME_WIN' | 'LIVE_START' | 'STATUS' | 'MEDIA';
}

export interface Conversation {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  lastMessage: string;
  timestamp: number;
  unread: number;
}

export interface Contestant {
  id: string;
  name: string;
  age: number;
  job: string;
  bio: string;
  imageUrl: string; 
  stream?: MediaStream; 
  status: 'ACTIVE' | 'ELIMINATED';
  isLocal: boolean;
  peerId?: string; 
  
  compatibility: number; 
  sentiment: 'HAPPY' | 'NERVOUS' | 'FLIRTY' | 'ANGRY'; 
  mysteryFact: string; 
  isMysteryRevealed: boolean;
  superLikes: number; 
  
  isImmune: boolean; 
  giftsReceived: number; 
  
  connectionQuality: 'EXCELLENT' | 'GOOD' | 'POOR'; 
  isVerified: boolean; 
  clubName: string; 
  
  hasPetCam: boolean; 
  isWearingPaperBag: boolean; 
  heliumVoice: boolean; 
}

export interface GameState {
  role: Role;
  contestants: Contestant[];
  pickerName: string;
  round: number;
  isDoubleBlind: boolean; 
  timeRemaining: number; 
  credits: number; 
  isUpsideDown: boolean; 
  chaosModeActive: boolean;
}

export type Theme = 'CYBERPUNK' | 'RETRO' | 'VICTORIAN';

export interface GameSettings {
  videoQuality: '4K' | '1080p' | '720p'; 
  lowLatency: boolean; 
  greenScreen: boolean; 
  colorBlindMode: boolean; 
  captions: boolean; 
  theme: Theme; 
  incognitoMode: boolean; 
  geoFencing: boolean; 
  bandwidthSaver: boolean; 
  blurBackground: boolean; 
  serverRegion: 'US-EAST' | 'EU-WEST' | 'ASIA'; 
  batterySaver: boolean; 
}

export interface Poll {
  id: string;
  question: string;
  options: { label: string; votes: number }[];
  isActive: boolean;
  totalVotes: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
}

export interface AdminStats {
  totalUsers: number;
  activeGames: number;
  serverLoad: number;
  dataProcessed: string; 
}

export interface GiftItem {
    id: string;
    name: string;
    cost: number;
    category: 'REACTION' | 'LUXURY' | 'FOOD' | 'ANIMALS' | 'CHAOS' | 'ROMANCE';
    icon: React.ReactNode;
    desc: string;
    cashValue: number; // Amount creator earns
}