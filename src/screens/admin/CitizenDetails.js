import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, makeApiCall } from '../../../config/supabase';

const { width } = Dimensions.get('window');

const CitizenDetails = ({ route, navigation }) => {
  const { citizenId } = route.params;
  const [citizenData, setCitizenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadCitizenDetails();
  }, [citizenId]);

  const loadCitizenDetails = async () => {
    try {
      setLoading(true);
      const response = await makeApiCall(
        `${apiClient.baseUrl}/api/admin-enhanced/citizens/${citizenId}/details`
      );
      
      if (response.success) {
        setCitizenData(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to load citizen details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Load citizen details error:', error);
      Alert.alert('Error', 'Failed to connect to server');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCitizenDetails();
    setRefreshing(false);
  };

  const handleDeleteCitizen = async () => {
    try {
      const response = await makeApiCall(
        `${apiClient.baseUrl}/api/admin-enhanced/citizens/${citizenId}`,
        'DELETE'
      );
      
      if (response.success) {
        Alert.alert('Success', 'Citizen deleted successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to delete citizen');
      }
    } catch (error) {
      console.error('Delete citizen error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    }
    setShowDeleteConfirm(false);
  };

  const openComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

  const renderTrackingStage = (stage, isActive, isCompleted, isLast) => {
    const getStageColor = () => {
      if (isCompleted) return '#27ae60';
      if (isActive) return '#3498db';
      return '#bdc3c7';
    };

    const getStageIcon = () => {
      if (isCompleted) return 'checkmark-circle';
      if (isActive) return 'radio-button-on';
      return 'radio-button-off';
    };

    return (
      <View key={stage.id} style={styles.trackingStage}>
        <View style={styles.stageIconContainer}>
          <Ionicons 
            name={getStageIcon()} 
            size={24} 
            color={getStageColor()} 
          />
          {!isLast && (
            <View style={[
              styles.stageLine, 
              { backgroundColor: isCompleted ? '#27ae60' : '#bdc3c7' }
            ]} />
          )}
        </View>
        
        <View style={styles.stageContent}>
          <View style={styles.stageHeader}>
            <Text style={[styles.stageName, { color: getStageColor() }]}>
              {stage.icon} {stage.name}
            </Text>
            {stage.date && (
              <Text style={styles.stageDate}>
                {new Date(stage.date).toLocaleDateString()}
              </Text>
            )}
          </View>
          
          <Text style={styles.stageDescription}>
            {stage.description}
          </Text>
          
          {stage.officer && (
            <Text style={styles.stageAssignment}>
              👮 {stage.officer}
            </Text>
          )}
          
          {stage.contractor && (
            <Text style={styles.stageAssignment}>
              🔧 {stage.contractor}
            </Text>
          )}
          
          {stage.estimatedCost && (
            <Text style={styles.stageAssignment}>
              💰 Estimated Cost: ₹{stage.estimatedCost}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderComplaintCard = (complaint) => {
    const getStatusColor = (status) => {
      const colors = {
        'pending': '#f39c12',
        'in_progress': '#3498db',
        'resolved': '#27ae60',
        'cancelled': '#95a5a6'
      };
      return colors[status] || '#95a5a6';
    };

    return (
      <TouchableOpacity
        key={complaint.id}
        style={styles.complaintCard}
        onPress={() => openComplaintDetails(complaint)}
      >
        <View style={styles.complaintHeader}>
          <Text style={styles.complaintTitle} numberOfLines={2}>
            {complaint.title}
          </Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(complaint.status) }
          ]}>
            <Text style={styles.statusText}>
              {complaint.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.complaintDescription} numberOfLines={3}>
          {complaint.description}
        </Text>
        
        <View style={styles.complaintMeta}>
          <Text style={styles.complaintDate}>
            📅 {new Date(complaint.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.complaintLocation}>
            📍 {complaint.location || 'Location not specified'}
          </Text>
        </View>
        
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>
            Stage {complaint.currentStage}/5
          </Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${(complaint.currentStage / 5) * 100}%` }
            ]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading citizen details...</Text>
      </View>
    );
  }

  if (!citizenData) {
    return (
      <View style={styles.errorContainer}>
        <Text>Citizen not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { citizen, complaints, stats } = citizenData;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#2c3e50', '#3498db']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Citizen Details</Text>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteConfirm(true)}
          >
            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Citizen Profile */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {citizen.profile_image ? (
            <Image source={{ uri: citizen.profile_image }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultProfileImage}>
              <Text style={styles.profileInitial}>
                {citizen.full_name ? citizen.full_name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.citizenName}>
            {citizen.full_name || 'Unknown User'}
          </Text>
          <Text style={styles.citizenEmail}>{citizen.email}</Text>
          <Text style={styles.citizenPhone}>
            📞 {citizen.phone_number || 'No phone number'}
          </Text>
          <Text style={styles.joinDate}>
            Joined: {new Date(citizen.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalComplaints}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#27ae60' }]}>{stats.resolved}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#3498db' }]}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#f39c12' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Complaints List */}
      <View style={styles.complaintsSection}>
        <Text style={styles.sectionTitle}>Complaints History</Text>
        {complaints.length === 0 ? (
          <Text style={styles.noComplaints}>No complaints found</Text>
        ) : (
          complaints.map(complaint => renderComplaintCard(complaint))
        )}
      </View>

      {/* Complaint Details Modal */}
      <Modal
        visible={showComplaintModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Complaint Tracking</Text>
            <TouchableOpacity
              onPress={() => setShowComplaintModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {selectedComplaint && (
            <ScrollView style={styles.modalContent}>
              {/* Complaint Info */}
              <View style={styles.complaintInfo}>
                <Text style={styles.complaintModalTitle}>
                  {selectedComplaint.title}
                </Text>
                <Text style={styles.complaintModalDescription}>
                  {selectedComplaint.description}
                </Text>
                
                {selectedComplaint.image_url && (
                  <Image 
                    source={{ uri: selectedComplaint.image_url }} 
                    style={styles.complaintImage}
                  />
                )}
                
                <View style={styles.complaintModalMeta}>
                  <Text style={styles.modalMetaText}>
                    📅 Submitted: {new Date(selectedComplaint.created_at).toLocaleDateString()} at {new Date(selectedComplaint.created_at).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.modalMetaText}>
                    📍 Location: {selectedComplaint.location || 'Not specified'}
                  </Text>
                  <Text style={styles.modalMetaText}>
                    📋 Category: {selectedComplaint.category || 'General'}
                  </Text>
                  <Text style={styles.modalMetaText}>
                    ⚡ Priority: {selectedComplaint.priority || 'Medium'}
                  </Text>
                </View>
              </View>
              
              {/* Amazon-style Tracking */}
              <View style={styles.trackingContainer}>
                <Text style={styles.trackingTitle}>📦 Complaint Progress</Text>
                {selectedComplaint.trackingStages?.map((stage, index) => 
                  renderTrackingStage(
                    stage, 
                    index + 1 === selectedComplaint.currentStage,
                    stage.status === 'completed',
                    index === selectedComplaint.trackingStages.length - 1
                  )
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Citizen</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete this citizen? This will also delete all their complaints and cannot be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleDeleteCitizen}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  deleteButton: {
    padding: 8,
  },
  profileSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: -10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  citizenName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  citizenEmail: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  citizenPhone: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  joinDate: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    minWidth: 70,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  complaintsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  noComplaints: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    padding: 20,
  },
  complaintCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  complaintDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  complaintMeta: {
    marginBottom: 10,
  },
  complaintDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 2,
  },
  complaintLocation: {
    fontSize: 12,
    color: '#95a5a6',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  complaintInfo: {
    marginBottom: 30,
  },
  complaintModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  complaintModalDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
    lineHeight: 24,
  },
  complaintImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  complaintModalMeta: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  modalMetaText: {
    fontSize: 14,
    color: '#5a6c7d',
    marginBottom: 8,
  },
  trackingContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  trackingStage: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stageIconContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  stageLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  stageContent: {
    flex: 1,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  stageName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stageDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  stageDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  stageAssignment: {
    fontSize: 12,
    color: '#3498db',
    marginBottom: 2,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: width - 40,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    lineHeight: 20,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  confirmDeleteButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
  },
  confirmDeleteButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CitizenDetails;
