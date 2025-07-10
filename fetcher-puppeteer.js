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
    
    // Industry verticals from Techstars
    this.industryVerticals = [
      { name: '3D printing', slug: '3d-printing', url_param: '3D+printing' },
      { name: 'Adtech', slug: 'adtech', url_param: 'Adtech' },
      { name: 'Age Tech', slug: 'age-tech', url_param: 'Age+Tech' },
      { name: 'Agtech', slug: 'agtech', url_param: 'Agtech' },
      { name: 'Artificial intelligence and machine learning', slug: 'ai-ml', url_param: 'Artificial+intelligence+and+machine+learning' },
      { name: 'Audiotech', slug: 'audiotech', url_param: 'Audiotech' },
      { name: 'Augmented reality', slug: 'augmented-reality', url_param: 'Augmented+reality' },
      { name: 'B2B payments', slug: 'b2b-payments', url_param: 'B2B+payments' },
      { name: 'Beauty', slug: 'beauty', url_param: 'Beauty' },
      { name: 'Big Data', slug: 'big-data', url_param: 'Big+Data' },
      { name: 'Carsharing', slug: 'carsharing', url_param: 'Carsharing' },
      { name: 'Cleantech', slug: 'cleantech', url_param: 'Cleantech' },
      { name: 'Climate tech', slug: 'climate-tech', url_param: 'Climate+tech' },
      { name: 'Cloudtech and DevOps', slug: 'cloudtech-devops', url_param: 'Cloudtech+and+DevOps' },
      { name: 'Construction technology', slug: 'construction-tech', url_param: 'Construction+technology' },
      { name: 'Cryptocurrency/Blockchain', slug: 'crypto-blockchain', url_param: 'Cryptocurrency%2FBlockchain' },
      { name: 'Cybersecurity', slug: 'cybersecurity', url_param: 'Cybersecurity' },
      { name: 'Digital health', slug: 'digital-health', url_param: 'Digital+health' },
      { name: 'E-commerce', slug: 'ecommerce', url_param: 'E-commerce' },
      { name: 'Edtech', slug: 'edtech', url_param: 'Edtech' },
      { name: 'Femtech', slug: 'femtech', url_param: 'Femtech' },
      { name: 'Fintech', slug: 'fintech', url_param: 'Fintech' },
      { name: 'Foodtech', slug: 'foodtech', url_param: 'Foodtech' },
      { name: 'Future of work', slug: 'future-of-work', url_param: 'Future+of+work' },
      { name: 'Gaming', slug: 'gaming', url_param: 'Gaming' },
      { name: 'HRtech', slug: 'hrtech', url_param: 'HRtech' },
      { name: 'Healthtech', slug: 'healthtech', url_param: 'Healthtech' },
      { name: 'Impact investing', slug: 'impact-investing', url_param: 'Impact+investing' },
      { name: 'Industrials', slug: 'industrials', url_param: 'Industrials' },
      { name: 'Infrastructure', slug: 'infrastructure', url_param: 'Infrastructure' },
      { name: 'Insurtech', slug: 'insurtech', url_param: 'Insurtech' },
      { name: 'Internet of Things', slug: 'iot', url_param: 'Internet+of+Things' },
      { name: 'Legal tech', slug: 'legal-tech', url_param: 'Legal+tech' },
      { name: 'Life sciences', slug: 'life-sciences', url_param: 'Life+sciences' },
      { name: 'Lifestyles of Health and Sustainability and wellness', slug: 'lohas-wellness', url_param: 'Lifestyles+of+Health+and+Sustainability+and+wellness' },
      { name: 'Manufacturing', slug: 'manufacturing', url_param: 'Manufacturing' },
      { name: 'Marketing tech', slug: 'marketing-tech', url_param: 'Marketing+tech' },
      { name: 'Micromobility', slug: 'micromobility', url_param: 'Micromobility' },
      { name: 'Mobile', slug: 'mobile', url_param: 'Mobile' },
      { name: 'Mobile commerce', slug: 'mobile-commerce', url_param: 'Mobile+commerce' },
      { name: 'Mobility tech', slug: 'mobility-tech', url_param: 'Mobility+tech' },
      { name: 'Nanotechnology', slug: 'nanotechnology', url_param: 'Nanotechnology' },
      { name: 'Oil and gas', slug: 'oil-gas', url_param: 'Oil+and+gas' },
      { name: 'Oncology', slug: 'oncology', url_param: 'Oncology' },
      { name: 'Pet tech', slug: 'pet-tech', url_param: 'Pet+tech' },
      { name: 'Real estate tech', slug: 'real-estate-tech', url_param: 'Real+estate+tech' },
      { name: 'Restaurant tech', slug: 'restaurant-tech', url_param: 'Restaurant+tech' },
      { name: 'Ridesharing', slug: 'ridesharing', url_param: 'Ridesharing' },
      { name: 'Robotics and Drones', slug: 'robotics-drones', url_param: 'Robotics+and+Drones' },
      { name: 'SaaS', slug: 'saas', url_param: 'SaaS' },
      { name: 'Space tech', slug: 'space-tech', url_param: 'Space+tech' },
      { name: 'Sports Tech', slug: 'sports-tech', url_param: 'Sports+Tech' },
      { name: 'Supply chain technology', slug: 'supply-chain-tech', url_param: 'Supply+chain+technology' },
      { name: 'Technology, media and telecommunications', slug: 'tmt', url_param: 'Technology%2C+media+and+telecommunications' },
      { name: 'Virtual reality', slug: 'virtual-reality', url_param: 'Virtual+reality' },
      { name: 'Wearables and quantified self', slug: 'wearables', url_param: 'Wearables+and+quantified+self' },
      { name: 'eSports', slug: 'esports', url_param: 'eSports' }
    ];
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
    
    // Aggressive infinite scroll to load ALL companies
    console.log('Starting infinite scroll to load all companies...');
    let previousCompanyCount = 0;
    let currentCompanyCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 100; // Much higher limit
    
    do {
      // Count current companies on page using multiple selectors
      currentCompanyCount = await page.evaluate(() => {
        const companySelectors = [
          'a[href*="/companies/"]',
          'a[href*="/portfolio/"]',
          '[data-testid*="company"]',
          '[class*="company"]',
          '[class*="portfolio"]',
          '.card',
          '[class*="card"]',
          'img[alt]'
        ];
        
        let maxCount = 0;
        for (const selector of companySelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > maxCount) {
            maxCount = elements.length;
          }
        }
        return maxCount;
      });
      
      console.log(`Current companies on page: ${currentCompanyCount}`);
      
      // Multiple scroll strategies
      await page.evaluate(() => {
        // Fast scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Incremental scrolling to trigger lazy loading
      await page.evaluate(() => {
        for (let i = 0; i < 10; i++) {
          window.scrollBy(0, 800);
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Scroll back up a bit and down again (sometimes helps)
      await page.evaluate(() => {
        window.scrollBy(0, -1000);
        setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 500);
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      scrollAttempts++;
      
      // Check if we found new companies
      if (currentCompanyCount === previousCompanyCount) {
        scrollAttempts++;
        if (scrollAttempts >= 3) { // If no new companies after 3 attempts, break
          console.log('No new companies found after multiple scroll attempts');
          break;
        }
      } else {
        scrollAttempts = 0; // Reset counter if we found new companies
        console.log(`Found ${currentCompanyCount - previousCompanyCount} new companies!`);
      }
      
      // Additional failsafe: if no companies found at all after initial attempts, break
      if (currentCompanyCount === 0 && scrollAttempts >= 2) {
        console.log('No companies found on page, trying alternative extraction...');
        break;
      }
      
      previousCompanyCount = currentCompanyCount;
      
    } while (scrollAttempts < 10 && currentCompanyCount < 2000); // Reduced max attempts
    
    console.log(`Finished scrolling. Total companies found: ${currentCompanyCount}`);
    
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
          await filterButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Try multiple selectors that might contain company data - more specific ones first
    const possibleSelectors = [
      'a[href*="/companies/"]',
      'a[href*="/portfolio/"]',
      '[data-testid*="company"]',
      '[class*="company"]',
      '[class*="portfolio"]',
      '.card',
      '[class*="card"]',
      '[role="button"]',
      'img[alt]',
      'a[title]'
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
            /^(apply|portfolio|companies|techstars|founders|show|year|filter|search|sort|view).*$/i,
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
            const descSelectors = ['p.jss1181', '[data-testid="company-card-oneliner"]', 'p', '.description', '.summary', '.bio', '.tagline', '.one-liner'];
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
            
            // Try to extract additional company data (removed batch extraction)
            
            const locationSelectors = ['p.jss1180', '[data-testid="company-card-location"]', '.location', '.city', '[data-location]', '[class*="location"]'];
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

            const socialMediaSelectors = [
              'a[href*="twitter.com"]',
              'a[href*="linkedin.com"]',
              'a[href*="facebook.com"]',
              'a[href*="instagram.com"]',
              'a[href*="angel.co"]',
            ];

            company.social_media = {};

            for (const socialSelector of socialMediaSelectors) {
              const socialEl = element.querySelector(socialSelector);
              if (socialEl && socialEl.href) {
                if (socialSelector.includes('twitter')) {
                  company.social_media.twitter = socialEl.href;
                } else if (socialSelector.includes('linkedin')) {
                  company.social_media.linkedin = socialEl.href;
                } else if (socialSelector.includes('facebook')) {
                  company.social_media.facebook = socialEl.href;
                } else if (socialSelector.includes('instagram')) {
                  company.social_media.instagram = socialEl.href;
                } else if (socialSelector.includes('angel.co')) {
                  company.social_media.angellist = socialEl.href;
                }
              }
            }
            
            // Extract any data attributes, except for 'testid'
            for (const attr of element.attributes) {
              if (attr.name.startsWith('data-') && attr.name !== 'data-testid') {
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
          /^(apply|portfolio|companies|techstars|founders|show|year|filter|search|sort|view).*$/i,
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
              const location = parent.querySelector('[class*="location"], [class*="city"], [data-location]')?.textContent?.trim();
              const industry = parent.querySelector('[class*="industry"], [class*="category"], [data-industry]')?.textContent?.trim();
              
              potentialCompanies.push({
                name: text,
                website: hasCompanyURL ? href : '',
                description: description || '',
                logo_url: logo || '',
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
      name: rawData.name || 'Unknown Company',
      slug,
      website: rawData.website || '',
      description: rawData.description || '',
      one_liner: rawData.description || '',
      location: rawData.location || 'Unknown',
      industry: rawData.industry || 'Unknown',
      industry_slug: rawData.industry_slug || '',
      subindustry: rawData.subindustry || '',
      status: this.parseStatus(rawData.status),
      founded_year: this.parseYear(rawData.founded_year),
      logo_url: rawData.logo_url || '',
      social_media: rawData.social_media || {},
      is_billion_plus: rawData.is_billion_plus || false,
      is_in_program: rawData.is_in_program || false,
      is_bcorp: rawData.is_bcorp || false,
      tags: Array.isArray(rawData.tags) ? rawData.tags : [],
      url: `${this.config.base_url}/portfolio/${slug}`,
      api: `/api/companies/${slug}.json`
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

  // Removed extractRegion method as we no longer use regions

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async generateEndpoints(companies, companiesByIndustry = new Map()) {
    console.log('Generating API endpoints...');
    
    // Ensure directories exist for API structure
    this.ensureDirectoryExists('./api');
    this.ensureDirectoryExists('./api/companies');
    this.ensureDirectoryExists('./api/industries');
    
    // Generate core endpoints
    fs.writeFileSync('./api/companies/all.json', JSON.stringify(companies, null, 2));
    
    const activeCompanies = companies.filter(c => c.status === 'Active');
    fs.writeFileSync('./api/companies/active.json', JSON.stringify(activeCompanies, null, 2));
    
    const exits = companies.filter(c => c.status === 'Acquired' || c.status === 'IPO');
    fs.writeFileSync('./api/companies/exits.json', JSON.stringify(exits, null, 2));
    
    const acquiredCompanies = companies.filter(c => c.status === 'Acquired');
    fs.writeFileSync('./api/companies/acquired.json', JSON.stringify(acquiredCompanies, null, 2));
    
    const ipoCompanies = companies.filter(c => c.status === 'IPO');
    fs.writeFileSync('./api/companies/ipo.json', JSON.stringify(ipoCompanies, null, 2));
    
    const billionPlusCompanies = companies.filter(c => c.is_billion_plus);
    fs.writeFileSync('./api/companies/billion-plus.json', JSON.stringify(billionPlusCompanies, null, 2));
    
    const bCorpCompanies = companies.filter(c => c.is_bcorp);
    fs.writeFileSync('./api/companies/bcorp.json', JSON.stringify(bCorpCompanies, null, 2));
    
    const inProgramCompanies = companies.filter(c => c.is_in_program);
    fs.writeFileSync('./api/companies/in-program.json', JSON.stringify(inProgramCompanies, null, 2));
    
    const closedCompanies = companies.filter(c => c.status === 'Closed');
    fs.writeFileSync('./api/companies/closed.json', JSON.stringify(closedCompanies, null, 2));
    
    // Individual companies
    for (const company of companies) {
      fs.writeFileSync(`./api/companies/${company.slug}.json`, JSON.stringify(company, null, 2));
    }
    
    // Industry endpoints are already saved individually during fetching
    // Just ensure the final industries index is up to date
    const industriesIndex = Array.from(companiesByIndustry.entries()).map(([slug, companies]) => {
      const industry = this.industryVerticals.find(i => i.slug === slug);
      return {
        name: industry?.name || slug,
        slug: slug,
        company_count: companies.length,
        api_endpoint: `/api/industries/${slug}.json`
      };
    });
    fs.writeFileSync('./api/industries/index.json', JSON.stringify(industriesIndex, null, 2));
    
    // Create main API index
    const apiIndex = {
      name: "Techstars Portfolio API",
      version: "1.0.0",
      description: "Unofficial API for Techstars portfolio companies",
      endpoints: {
        companies: {
          all: "/api/companies/all.json",
          active: "/api/companies/active.json", 
          exits: "/api/companies/exits.json",
          acquired: "/api/companies/acquired.json",
          ipo: "/api/companies/ipo.json",
          closed: "/api/companies/closed.json",
          billion_plus: "/api/companies/billion-plus.json",
          bcorp: "/api/companies/bcorp.json",
          in_program: "/api/companies/in-program.json"
        },
        industries: {
          index: "/api/industries/index.json",
          endpoints: Object.fromEntries(
            Array.from(companiesByIndustry.keys()).map(slug => [
              slug, `/api/industries/${slug}.json`
            ])
          )
        },
        meta: "/api/meta.json"
      },
      total_companies: companies.length,
      total_industries: companiesByIndustry.size,
      last_updated: new Date().toISOString()
    };
    fs.writeFileSync('./api/index.json', JSON.stringify(apiIndex, null, 2));
    
    console.log(`✓ Generated endpoints for ${companies.length} companies`);
  }

  generateMetadata(companies, companiesByIndustry = new Map()) {
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
      total_industries: companiesByIndustry?.size || 0,
      data_sources: [
        `${this.config.base_url}${this.config.portfolio_path}`,
        'Puppeteer browser automation',
        'Dynamic content extraction'
      ]
    };
  }

  async fetchCompaniesByIndustry(page, industry) {
    console.log(`🔍 Fetching companies for industry: ${industry.name}`);
    
    const url = `${this.config.base_url}${this.config.portfolio_path}?industry_vertical=${industry.url_param}`;
    console.log(`Navigating to: ${url}`);
    
    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.config.timeout
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Extract companies from this industry page
      const industryCompanies = await this.extractCompaniesFromPage(page);
      
      // Tag each company with the correct industry
      const taggedCompanies = industryCompanies.map(company => ({
        ...company,
        industry: industry.name,
        industry_slug: industry.slug
      }));
      
      console.log(`✅ Found ${taggedCompanies.length} companies in ${industry.name}`);
      return taggedCompanies;
      
    } catch (error) {
      console.error(`❌ Error fetching ${industry.name}:`, error.message);
      return [];
    }
  }

  async fetchPortfolioData() {
    let browser;
    const errors = [];
    let companies = [];
    const companiesByIndustry = new Map();

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
      
      // Fetch companies by industry verticals
      console.log(`🏭 Fetching companies from ${this.industryVerticals.length} industry verticals...`);
      
      // Check for resume capability (unless --fresh flag is used)
      let startIndex = 0;
      let processedIndustries = [];
      const allRawCompanies = [];
      
      const forceFresh = process.argv.includes('--fresh');
      const checkpointFile = './api/checkpoint.json';
      
      if (forceFresh && fs.existsSync(checkpointFile)) {
        fs.unlinkSync(checkpointFile);
        console.log('🔄 Fresh start requested - removed existing checkpoint');
      }
      
      if (!forceFresh && fs.existsSync(checkpointFile)) {
        try {
          const checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
          startIndex = checkpoint.last_completed_index + 1;
          processedIndustries = checkpoint.processed_industries || [];
          
          if (startIndex < this.industryVerticals.length) {
            console.log(`🔄 Resuming from industry ${startIndex + 1}/${this.industryVerticals.length}: ${this.industryVerticals[startIndex].name}`);
            console.log(`📊 Already completed: ${processedIndustries.length} industries`);
            
            // Load existing companies from already processed industries
            for (const industry of processedIndustries) {
              try {
                const industryData = JSON.parse(fs.readFileSync(`./api/industries/${industry.slug}.json`, 'utf8'));
                allRawCompanies.push(...industryData);
                companiesByIndustry.set(industry.slug, industryData);
              } catch (e) {
                console.warn(`⚠️ Could not load existing data for ${industry.name}`);
              }
            }
          } else {
            console.log(`✅ All industries already completed! Starting fresh...`);
            startIndex = 0;
            processedIndustries = [];
          }
        } catch (e) {
          console.warn(`⚠️ Could not read checkpoint file, starting fresh...`);
          startIndex = 0;
          processedIndustries = [];
        }
      }
      
      for (let i = startIndex; i < this.industryVerticals.length; i++) {
        const industry = this.industryVerticals[i];
        console.log(`\n📊 Progress: ${i + 1}/${this.industryVerticals.length} - ${industry.name}`);
        
        try {
          const industryCompanies = await this.fetchCompaniesByIndustry(page, industry);
          
          if (industryCompanies.length > 0) {
            allRawCompanies.push(...industryCompanies);
            companiesByIndustry.set(industry.slug, industryCompanies);
            
            // Save industry data immediately to prevent data loss
            this.ensureDirectoryExists('./api/industries');
            fs.writeFileSync(`./api/industries/${industry.slug}.json`, JSON.stringify(industryCompanies, null, 2));
            console.log(`💾 Saved ${industryCompanies.length} companies for ${industry.name}`);
            
            processedIndustries.push({
              name: industry.name,
              slug: industry.slug,
              company_count: industryCompanies.length,
              api_endpoint: `/api/industries/${industry.slug}.json`
            });
          } else {
            console.log(`⚠️ No companies found for ${industry.name}`);
            processedIndustries.push({
              name: industry.name,
              slug: industry.slug,
              company_count: 0,
              api_endpoint: `/api/industries/${industry.slug}.json`
            });
          }
          
          // Save progress after each industry
          this.ensureDirectoryExists('./api/industries');
          fs.writeFileSync('./api/industries/index.json', JSON.stringify(processedIndustries, null, 2));
          
          // Save checkpoint for resume capability
          const checkpoint = {
            last_updated: new Date().toISOString(),
            last_completed_index: i,
            last_completed_industry: industry.name,
            processed_industries: processedIndustries,
            total_industries: this.industryVerticals.length,
            completion_percentage: Math.round(((i + 1) / this.industryVerticals.length) * 100)
          };
          fs.writeFileSync('./api/checkpoint.json', JSON.stringify(checkpoint, null, 2));
          
          // Save interim metadata
          const interimMetadata = {
            last_updated: new Date().toISOString(),
            processing_status: `Completed ${i + 1}/${this.industryVerticals.length} industries`,
            industries_processed: processedIndustries.length,
            total_companies_so_far: allRawCompanies.length,
            industries_completed: processedIndustries.filter(ind => ind.company_count > 0).length
          };
          fs.writeFileSync('./api/processing-status.json', JSON.stringify(interimMetadata, null, 2));
          
          // Small delay between industry fetches to be respectful
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Failed to fetch ${industry.name}:`, error.message);
          errors.push(`Failed to fetch ${industry.name}: ${error.message}`);
        }
      }
      
      console.log(`\n🎉 Completed fetching all industries!`);
      console.log(`📈 Total companies found across all industries: ${allRawCompanies.length}`);
      console.log(`💾 All ${processedIndustries.length} industry files saved individually`);
      
      // Remove duplicates (companies can appear in multiple industries)
      const uniqueCompanies = [];
      const seenCompanies = new Set();
      
      for (const company of allRawCompanies) {
        const companyKey = company.name?.toLowerCase() || company.website || Math.random();
        if (!seenCompanies.has(companyKey)) {
          seenCompanies.add(companyKey);
          uniqueCompanies.push(company);
        }
      }
      
      const rawCompanies = uniqueCompanies;
      
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
          location: 'Boulder, CO',
          industry: 'Technology',
          industry_slug: 'technology',
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
    await this.generateEndpoints(companies, companiesByIndustry);
    
    const metadata = this.generateMetadata(companies, companiesByIndustry);
    fs.writeFileSync('./api/meta.json', JSON.stringify(metadata, null, 2));
    
    // Clean up temporary files
    if (fs.existsSync('./api/processing-status.json')) {
      fs.unlinkSync('./api/processing-status.json');
    }
    if (fs.existsSync('./api/checkpoint.json')) {
      fs.unlinkSync('./api/checkpoint.json');
    }
    
    console.log(`\n📊 Extraction Summary:`);
    console.log(`- Total companies: ${companies.length}`);
    console.log(`- Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.warn('\n⚠️ Errors encountered:');
      errors.forEach(error => console.warn(`- ${error}`));
    }
    
    console.log('\n✅ Enhanced Techstars API generation completed!');
    console.log('📁 API Files generated:');
    console.log('- api/index.json (API documentation)');
    console.log('- api/meta.json');
    console.log('- api/companies/all.json');
    console.log('- api/companies/active.json');
    console.log('- api/companies/exits.json');
    console.log('- And more endpoint files...');
    console.log('\n🚀 Ready for GitHub Pages deployment!');
    
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