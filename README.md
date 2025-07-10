# Techstars Portfolio API

> 🚀 Unofficial API for Techstars portfolio companies, similar to the YC API

[![Update Data](https://github.com/veerdosi/techstars-api/actions/workflows/update-data.yml/badge.svg)](https://github.com/your-username/techstars-api/actions/workflows/update-data.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Deno](https://img.shields.io/badge/Deno-000000?logo=deno&logoColor=white)](https://deno.land/)

## 📊 Stats

- **Portfolio Companies** tracked from Techstars
- **Auto-updated:** Daily via GitHub Actions
- **Format:** JSON REST API
- **Deployment:** GitHub Pages

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/techstars-api.git
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

| Endpoint           | Path                           | Description                       |
| ------------------ | ------------------------------ | --------------------------------- |
| All Companies      | `/companies/all.json`          | All portfolio companies           |
| Active Companies   | `/companies/active.json`       | Currently active companies        |
| Exits              | `/companies/exits.json`        | Acquired and IPO companies        |
| Acquired Companies | `/companies/acquired.json`     | Companies that were acquired      |
| IPO Companies      | `/companies/ipo.json`          | Companies that went public        |
| Billion+ Companies | `/companies/billion-plus.json` | Companies valued at $1B+          |
| B Corp Companies   | `/companies/bcorp.json`        | Certified B Corporation companies |
| In Program         | `/companies/in-program.json`   | Companies currently in program    |
| Closed Companies   | `/companies/closed.json`       | Companies that are closed         |

### Filter Endpoints

| Endpoint         | Path                     | Description                  |
| ---------------- | ------------------------ | ---------------------------- |
| Batches Index    | `/batches/index.json`    | All batches with metadata    |
| Programs Index   | `/programs/index.json`   | All programs with metadata   |
| Industries Index | `/industries/index.json` | All industries with metadata |
| Regions Index    | `/regions/index.json`    | All regions with metadata    |
| API Metadata     | `/meta.json`             | API statistics and metadata  |

### Individual Resources

- **Individual Company:** `/companies/[company-slug].json`
- **Batch Details:** `/batches/[batch-name].json`
- **Industry Details:** `/industries/[industry-name].json`
- **Region Details:** `/regions/[region-name].json`

## 💻 Usage Examples

### JavaScript/TypeScript

```javascript
// Fetch all companies
const companies = await fetch(
  "https://your-username.github.io/techstars-api/companies/all.json"
).then((response) => response.json());

// Fetch only active companies
const activeCompanies = await fetch(
  "https://your-username.github.io/techstars-api/companies/active.json"
).then((response) => response.json());

// Fetch companies by industry
const techCompanies = await fetch(
  "https://your-username.github.io/techstars-api/industries/technology.json"
).then((response) => response.json());
```

### Python

```python
import requests

# Fetch all companies
response = requests.get('https://your-username.github.io/techstars-api/companies/all.json')
companies = response.json()

# Fetch metadata
response = requests.get('https://your-username.github.io/techstars-api/meta.json')
metadata = response.json()
print(f"Total companies: {metadata['total_companies']}")
```

### cURL

```bash
# Get all companies
curl -s "https://your-username.github.io/techstars-api/companies/all.json" | jq '.'

# Get exits only
curl -s "https://your-username.github.io/techstars-api/companies/exits.json" | jq '.[] | {name, status, batch}'

# Get API metadata
curl -s "https://your-username.github.io/techstars-api/meta.json" | jq '.'
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
  batch: string;
  program: string;
  location: string;
  region: string;
  industry: string;
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

### Batch Object

```typescript
interface TechstarsBatch {
  name: string;
  year: number;
  program: string;
  location: string;
  companies: TechstarsCompany[];
  company_count: number;
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
├── companies/                 # Company JSON files
├── batches/                   # Batch JSON files
├── industries/                # Industry JSON files
├── regions/                   # Region JSON files
└── meta.json                  # API metadata
```

### Available Tasks

```bash
# Run data fetcher
npm run fetch

# Install dependencies
npm install

# Start data fetching
npm start
```

### Local Development

```bash
# Clone and setup
git clone https://github.com/your-username/techstars-api.git
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
- **JavaScript-rendered content** via Puppeteer headless browser
- **Next.js `__NEXT_DATA__`** when available
- **Dynamic DOM elements** after page load
- **Network API calls** monitoring

## 🔒 Rate Limiting & Ethics

### Best Practices

- **Respects robots.txt** and rate limits
- **Caches responses** to minimize requests
- **Uses appropriate user agents**
- **Monitors for ToS changes**
- **Provides attribution** and disclaimers

### Compliance

- **Educational/research use** case
- **No commercial use** without permission
- **Proper attribution** to Techstars
- **Respects copyright** on logos/images

## 🚀 Deployment

### GitHub Pages Setup

1. **Enable GitHub Pages** in repository settings
2. **Select source:** GitHub Actions
3. **The workflow will automatically deploy** after data updates

### Custom Domain (Optional)

1. Add `CNAME` file with your domain
2. Update DNS records
3. Enable HTTPS in GitHub Pages settings

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- **Data extraction accuracy**
- **New filtering options**
- **Performance optimizations**
- **Documentation improvements**
- **Error handling**

### Development Process

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is an **unofficial API** created for educational and research purposes. It is **not affiliated with, endorsed by, or sponsored by Techstars**. The data is publicly available information extracted from Techstars' website.

### Terms of Use

- ✅ Educational and research purposes
- ✅ Open source projects
- ❌ Commercial use without permission
- ❌ Violating Techstars' terms of service

## 🙏 Acknowledgments

- **Inspired by:** [YC API](https://github.com/reworkd/ycapi)
- **Built with:** [Deno](https://deno.land/)
- **Hosted on:** [GitHub Pages](https://pages.github.com/)
- **Data from:** [Techstars](https://www.techstars.com/)

## 📞 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/your-username/techstars-api/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/your-username/techstars-api/discussions)
- 📧 **Email:** your-email@example.com

---

**Made with ❤️ by [Your Name](https://github.com/your-username)**
