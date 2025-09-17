import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  Platform,
  TextInput,
  Keyboard,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import EnvironmentalTheme from '../../theme/EnvironmentalTheme';
import { API_BASE_URL, apiClient, makeApiCall } from '../../../config/supabase';

// Get screen dimensions for responsive layout
const { width, height } = Dimensions.get('window');

const ComplaintMapScreenFixed = ({ navigation, route }) => {
  // Safe theme access functions
  const getThemeColor = (path, defaultColor) => {
    try {
      // Parse dot notation path like 'primary.main'
      const parts = path.split('.');
      let value = EnvironmentalTheme;
      for (const part of parts) {
        if (!value || typeof value !== 'object') return defaultColor;
        value = value[part];
      }
      return value || defaultColor;
    } catch (e) {
      return defaultColor;
    }
  };
  
  // Safely access route props with fallbacks
  const routeParams = route?.params || {};
  
  const [complaints, setComplaints] = useState([]);
  const [heatMapData, setHeatMapData] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState({
    latitude: 11.0168,
    longitude: 76.9558,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [mapRef, setMapRef] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [mapError, setMapError] = useState(null);
  
  // Fetch user's current location
  const fetchUserLocation = async () => {
    try {
      console.log('🔍 Fetching user location...');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ Location permission denied');
        setErrorMsg('Permission to access location was denied');
        return;
      }

      setLoading(true);
      
      // Get user location with high accuracy
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000 // Accept a location that's up to 10 seconds old
      });
      
      console.log('📍 User location obtained:', 
        location.coords.latitude, 
        location.coords.longitude
      );
      
      setLocation(location);

      // Update map region to user's location with closer zoom
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01, // Closer zoom for better detail
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      
      // Animate map to user location if map reference is available
      if (mapRef && mapReady) {
        console.log('🗺️ Animating map to user location');
        mapRef.animateToRegion(newRegion, 1000);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("❌ Error getting location:", error);
      setErrorMsg('Could not fetch location');
      setLoading(false);
    }
  };

  // Fetch complaint data
  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching heatmap data...');
      
      // Fetch from backend API
      const response = await fetch(apiClient.heatMap.data);
      const data = await response.json();
      
      if (data.success && data.data && data.data.points) {
        console.log(`✅ Retrieved ${data.data.points.length} heatmap points`);
        
        // Format points for the heatmap
        const formattedPoints = data.data.points.map(point => ({
          latitude: parseFloat(point.lat || point.latitude || point.location_latitude || 0),
          longitude: parseFloat(point.lng || point.longitude || point.location_longitude || 0),
          weight: parseFloat(point.weight || point.intensity || point.priority_score || 1)
        })).filter(point => 
          !isNaN(point.latitude) && 
          !isNaN(point.longitude) && 
          point.latitude !== 0 && 
          point.longitude !== 0
        );
        
        console.log(`✅ Formatted ${formattedPoints.length} valid heatmap points`);
        setHeatMapData(formattedPoints);
      }
    } catch (error) {
      console.error('❌ Error fetching heatmap data:', error);
      Alert.alert('Error', 'Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize map and data
  useEffect(() => {
    fetchUserLocation();
    fetchHeatmapData();
    
    // Clean up function
    return () => {
      console.log('Cleaning up map resources');
    };
  }, []);

  // Handle errors in map loading
  const handleMapError = (error) => {
    console.error('Map error:', error);
    setMapError(error.message || 'Failed to load map');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={getThemeColor('primary.main', '#2E7D32')} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaint Map</Text>
      </View>
      
      {/* Map Container */}
      <View style={styles.mapContainer}>
        {/* Loading overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
        
        {/* Error message */}
        {mapError && (
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle" size={48} color="#D32F2F" />
            <Text style={styles.errorText}>Map Error: {mapError}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setMapError(null);
                fetchUserLocation();
                fetchHeatmapData();
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Map View */}
        <MapView
          ref={ref => setMapRef(ref)}
          style={styles.map}
          initialRegion={region}
          onMapReady={() => {
            console.log('Map is ready');
            setMapReady(true);
          }}
          onError={handleMapError}
          provider="google"
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={false}
        >
          {/* Custom Heatmap using Circles */}
          {showHeatmap && heatMapData && Array.isArray(heatMapData) && heatMapData.length > 0 && 
            heatMapData.map((point, index) => {
              // Calculate radius and color based on weight
              const weight = point.weight || 1;
              const baseRadius = 80; // Base radius in meters
              const radius = baseRadius + (weight * 20); // Scale radius by weight
              
              // Color gradient from yellow to red based on weight
              const greenValue = Math.max(0, 255 - (weight * 60));
              const fillColor = `rgba(255, ${greenValue}, 0, 0.3)`;
              const strokeColor = `rgba(255, ${greenValue}, 0, 0.8)`;
              
              return (
                <Circle
                  key={`heatcircle-${index}`}
                  center={{
                    latitude: point.latitude,
                    longitude: point.longitude
                  }}
                  radius={radius}
                  fillColor={fillColor}
                  strokeColor={strokeColor}
                  strokeWidth={1}
                  zIndex={5}
                />
              );
            })
          }
          
          {/* Markers at heatmap points */}
          {showHeatmap && heatMapData && Array.isArray(heatMapData) && heatMapData.length > 0 && 
            heatMapData.map((point, index) => (
              <Marker
                key={`heatpoint-${index}`}
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude
                }}
                anchor={{x: 0.5, y: 0.5}}
                opacity={0.8}
              >
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 0, 0, 0.8)'
                }} />
              </Marker>
            ))
          }
        </MapView>
        
        {/* Controls Overlay */}
        <View style={styles.controls}>
          {/* Heatmap Toggle Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              showHeatmap && styles.activeButton
            ]}
            onPress={() => setShowHeatmap(!showHeatmap)}
          >
            <MaterialIcons 
              name={showHeatmap ? "layers" : "layers-clear"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          
          {/* My Location Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={fetchUserLocation}
          >
            <Ionicons name="locate" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Heatmap Info Overlay */}
        {showHeatmap && heatMapData && Array.isArray(heatMapData) && heatMapData.length > 0 && (
          <View style={styles.infoOverlay}>
            <Text style={styles.infoText}>
              Showing {heatMapData.length} hotspots
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  backButton: {
    padding: 5,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2E7D32',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    elevation: 5,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  activeButton: {
    backgroundColor: '#FF8F00',
  },
  infoOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  infoText: {
    color: 'white',
    fontSize: 12,
  },
});

export default ComplaintMapScreenFixed;
