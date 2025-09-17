// NewsService.js - Real News Data Management with Location-Based Filtering

import LocationService from './LocationService';

class NewsService {
  constructor() {
    this.cache = null;
    this.lastFetchTime = null;
    this.locationCache = null;
    this.lastLocationTime = null;
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    this.LOCATION_CACHE_DURATION = 60 * 60 * 1000; // 1 hour
    
    // News API configuration
    this.NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY || 'demo_key';
    this.NEWS_API_URL = process.env.EXPO_PUBLIC_NEWS_API_URL || 'https://newsapi.org/v2';
    this.USE_REAL_API = this.NEWS_API_KEY !== 'demo_key';
    
    console.log(`📰 NewsService initialized with ${this.USE_REAL_API ? 'REAL' : 'DEMO'} API`);
  }

  // Get real news from NewsAPI based on location
  async getRealNews(userLocation = null, category = null) {
    try {
      if (!this.USE_REAL_API) {
        console.log('📰 Using placeholder data (no API key)');
        return this.getPlaceholderDelhiNews();
      }

      // Get user location if not provided
      if (!userLocation) {
        try {
          userLocation = await LocationService.getCurrentLocation();
        } catch (error) {
          console.log('📰 Could not get location, using India as default');
          userLocation = { city: null, region: null, country: 'India' };
        }
      }

      // Build location query
      let locationQuery = this.buildLocationQuery(userLocation);
      console.log(`📰 Fetching news for location: ${locationQuery}`);

      // Build API URL
      let apiUrl = `${this.NEWS_API_URL}/everything?apiKey=${this.NEWS_API_KEY}`;
      
      // Add location-based search terms
      const searchTerms = this.buildSearchTerms(userLocation, category);
      apiUrl += `&q=${encodeURIComponent(searchTerms)}`;
      
      // Additional parameters
      apiUrl += '&language=en';
      apiUrl += '&sortBy=publishedAt';
      apiUrl += '&pageSize=20';
      apiUrl += '&from=' + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours

      console.log('📰 Fetching from NewsAPI...');
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`NewsAPI error: ${data.message || 'Unknown error'}`);
      }

      // Transform NewsAPI data to our format
      const transformedNews = this.transformNewsAPIData(data.articles, userLocation);
      
