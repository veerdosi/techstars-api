# Techstars Portfolio API

> 🚀 Unofficial API for Techstars portfolio companies

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📊 Stats

- **Portfolio Companies** tracked from Techstars
- **Manual updates:** Run locally and push to GitHub Pages
- **Format:** JSON REST API
- **Deployment:** GitHub Pages

## 🚀 GitHub Pages Deployment

### Step 1: Enable GitHub Pages

1. Go to your repo on GitHub
2. Go to **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** (or master)
5. Folder: **/ (root)**
6. Click **Save**

### Step 2: Update Data

Run locally to generate API files:

```bash
npm install
npm run fetch        # Resume from last checkpoint (if exists)
npm run fetch:fresh  # Start fresh (ignore checkpoints)
```

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Update API data"
git push origin main
```

Your API will be available at: `https://[username].github.io/[repo-name]/api/`

## 🔄 Resume Capability

The scraper automatically saves progress after each industry. If interrupted, it will resume from where it left off:

```bash
# First run - fetches industries 1-20, then crashes
npm run fetch

# Second run - automatically resumes from industry 21
npm run fetch

# Force fresh start (ignore saved progress)
npm run fetch:fresh
```

**Progress files created:**
- `./api/checkpoint.json` - Resume point and progress tracker (auto-deleted when complete)
- `./api/industries/[industry].json` - Individual industry data (saved immediately)

**Note:** The checkpoint file is automatically deleted once all 53 industries are successfully fetched.

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/veerdosi/techstars-api.git
cd techstars-api
```

### 2. Install Dependencies

```bash
# Install Puppeteer for web scraping
npm install
```

### 3. Run the Data Fetcher

```bash
# Fetch portfolio data from Techstars using headless browser
npm run fetch
```

## 📋 API Endpoints

### Core Endpoints

| Endpoint           | Path                               | Description                       |
| ------------------ | ---------------------------------- | --------------------------------- |
| API Index          | `/api/index.json`                  | API documentation and endpoints   |
| All Companies      | `/api/companies/all.json`          | All portfolio companies           |
| Active Companies   | `/api/companies/active.json`       | Currently active companies        |
| Exits              | `/api/companies/exits.json`        | Acquired and IPO companies        |
| Acquired Companies | `/api/companies/acquired.json`     | Companies that were acquired      |
| IPO Companies      | `/api/companies/ipo.json`          | Companies that went public        |
| Billion+ Companies | `/api/companies/billion-plus.json` | Companies valued at $1B+          |
| B Corp Companies   | `/api/companies/bcorp.json`        | Certified B Corporation companies |
| In Program         | `/api/companies/in-program.json`   | Companies currently in program    |
| Closed Companies   | `/api/companies/closed.json`       | Companies that are closed         |
| API Metadata       | `/api/meta.json`                   | API statistics and metadata       |

### Industry Verticals (53+ Industries)

| Endpoint                 | Path                                   | Description                    |
| ------------------------ | -------------------------------------- | ------------------------------ |
| Industries Index         | `/api/industries/index.json`           | List of all industry verticals |
| AI/ML Companies          | `/api/industries/ai-ml.json`           | 1515+ AI/ML companies          |
| Fintech Companies        | `/api/industries/fintech.json`         | 1034+ Fintech companies        |
| Healthtech Companies     | `/api/industries/healthtech.json`      | 401+ Healthtech companies      |
| Mobile Companies         | `/api/industries/mobile.json`          | 1202+ Mobile companies         |
| SaaS Companies           | `/api/industries/saas.json`            | 127+ SaaS companies            |
| Cybersecurity Companies  | `/api/industries/cybersecurity.json`   | 113+ Cybersecurity companies   |
| Gaming Companies         | `/api/industries/gaming.json`          | 188+ Gaming companies          |
| Edtech Companies         | `/api/industries/edtech.json`          | 238+ Edtech companies          |
| Cleantech Companies      | `/api/industries/cleantech.json`       | 339+ Cleantech companies       |
| Climate Tech Companies   | `/api/industries/climate-tech.json`    | 344+ Climate tech companies    |
| **+ 42 more industries** | `/api/industries/[industry-slug].json` | See index for complete list    |

### Individual Resources

- **Individual Company:** `/api/companies/[company-slug].json`
- **Industry Vertical:** `/api/industries/[industry-slug].json`

## 💻 Usage Examples

### Python

```python
import requests

