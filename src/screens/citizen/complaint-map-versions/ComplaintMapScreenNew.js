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
  ScrollView,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../../../config/supabase';

const ComplaintMapScreen = ({ navigation, route }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [region, setRegion] = useState({
    latitude: 10.9837,
    longitude: 76.9266,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // Fetch complaints data
  const fetchComplaints = async () => {
    try {
      console.log('🔄 Fetching complaints from:', `${API_BASE_URL}/api/complaints/all`);
      const response = await fetch(`${API_BASE_URL}/api/complaints/all`);
      const data = await response.json();
      
      if (data.success && data.complaints) {
        console.log('✅ Fetched complaints:', data.complaints.length);
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
    fetchComplaints();
  }, []);

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

  // Complaint Details Modal
  const ComplaintDetailsModal = () => {
    if (!selectedComplaint) return null;

    return (
      <Modal
        visible={showComplaintModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComplaintModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedComplaint.title}</Text>
              <TouchableOpacity 
                onPress={() => setShowComplaintModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
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
                  Priority: {Math.round(selectedComplaint.priority_score * 100)}%
                </Text>
                <Text style={styles.detailText}>
                  Created: {new Date(selectedComplaint.created_at).toLocaleDateString()}
                </Text>
              </View>

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
          <TouchableOpacity onPress={fetchComplaints}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Map */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading complaints...</Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={region}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {complaints.map((complaint, index) => {
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
                    setSelectedComplaint(complaint);
                    setShowComplaintModal(true);
                  }}
                >
                  <View style={[styles.markerContainer, { backgroundColor: getStatusColor(complaint.status) }]}>
                    <Text style={styles.markerText}>{index + 1}</Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          📍 {complaints.length} Complaints Loaded
        </Text>
        <Text style={styles.statsText}>
          🔴 {complaints.filter(c => c.status === 'pending').length} Pending • 
          🟡 {complaints.filter(c => c.status === 'in_progress').length} Progress • 
          🟢 {complaints.filter(c => c.status === 'completed').length} Resolved
        </Text>
      </View>

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
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default ComplaintMapScreen;
