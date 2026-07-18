export interface AudioResponse {
  key: string;
  url: string;
  format: string;
  durationMs: number | null;
  expiresAt: string | null;
}
