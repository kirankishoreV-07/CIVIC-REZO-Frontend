import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  ScrollView,
  Image,
  TextInput,
  Keyboard,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../../../config/supabase';

const ComplaintMapScreen = ({ navigation, route }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [region, setRegion] = useState({
    latitude: 10.9837,
    longitude: 76.9266,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [isProgrammaticMove, setIsProgrammaticMove] = useState(false);
  const [isMarkerInteracting, setIsMarkerInteracting] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true); // Toggle for heatmap vs markers
  const mapRef = useRef(null);
  const regionChangeTimeoutRef = useRef(null);

  // Get user's current location
  const getUserLocation = async () => {
    try {
      console.log('📍 Requesting location permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('❌ Location permission denied');
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to see complaints near you.',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }

      console.log('🔄 Getting current location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05, // Closer zoom to user area
        longitudeDelta: 0.05,
      };

      console.log('✅ User location obtained:', userCoords);
      setUserLocation(location.coords);
      setRegion(userCoords);
      
    } catch (error) {
      console.error('❌ Error getting location:', error);
      Alert.alert(
        'Location Error', 
        'Could not get your location. Showing default area.',
        [{ text: 'OK' }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Dynamic global search function with geocoding
  const searchLocation = async (query) => {
    console.log('� SEARCH TRIGGERED - Query:', query);
    
    if (!query || !query.trim()) {
      console.log('❌ Empty query, clearing results');
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchResults(true);
    
    try {
      const results = [];
      const queryLower = query.toLowerCase().trim();
      console.log('🔎 Searching for:', queryLower);

      // 1. Search predefined cities (most reliable)
      const cities = {
        'delhi': { lat: 28.6139, lng: 77.2090, name: 'Delhi, India' },
        'new delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi, India' },
        'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai, India' },
        'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore, India' },
        'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai, India' },
        'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata, India' },
        'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad, India' },
        'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune, India' },
        'kochi': { lat: 9.9312, lng: 76.2673, name: 'Kochi, Kerala' },
        'ernakulam': { lat: 9.9816, lng: 76.2999, name: 'Ernakulam, Kerala' },
        'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur, India' },
        'ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad, India' },
        'lucknow': { lat: 26.8467, lng: 80.9462, name: 'Lucknow, India' },
        'nagpur': { lat: 21.1458, lng: 79.0882, name: 'Nagpur, India' },
        'surat': { lat: 21.1702, lng: 72.8311, name: 'Surat, India' }
      };

      // Exact match
      if (cities[queryLower]) {
        const city = cities[queryLower];
        results.push({
          id: `city_${queryLower}`,
          latitude: city.lat,
          longitude: city.lng,
          title: city.name,
          subtitle: 'Major City',
          type: 'city'
        });
        console.log('✅ Found exact city match:', city.name);
      } else {
        // Partial match
        const partialMatches = Object.keys(cities).filter(cityKey => 
          cityKey.includes(queryLower) || queryLower.includes(cityKey.split(' ')[0])
        );
        
        if (partialMatches.length > 0) {
          const cityKey = partialMatches[0];
          const city = cities[cityKey];
          results.push({
            id: `city_${cityKey}`,
            latitude: city.lat,
            longitude: city.lng,
            title: city.name,
            subtitle: 'Major City',
            type: 'city'
          });
          console.log('✅ Found partial city match:', city.name);
        }
      }

      // 2. Dynamic geocoding search for all cities worldwide
      if (results.length === 0 || queryLower.length > 3) {
        console.log('🌐 Searching globally via geocoding...');
        
        try {
          // Use Nominatim (OpenStreetMap) for free geocoding
          const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=8&q=${encodeURIComponent(query)}&addressdetails=1`;
          console.log('🔗 Geocoding URL:', geocodeUrl);
          
          const geocodeResponse = await fetch(geocodeUrl, {
            headers: {
              'User-Agent': 'CivicRezo App 1.0'
            }
          });
          
          const geocodeData = await geocodeResponse.json();
          console.log('🗺️ Geocoding response:', geocodeData.length, 'results');
          
          if (geocodeData && geocodeData.length > 0) {
            geocodeData.slice(0, 6).forEach((place, index) => {
              // Filter for cities, towns, villages, etc.
              const placeType = place.type || place.class;
              const isSettlement = ['city', 'town', 'village', 'hamlet', 'municipality', 'suburb', 'neighbourhood', 'administrative'].includes(placeType) ||
                                 place.display_name.includes('city') || 
                                 place.display_name.includes('town') ||
                                 place.addresstype === 'city' ||
                                 place.addresstype === 'town' ||
                                 place.importance > 0.3;
              
              if (isSettlement) {
                // Clean up the display name
                const nameParts = place.display_name.split(',');
                const mainName = nameParts[0];
                const state = place.address?.state || nameParts[1]?.trim();
                const country = place.address?.country || nameParts[nameParts.length - 1]?.trim();
                
                const title = state && state !== mainName ? `${mainName}, ${state}` : mainName;
                const subtitle = `${country || 'Location'} • Global Search`;
                
                // Avoid duplicates from predefined cities
                const isDuplicate = results.some(r => 
                  Math.abs(r.latitude - parseFloat(place.lat)) < 0.01 && 
                  Math.abs(r.longitude - parseFloat(place.lon)) < 0.01
                );
                
                if (!isDuplicate) {
                  results.push({
                    id: `geocoded_${place.place_id}`,
                    latitude: parseFloat(place.lat),
                    longitude: parseFloat(place.lon),
                    title: title,
                    subtitle: subtitle,
                    type: 'geocoded',
                    importance: place.importance || 0
                  });
                  
                  console.log(`🌍 Added geocoded location: ${title}`);
                }
              }
            });
          }
        } catch (geocodeError) {
          console.log('⚠️ Geocoding failed, continuing with other results:', geocodeError.message);
        }
      }

      // 3. Search in complaints
      if (complaints && complaints.length > 0) {
        const matchingComplaints = complaints.filter(complaint => 
          complaint.title?.toLowerCase().includes(queryLower) ||
          complaint.description?.toLowerCase().includes(queryLower) ||
          complaint.category?.toLowerCase().includes(queryLower)
        );

        matchingComplaints.slice(0, 3).forEach(complaint => {
          results.push({
            id: `complaint_${complaint.id}`,
            latitude: parseFloat(complaint.location_latitude),
            longitude: parseFloat(complaint.location_longitude),
            title: complaint.title,
            subtitle: `${complaint.category} • Complaint`,
            complaint: complaint,
            type: 'complaint'
          });
        });
        console.log(`✅ Found ${matchingComplaints.length} matching complaints`);
      }

      // Sort results by relevance (predefined cities first, then by importance)
      results.sort((a, b) => {
        if (a.type === 'city' && b.type !== 'city') return -1;
        if (b.type === 'city' && a.type !== 'city') return 1;
        if (a.type === 'complaint' && b.type === 'geocoded') return -1;
        if (b.type === 'complaint' && a.type === 'geocoded') return 1;
        if (a.importance && b.importance) return b.importance - a.importance;
        return 0;
      });

      // Show results
      if (results.length > 0) {
        console.log(`🎯 Setting ${results.length} search results (sorted):`, results.map(r => `${r.title} (${r.type})`));
        setSearchResults(results);
        setShowSearchResults(true);
        console.log('✅ Search results state updated, dropdown should show');

        // Auto-select if only one result and it's exact match
        if (results.length === 1 && (results[0].type === 'city' || results[0].title.toLowerCase().includes(queryLower))) {
          console.log('🎯 Only one result found, auto-selecting:', results[0].title);
          Alert.alert(
            'Location Found!', 
            `Moving to ${results[0].title}...`, 
            [{ text: 'OK' }], 
            { cancelable: true }
          );
          setTimeout(() => {
            selectSearchResult(results[0]);
          }, 800);
        } else if (results.length > 1) {
          // Auto-select top result if its title matches the query closely
          const topResult = results[0];
          if (topResult.title && topResult.title.toLowerCase().includes(queryLower)) {
            console.log('🎯 Top result matches query, auto-selecting:', topResult.title);
            Alert.alert(
              'Location Found!', 
              `Moving to ${topResult.title}...`, 
              [{ text: 'OK' }], 
              { cancelable: true }
            );
            setTimeout(() => {
              selectSearchResult(topResult);
            }, 800);
          }
        }
      } else {
        console.log('❌ No results found, showing empty state');
        setSearchResults([]);
        setShowSearchResults(false);
        Alert.alert('No Results', `No results found for "${query}". Try searching for any city name worldwide or complaint keywords.`);
      }

    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
      Alert.alert('Search Error', 'Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
      console.log('✅ Search completed');
    }
  };

  // Handle search result selection
  const selectSearchResult = (result) => {
    console.log('🎯 SEARCH RESULT SELECTED:', result);
    console.log('Current region before update:', region);
    
    const newRegion = {
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.08, // Slightly broader view
      longitudeDelta: 0.08,
    };
    
    console.log('📍 NEW REGION TO SET:', newRegion);
    console.log(`🌍 Moving from [${region.latitude}, ${region.longitude}] to [${newRegion.latitude}, ${newRegion.longitude}]`);
    
    // Set flag to prevent onRegionChangeComplete from interfering
    setIsProgrammaticMove(true);
    
    // Use MapView animateToRegion for smooth transition
    if (mapRef.current) {
      console.log('🎬 Animating map to region via ref');
      mapRef.current.animateToRegion(newRegion, 1000);
    }
    
    // Also update state for fallback
    setRegion(newRegion);
    setSearchQuery(result.title);
    setShowSearchResults(false);
    Keyboard.dismiss();
    
    // Reset flag after animation
    setTimeout(() => {
      setIsProgrammaticMove(false);
      console.log('✅ Animation completed, region controls restored');
    }, 1500);
    
    // Log after state update
    setTimeout(() => {
      console.log('✅ Region should now be:', newRegion);
    }, 100);
    
    // If it's a complaint result, show the complaint details
    if (result.complaint) {
      setTimeout(() => {
        setSelectedComplaint(result.complaint);
        setShowComplaintModal(true);
      }, 500);
    }
  };

  // Fetch complaints data
  const fetchComplaints = async () => {
    try {
      console.log('🔄 Fetching complaints from:', `${API_BASE_URL}/api/complaints/all`);
      const response = await fetch(`${API_BASE_URL}/api/complaints/all`);
      const data = await response.json();
      
      if (data.success && data.complaints) {
        console.log('✅ Fetched complaints:', data.complaints.length);
        console.log('📊 Status breakdown:', data.complaints.map(c => ({ id: c.id?.substring(0,8), status: c.status })));
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error('❌ Error fetching complaints:', error);
      Alert.alert('Error', 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get user location first, then fetch complaints
    const initializeMap = async () => {
      await getUserLocation();
      await fetchComplaints();
    };
    
    initializeMap();
    
    // Cleanup function
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (regionChangeTimeoutRef.current) {
        clearTimeout(regionChangeTimeoutRef.current);
      }
    };
  }, []);

  // Simple manual search function with better debugging
  const handleSearch = () => {
    console.log('🚀 MANUAL SEARCH TRIGGERED');
    console.log('Current searchQuery state:', searchQuery);
    console.log('Query length:', searchQuery?.length);
    console.log('Query trimmed:', searchQuery?.trim());
    
    if (!searchQuery || !searchQuery.trim()) {
      console.log('❌ Empty search query, showing alert');
      Alert.alert('Search Required', 'Please enter a city name or complaint keyword.');
      return;
    }
    
    console.log('✅ Calling searchLocation with:', searchQuery);
    searchLocation(searchQuery);
  };

  // Calculate statistics
  const statsData = (() => {
    const pending = complaints.filter(c => c.status?.toLowerCase() === 'pending').length;
    const inProgress = complaints.filter(c => c.status?.toLowerCase() === 'in_progress').length;
    const resolved = complaints.filter(c => c.status?.toLowerCase() === 'completed' || c.status?.toLowerCase() === 'resolved').length;
    
    console.log(`📊 Statistics calculated - Total: ${complaints.length}, Pending: ${pending}, Progress: ${inProgress}, Resolved: ${resolved}`);
    console.log('🔍 All complaint statuses:', complaints.map(c => ({ id: c.id?.substring(0,8), status: c.status })));
    
    return { pending, inProgress, resolved };
  })();

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'resolved':
        return '#4CAF50'; // Green
      case 'in_progress':
        return '#FF9800'; // Orange
      case 'pending':
      default:
        return '#F44336'; // Red
    }
  };

  // Get category icon for map markers
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'pothole':
      case 'road_damage':
        return 'car';
      case 'water_issue':
      case 'water_leakage':
        return 'water';
      case 'sewage_overflow':
        return 'warning';
      case 'garbage':
        return 'trash';
      case 'streetlight':
        return 'bulb';
      case 'electricity':
      case 'electrical_danger':
        return 'flash';
      case 'tree_issue':
        return 'leaf';
      case 'flooding':
        return 'rainy';
      case 'fire_hazard':
        return 'flame';
      case 'traffic_signal':
        return 'stop';
      default:
        return 'alert-circle';
    }
  };

  // Create density clusters for heatmap visualization
  const createDensityClusters = () => {
    const clusters = [];
    const radius = 0.008; // Roughly 800m radius
    
    // Group complaints by proximity
    const processed = new Set();
    
    complaints.forEach((complaint, index) => {
      if (processed.has(index)) return;
      
      const lat = parseFloat(complaint.location_latitude);
      const lng = parseFloat(complaint.location_longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      const nearbyComplaints = [complaint];
      processed.add(index);
      
      // Find nearby complaints
      complaints.forEach((other, otherIndex) => {
        if (processed.has(otherIndex) || index === otherIndex) return;
        
        const otherLat = parseFloat(other.location_latitude);
        const otherLng = parseFloat(other.location_longitude);
        
        if (isNaN(otherLat) || isNaN(otherLng)) return;
        
        // Calculate distance (simple approximation)
        const distance = Math.sqrt(
          Math.pow(lat - otherLat, 2) + Math.pow(lng - otherLng, 2)
        );
        
        if (distance <= radius) {
          nearbyComplaints.push(other);
          processed.add(otherIndex);
        }
      });
      
      // Create cluster
      clusters.push({
        latitude: lat,
        longitude: lng,
        complaints: nearbyComplaints,
        density: nearbyComplaints.length,
        id: `cluster_${index}`
      });
    });
    
    return clusters;
  };

  // Render heatmap overlay circles
  const renderHeatmapOverlays = () => {
    const clusters = createDensityClusters();
    
    return clusters.map((cluster) => {
      const density = cluster.density;
      const maxDensity = Math.max(...clusters.map(c => c.density));
      const intensity = density / maxDensity;
      
      // Color and size based on density
      const getHeatmapColor = (intensity) => {
        if (intensity >= 0.8) return 'rgba(231, 76, 60, 0.4)'; // High density - red
        if (intensity >= 0.6) return 'rgba(230, 126, 34, 0.4)'; // Medium-high - orange
        if (intensity >= 0.4) return 'rgba(241, 196, 15, 0.4)'; // Medium - yellow
        if (intensity >= 0.2) return 'rgba(52, 152, 219, 0.4)'; // Low-medium - blue
        return 'rgba(46, 125, 50, 0.4)'; // Low density - green
      };
      
      const radius = Math.max(100, intensity * 500); // Min 100m, max 500m radius
      
      return (
        <Circle
          key={cluster.id}
          center={{
            latitude: cluster.latitude,
            longitude: cluster.longitude
          }}
          radius={radius}
          fillColor={getHeatmapColor(intensity)}
          strokeColor={getHeatmapColor(intensity).replace('0.4', '0.6')}
          strokeWidth={2}
          onPress={() => {
            // Show complaints in this cluster
            setSelectedComplaint({
              id: cluster.id,
              title: `${density} Complaint${density > 1 ? 's' : ''} in this area`,
              description: cluster.complaints.map(c => `• ${c.title}`).join('\n'),
              status: 'cluster',
              complaints: cluster.complaints,
              latitude: cluster.latitude,
              longitude: cluster.longitude,
            });
            setShowComplaintModal(true);
          }}
        />
      );
    });
  };

  // Render traditional markers
  const renderMarkers = () => {
    return complaints.map((complaint, index) => {
      const lat = parseFloat(complaint.location_latitude);
      const lng = parseFloat(complaint.location_longitude);
      
      if (isNaN(lat) || isNaN(lng)) return null;
      
      return (
        <Marker
          key={complaint.id}
          coordinate={{
            latitude: lat,
            longitude: lng
          }}
          title={complaint.title}
          description={complaint.description}
          onPress={() => {
            console.log('📍 Marker pressed:', complaint.title);
            setIsMarkerInteracting(true);
            setSelectedComplaint(complaint);
            setShowComplaintModal(true);
            
            // Reset marker interaction flag after modal is open
            setTimeout(() => {
              setIsMarkerInteracting(false);
            }, 1000);
          }}
        >
          <View style={styles.modernPinContainer}>
            <View style={[styles.modernPinHead, { backgroundColor: getStatusColor(complaint.status) }]}>
              {/* Debug: Log marker status and color */}
              {console.log(`🔍 Marker ID: ${complaint.id?.substring(0,8)}, Status: "${complaint.status}", Color: ${getStatusColor(complaint.status)}`)}
              <Ionicons 
                name={getCategoryIcon(complaint.category)} 
                size={16} 
                color="white" 
              />
            </View>
            <View style={[styles.modernPinTail, { borderTopColor: getStatusColor(complaint.status) }]} />
          </View>
        </Marker>
      );
    });
  };

  // Complaint Details Modal
  const ComplaintDetailsModal = () => {
    if (!selectedComplaint) return null;

    return (
      <Modal
        visible={showComplaintModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowComplaintModal(false);
          setIsMarkerInteracting(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedComplaint.title}</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowComplaintModal(false);
                  setIsMarkerInteracting(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedComplaint.status === 'cluster' ? (
                // Cluster view
                <>
                  <View style={styles.statusSection}>
                    <View style={[styles.statusBadge, { backgroundColor: '#3498db' }]}>
                      <Text style={styles.statusText}>CLUSTER VIEW</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Area Summary</Text>
                    <Text style={styles.description}>{selectedComplaint.description}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Individual Complaints</Text>
                    {selectedComplaint.complaints?.map((complaint, index) => (
                      <TouchableOpacity 
                        key={complaint.id}
                        style={styles.clusterItem}
                        onPress={() => {
                          setSelectedComplaint(complaint);
                        }}
                      >
                        <View style={[styles.clusterBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                          <Text style={styles.clusterBadgeText}>{index + 1}</Text>
                        </View>
                        <View style={styles.clusterInfo}>
                          <Text style={styles.clusterTitle}>{complaint.title}</Text>
                          <Text style={styles.clusterStatus}>{complaint.status.replace('_', ' ')}</Text>
                          <Text style={styles.clusterCategory}>{complaint.category}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : (
                // Individual complaint view
                <>
                  <View style={styles.statusSection}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedComplaint.status) }]}>
                      <Text style={styles.statusText}>{selectedComplaint.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{selectedComplaint.description}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <Text style={styles.detailText}>Category: {selectedComplaint.category}</Text>
                    <Text style={styles.detailText}>
                      Location: {selectedComplaint.location_latitude}, {selectedComplaint.location_longitude}
                    </Text>
                    <Text style={styles.detailText}>
                      Priority: {Math.round((selectedComplaint.priority_score || 0) * 100)}%
                    </Text>
                    <Text style={styles.detailText}>
                      Created: {selectedComplaint.created_at ? new Date(selectedComplaint.created_at).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                </>
              )}

              {selectedComplaint.image_urls && selectedComplaint.image_urls.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Images</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectedComplaint.image_urls.map((imageUrl, index) => (
                      <Image 
                        key={index}
                        source={{ uri: imageUrl }} 
                        style={styles.complaintImage}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1B5E20', '#2E7D32', '#60AD5E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complaint Map</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={getUserLocation} 
              style={styles.locationButton}
            >
              <Ionicons name="location" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={fetchComplaints}>
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search any city worldwide, complaints..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={(text) => {
              console.log('🔤 Text input changed:', text);
              setSearchQuery(text);
              
              // Clear previous timeout
              if (searchTimeout) {
                clearTimeout(searchTimeout);
              }
              
              if (text.trim().length === 0) {
                setSearchResults([]);
                setShowSearchResults(false);
              } else if (text.trim().length >= 2) {
                // Debounced search - search after 500ms of no typing
                const newTimeout = setTimeout(() => {
                  console.log('⏱️ Auto-searching after typing pause:', text);
                  searchLocation(text);
                }, 500);
                setSearchTimeout(newTimeout);
              }
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="words"
          />
          <TouchableOpacity 
            onPress={handleSearch}
            style={styles.searchButton}
          >
            <Ionicons name="search-circle" size={24} color="#2E7D32" />
          </TouchableOpacity>
          
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                console.log('🗑️ Clearing search');
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        {searchLoading && (
          <ActivityIndicator size="small" color="#2E7D32" style={styles.searchLoader} />
        )}
        
        {/* Test Buttons - Remove after testing */}
  {/* Test Buttons removed as requested */}
      </View>

      {/* Search Results */}

      {showSearchResults && (
        <View style={styles.searchResultsContainer}>
          {searchResults.length > 0 ? (
          <ScrollView style={styles.searchResultsList}>
            {searchResults.map((result) => {
              // Determine icon and color based on result type
              let iconName, iconColor;
              switch (result.type) {
                case 'complaint':
                  iconName = 'flag';
                  iconColor = '#F44336';
                  break;
                case 'city':
                  iconName = 'business';
                  iconColor = '#2196F3';
                  break;
                case 'geocoded':
                  iconName = 'location';
                  iconColor = '#4CAF50';
                  break;
                default:
                  iconName = 'location';
                  iconColor = '#2E7D32';
              }

              return (
                <TouchableOpacity
                  key={result.id}
                  style={styles.searchResultItem}
                  onPress={() => selectSearchResult(result)}
                >
                  <Ionicons 
                    name={iconName} 
                    size={20} 
                    color={iconColor} 
                  />
                  <View style={styles.searchResultText}>
                    <Text style={styles.searchResultTitle}>{result.title}</Text>
                    <Text style={styles.searchResultSubtitle}>{result.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                {searchLoading ? 'Searching...' : 'No results found'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        {loading || locationLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>
              {locationLoading ? 'Getting your location...' : 'Loading complaints...'}
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            followsUserLocation={false}
            moveOnMarkerPress={false}
            zoomEnabled={true}
            scrollEnabled={true}
            pitchEnabled={false}
            rotateEnabled={false}
            onRegionChangeComplete={(newRegion) => {
              // Clear any existing timeout
              if (regionChangeTimeoutRef.current) {
                clearTimeout(regionChangeTimeoutRef.current);
              }

              // Debounce region changes to prevent rapid updates
              regionChangeTimeoutRef.current = setTimeout(() => {
                if (!isProgrammaticMove && !showComplaintModal && !isMarkerInteracting) {
                  console.log('👆 User manually moved map to:', newRegion);
                  setRegion(newRegion);
                } else {
                  console.log('🤖 Ignoring region change (programmatic move, modal open, or marker interaction)');
                }
              }, 200); // 200ms debounce
            }}
          >
            {showHeatmap ? renderHeatmapOverlays() : renderMarkers()}
          </MapView>
        )}
      </View>

      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showHeatmap && styles.toggleButtonActive]}
          onPress={() => setShowHeatmap(true)}
        >
          <Ionicons 
            name="analytics" 
            size={20} 
            color={showHeatmap ? '#fff' : '#666'} 
          />
          <Text style={[styles.toggleText, showHeatmap && styles.toggleTextActive]}>
            Heatmap
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleButton, !showHeatmap && styles.toggleButtonActive]}
          onPress={() => setShowHeatmap(false)}
        >
          <Ionicons 
            name="location" 
            size={20} 
            color={!showHeatmap ? '#fff' : '#666'} 
          />
          <Text style={[styles.toggleText, !showHeatmap && styles.toggleTextActive]}>
            Markers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          📍 {complaints.length} Complaints {showHeatmap ? 'in Density View' : 'as Markers'} {userLocation ? '• 🎯 Your Location Found' : ''}
        </Text>
        <Text style={styles.statsText}>
          🔴 {statsData.pending} Pending • 
          🟡 {statsData.inProgress} Progress • 
          🟢 {statsData.resolved} Resolved
        </Text>
      </View>

      {/* Elegant Blue Chatbot Button */}
      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => {
          console.log('🤖 Chatbot button pressed from map!');
          navigation.navigate('CivicChatbot');
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <ComplaintDetailsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    marginRight: 12,
    padding: 4,
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    marginLeft: 10,
  },
  searchButton: {
    marginLeft: 10,
    padding: 2,
  },
  searchLoader: {
    position: 'absolute',
    right: 20,
    top: 24,
  },
  searchResultsContainer: {
    backgroundColor: 'white',
    maxHeight: 250,
    borderBottomWidth: 2,
    borderBottomColor: '#2E7D32',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#2E7D32',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchResultText: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2E7D32',
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinHead: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  pinText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Modern Map Pin Styles
  modernPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernPinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  modernPinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    padding: 16,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  complaintImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: '#2E7D32',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  toggleText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  clusterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    marginVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  clusterBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clusterBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  clusterInfo: {
    flex: 1,
  },
  clusterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  clusterStatus: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  clusterCategory: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 1000,
  },
});

export default ComplaintMapScreen;
