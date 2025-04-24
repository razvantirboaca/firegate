export interface LogEntry {
  id: string;
  user: string;
  message: string;
  tags: string[];
  timestamp: number;
  translated?: Record<string, string>; // { ro: "...", es: "..." }
}
