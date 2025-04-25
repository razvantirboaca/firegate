export interface ChatMessage {
  id: string;
  role: 'user' | 'nova';
  content: string;
  timestamp: number;
  tags?: string[];
  metadata?: {
    contactLevel?: string;
    reason?: string;
  };
}
