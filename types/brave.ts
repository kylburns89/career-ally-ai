export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  is_source_local: boolean;
  is_source_both: boolean;
  age: string | null;
  family_friendly: boolean;
  meta_url: {
    scheme: string;
    netloc: string;
    path: string;
    query: string;
    fragment: string;
  };
}

export interface BraveSearchAPIResponse {
  type: string;
  web: {
    results: BraveSearchResult[];
    total: number;
  };
  query: {
    original: string;
  };
}

// Adapter type to maintain compatibility with existing code
export interface AdaptedSearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  source: string;
  published_date?: string;
}

export interface AdaptedSearchResponse {
  results: AdaptedSearchResult[];
  query: string;
  status: string;
}
