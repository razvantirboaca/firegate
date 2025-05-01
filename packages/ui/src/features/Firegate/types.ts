export type ChatMessage = {
  id?: string;
  role: 'user' | 'nova';
  content: string;
  layer?: '3D' | '4D' | '5D' | '6D' | '7D';
  timestamp?: string;
  tags?: string[];
  contactLevel?: string;
  translated?: string | null;
  lang?: string;
  reason?: string;
  logged?: boolean;
};
