const puppeteer = require('puppeteer');
const fs = require('fs');

class AdvancedTechstarsFetcher {
  constructor() {
    this.config = {
      base_url: 'https://www.techstars.com',
      portfolio_path: '/portfolio',
      timeout: 60000, // Increased to 60 seconds
      waitForSelector: '.company-card, [data-testid*="company"], .portfolio-company, .startup-card',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
  }

  async launchBrowser(debug = false) {
    return await puppeteer.launch({
      headless: debug ? false : 'new', // Show browser if debug mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-extensions',
        '--disable-plugins'
      ],
      devtools: debug // Open devtools if debug mode
    });
  }

  async extractCompaniesFromPage(page) {
    console.log('Waiting for page to load and companies to render...');
    
    // Wait for the page to load
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Try to wait for company grid to load
    try {
      await page.waitForSelector('[data-testid="portfolio-grid"], .portfolio-grid, [class*="grid"], [class*="companies"]', { timeout: 10000 });
    } catch (e) {
      console.log('Grid container not found, proceeding with extraction...');
    }
    
    // Try to load more companies by scrolling and clicking load more buttons
    console.log('Trying to load more companies...');
    
    // Scroll to bottom to trigger infinite scroll
    let previousHeight = await page.evaluate('document.body.scrollHeight');
    for (let i = 0; i < 5; i++) {
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if new content loaded
      let newHeight = await page.evaluate('document.body.scrollHeight');
      if (newHeight === previousHeight) {
        break;
      }
      previousHeight = newHeight;
    }
    
    // Look for and click "Load More" or "Show More" buttons
    const loadMoreSelectors = [
      'button[class*="load"], button[class*="more"], button[class*="show"]',
      '[class*="load-more"], [class*="show-more"]',
      'button:contains("Load"), button:contains("More"), button:contains("Show")'
    ];
    
    for (const selector of loadMoreSelectors) {
      try {
        const loadMoreButton = await page.$(selector);
        if (loadMoreButton) {
          console.log(`Found load more button with selector: ${selector}`);
          await loadMoreButton.click();
          await new Promise(resolve => setTimeout(resolve, 3000));
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Try to remove any filters that might be limiting results
    const filterSelectors = [
      '[class*="filter"] button', '[class*="clear"]', 'button[class*="reset"]'
    ];
    
    for (const selector of filterSelectors) {
      try {
        const filterButton = await page.$(selector);
        if (filterButton) {
          console.log(`Trying to clear filters with selector: ${selector}`);
          await filterButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Try multiple selectors that might contain company data - more specific ones first
    const possibleSelectors = [
      '[data-testid*="company-card"]',
      '[data-testid*="portfolio-item"]',
      '.portfolio-item',
      '.company-card',
      '[data-company-id]',
      '[data-company-name]',
      'a[href*="/companies/"]',
      'a[href*="/portfolio/"][href*="/companies/"]',
      '[class*="CompanyCard"]',
      '[class*="PortfolioItem"]',
      '[class*="company-item"]'
    ];
    
    let companies = [];
    
    for (const selector of possibleSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        console.log(`Found elements with selector: ${selector}`);
        
        companies = await page.evaluate((sel) => {
          const elements = document.querySelectorAll(sel);
          const extractedCompanies = [];
          
          // Filter out common navigation/UI elements
          const excludePatterns = [
            /^(apply|portfolio|companies|techstars|founders|show|regions|year|filter|search|sort|view).*$/i,
            /^(accelerator|program|about|contact|team|investors|news|blog|careers|press).*$/i,
            /^(sign|log|register|login|logout|account|profile|dashboard|settings).*$/i,
            /^(inc|llc|corp|ltd|company|co\.)$/i,
            /^(big data|fintech|saas|mobile|ai|ml|iot|b2b|b2c|api|sdk|platform).*$/i,
            /^(terms|privacy|policy|notice|guidelines|information|brand|cookie|consent|more).*$/i,
            /\.com$|\.io$|\.co$|\.org$|\.net$|\.space$/i, // Exclude URLs as company names
            /^(we|this|that|click|select|choose|enable|disable|use|accept|agree|submit).*$/i
          ];
          
          elements.forEach((element, index) => {
            const company = {};
            
            // Try to extract company name from multiple sources
            const nameSelectors = ['h1', 'h2', 'h3', 'h4', '.name', '.company-name', '.title', '[alt]', '[data-company-name]'];
            let foundName = '';
            
            for (const nameSelector of nameSelectors) {
              const nameEl = element.querySelector(nameSelector);
              if (nameEl && nameEl.textContent.trim()) {
                foundName = nameEl.textContent.trim();
              } else if (nameEl && nameEl.alt) {
                foundName = nameEl.alt.trim();
              } else if (nameEl && nameEl.getAttribute('data-company-name')) {
                foundName = nameEl.getAttribute('data-company-name').trim();
              }
              
              if (foundName) {
                // Clean up URL-based names (e.g., "flyzipline.com" -> "Zipline")
                if (foundName.includes('.')) {
                  const parts = foundName.split('.');
                  if (parts.length >= 2 && parts[0].length > 2) {
                    foundName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                  }
                }
                
                // Skip if it matches exclusion patterns
                const shouldExclude = excludePatterns.some(pattern => pattern.test(foundName));
                if (!shouldExclude && foundName.length > 1 && foundName.length < 100) {
                  company.name = foundName;
                  break;
                }
              }
            }
            
            // Skip if no valid name found
            if (!company.name) return;
            
            // Try to extract website/link - prefer company-specific URLs
            const linkEl = element.querySelector('a');
            if (linkEl && linkEl.href) {
              if (linkEl.href.includes('/companies/') || linkEl.href.includes('/portfolio/')) {
                company.website = linkEl.href;
              } else if (!linkEl.href.includes('techstars.com') && linkEl.href.startsWith('http')) {
                company.website = linkEl.href;
              }
            }
            
            // Try to extract description
            const descSelectors = ['p', '.description', '.summary', '.bio', '.tagline', '.one-liner'];
            for (const descSelector of descSelectors) {
              const descEl = element.querySelector(descSelector);
              if (descEl && descEl.textContent.trim()) {
                const descText = descEl.textContent.trim();
                if (descText.length > 10 && descText.length < 500 && !descText.toLowerCase().includes('techstars')) {
                  company.description = descText;
                  break;
                }
              }
            }
            
            // Try to extract logo
            const logoEl = element.querySelector('img');
            if (logoEl && logoEl.src && !logoEl.src.includes('logo-dark.png') && !logoEl.src.includes('techstars')) {
              company.logo_url = logoEl.src;
            }
            
            // Try to extract additional company data
            const batchSelectors = ['.batch', '.class', '.year', '[data-batch]', '[class*="batch"]'];
            for (const batchSelector of batchSelectors) {
              const batchEl = element.querySelector(batchSelector);
              if (batchEl && batchEl.textContent.trim()) {
                company.batch = batchEl.textContent.trim();
                break;
              }
            }
            
            const locationSelectors = ['.location', '.city', '.region', '[data-location]', '[class*="location"]'];
            for (const locationSelector of locationSelectors) {
              const locationEl = element.querySelector(locationSelector);
              if (locationEl && locationEl.textContent.trim()) {
                company.location = locationEl.textContent.trim();
                break;
              }
            }
            
            const industrySelectors = ['.industry', '.category', '.sector', '[data-industry]', '[class*="industry"]'];
            for (const industrySelector of industrySelectors) {
              const industryEl = element.querySelector(industrySelector);
              if (industryEl && industryEl.textContent.trim()) {
                company.industry = industryEl.textContent.trim();
                break;
              }
            }
            
            // Extract any data attributes
            for (const attr of element.attributes) {
              if (attr.name.startsWith('data-')) {
                company[attr.name.replace('data-', '')] = attr.value;
              }
            }
            
            // Only add if we found a valid company name and it's not a UI element
            if (company.name && company.name.length > 2) {
              extractedCompanies.push(company);
            }
          });
          
          return extractedCompanies;
        }, selector);
        
        if (companies.length > 0) {
          console.log(`Successfully extracted ${companies.length} companies using selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Selector not found, continue to next one
        continue;
      }
    }
    
    // If no companies found with specific selectors, try looking for links to company pages
    if (companies.length === 0) {
      console.log('No companies found with specific selectors, trying link-based approach...');
      
      companies = await page.evaluate(() => {
        // Look for links that might lead to company pages
        const allLinks = document.querySelectorAll('a[href]');
        const potentialCompanies = [];
        
        // Common exclusion patterns for navigation/UI elements
        const excludePatterns = [
          /^(apply|portfolio|companies|techstars|founders|show|regions|year|filter|search|sort|view).*$/i,
          /^(accelerator|program|about|contact|team|investors|news|blog|careers|press).*$/i,
          /^(sign|log|register|login|logout|account|profile|dashboard|settings).*$/i,
          /^(learn|explore|discover|find|browse|navigate|menu|home|back|next|previous).*$/i,
          /^(big data|fintech|saas|mobile|ai|ml|iot|b2b|b2c|api|sdk|platform).*$/i,
          /^(inc|llc|corp|ltd|company|co\.)$/i,
          /^(terms|privacy|policy|notice|guidelines|information|brand|cookie|consent|more).*$/i,
          /\.com$|\.io$|\.co$|\.org$|\.net$|\.space$/i, // Exclude URLs as company names
          /^(we|this|that|click|select|choose|enable|disable|use|accept|agree|submit).*$/i
        ];
        
        allLinks.forEach(link => {
          let text = link.textContent?.trim();
          const href = link.href;
          
          // Skip if text is too short, too long, or matches exclusion patterns
          if (!text || text.length < 2 || text.length > 100) return;
          
          // Clean up URL-based names (e.g., "flyzipline.com" -> "Zipline")
          if (text.includes('.')) {
            const parts = text.split('.');
            if (parts.length >= 2 && parts[0].length > 2) {
              text = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
            }
          }
          
          const shouldExclude = excludePatterns.some(pattern => pattern.test(text));
          if (shouldExclude) return;
          
          // Look for company-like characteristics
          const hasCompanyURL = href.includes('/companies/') || href.includes('/portfolio/') || (!href.includes('techstars.com') && href.startsWith('http'));
          const hasCompanyName = /^[A-Z][a-zA-Z0-9\s&.,'-]{2,50}$/.test(text);
          
          if (hasCompanyURL || hasCompanyName) {
            // Look for associated data in parent elements
            const parent = link.closest('div, article, section, li, .card, [class*="item"]');
            if (parent) {
              const description = parent.querySelector('p, .description, .summary, .tagline')?.textContent?.trim();
              const logo = parent.querySelector('img')?.src;
              
              // Try to get more data from the parent element
              const batch = parent.querySelector('[class*="batch"], [class*="class"], [data-batch]')?.textContent?.trim();
              const location = parent.querySelector('[class*="location"], [class*="city"], [data-location]')?.textContent?.trim();
              const industry = parent.querySelector('[class*="industry"], [class*="category"], [data-industry]')?.textContent?.trim();
              
              potentialCompanies.push({
                name: text,
                website: hasCompanyURL ? href : '',
                description: description || '',
                logo_url: logo || '',
                batch: batch || '',
                location: location || '',
                industry: industry || ''
              });
            }
          }
        });
        
        // Remove duplicates and filter out obvious non-companies
        const unique = potentialCompanies.filter((company, index, self) => {
          const isDuplicate = self.findIndex(c => c.name === company.name) !== index;
          const isLikelyCompany = company.name.length > 2 && !company.name.toLowerCase().includes('techstars');
          return !isDuplicate && isLikelyCompany;
        });
        
        return unique.slice(0, 100); // Limit to first 100 to avoid noise
      });
    }
    
    return companies;
  }

  async checkForApiCalls(page) {
    console.log('Monitoring network requests for API calls...');
    
    const apiCalls = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('api') || url.includes('graphql') || url.includes('portfolio') || url.includes('companies')) {
        apiCalls.push({
          url,
          status: response.status(),
          method: response.request().method()
        });
      }
    });
    
    // Wait a bit to capture API calls
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (apiCalls.length > 0) {
      console.log('Found potential API calls:');
      apiCalls.forEach(call => {
        console.log(`- ${call.method} ${call.url} (${call.status})`);
      });
    }
    
    return apiCalls;
  }

  async extractDataFromNextData(page) {
    console.log('Looking for Next.js data...');
    
    return await page.evaluate(() => {
      const nextDataScript = document.querySelector('#__NEXT_DATA__');
      if (nextDataScript) {
        try {
          const data = JSON.parse(nextDataScript.textContent);
          console.log('Found Next.js data');
          return data;
        } catch (e) {
          return null;
        }
      }
      return null;
    });
  }

  cleanAndStructureCompany(rawData, index) {
    const slug = rawData.name ? rawData.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') : `company-${index}`;
    
    return {
      id: index + 1,
      name: rawData.name || 'Unknown Company',
      slug,
      website: rawData.website || '',
      description: rawData.description || '',
      one_liner: rawData.description || '',
      batch: rawData.batch || 'Unknown',
      program: rawData.program || 'Unknown',
      location: rawData.location || 'Unknown',
      region: this.extractRegion(rawData.location || ''),
      industry: rawData.industry || 'Unknown',
      subindustry: rawData.subindustry || '',
      status: this.parseStatus(rawData.status),
      founded_year: this.parseYear(rawData.founded_year),
      logo_url: rawData.logo_url || '',
      is_billion_plus: rawData.is_billion_plus || false,
      is_in_program: rawData.is_in_program || false,
      is_bcorp: rawData.is_bcorp || false,
      tags: Array.isArray(rawData.tags) ? rawData.tags : [],
      url: `${this.config.base_url}/portfolio/${slug}`,
      api: `./companies/${slug}.json`
    };
  }

  parseStatus(status) {
    if (!status) return 'Active';
    
    const statusStr = status.toString().toLowerCase();
    if (statusStr.includes('acquired')) return 'Acquired';
    if (statusStr.includes('ipo')) return 'IPO';
    if (statusStr.includes('closed')) return 'Closed';
    return 'Active';
  }

  parseYear(year) {
    if (!year) return undefined;
    
    const yearNum = parseInt(year.toString());
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      return undefined;
    }
    
    return yearNum;
  }

  extractRegion(location) {
    if (!location) return 'Unknown';
    
    const regionMap = {
      'New York': 'North America',
      'San Francisco': 'North America',
      'Boston': 'North America',
      'Austin': 'North America',
      'Denver': 'North America',
      'Seattle': 'North America',
      'Chicago': 'North America',
      'London': 'Europe',
      'Berlin': 'Europe',
      'Paris': 'Europe',
      'Amsterdam': 'Europe',
      'Tel Aviv': 'Middle East',
      'Dubai': 'Middle East',
      'Singapore': 'Asia',
      'Tokyo': 'Asia',
      'Sydney': 'Australia',
      'Toronto': 'North America',
      'Mexico City': 'Latin America',
      'São Paulo': 'Latin America',
    };
    
    for (const [city, region] of Object.entries(regionMap)) {
      if (location.includes(city)) {
        return region;
      }
    }
    
    return 'Other';
  }

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async generateEndpoints(companies) {
    console.log('Generating API endpoints...');
    
    // Ensure directories exist
    this.ensureDirectoryExists('./companies');
    this.ensureDirectoryExists('./batches');
    this.ensureDirectoryExists('./industries');
    this.ensureDirectoryExists('./regions');
    
    // Generate core endpoints
    fs.writeFileSync('./companies/all.json', JSON.stringify(companies, null, 2));
    
    const activeCompanies = companies.filter(c => c.status === 'Active');
    fs.writeFileSync('./companies/active.json', JSON.stringify(activeCompanies, null, 2));
    
    const exits = companies.filter(c => c.status === 'Acquired' || c.status === 'IPO');
    fs.writeFileSync('./companies/exits.json', JSON.stringify(exits, null, 2));
    
    const acquiredCompanies = companies.filter(c => c.status === 'Acquired');
    fs.writeFileSync('./companies/acquired.json', JSON.stringify(acquiredCompanies, null, 2));
    
    const ipoCompanies = companies.filter(c => c.status === 'IPO');
    fs.writeFileSync('./companies/ipo.json', JSON.stringify(ipoCompanies, null, 2));
    
    const billionPlusCompanies = companies.filter(c => c.is_billion_plus);
    fs.writeFileSync('./companies/billion-plus.json', JSON.stringify(billionPlusCompanies, null, 2));
    
    const bCorpCompanies = companies.filter(c => c.is_bcorp);
    fs.writeFileSync('./companies/bcorp.json', JSON.stringify(bCorpCompanies, null, 2));
    
    const inProgramCompanies = companies.filter(c => c.is_in_program);
    fs.writeFileSync('./companies/in-program.json', JSON.stringify(inProgramCompanies, null, 2));
    
    const closedCompanies = companies.filter(c => c.status === 'Closed');
    fs.writeFileSync('./companies/closed.json', JSON.stringify(closedCompanies, null, 2));
    
    // Individual companies
    for (const company of companies) {
      fs.writeFileSync(`./companies/${company.slug}.json`, JSON.stringify(company, null, 2));
    }
    
    console.log(`✓ Generated endpoints for ${companies.length} companies`);
  }

  generateMetadata(companies) {
    const statusCounts = companies.reduce((acc, company) => {
      acc[company.status] = (acc[company.status] || 0) + 1;
      return acc;
    }, {});

    return {
      last_updated: new Date().toISOString(),
      total_companies: companies.length,
      active_companies: statusCounts.Active || 0,
      acquired_companies: statusCounts.Acquired || 0,
      ipo_companies: statusCounts.IPO || 0,
      closed_companies: statusCounts.Closed || 0,
      billion_plus_companies: companies.filter(c => c.is_billion_plus).length,
      total_batches: 0,
      total_programs: 0,
      total_industries: 0,
      total_regions: 0,
      data_sources: [
        `${this.config.base_url}${this.config.portfolio_path}`,
        'Puppeteer browser automation',
        'Dynamic content extraction'
      ]
    };
  }

  async fetchPortfolioData() {
    let browser;
    const errors = [];
    let companies = [];

    try {
      console.log('🚀 Starting advanced Techstars data extraction...');
      console.log('Launching headless browser...');
      
      // Check if debug mode is requested
      const debug = process.argv.includes('--debug');
      if (debug) {
        console.log('🐛 Debug mode: Browser will be visible');
      }
      
      browser = await this.launchBrowser(debug);
      const page = await browser.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent(this.config.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });
      
      console.log(`Navigating to ${this.config.base_url}${this.config.portfolio_path}...`);
      
      // Navigate to portfolio page with more flexible wait strategy
      try {
        await page.goto(`${this.config.base_url}${this.config.portfolio_path}`, {
          waitUntil: 'domcontentloaded', // Less strict than networkidle0
          timeout: this.config.timeout
        });
        
        // Wait a bit more for dynamic content
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (timeoutError) {
        console.warn('⚠️ Navigation timeout, trying with basic load...');
        
        // Fallback: try with minimal wait
        await page.goto(`${this.config.base_url}${this.config.portfolio_path}`, {
          waitUntil: 'load',
          timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      console.log('Page loaded successfully!');
      
      // Check for API calls
      await this.checkForApiCalls(page);
      
      // Try to extract Next.js data
      const nextData = await this.extractDataFromNextData(page);
      if (nextData) {
        console.log('Found Next.js data structure');
        // Try to extract companies from Next.js data
        // This would need specific parsing based on the actual structure
      }
      
      // Extract companies from the rendered page
      const rawCompanies = await this.extractCompaniesFromPage(page);
      
      if (rawCompanies.length > 0) {
        console.log(`✅ Successfully extracted ${rawCompanies.length} companies!`);
        
        // Clean and structure the data
        companies = rawCompanies.map((company, index) => 
          this.cleanAndStructureCompany(company, index)
        );
        
        console.log('Sample companies extracted:');
        companies.slice(0, 3).forEach(company => {
          console.log(`- ${company.name} (${company.website})`);
        });
        
      } else {
        errors.push('No companies extracted from the page');
        console.warn('⚠️ No companies found. The page structure might have changed.');
        
        // Create minimal sample data
        companies = [{
          id: 1,
          name: 'Sample Techstars Company',
          slug: 'sample-techstars-company',
          website: 'https://example.com',
          description: 'This is sample data - real extraction needs refinement',
          one_liner: 'Sample company for API testing',
          batch: 'Sample Batch 2024',
          program: 'Accelerator',
          location: 'Boulder, CO',
          region: 'North America',
          industry: 'Technology',
          subindustry: 'Software',
          status: 'Active',
          founded_year: 2020,
          logo_url: '',
          is_billion_plus: false,
          is_in_program: false,
          is_bcorp: false,
          tags: ['sample', 'testing'],
          url: 'https://www.techstars.com/portfolio/sample-company',
          api: './companies/sample-techstars-company.json'
        }];
      }
      
      await browser.close();
      
    } catch (error) {
      errors.push(`Browser automation failed: ${error.message}`);
      console.error('❌ Browser error:', error);
      
      if (browser) {
        await browser.close();
      }
    }
    
    // Generate endpoints and metadata
    await this.generateEndpoints(companies);
    
    const metadata = this.generateMetadata(companies);
    fs.writeFileSync('./meta.json', JSON.stringify(metadata, null, 2));
    
    console.log(`\n📊 Extraction Summary:`);
    console.log(`- Total companies: ${companies.length}`);
    console.log(`- Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.warn('\n⚠️ Errors encountered:');
      errors.forEach(error => console.warn(`- ${error}`));
    }
    
    console.log('\n✅ Enhanced Techstars API generation completed!');
    console.log('📁 Files generated:');
    console.log('- meta.json');
    console.log('- companies/all.json');
    console.log('- companies/active.json');
    console.log('- companies/exits.json');
    console.log('- And more endpoint files...');
    
    return { companies, metadata, errors };
  }
}

// Run the enhanced fetcher
async function main() {
  const fetcher = new AdvancedTechstarsFetcher();
  try {
    await fetcher.fetchPortfolioData();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  main();
} catch (e) {
  console.log('📦 Puppeteer not found. Installing...');
  console.log('Run: npm install puppeteer');
  console.log('Then run: node fetcher-puppeteer.js');
}