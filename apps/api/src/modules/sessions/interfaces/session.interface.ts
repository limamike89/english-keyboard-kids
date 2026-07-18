export interface SessionResponse {
  sessionToken: string;
  user: {
    id: string;
    displayName: string;
    language: string;
    isAnonymous: boolean;
    xp: number;
    coins: number;
  };
}

export interface CurrentSessionResponse {
  id: string;
  displayName: string;
  language: string;
  isAnonymous: boolean;
  xp: number;
  coins: number;
  stats: {
    gamesPlayed: number;
    totalCorrect: number;
    totalIncorrect: number;
  };
}
