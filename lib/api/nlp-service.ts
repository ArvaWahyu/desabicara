// API service for NLP Flask backend

const NLP_API_BASE_URL = process.env.NEXT_PUBLIC_NLP_API_URL || 'http://localhost:5000';

export interface TranslationRequest {
  text: string;
  dialect?: 'Api' | 'Nyo';
  simplify?: boolean;
}

export interface TranslationResponse {
  success: boolean;
  original: string;
  case_folding: string;
  tokens: string[];
  normalized_tokens: string[];
  translated_tokens: string[];
  translated_text: string;
  simplified_text: string | null;
  dialect: string;
  processing_time_ms: number;
  nlp_steps: {
    case_folding: string;
    tokenization: string[];
    normalization: string[];
    translation: string[];
  };
  error?: string;
}

export interface SimplificationRequest {
  text: string;
}

export interface SimplificationResponse {
  success: boolean;
  original: string;
  simplified: string;
  applied_rules: Array<{ formal: string; simple: string }>;
  word_count: number;
  rules_applied: number;
  error?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  stats: {
    translator: {
      total_entries: number;
      current_dialect: string;
    };
    simplifier: {
      total_rules: number;
      rules_available: number;
    };
    database_connected: boolean;
  };
  error?: string;
}

class NLPService {
  private baseUrl: string;

  constructor(baseUrl: string = NLP_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw new Error('Unknown error occurred');
    }
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    return this.request<TranslationResponse>('/translate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async simplify(request: SimplificationRequest): Promise<SimplificationResponse> {
    return this.request<SimplificationResponse>('/simplify', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health', {
      method: 'GET',
    });
  }
}

// Export singleton instance
export const nlpService = new NLPService();
