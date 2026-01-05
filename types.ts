
export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: string;
  prediction: '1' | 'X' | '2';
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
