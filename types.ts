export interface TechstarsCompany {
  id: number;
  name: string;
  slug: string;
  website: string;
  description: string;
  one_liner: string;
  batch: string;
  program: string;
  location: string;
  region: string;
  industry: string;
  subindustry: string;
  status: 'Active' | 'Acquired' | 'IPO' | 'Closed';
  founded_year?: number;
  logo_url?: string;
  is_billion_plus: boolean;
  is_in_program: boolean;
  is_bcorp: boolean;
  tags: string[];
  url: string;
  api: string;
}

export interface TechstarsBatch {
  name: string;
  year: number;
  program: string;
  location: string;
  companies: TechstarsCompany[];
  company_count: number;
}

export interface TechstarsProgram {
  name: string;
  description: string;
  batches: string[];
  companies: TechstarsCompany[];
  company_count: number;
}

export interface TechstarsIndustry {
  name: string;
  companies: TechstarsCompany[];
  company_count: number;
}

export interface TechstarsRegion {
  name: string;
  companies: TechstarsCompany[];
  company_count: number;
}

export interface TechstarsMetadata {
  last_updated: string;
  total_companies: number;
  active_companies: number;
  acquired_companies: number;
  ipo_companies: number;
  closed_companies: number;
  billion_plus_companies: number;
  total_batches: number;
  total_programs: number;
  total_industries: number;
  total_regions: number;
  data_sources: string[];
}

export interface ScrapingConfig {
  base_url: string;
  portfolio_path: string;
  rate_limit_ms: number;
  max_retries: number;
  user_agent: string;
  headers: Record<string, string>;
}

export interface CompanyRawData {
  name?: string;
  website?: string;
  description?: string;
  batch?: string;
  program?: string;
  location?: string;
  industry?: string;
  status?: string;
  founded_year?: string | number;
  logo_url?: string;
  tags?: string[];
  [key: string]: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FetcherResults {
  companies: TechstarsCompany[];
  batches: TechstarsBatch[];
  programs: TechstarsProgram[];
  industries: TechstarsIndustry[];
  regions: TechstarsRegion[];
  metadata: TechstarsMetadata;
  errors: string[];
}