# Fetch all companies
response = requests.get('https://veerdosi.github.io/techstars-api/api/companies/all.json')
companies = response.json()

# Fetch metadata
response = requests.get('https://veerdosi.github.io/techstars-api/api/meta.json')
metadata = response.json()
print(f"Total companies: {metadata['total_companies']}")

# Fetch AI/ML companies
response = requests.get('https://veerdosi.github.io/techstars-api/api/industries/ai-ml.json')
ai_companies = response.json()
print(f"AI/ML companies: {len(ai_companies)}")

# Fetch all available industries
response = requests.get('https://veerdosi.github.io/techstars-api/api/industries/index.json')
industries = response.json()
print(f"Available industries: {len(industries)}")

for industry in industries[:5]:  # Show first 5 industries
    print(f"- {industry['name']}: {industry['company_count']} companies")
```

## 🏗️ Data Structure

### Company Object

```typescript
interface TechstarsCompany {
  id: number;
  name: string;
  slug: string;
  website: string;
  description: string;
  one_liner: string;
  location: string;
  industry: string; // Accurate industry from vertical filtering
  industry_slug: string; // URL-friendly industry slug
  subindustry: string;
  status: "Active" | "Acquired" | "IPO" | "Closed";
  founded_year?: number;
  logo_url?: string;
  is_billion_plus: boolean;
  is_in_program: boolean;
  is_bcorp: boolean;
  tags: string[];
  url: string;
  api: string;
}
```

### Industry Object

```typescript
interface TechstarsIndustry {
  name: string; // e.g., "Artificial intelligence and machine learning"
  slug: string; // e.g., "ai-ml"
  company_count: number; // Number of companies in this industry
  api_endpoint: string; // e.g., "/api/industries/ai-ml.json"
}
```

## 🔧 Development

### Project Structure

```
techstars-api/
├── README.md
├── LICENSE
├── deno.json                  # Deno configuration
├── index.html                 # Landing page
├── fetcher.ts                 # Main data fetcher
├── generate-endpoints.ts      # API endpoint generator
├── types.ts                   # TypeScript interfaces
├── .github/workflows/
│   └── update-data.yml        # GitHub Actions workflow
├── scripts/
│   └── generate-readme.ts     # README generator
├── api/
│   ├── companies/             # Company JSON files
│   ├── industries/            # Industry JSON files (53+ verticals)
│   ├── index.json             # API documentation
│   └── meta.json              # API metadata
└── meta.json                  # API metadata
```

### Available Tasks

```bash
# Run data fetcher (with resume capability)
npm run fetch

# Run data fetcher with fresh start (ignore checkpoints)
npm run fetch:fresh

# Run data fetcher in debug mode (visible browser)
npm run fetch:debug

# Run data fetcher fresh start in debug mode
npm run fetch:fresh-debug

# Install dependencies
npm install

# Start data fetching (same as fetch)
npm start
```

### Local Development

```bash
# Clone and setup
git clone https://github.com/veerdosi/techstars-api.git
cd techstars-api

# Install dependencies
npm install

# Fetch data
npm run fetch

# Start local server (optional)
npx http-server . -p 8080
```

## 🤖 Automation

### Manual Data Collection

Run this monthly to update the portfolio data:

```bash
# Monthly data collection
npm run fetch

# Check what was collected
cat meta.json
ls companies/

# Commit and push changes
git add .
git commit -m "📊 Monthly data update - $(date)"
git push
```

### Data Collection Features

The system:

- **Uses headless browser** for JavaScript-rendered content
- **Monitors network requests** for API endpoints
- **Tries multiple extraction strategies**
- **Validates data quality** before saving
- **Generates comprehensive API endpoints**

## 📊 Data Sources

The API extracts data from:

- **Techstars portfolio pages** (https://www.techstars.com/portfolio)
- **Industry-filtered pages** (53+ verticals like `?industry_vertical=Artificial+intelligence+and+machine+learning`)
- **JavaScript-rendered content** via Puppeteer headless browser
- **Infinite scroll pagination** to load all companies
- **Dynamic DOM elements** after page load
- **Network API calls** monitoring
