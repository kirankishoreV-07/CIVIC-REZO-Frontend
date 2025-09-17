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
    
    // News API configuration - Force real API
    this.NEWS_API_KEY = 'a7c4dd34b48e43ef843e3a9e9743b0b0'; // Direct hardcoded API key
    this.NEWS_API_URL = 'https://newsapi.org/v2';
    this.USE_REAL_API = true; // Always use real API
    
    // Debug logging
    console.log('🔧 NewsService Configuration:');
    console.log('API Key:', this.NEWS_API_KEY.substring(0, 8) + '...');
    console.log('API URL:', this.NEWS_API_URL);
    console.log('USE_REAL_API:', this.USE_REAL_API);
    
    console.log(`📰 NewsService initialized with REAL API (hardcoded)`);
  }

  // Get real news from NewsAPI based on location
  async getRealNews(userLocation = null, category = null) {
    try {
      console.log('📰 getRealNews called - Starting real API fetch');
      console.log('📰 API Key:', this.NEWS_API_KEY.substring(0, 8) + '...');

      // Get user location if not provided
      if (!userLocation) {
        try {
          console.log('📰 Getting user location...');
          userLocation = await LocationService.getCurrentLocation();
          console.log('📰 Location obtained:', userLocation);
        } catch (error) {
          console.log('📰 Could not get location, using India as default');
          userLocation = { city: null, region: null, country: 'India' };
        }
      }

      // SIMPLIFIED DEBUG - Use both civic and general queries
      console.log('📰 DEBUG: Using combined civic and general news query');
      let apiUrl = `${this.NEWS_API_URL}/top-headlines?country=in&pageSize=20&apiKey=${this.NEWS_API_KEY}`;
      
      // Try specific civic query as fallback
      const civicQuery = 'infrastructure OR hospital OR school OR road OR public OR government OR municipal OR civic OR health OR education OR transport';
      const fallbackUrl = `${this.NEWS_API_URL}/everything?q=${encodeURIComponent(civicQuery)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${this.NEWS_API_KEY}`;

      console.log('📰 Primary API URL:', apiUrl);
      console.log('📰 Civic Fallback URL:', fallbackUrl);
      console.log('📰 Fetching from NewsAPI...');
      
      // Try without User-Agent header first (React Native limitation)
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      console.log('📰 API Response status:', response.status);
      
      if (!response.ok) {
        console.log('📰 Primary API failed, trying fallback...');
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        console.log('📰 Fallback Response status:', fallbackResponse.status);
        
        if (!fallbackResponse.ok) {
          throw new Error(`Both API calls failed: ${response.status} and ${fallbackResponse.status}`);
        }
        
        const fallbackData = await fallbackResponse.json();
        console.log('📰 Fallback API Response data:', fallbackData.status, 'Total Results:', fallbackData.totalResults);
        
        if (fallbackData.status !== 'ok') {
          throw new Error(`Fallback NewsAPI error: ${fallbackData.message || 'Unknown error'}`);
        }
        
        const transformedNews = this.transformNewsAPIData(fallbackData.articles, userLocation);
        console.log(`📰 SUCCESS (fallback): Fetched ${transformedNews.length} news articles`);
        return transformedNews;
      }
      
      if (!response.ok) {
        console.log('📰 Response not OK, status:', response.status);
        const errorText = await response.text();
        console.log('📰 Error response:', errorText);
        throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📰 API Response data:', data.status, 'Total Results:', data.totalResults);
      
      if (data.status !== 'ok') {
        console.log('📰 API status not OK:', data.message);
        throw new Error(`NewsAPI error: ${data.message || 'Unknown error'}`);
      }

      // Check if we have articles - if not, try fallback searches
      if (!data.articles || data.articles.length === 0) {
        console.log('📰 No articles in primary response, trying fallback searches...');
        throw new Error('No articles in primary response - triggering fallback');
      }

      // Transform NewsAPI data to our format
      const transformedNews = this.transformNewsAPIData(data.articles, userLocation);
      
      console.log(`📰 SUCCESS: Fetched ${transformedNews.length} real news articles`);
      console.log('📰 Sample headlines:', transformedNews.slice(0, 3).map(n => n.headline));
      return transformedNews;

    } catch (error) {
      console.error('📰 Primary API call failed:', error.message);
      
      // Try multiple fallback approaches
      const fallbackQueries = [
        { name: 'India Search', url: `${this.NEWS_API_URL}/everything?apiKey=${this.NEWS_API_KEY}&q=India&language=en&sortBy=publishedAt&pageSize=20` },
        { name: 'General News', url: `${this.NEWS_API_URL}/everything?apiKey=${this.NEWS_API_KEY}&q=news&language=en&sortBy=publishedAt&pageSize=20` },
        { name: 'Technology', url: `${this.NEWS_API_URL}/everything?apiKey=${this.NEWS_API_KEY}&q=technology&language=en&sortBy=publishedAt&pageSize=20` },
        { name: 'US Headlines', url: `${this.NEWS_API_URL}/top-headlines?country=us&pageSize=20&apiKey=${this.NEWS_API_KEY}` }
      ];
      
      for (const fallback of fallbackQueries) {
        try {
          console.log(`📰 Trying ${fallback.name}...`);
          const fallbackResponse = await fetch(fallback.url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.status === 'ok' && fallbackData.articles && fallbackData.articles.length > 0) {
              console.log(`📰 ${fallback.name} SUCCESS: Got ${fallbackData.articles.length} articles`);
              const transformedNews = this.transformNewsAPIData(fallbackData.articles, userLocation || { country: 'India' });
              return transformedNews;
            }
          }
        } catch (fallbackError) {
          console.error(`📰 ${fallback.name} failed:`, fallbackError.message);
        }
      }
      
      console.log('📰 ALL FALLBACK ATTEMPTS FAILED - Returning placeholder news');
      return this.getPlaceholderNews();
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
    if (location && location.city && location.city.toLowerCase() !== 'delhi') {
      terms.push(location.city);
    }
    if (location && location.region && location.region.toLowerCase() !== 'delhi') {
      terms.push(location.region);
    }
    if (location && location.country) {
      terms.push(location.country);
    }
    
    // Add category terms if specified
    if (category) {
      const categoryTerms = this.getCategorySearchTerms(category);
      terms.push(...categoryTerms);
    } else {
      // Use broader terms to get more general news if no specific location
      terms.push('India', 'news', 'public');
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
          source: article.source ? article.source.name : 'News Source',
          category: category,
          publishedAt: new Date(article.publishedAt),
          readTime: this.estimateReadTime(article.description),
          priority: priority,
          url: article.url,
          author: article.author,
          location: (location && location.city) ? location.city : (location && location.region) ? location.region : 'India',
          isReal: true
        };
      })
      .slice(0, 15); // Limit to 15 articles
  }

  // Determine news category from content
  determineCategory(content) {
    if (/emergency|fire|disaster|rescue|accident|bomb|terror|alert/i.test(content)) return 'Emergency';
    if (/traffic|transport|metro|road|highway|vehicle|railway|bus|train/i.test(content)) return 'Transportation';
    if (/weather|rain|flood|storm|cyclone|temperature|monsoon/i.test(content)) return 'Weather';
    if (/infrastructure|construction|development|building|bridge|project|smart city/i.test(content)) return 'Infrastructure';
    if (/health|hospital|medical|doctor|patient|covid|AIIMS|clinic/i.test(content)) return 'Health';
    if (/environment|pollution|air|water|waste|climate|clean|green/i.test(content)) return 'Environment';
    if (/police|security|crime|safety|law|investigation/i.test(content)) return 'Public Safety';
    if (/education|school|university|student|exam|CBSE|college/i.test(content)) return 'Education';
    if (/election|vote|politics|government|minister|municipal|civic|public service|administration/i.test(content)) return 'Civic Services';
    if (/water|electricity|gas|power|utility|sewage|drainage/i.test(content)) return 'Utilities';
    
    return 'Civic Services'; // Default category for civic-related content
  }

  // Determine priority from content
  determinePriority(content) {
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

  // Placeholder news data (fallback when API is not available)
  getPlaceholderNews() {
    console.log('📰 GENERATING PLACEHOLDER NEWS - This should always work');
    const currentDate = new Date();
    const todayStr = currentDate.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const placeholderNews = [
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
        headline: 'Heavy Rain Alert: Water logging Expected',
        summary: `Weather department warns of heavy rainfall in Delhi-NCR today, ${todayStr}. Citizens advised to avoid unnecessary travel.`,
        imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=250&fit=crop',
        source: 'IMD Delhi',
        category: 'Weather',
        publishedAt: new Date(currentDate.getTime() - 25 * 60 * 1000), // 25 minutes ago
        readTime: '2 min read',
        priority: 'high'
      },
      {
        id: 'news_4',
        headline: 'Metro Blue Line Partially Disrupted',
        summary: 'Technical snag at Rajouri Garden station. Services between Kirti Nagar and Ramesh Nagar suspended.',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop',
        source: 'Delhi Metro Rail Corporation',
        category: 'Transportation',
        publishedAt: new Date(currentDate.getTime() - 35 * 60 * 1000), // 35 minutes ago
        readTime: '1 min read',
        priority: 'high'
      },
      {
        id: 'news_5',
        headline: 'New Air Pollution Control Measures Announced',
        summary: 'Delhi government introduces stricter emission norms for commercial vehicles. Implementation starts next month.',
        imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=250&fit=crop',
        source: 'Delhi Pollution Control Board',
        category: 'Environment',
        publishedAt: new Date(currentDate.getTime() - 45 * 60 * 1000), // 45 minutes ago
        readTime: '3 min read',
        priority: 'medium'
      },
      {
        id: 'news_6',
        headline: 'Public Wi-Fi Expansion in Parks',
        summary: 'Free Wi-Fi services now available in 25 additional public parks across Delhi. Part of Digital India initiative.',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop',
        source: 'Delhi Development Authority',
        category: 'Technology',
        publishedAt: new Date(currentDate.getTime() - 60 * 60 * 1000), // 1 hour ago
        readTime: '2 min read',
        priority: 'low'
      },
      {
        id: 'news_7',
        headline: 'Water Supply Disruption in South Delhi',
        summary: 'Planned maintenance work will affect water supply in Greater Kailash, Defence Colony areas from 10 PM to 6 AM.',
        imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=250&fit=crop',
        source: 'Delhi Jal Board',
        category: 'Utilities',
        publishedAt: new Date(currentDate.getTime() - 90 * 60 * 1000), // 1.5 hours ago
        readTime: '2 min read',
        priority: 'medium'
      },
      {
        id: 'news_8',
        headline: 'New Healthcare Center Opens in Dwarka',
        summary: 'State-of-the-art 200-bed facility with emergency services. Expected to serve 50,000 residents in the area.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop',
        source: 'Delhi Health Department',
        category: 'Health',
        publishedAt: new Date(currentDate.getTime() - 120 * 60 * 1000), // 2 hours ago
        readTime: '3 min read',
        priority: 'medium'
      },
      {
        id: 'news_9',
        headline: 'Student Safety Initiative in Schools',
        summary: 'Delhi Education Department launches comprehensive safety protocols. CCTV monitoring and emergency response systems.',
        imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop',
        source: 'Directorate of Education, Delhi',
        category: 'Education',
        publishedAt: new Date(currentDate.getTime() - 150 * 60 * 1000), // 2.5 hours ago
        readTime: '2 min read',
        priority: 'medium'
      },
      {
        id: 'news_10',
        headline: 'Smart Traffic Signals at 50 New Junctions',
        summary: 'AI-powered traffic management system reduces waiting time by 30%. Part of Smart City mission.',
        imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop',
        source: 'Delhi Traffic Police',
        category: 'Infrastructure',
        publishedAt: new Date(currentDate.getTime() - 180 * 60 * 1000), // 3 hours ago
        readTime: '2 min read',
        priority: 'low'
      },
      {
        id: 'news_11',
        headline: 'Community Food Distribution Drive',
        summary: 'Local NGOs collaborate with MCD for weekly food distribution. Serving 500 families in need across 10 locations.',
        imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=250&fit=crop',
        source: 'Municipal Corporation of Delhi',
        category: 'Social Welfare',
        publishedAt: new Date(currentDate.getTime() - 210 * 60 * 1000), // 3.5 hours ago
        readTime: '2 min read',
        priority: 'low'
      },
      {
        id: 'news_12',
        headline: 'Enhanced Security at Tourist Spots',
        summary: 'Additional police deployment at Red Fort, India Gate, and Lotus Temple. Tourist safety remains top priority.',
        imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=250&fit=crop',
        source: 'Delhi Police',
        category: 'Security',
        publishedAt: new Date(currentDate.getTime() - 240 * 60 * 1000), // 4 hours ago
        readTime: '2 min read',
        priority: 'medium'
      }
    ];
    
    console.log(`📰 Generated ${placeholderNews.length} placeholder news articles`);
    return placeholderNews;
  }

  // Get fresh location-based news using real API (NO Delhi context)
  async getLocationNews() {
    try {
      // Clear cache to always fetch fresh real news
      console.log('📰 FORCING FRESH NEWS FETCH - Clearing cache');
      this.cache = null;
      this.lastFetchTime = null;

      console.log('📰 Fetching fresh location-based news (NOT Delhi-specific)...');
      
      // Try to get user location for location-based news
      let userLocation = null;
      try {
        userLocation = await LocationService.getCurrentLocation();
        console.log(`📰 Got user location: ${(userLocation && userLocation.city) || (userLocation && userLocation.region) || 'Unknown'}`);
      } catch (error) {
        console.log('📰 Could not get user location, using default');
      }

      // FORCE REAL NEWS API - NO CACHE, NO FALLBACKS
      const newsData = await this.getRealNews(userLocation);

      console.log(`📰 SUCCESS: Fetched ${newsData ? newsData.length : 0} REAL news articles`);
      
      return {
        success: true,
        news: newsData || [],
        source: 'real-newsapi-forced',
        location: (userLocation && userLocation.city) || (userLocation && userLocation.region) || 'India'
      };
    } catch (error) {
      console.error('❌ Real news API failed:', error);
      console.log('📰 Using placeholder news as fallback');
      
      const placeholderNews = this.getPlaceholderNews();
      
      return {
        success: true,
        news: placeholderNews,
        source: 'placeholder-fallback',
        location: 'Delhi',
        note: 'Using local news due to API unavailability'
      };
    }
  }

  // Get top priority news for carousel (increased to 10 articles)
  async getTopNews(limit = 10) {
    console.log(`📰 getTopNews called with limit: ${limit}`);
    try {
      console.log('📰 Calling getLocationNews...');
      const result = await this.getLocationNews();
      console.log('📰 getLocationNews result:', result.success, result.news?.length || 0, 'articles');
      
      if (!result.success || !result.news || result.news.length === 0) {
        console.log('📰 No news available from getLocationNews, using placeholder directly');
        const placeholderNews = this.getPlaceholderNews();
        console.log(`📰 Returning ${placeholderNews.slice(0, limit).length} placeholder articles`);
        return { 
          success: true, 
          news: placeholderNews.slice(0, limit),
          source: 'placeholder-direct'
        };
      }

      // Filter for civic-related news first
      const civicNews = result.news.filter(article => 
        article.category === 'Infrastructure' ||
        article.category === 'Health' ||
        article.category === 'Emergency' ||
        article.category === 'Civic Services' ||
        article.category === 'Environment' ||
        article.category === 'Transportation' ||
        article.category === 'Public Safety' ||
        article.category === 'Education' ||
        article.category === 'Utilities' ||
        article.priority === 'urgent' ||
        article.priority === 'high' ||
        // Also include by keywords in headlines
        /infrastructure|hospital|school|road|public|government|municipal|civic|health|education|transport|AIIMS|railway/i.test(article.headline)
      );

      console.log(`📰 Filtered ${civicNews.length} civic news from ${result.news.length} total`);
      console.log(`📰 Civic headlines: ${civicNews.slice(0, 3).map(n => n.headline).join(', ')}`);

      // Use civic news first, then general news if needed
      const newsToUse = civicNews.length >= limit ? civicNews : [...civicNews, ...result.news];
      const topNews = newsToUse.slice(0, limit);

      console.log(`📰 Returning ${topNews.length} top news (requested ${limit})`);
      console.log(`📰 Top news categories: ${topNews.map(n => n.category).join(', ')}`);

      return {
        success: true,
        news: topNews,
        source: result.source
      };
    } catch (error) {
      console.error('❌ Error fetching top news:', error);
      console.log('📰 Fallback: returning placeholder news from catch block');
      const placeholderNews = this.getPlaceholderNews();
      return { 
        success: true, 
        news: placeholderNews.slice(0, limit),
        source: 'placeholder-error-fallback'
      };
    }
  }

  // Get news by category with location filtering
  async getNewsByCategory(category) {
    try {
      const result = await this.getLocationNews();
      if (!result.success) {
        return { success: false, news: [] };
      }

      const categoryNews = result.news.filter(article => 
        article.category.toLowerCase() === category.toLowerCase()
      );

      return {
        success: true,
        news: categoryNews,
        source: result.source,
        category
      };
    } catch (error) {
      console.error(`❌ Error fetching ${category} news:`, error);
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
