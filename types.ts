
export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  market1: string; // e.g., "Home Win (Handicap 0:2)"
  market2: string; // e.g., "Over 0.5 Home Goals"
  confidence: number;
  reasoning: string;
}

export interface PredictionState {
  matches: Match[];
  loading: boolean;
  error: string | null;
  date: string;
  groundingSources: Array<{ web: { uri: string; title: string } }>;
}

export interface SearchResponse {
  matches: Match[];
  summary: string;
}
