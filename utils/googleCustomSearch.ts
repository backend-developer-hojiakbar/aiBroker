/**
 * Google Custom Search API Integration
 * Enhanced search capabilities for AI-Broker Elite
 */

interface SearchResultItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  htmlSnippet?: string;
  htmlTitle?: string;
  pagemap?: {
    cse_thumbnail?: Array<{ src: string; width: string; height: string }>;
    metatags?: Array<Record<string, string>>;
  };
}

interface CustomSearchResponse {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
  context: {
    title: string;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items: SearchResultItem[];
}

class GoogleCustomSearch {
  private readonly API_KEY: string;
  private readonly CSE_ID: string;
  private readonly BASE_URL: string = 'https://www.googleapis.com/customsearch/v1';

  constructor(apiKey?: string, cseId?: string) {
    // Use provided credentials or fallback to environment variables
    this.API_KEY = apiKey || import.meta.env.GOOGLE_API_KEY || "AIzaSyBa6zJ-L6whz_BSam3nGQyklRcWjOVN-0U";
    this.CSE_ID = cseId || import.meta.env.GOOGLE_CSE_ID || "757622fdd95af45c4";
    
    // Log initialization
    console.log("Google Custom Search initialized with API Key:", this.API_KEY.substring(0, 10) + "...", "CSE ID:", this.CSE_ID);
  }

  /**
   * Perform a search using Google Custom Search API
   * @param query Search query
   * @param options Additional search options
   * @returns Promise with search results
   */
  async search(
    query: string,
    options: {
      num?: number; // Number of results (1-10)
      start?: number; // Start index (1-101)
      lr?: string; // Language restriction (e.g., 'lang_en', 'lang_uz')
      gl?: string; // Geographic location (e.g., 'UZ', 'US')
      safe?: 'active' | 'off'; // Safe search
      exactTerms?: string; // Exact terms to include
      excludeTerms?: string; // Terms to exclude
    } = {}
  ): Promise<CustomSearchResponse> {
    try {
      const params = new URLSearchParams({
        key: this.API_KEY,
        cx: this.CSE_ID,
        q: query,
        num: (options.num || 5).toString(),
        start: (options.start || 1).toString(),
        lr: options.lr || 'lang_uz',
        gl: options.gl || 'UZ',
        safe: options.safe || 'active'
      });

      // Add optional parameters if provided
      if (options.exactTerms) params.append('exactTerms', options.exactTerms);
      if (options.excludeTerms) params.append('excludeTerms', options.excludeTerms);

      const url = `${this.BASE_URL}?${params.toString()}`;
      console.log(`Google Custom Search Request: ${url}`);

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Custom Search API error: ${response.status} - ${errorText}`);
      }

      const data: CustomSearchResponse = await response.json();
      console.log(`Google Custom Search Results: ${data.items?.length || 0} items found`);
      return data;
    } catch (error) {
      console.error('Google Custom Search error:', error);
      throw new Error(`Google Custom Search failed: ${error.message}`);
    }
  }

  /**
   * Extract supplier information from search results
   * @param query Product/service name to search for
   * @returns Array of potential suppliers with contact information
   */
  async findSuppliers(query: string): Promise<any[]> {
    try {
      // Search for suppliers in Uzbekistan first
      const domesticResults = await this.search(`${query} ta'minotchi O'zbekiston`, {
        num: 5,
        lr: 'lang_uz',
        gl: 'UZ'
      });

      // Search for international suppliers
      const internationalResults = await this.search(`${query} manufacturer exporter`, {
        num: 5,
        lr: 'lang_en',
        gl: 'US'
      });

      // Combine and process results
      const allResults = [
        ...(domesticResults.items || []),
        ...(internationalResults.items || [])
      ];

      // Extract potential suppliers with contact info
      const suppliers = allResults.map(item => ({
        title: item.htmlTitle || item.title,
        url: item.link,
        snippet: item.htmlSnippet || item.snippet,
        domain: item.displayLink,
        hasContactInfo: this.hasContactInformation(item.snippet)
      }));

      return suppliers;
    } catch (error) {
      console.error('Supplier search error:', error);
      return [];
    }
  }

  /**
   * Check if text contains contact information indicators
   * @param text Text to analyze
   * @returns Boolean indicating if contact info is likely present
   */
  private hasContactInformation(text: string): boolean {
    const contactKeywords = [
      'tel:', 'phone', 'telefon', 'contact', 'aloqa', 'manzil', 'address',
      'email', 'e-mail', 'pochta', 'website', 'sayt', 'price', 'narx'
    ];
    
    const lowerText = text.toLowerCase();
    return contactKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Search for specific information about a company
   * @param companyName Name of the company to research
   * @returns Detailed company information
   */
  async getCompanyInfo(companyName: string): Promise<any> {
    try {
      // Search for company information
      const infoResults = await this.search(`${companyName} company profile Uzbekistan`, {
        num: 3,
        lr: 'lang_en'
      });

      // Search for company reviews
      const reviewResults = await this.search(`${companyName} customer reviews rating`, {
        num: 3,
        lr: 'lang_en'
      });

      return {
        info: infoResults.items || [],
        reviews: reviewResults.items || []
      };
    } catch (error) {
      console.error('Company info search error:', error);
      return { info: [], reviews: [] };
    }
  }

  /**
   * Search for tender opportunities
   * @param keywords Keywords to search for
   * @param region Region to focus on
   * @returns Array of tender opportunities
   */
  async findTenders(keywords: string, region: string = 'Uzbekistan'): Promise<any[]> {
    try {
      const results = await this.search(`${keywords} tender ${region}`, {
        num: 10,
        lr: 'lang_uz',
        gl: 'UZ'
      });

      return (results.items || []).map(item => ({
        title: item.htmlTitle || item.title,
        url: item.link,
        snippet: item.htmlSnippet || item.snippet,
        domain: item.displayLink,
        isTender: this.isTenderOpportunity(item.snippet)
      })).filter(item => item.isTender);
    } catch (error) {
      console.error('Tender search error:', error);
      return [];
    }
  }

  /**
   * Check if text represents a tender opportunity
   * @param text Text to analyze
   * @returns Boolean indicating if it's likely a tender
   */
  private isTenderOpportunity(text: string): boolean {
    const tenderKeywords = [
      'tender', 'ariza', 'application', 'procurement', 'sotib olish',
      'deadline', 'muddat', 'price', 'narx', 'contract', 'shartnoma'
    ];
    
    const lowerText = text.toLowerCase();
    return tenderKeywords.some(keyword => lowerText.includes(keyword));
  }
}

// Initialize with environment variables or default credentials
export const googleCustomSearch = new GoogleCustomSearch();

export default GoogleCustomSearch;