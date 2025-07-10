import { TechstarsMetadata } from '../types.ts';

class ReadmeGenerator {
  private metadata: TechstarsMetadata | null = null;
  
  private async loadMetadata(): Promise<void> {
    try {
      const metaContent = await Deno.readTextFile('./meta.json');
      this.metadata = JSON.parse(metaContent);
    } catch (error) {
      console.warn('Could not load metadata, using defaults:', error);
      this.metadata = {
        last_updated: new Date().toISOString(),
        total_companies: 0,
        active_companies: 0,
        acquired_companies: 0,
        ipo_companies: 0,
        closed_companies: 0,
        billion_plus_companies: 0,
        total_batches: 0,
        total_programs: 0,
        total_industries: 0,
        total_regions: 0,
        data_sources: []
      };
    }
  }
  
  private formatNumber(num: number): string {
    return num.toLocaleString();
  }
  
  private formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }
  
  private generateStatsTable(): string {
    if (!this.metadata) return '';
    
    const stats = [
      ['Total Companies', this.formatNumber(this.metadata.total_companies)],
      ['Active Companies', this.formatNumber(this.metadata.active_companies)],
      ['Acquired Companies', this.formatNumber(this.metadata.acquired_companies)],
      ['IPO Companies', this.formatNumber(this.metadata.ipo_companies)],
      ['Closed Companies', this.formatNumber(this.metadata.closed_companies)],
      ['Billion+ Companies', this.formatNumber(this.metadata.billion_plus_companies)],
      ['Total Batches', this.formatNumber(this.metadata.total_batches)],
      ['Total Programs', this.formatNumber(this.metadata.total_programs)],
      ['Industries', this.formatNumber(this.metadata.total_industries)],
      ['Regions', this.formatNumber(this.metadata.total_regions)]
    ];
    
    let table = '| Metric | Count |\n|--------|-------|\n';
    stats.forEach(([metric, count]) => {
      table += `| ${metric} | ${count} |\n`;
    });
    
    return table;
  }
  
  private generateEndpointsTable(): string {
    const endpoints = [
      // Core endpoints
      ['All Companies', '/companies/all.json', 'All portfolio companies'],
      ['Active Companies', '/companies/active.json', 'Currently active companies'],
      ['Exits', '/companies/exits.json', 'Acquired and IPO companies'],
      ['Acquired Companies', '/companies/acquired.json', 'Companies that were acquired'],
      ['IPO Companies', '/companies/ipo.json', 'Companies that went public'],
      ['Billion+ Companies', '/companies/billion-plus.json', 'Companies valued at $1B+'],
      ['B Corp Companies', '/companies/bcorp.json', 'Certified B Corporation companies'],
      ['In Program', '/companies/in-program.json', 'Companies currently in program'],
      ['Closed Companies', '/companies/closed.json', 'Companies that are closed'],
      
      // Index endpoints
      ['Batches Index', '/batches/index.json', 'All batches with metadata'],
      ['Programs Index', '/programs/index.json', 'All programs with metadata'],
      ['Industries Index', '/industries/index.json', 'All industries with metadata'],
      ['Regions Index', '/regions/index.json', 'All regions with metadata'],
      
      // Metadata
      ['API Metadata', '/meta.json', 'API statistics and metadata']
    ];
    
    let table = '| Endpoint | Path | Description |\n|----------|------|-------------|\n';
    endpoints.forEach(([name, path, description]) => {
      table += `| ${name} | \`${path}\` | ${description} |\n`;
    });
    
    return table;
  }
  
  private generateQuickStartExamples(): string {
    const examples = `
### JavaScript/TypeScript

\`\`\`javascript
// Fetch all companies
const companies = await fetch('https://your-username.github.io/techstars-api/companies/all.json')
  .then(response => response.json());

// Fetch only active companies
const activeCompanies = await fetch('https://your-username.github.io/techstars-api/companies/active.json')
  .then(response => response.json());

// Fetch companies by industry
const techCompanies = await fetch('https://your-username.github.io/techstars-api/industries/technology.json')
  .then(response => response.json());
\`\`\`

### Python

\`\`\`python
import requests

# Fetch all companies
response = requests.get('https://your-username.github.io/techstars-api/companies/all.json')
companies = response.json()

# Fetch metadata
response = requests.get('https://your-username.github.io/techstars-api/meta.json')
metadata = response.json()
print(f"Total companies: {metadata['total_companies']}")
\`\`\`

### cURL

\`\`\`bash
# Get all companies
curl -s "https://your-username.github.io/techstars-api/companies/all.json" | jq '.'

# Get exits only
curl -s "https://your-username.github.io/techstars-api/companies/exits.json" | jq '.[] | {name, status, batch}'

# Get API metadata
curl -s "https://your-username.github.io/techstars-api/meta.json" | jq '.'
\`\`\`
`;
    
    return examples;
  }
  
  async generateReadme(): Promise<string> {
    await this.loadMetadata();
    
    const lastUpdated = this.metadata ? this.formatDate(this.metadata.last_updated) : 'Never';
    const totalCompanies = this.metadata ? this.formatNumber(this.metadata.total_companies) : '0';
    
    const readme = `# Techstars Portfolio API

> 🚀 Unofficial API for Techstars portfolio companies, similar to the YC API

[![Update Data](https://github.com/your-username/techstars-api/actions/workflows/update-data.yml/badge.svg)](https://github.com/your-username/techstars-api/actions/workflows/update-data.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Deno](https://img.shields.io/badge/Deno-000000?logo=deno&logoColor=white)](https://deno.land/)

## 📊 Stats

- **${totalCompanies} Companies** in the Techstars portfolio
- **Last Updated:** ${lastUpdated}
- **Auto-updated:** Daily via GitHub Actions
- **Format:** JSON REST API

${this.generateStatsTable()}

## 🚀 Quick Start

The API provides JSON endpoints for Techstars portfolio companies with filtering options by status, batch, industry, and region.

### Base URL
\`\`\`
https://your-username.github.io/techstars-api/
\`\`\`

### Example Usage

${this.generateQuickStartExamples()}

## 📋 API Endpoints

${this.generateEndpointsTable()}

## 🏗️ Data Structure

### Company Object

\`\`\`typescript
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
\`\`\`

### Batch Object

\`\`\`typescript
interface TechstarsBatch {
  name: string;
  year: number;
  program: string;
  location: string;
  companies: TechstarsCompany[];
  company_count: number;
}
\`\`\`

## 🔍 Filtering & Querying

### By Status
- \`/companies/active.json\` - Active companies
- \`/companies/acquired.json\` - Acquired companies  
- \`/companies/ipo.json\` - IPO companies
- \`/companies/exits.json\` - All exits (acquired + IPO)
- \`/companies/closed.json\` - Closed companies

### By Special Categories
- \`/companies/billion-plus.json\` - Companies valued at $1B+
- \`/companies/bcorp.json\` - Certified B Corporations
- \`/companies/in-program.json\` - Currently in program

### By Batch
- \`/batches/index.json\` - List all batches
- \`/batches/[batch-name].json\` - Companies in specific batch

### By Industry
- \`/industries/index.json\` - List all industries
- \`/industries/[industry-name].json\` - Companies in specific industry

### By Region
- \`/regions/index.json\` - List all regions
- \`/regions/[region-name].json\` - Companies in specific region

### Individual Companies
- \`/companies/[company-slug].json\` - Individual company details

## 🛠️ Development

### Prerequisites
- [Deno](https://deno.land/) 1.37+
- Git

### Local Development

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/techstars-api.git
cd techstars-api

# Install Deno (if not already installed)
curl -fsSL https://deno.land/install.sh | sh

# Run the data fetcher
deno run --allow-net --allow-read --allow-write fetcher.ts

# Generate README
deno run --allow-read --allow-write scripts/generate-readme.ts

# Run linter
deno lint

# Format code
deno fmt
\`\`\`

### Architecture

The system consists of several components:

1. **Data Fetcher** (\`fetcher.ts\`) - Extracts data from Techstars portfolio pages
2. **Type Definitions** (\`types.ts\`) - TypeScript interfaces for data structures
3. **Endpoint Generator** (\`generate-endpoints.ts\`) - Creates JSON API endpoints
4. **GitHub Actions** (\`.github/workflows/update-data.yml\`) - Automates daily updates
5. **README Generator** (\`scripts/generate-readme.ts\`) - Generates this documentation

### Data Sources

The API extracts data from:
- Techstars portfolio pages (https://www.techstars.com/portfolio)
- Next.js \`__NEXT_DATA__\` when available
- HTML parsing as fallback
- Company individual pages for detailed information

## 🔄 Updates

- **Frequency:** Daily at 6 AM UTC
- **Method:** GitHub Actions workflow
- **Trigger:** Scheduled cron job + manual dispatch
- **Deployment:** Automatic to GitHub Pages

## 📝 Data Quality

### Validation
- Company names are required
- Website URLs are validated
- Data types are enforced
- Duplicate detection

### Cleaning
- Standardized status values
- Consistent location formatting
- Industry categorization
- Region mapping

## 🚦 Rate Limiting

The API is static (hosted on GitHub Pages) so there are no rate limits. However, please be respectful:

- Cache responses when possible
- Don't hammer the endpoints
- Consider using appropriate HTTP caching headers

## 🤝 Contributing

Contributions are welcome! Please feel free to:

1. Report bugs and issues
2. Suggest new features
3. Improve data extraction logic
4. Add new endpoints
5. Enhance documentation

### Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is an unofficial API created for educational and research purposes. It is not affiliated with, endorsed by, or sponsored by Techstars. The data is publicly available information extracted from Techstars' website.

### Terms of Use

- Use for educational and research purposes
- Do not use for commercial purposes without permission
- Respect Techstars' terms of service
- Provide proper attribution
- No warranty or guarantee of data accuracy

## 🙏 Acknowledgments

- Inspired by the [YC API](https://github.com/reworkd/ycapi)
- Built with [Deno](https://deno.land/)
- Hosted on [GitHub Pages](https://pages.github.com/)
- Data from [Techstars](https://www.techstars.com/)

## 📊 Usage Analytics

Want to track API usage? Consider adding:
- Google Analytics
- Plausible Analytics
- Simple server logs

## 🔗 Related Projects

- [YC API](https://github.com/reworkd/ycapi) - Y Combinator companies API
- [Crunchbase API](https://data.crunchbase.com/docs) - Startup and company data
- [AngelList API](https://angel.co/api) - Startup and investor data

## 📞 Support

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/techstars-api/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/techstars-api/discussions)

---

**Last Updated:** ${lastUpdated}  
**Total Companies:** ${totalCompanies}  
**API Version:** 1.0.0  

Made with ❤️ by [Your Name](https://github.com/your-username)
`;
    
    return readme;
  }
}

// Main execution
if (import.meta.main) {
  try {
    const generator = new ReadmeGenerator();
    const readme = await generator.generateReadme();
    
    await Deno.writeTextFile('./README.md', readme);
    console.log('✅ README.md generated successfully!');
    
  } catch (error) {
    console.error('Error generating README:', error);
    Deno.exit(1);
  }
}

export { ReadmeGenerator };