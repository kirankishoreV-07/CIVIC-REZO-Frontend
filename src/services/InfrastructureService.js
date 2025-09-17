/**
 * Infrastructure Service for detecting nearby points of interest
 * Helps users understand their location context when reporting issues
 */
class InfrastructureService {
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_MOBILE_API_KEY || 'AIzaSyD44ORakAZledPQSeEwxk0Ohthgsc_eMQ0';
  }

  /**
   * Get nearby infrastructure points for location context
   */
  async getNearbyInfrastructure(latitude, longitude, radius = 500) {
    console.log(`🏗️ Finding infrastructure near: ${latitude}, ${longitude}`);
    
    try {
      const infrastructureTypes = [
        // Essential infrastructure
        { type: 'hospital', icon: 'medical', color: '#e74c3c', priority: 'high' },
        { type: 'police', icon: 'shield', color: '#3498db', priority: 'high' },
        { type: 'fire_station', icon: 'flame', color: '#f39c12', priority: 'high' },
        { type: 'train_station', icon: 'train', color: '#8e44ad', priority: 'high' },
        { type: 'school', icon: 'school', color: '#2ecc71', priority: 'medium' },
        { type: 'bank', icon: 'card', color: '#9b59b6', priority: 'medium' },
        { type: 'gas_station', icon: 'car', color: '#e67e22', priority: 'medium' },
        { type: 'pharmacy', icon: 'medical', color: '#1abc9c', priority: 'medium' },
        { type: 'atm', icon: 'card', color: '#34495e', priority: 'low' },
        { type: 'bus_station', icon: 'bus', color: '#95a5a6', priority: 'low' },
        { type: 'restaurant', icon: 'restaurant', color: '#f1c40f', priority: 'low' }
      ];

      const allNearbyPlaces = [];
      
      // Search for each infrastructure type
      for (const infra of infrastructureTypes) {
        try {
          // Use larger radius for train stations as they are typically farther away
          const searchRadius = infra.type === 'train_station' ? radius * 3 : radius;
          const places = await this.searchPlacesByType(latitude, longitude, infra.type, searchRadius);
          const enhancedPlaces = places.map(place => ({
            ...place,
            icon: infra.icon,
            color: infra.color,
            priority: infra.priority,
            infrastructureType: infra.type
          }));
          allNearbyPlaces.push(...enhancedPlaces);
        } catch (error) {
          console.log(`⚠️ Failed to fetch ${infra.type}:`, error.message);
        }
      }

      // Sort by priority and distance
      const sortedPlaces = this.sortInfrastructureByRelevance(allNearbyPlaces);
      
      // Get the most relevant nearby places (max 10)
      const topPlaces = sortedPlaces.slice(0, 10);
      
      console.log(`✅ Found ${topPlaces.length} nearby infrastructure points`);
      
      return {
        success: true,
        infrastructure: topPlaces,
        summary: this.generateLocationSummary(topPlaces, latitude, longitude),
        totalFound: allNearbyPlaces.length
      };

    } catch (error) {
      console.error('❌ Infrastructure detection failed:', error);
      return {
        success: false,
        infrastructure: [],
        summary: 'Unable to detect nearby infrastructure',
        error: error.message
      };
    }
  }

  /**
   * Search for places by type using Google Places API
   */
  async searchPlacesByType(lat, lng, type, radius) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        return data.results.slice(0, 3).map(place => ({
          id: place.place_id,
          name: place.name,
          distance: this.calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
          rating: place.rating || 0,
          vicinity: place.vicinity,
          location: place.geometry.location,
          isOpen: place.opening_hours?.open_now
        }));
      }
      
      return [];
    } catch (error) {
      console.log(`Failed to search ${type}:`, error.message);
      return [];
    }
  }

  /**
   * Calculate distance between two points in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(R * c);
  }

  /**
   * Sort infrastructure by relevance (priority + distance)
   */
  sortInfrastructureByRelevance(places) {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    
    return places.sort((a, b) => {
      const priorityA = priorityWeight[a.priority] || 1;
      const priorityB = priorityWeight[b.priority] || 1;
      
      // Higher priority first, then closer distance
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      
      return a.distance - b.distance;
    });
  }

  /**
   * Generate a summary of the location context
   */
  generateLocationSummary(infrastructure, lat, lng) {
    if (infrastructure.length === 0) {
      return 'Location captured successfully. No nearby infrastructure detected.';
    }

    // Group infrastructure by type and get the closest of each type
    const uniqueInfrastructure = this.getUniqueInfrastructureByType(infrastructure);
    const highPriority = uniqueInfrastructure.filter(i => i.priority === 'high');
    const mediumPriority = uniqueInfrastructure.filter(i => i.priority === 'medium');
    const closest = infrastructure[0];
    
    let summary = `📍 Location Context Report:\n\n`;
    
    // Essential services (high priority)
    if (highPriority.length > 0) {
      summary += `🚨 Essential Services:\n`;
      highPriority.forEach(infra => {
        const typeLabel = this.getInfrastructureTypeLabel(infra.infrastructureType);
        summary += `• ${typeLabel}: ${infra.name} (${infra.distance}m)\n`;
      });
      summary += `\n`;
    }
    
    // Other services (medium priority)
    if (mediumPriority.length > 0) {
      summary += `🏢 Other Facilities:\n`;
      mediumPriority.slice(0, 3).forEach(infra => {
        const typeLabel = this.getInfrastructureTypeLabel(infra.infrastructureType);
        summary += `• ${typeLabel}: ${infra.name} (${infra.distance}m)\n`;
      });
      summary += `\n`;
    }
    
    summary += `� Closest landmark: ${closest.name} (${closest.distance}m away)\n`;
    summary += `📊 Total infrastructure points found: ${infrastructure.length}`;
    
    return summary;
  }

  /**
   * Get unique infrastructure by type (closest of each type)
   */
  getUniqueInfrastructureByType(infrastructure) {
    const typeMap = new Map();
    
    infrastructure.forEach(infra => {
      const type = infra.infrastructureType;
      if (!typeMap.has(type) || infra.distance < typeMap.get(type).distance) {
        typeMap.set(type, infra);
      }
    });
    
    return Array.from(typeMap.values()).sort((a, b) => {
      // Sort by priority first, then by distance
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.distance - b.distance;
    });
  }

  /**
   * Get user-friendly label for infrastructure type
   */
  getInfrastructureTypeLabel(type) {
    const labels = {
      'hospital': 'Hospital',
      'police': 'Police Station',
      'fire_station': 'Fire Station',
      'train_station': 'Railway Station',
      'school': 'School',
      'bank': 'Bank',
      'gas_station': 'Gas Station',
      'pharmacy': 'Pharmacy',
      'atm': 'ATM',
      'bus_station': 'Bus Station',
      'restaurant': 'Restaurant'
    };
    return labels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get infrastructure relevance for complaint type
   */
  getRelevantInfrastructure(complaintType, infrastructure) {
    const relevanceMap = {
      'medical_emergency': ['hospital', 'pharmacy', 'police', 'train_station'],
      'fire_hazard': ['fire_station', 'hospital', 'police'],
      'security_issue': ['police', 'hospital', 'train_station'],
      'traffic_issue': ['police', 'hospital', 'gas_station', 'train_station'],
      'water_issue': ['hospital', 'school'],
      'electricity': ['hospital', 'school', 'bank', 'train_station'],
      'garbage': ['school', 'restaurant', 'hospital'],
      'road_damage': ['hospital', 'police', 'gas_station', 'train_station'],
      'pothole': ['hospital', 'police', 'train_station'],
      'traffic_signal': ['police', 'hospital', 'train_station']
    };

    const relevantTypes = relevanceMap[complaintType] || [];
    return infrastructure.filter(infra => 
      relevantTypes.includes(infra.infrastructureType)
    );
  }

  /**
   * Format infrastructure data for display
   */
  formatInfrastructureForDisplay(infrastructure) {
    return infrastructure.map(infra => ({
      id: infra.id,
      title: infra.name,
      subtitle: `${infra.infrastructureType.replace('_', ' ')} • ${infra.distance}m away`,
      icon: infra.icon,
      color: infra.color,
      distance: infra.distance,
      priority: infra.priority,
      rating: infra.rating,
      vicinity: infra.vicinity,
      isOpen: infra.isOpen
    }));
  }
}

export default new InfrastructureService();
