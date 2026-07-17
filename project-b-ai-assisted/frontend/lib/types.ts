export interface ShortenResponse {
  short_code: string;
  short_url: string;
  long_url: string;
  created_at: string;
  expires_at: string | null;
}

export interface UrlStats {
  short_code: string;
  short_url: string;
  long_url: string;
  clicks: number;
  created_at: string;
  expires_at: string | null;
}

export interface ApiError {
  detail: string;
}