      console.log(`📰 Fetched ${transformedNews.length} real news articles for ${locationQuery}`);
      return transformedNews;

    } catch (error) {
      console.error('📰 Real news API error:', error.message);
      console.log('📰 Falling back to placeholder data');
      return this.getPlaceholderDelhiNews();
    }
  }

  // Build location query for news search
  buildLocationQuery(location) {
    if (!location) return 'India';
    
    // Avoid Delhi if user specifically requested non-Delhi news
    if (location.city && location.city.toLowerCase() !== 'delhi') {
      return `${location.city}, ${location.region || location.country}`;
    } else if (location.region && location.region.toLowerCase() !== 'delhi') {
      return `${location.region}, ${location.country}`;
    } else {
      return location.country || 'India';
    }
  }

  // Build search terms for NewsAPI
  buildSearchTerms(location, category = null) {
    const terms = [];
    
    // Add location terms
    if (location?.city && location.city.toLowerCase() !== 'delhi') {
      terms.push(location.city);
    }
    if (location?.region && location.region.toLowerCase() !== 'delhi') {
      terms.push(location.region);
    }
    if (location?.country) {
      terms.push(location.country);
    }
    
    // Add category terms if specified
    if (category) {
      const categoryTerms = this.getCategorySearchTerms(category);
      terms.push(...categoryTerms);
    } else {
      // Default civic-related terms
      terms.push('civic', 'municipal', 'city', 'infrastructure', 'public services');
    }
    
    // Ensure we have some search terms
    if (terms.length === 0) {
      terms.push('India', 'news');
    }
    
    return terms.join(' OR ');
  }

  // Get search terms for specific categories
  getCategorySearchTerms(category) {
    const categoryMap = {
      'Emergency': ['emergency', 'disaster', 'fire', 'rescue'],
      'Traffic': ['traffic', 'transport', 'road', 'metro'],
      'Weather': ['weather', 'rain', 'flood', 'storm'],
      'Infrastructure': ['infrastructure', 'construction', 'development'],
      'Health': ['health', 'hospital', 'medical', 'healthcare'],
      'Environment': ['environment', 'pollution', 'air quality', 'waste'],
      'Security': ['security', 'police', 'safety', 'crime'],
      'Education': ['education', 'school', 'university', 'students']
    };
    
    return categoryMap[category] || ['news'];
  }

  // Transform NewsAPI data to our internal format
  transformNewsAPIData(articles, location) {
    return articles
      .filter(article => article.title && article.description && article.urlToImage)
      .map((article, index) => {
        // Determine category based on content
        const category = this.determineCategory(article.title + ' ' + article.description);
        
        // Determine priority based on keywords
        const priority = this.determinePriority(article.title + ' ' + article.description);
        
        return {
          id: `real_news_${index}_${Date.now()}`,
          headline: article.title,
          summary: article.description,
          imageUrl: article.urlToImage,
          source: article.source?.name || 'News Source',
          category: category,
          publishedAt: new Date(article.publishedAt),
          readTime: this.estimateReadTime(article.description),
          priority: priority,
          url: article.url,
          author: article.author,
          location: location?.city || location?.region || 'India',
          isReal: true
        };
      })
      .slice(0, 15); // Limit to 15 articles
  }

  // Determine news category from content
  determineCategory(content) {
    const contentLower = content.toLowerCase();
    
    if (/emergency|fire|disaster|rescue|accident|bomb|terror/i.test(content)) return 'Emergency';
    if (/traffic|transport|metro|road|highway|vehicle/i.test(content)) return 'Traffic';
    if (/weather|rain|flood|storm|cyclone|temperature/i.test(content)) return 'Weather';
    if (/infrastructure|construction|development|building/i.test(content)) return 'Infrastructure';
    if (/health|hospital|medical|doctor|patient|covid/i.test(content)) return 'Health';
    if (/environment|pollution|air|water|waste|climate/i.test(content)) return 'Environment';
    if (/police|security|crime|safety|law/i.test(content)) return 'Security';
    if (/education|school|university|student|exam/i.test(content)) return 'Education';
    if (/election|vote|politics|government|minister/i.test(content)) return 'Civic Services';
    
    return 'Civic Services'; // Default category
  }

  // Determine priority from content
  determinePriority(content) {
    const contentLower = content.toLowerCase();
    
    if (/urgent|emergency|breaking|alert|critical|disaster/i.test(content)) return 'urgent';
    if (/important|significant|major|serious|warning/i.test(content)) return 'high';
    if (/update|report|announce|plan|develop/i.test(content)) return 'medium';
    
    return 'medium'; // Default priority
  }

  // Estimate reading time
  estimateReadTime(text) {
    if (!text) return '1 min read';
    const wordCount = text.split(' ').length;
    const readingSpeed = 200; // words per minute
    const minutes = Math.ceil(wordCount / readingSpeed);
    return `${minutes} min read`;
  }

  // Placeholder Delhi news data (fallback when API is not available)
  getPlaceholderDelhiNews() {
    const currentDate = new Date();
    const todayStr = currentDate.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    return [
      {
        id: 'news_1',
        headline: 'Emergency: Gas Leak Reported in Karol Bagh',
        summary: 'Immediate evacuation of 3 residential blocks. Fire department and gas authority teams on site.',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop',
        source: 'Delhi Fire Service',
        category: 'Emergency',
        publishedAt: new Date(currentDate.getTime() - 10 * 60 * 1000), // 10 minutes ago
        readTime: '1 min read',
        priority: 'urgent'
      },
      {
        id: 'news_2',
        headline: 'Traffic Jam Alert: Outer Ring Road Blocked',
        summary: 'Major accident near Punjabi Bagh causing 2-hour delays. Use alternate routes via Rohtak Road.',
        imageUrl: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=400&h=250&fit=crop',
        source: 'Delhi Traffic Police',
        category: 'Traffic',
        publishedAt: new Date(currentDate.getTime() - 15 * 60 * 1000), // 15 minutes ago
        readTime: '2 min read',
        priority: 'urgent'
      },
      {
        id: 'news_3',
        headline: 'Weather Alert: Heavy Rain Expected Tonight',
        summary: 'IMD predicts 50mm rainfall with thunderstorms. Waterlogging expected in low-lying areas.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=250&fit=crop',
        source: 'India Meteorological Department',
        category: 'Weather',
        publishedAt: new Date(currentDate.getTime() - 20 * 60 * 1000), // 20 minutes ago
        readTime: '1 min read',
        priority: 'high'
      },
      {
        id: 'news_4',
        headline: 'Delhi Metro Phase 4 Extension Opens Tomorrow',
        summary: 'Three new metro stations including Dwarka-Najafgarh corridor will begin operations with enhanced connectivity.',
        imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop',
        source: 'Delhi Metro Rail Corporation',
        category: 'Transportation',
        publishedAt: new Date(currentDate.getTime() - 30 * 60 * 1000), // 30 minutes ago
        readTime: '2 min read',
        priority: 'high'
      },
      {
        id: 'news_5',
        headline: 'Air Quality Alert: AQI Reaches 150 in Central Delhi',
        summary: 'Health advisory issued as PM2.5 levels spike. Citizens advised to limit outdoor activities and use masks.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=250&fit=crop',
        source: 'Delhi Pollution Control Committee',
        category: 'Environment',
        publishedAt: new Date(currentDate.getTime() - 45 * 60 * 1000), // 45 minutes ago
        readTime: '2 min read',
        priority: 'high'
      },
      {
        id: 'news_6',
        headline: 'Delhi Airport T1 Renovation Causes Flight Delays',
        summary: 'Terminal upgrades result in 30-45 minute delays. Passengers advised to arrive 3 hours early.',
        imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop',
        source: 'Delhi Airport Authority',
        category: 'Transportation',
        publishedAt: new Date(currentDate.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        readTime: '3 min read',
        priority: 'high'
      },
      {
        id: 'news_7',
        headline: 'CM Announces New Water Treatment Plant',
        summary: 'Rs 500 crore investment approved for Yamuna water treatment facility to serve 2 lakh households in East Delhi.',
        imageUrl: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=400&h=250&fit=crop',
        source: 'Delhi Government',
        category: 'Infrastructure',
        publishedAt: new Date(currentDate.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        readTime: '3 min read',
        priority: 'medium'
      },
      {
        id: 'news_8',
        headline: 'Power Cut Schedule: Dwarka & Rohini Areas',
        summary: 'Planned maintenance work from 10 AM to 4 PM tomorrow. Emergency contact: 1912 for urgent issues.',
        imageUrl: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=400&h=250&fit=crop',
        source: 'Delhi Electricity Board',
        category: 'Utilities',
        publishedAt: new Date(currentDate.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        readTime: '2 min read',
        priority: 'medium'
      },
      {
        id: 'news_9',
        headline: 'New COVID Vaccination Drive Starts Monday',
        summary: 'Free booster shots for citizens above 60. Registration open at CoWIN portal and 200+ centers.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=250&fit=crop',
        source: 'Delhi Health Department',
        category: 'Health',
        publishedAt: new Date(currentDate.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        readTime: '2 min read',
        priority: 'medium'
      },
      {
        id: 'news_10',
        headline: 'Delhi University Admission Portal Reopens',
        summary: 'Second cutoff list released with 15% more seats. Online applications deadline extended till next Friday.',
        imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop',
        source: 'Delhi University',
        category: 'Education',
        publishedAt: new Date(currentDate.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
        readTime: '3 min read',
        priority: 'medium'
      },
      {
        id: 'news_11',
        headline: 'Municipal Corporation Waste Collection Update',
        summary: 'Door-to-door collection suspended in 15 areas due to truck maintenance. Resume tomorrow 6 AM.',
        imageUrl: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=400&h=250&fit=crop',
        source: 'Municipal Corporation of Delhi',
        category: 'Civic Services',
        publishedAt: new Date(currentDate.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
        readTime: '2 min read',
        priority: 'medium'
      },
      {
        id: 'news_12',
        headline: 'Security Alert: Republic Day Preparations Begin',
        summary: 'Road closures from Raj Path to India Gate. Metro services modified on January 26th.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=250&fit=crop',
        source: 'Delhi Police',
        category: 'Security',
        publishedAt: new Date(currentDate.getTime() - 7 * 60 * 60 * 1000), // 7 hours ago
        readTime: '2 min read',
        priority: 'high'
      },
      {
        id: 'news_13',
        headline: 'Night Shelter Capacity Increased for Winter',
        summary: '500 additional beds arranged across 20 locations. Free meals and medical checkups available.',
        imageUrl: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=400&h=250&fit=crop',
        source: 'Delhi Urban Shelter',
        category: 'Social Welfare',
        publishedAt: new Date(currentDate.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
        readTime: '2 min read',
        priority: 'medium'
      },
      {
        id: 'news_14',
        headline: 'Digital Bus Stops with Real-time Updates',
        summary: 'Smart displays showing live bus arrivals installed at 100 major bus stops across Delhi.',
        imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop',
        source: 'Delhi Transport Corporation',
        category: 'Technology',
        publishedAt: new Date(currentDate.getTime() - 9 * 60 * 60 * 1000), // 9 hours ago
        readTime: '2 min read',
        priority: 'medium'
      },
      {
        id: 'news_15',
        headline: 'Free Eye Checkup Camp at AIIMS',
        summary: 'Special camp for senior citizens and children. Free glasses and cataract surgery consultations.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=250&fit=crop',
        source: 'AIIMS Delhi',
        category: 'Health',
        publishedAt: new Date(currentDate.getTime() - 10 * 60 * 60 * 1000), // 10 hours ago
        readTime: '2 min read',
        priority: 'medium'
      }
    ];
  }

  // Get cached news or fetch fresh data with location-based filtering
  async getDelhiNews() {
    try {
      // Check cache validity
      const now = Date.now();
      if (this.cache && this.lastFetchTime && (now - this.lastFetchTime) < this.CACHE_DURATION) {
        console.log('📰 Returning cached news');
        return {
          success: true,
          news: this.cache,
          source: 'cache'
        };
      }

      console.log('📰 Fetching fresh news...');
      
      // Try to get user location for location-based news
      let userLocation = null;
      try {
        userLocation = await LocationService.getCurrentLocation();
        console.log(`📰 Got user location: ${userLocation.city || userLocation.region || 'Unknown'}`);
      } catch (error) {
        console.log('📰 Could not get user location, using default');
      }

      // Get real news with location filtering
      const newsData = await this.getRealNews(userLocation);
      
      // Update cache
      this.cache = newsData;
      this.lastFetchTime = now;

      console.log(`📰 Fetched ${newsData.length} news articles`);
      
      return {
        success: true,
        news: newsData,
        source: this.USE_REAL_API ? 'newsapi' : 'placeholder',
        location: userLocation?.city || userLocation?.region || 'India'
      };
    } catch (error) {
      console.error('❌ Error fetching news:', error);
      
      // Fallback to placeholder data
      const fallbackData = this.getPlaceholderDelhiNews();
      return {
        success: false,
        news: fallbackData,
        source: 'fallback',
        error: error.message
      };
    }
  }
        error: error.message,
        source: this.cache ? 'cache_fallback' : 'empty'
      };
    }
  }

  // Get top priority news for carousel
  async getTopNews(limit = 3) {
    try {
      const result = await this.getDelhiNews();
      if (!result.success && result.news.length === 0) {
        return { success: false, news: [] };
      }

      const topNews = result.news
        .filter(article => article.priority === 'urgent' || article.priority === 'high')
        .slice(0, limit);

      return {
        success: true,
        news: topNews,
        source: result.source
      };
    } catch (error) {
      console.error('❌ Error getting top news:', error);
      return { success: false, news: [] };
    }
  }

  // Get news by category
  async getNewsByCategory(category) {
    try {
      const result = await this.getDelhiNews();
      if (!result.success) {
        return { success: false, news: [] };
      }

      const categoryNews = result.news.filter(article => 
        article.category.toLowerCase() === category.toLowerCase()
      );

      return {
        success: true,
        news: categoryNews,
        source: result.source
      };
    } catch (error) {
      console.error(`❌ Error getting ${category} news:`, error);
      return { success: false, news: [] };
    }
  }

  // Format time for display
  formatTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  }

  // Get priority color for UI
  getPriorityColor(priority) {
    const colors = {
      urgent: '#FF4444',
      high: '#FF8C00',
      medium: '#FFD700',
      low: '#90EE90'
    };
    return colors[priority] || colors.medium;
  }

  // Get category color for UI
  getCategoryColor(category) {
    const colors = {
      Emergency: '#FF4444',
      Traffic: '#FF6B35',
      Weather: '#4A90E2',
      Transportation: '#7B68EE',
      Environment: '#32CD32',
      Infrastructure: '#8B4513',
      Utilities: '#FFD700',
      Health: '#FF69B4',
      Education: '#20B2AA',
      'Civic Services': '#9370DB',
      Security: '#DC143C',
      'Social Welfare': '#32CD32',
      Technology: '#4169E1'
    };
    return colors[category] || '#666666';
  }

  // Clear cache (useful for testing or force refresh)
  clearCache() {
    this.cache = null;
    this.lastFetchTime = null;
    console.log('📰 News cache cleared');
  }
}

// Export singleton instance
export default new NewsService();
