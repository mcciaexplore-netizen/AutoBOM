
export interface RateItem {
  id: string;
  name: string;
  unit: string;
  rate: number;
}

export interface BOMMetadata {
  projectName?: string;
  drawingNumber?: string;
  client?: string;
  date?: string;
  totalWeight?: string;
}

export interface BOMItem {
  category: string;
  item: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BOMResult {
  metadata: BOMMetadata;
  items: BOMItem[];
  totalCost: number;
  currency: string;
  notes?: string;
}

export type AIProvider = 'gemini' | 'groq';

export interface AppSettings {
  provider: AIProvider;
  geminiApiKey: string;
  groqApiKey: string;
  groqModel: string;
  businessName: string;
  businessAddress: string;
  businessContact: string;
}

export enum AppStep {
  RATE_LIST = 0,
  PROJECT_INPUT = 1,
  RESULTS = 2,
}
