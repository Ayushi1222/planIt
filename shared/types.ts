import type { Content } from "@google/genai";

declare global {
  interface Window {
    google: any;
  }
}

export type ActivityCategory = 'Dining' | 'Outdoors' | 'Relaxing' | 'Entertainment' | 'Family' | 'Culture';

export interface ManualActivity {
  id: string;
  title: string;
  category: ActivityCategory;
  time?: string;
  notes?: string;
}

export type BrowserActivity = Omit<ManualActivity, 'id'>;

export interface Day {
  id: string;
  name: string;
  date: string;
  activities: ManualActivity[];
}

export interface Plan {
  id: string;
  name: string;
  days: Day[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Preferences {
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dates: {
    start: string;
    end: string;
  };
  pace: string;
  vibe: string;
  budget: string;
  interests: string[];
  dietaryNeeds: string[];
  group: string;
  distance: string;
  occasion: string;
  accommodation: string[];
  transportation: string;
}

export interface GroundingMetadataSource {
  uri: string;
  title?: string;
}

export interface Location {
  name?: string;
  address: string;
}

export interface TravelInfo {
  mode: string;
  duration: string;
  distance?: string | null;
  from?: string | null;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: Location;
  category: 'Dining' | 'Entertainment' | 'Relaxation' | 'Activity' | 'Nightlife' | 'Shopping' | 'Culture' | 'History & Heritage' | 'Nature & Parks' | 'Special Event' | 'Outdoor Activities' | 'Travel' | 'Art & Culture' | 'Live Music';
  estimatedCost: string;
  isSpecialEvent: boolean;
  bookingPartner?: 'Zomato' | 'BookMyShow' | 'Internal' | null;
  travelInfo: TravelInfo;
}

export interface DayPlan {
  day: string;
  theme: string;
  activities: Activity[];
}

export interface Itinerary {
  title: string;
  totalEstimatedCost: string;
  itinerary: DayPlan[];
  preferences: Preferences;
  sources: GroundingMetadataSource[];
}

export interface SavedPlan extends Itinerary {
  chatHistory?: Content[];
}