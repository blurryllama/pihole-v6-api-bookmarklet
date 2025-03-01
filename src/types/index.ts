// Pi-hole API response types
export interface AuthResponse {
  session?: {
    sid: string;
  };
  error?: string;
}

export interface BlockingResponse {
  status: string;
  error?: string;
}

// Settings types
export interface PiholeSettings {
  baseUrl: string;
  password: string;
}

// Duration option type
export interface DurationOption {
  value: number;
  label: string;
}

// Status message type
export interface StatusMessage {
  text: string;
  type: 'success' | 'error' | '';
} 