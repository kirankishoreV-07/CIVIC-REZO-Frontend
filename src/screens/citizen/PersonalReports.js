import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, makeApiCall } from '../../../config/supabase';

const { width } = Dimensions.get('window');

const PersonalReports = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  useEffect(() => {
    loadPersonalReports();
  }, []);

  const loadPersonalReports = async () => {
    try {
      setLoading(true);
      const response = await makeApiCall(apiClient.complaints.personalReports);
      
      if (response.success) {
        setReports(response.data.complaints);
        setStats(response.data.stats);
      } else {
        Alert.alert('Error', response.message || 'Failed to load your reports');
      }
    } catch (error) {
      console.error('Load personal reports error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPersonalReports();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear stored auth data
              await AsyncStorage.multiRemove(['authToken', 'userData']);
              // Navigate to welcome screen
              navigation.replace('Welcome');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout properly');
            }
          }
        }
      ]
    );
  };

  const openTrackingDetails = (report) => {
    setSelectedReport(report);
    setShowTrackingModal(true);
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

  const renderReportCard = (report) => {
    const getStatusColor = (status) => {
      const colors = {
        'pending': '#f39c12',
        'in_progress': '#3498db',
        'resolved': '#27ae60',
        'cancelled': '#95a5a6'
      };
      return colors[status] || '#95a5a6';
    };

    const getStatusText = (status) => {
      const statusMap = {
        'pending': 'PENDING',
        'in_progress': 'IN PROGRESS',
        'resolved': 'RESOLVED',
        'cancelled': 'CANCELLED'
      };
      return statusMap[status] || status.toUpperCase();
    };

    return (
      <TouchableOpacity
        key={report.id}
        style={styles.reportCard}
        onPress={() => openTrackingDetails(report)}
      >
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle} numberOfLines={2}>
            {report.title}
          </Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(report.status) }
          ]}>
            <Text style={styles.statusText}>
              {getStatusText(report.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.reportDescription} numberOfLines={3}>
          {report.description}
        </Text>
        
        {report.image_url && (
          <Image 
            source={{ uri: report.image_url }} 
            style={styles.reportImage}
          />
        )}
        
        <View style={styles.reportMeta}>
          <Text style={styles.reportDate}>
            📅 Submitted: {new Date(report.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.reportLocation}>
            📍 {report.location_address || 'Location not specified'}
          </Text>
          <Text style={styles.reportCategory}>
            📋 {report.category || 'General'}
          </Text>
        </View>
        
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>
            Stage {report.currentStage}/5
          </Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { 
                width: `${(report.currentStage / 5) * 100}%`,
                backgroundColor: getStatusColor(report.status)
              }
            ]} />
          </View>
        </View>
        
        <View style={styles.trackingButton}>
          <Ionicons name="eye-outline" size={16} color="#3498db" />
          <Text style={styles.trackingButtonText}>View Tracking Details</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your reports...</Text>
      </View>
    );
  }

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
          
          <Text style={styles.headerTitle}>My Reports</Text>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalComplaints || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#27ae60' }]}>{stats.resolved || 0}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#3498db' }]}>{stats.inProgress || 0}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#f39c12' }]}>{stats.pending || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Reports List */}
      <View style={styles.reportsSection}>
        <Text style={styles.sectionTitle}>Your Complaint Reports</Text>
        {reports.length === 0 ? (
          <View style={styles.noReports}>
            <Ionicons name="document-outline" size={60} color="#bdc3c7" />
            <Text style={styles.noReportsText}>No reports found</Text>
            <Text style={styles.noReportsSubtext}>
              Submit your first complaint to see it here
            </Text>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => navigation.navigate('SubmitComplaint')}
            >
              <Text style={styles.submitButtonText}>Submit Complaint</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reports.map(report => renderReportCard(report))
        )}
      </View>

      {/* Tracking Details Modal */}
      <Modal
        visible={showTrackingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📦 Complaint Tracking</Text>
            <TouchableOpacity
              onPress={() => setShowTrackingModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {selectedReport && (
            <ScrollView style={styles.modalContent}>
              {/* Report Info */}
              <View style={styles.reportInfo}>
                <Text style={styles.reportModalTitle}>
                  {selectedReport.title}
                </Text>
                <Text style={styles.reportModalDescription}>
                  {selectedReport.description}
                </Text>
                
                {selectedReport.image_url && (
                  <Image 
                    source={{ uri: selectedReport.image_url }} 
                    style={styles.reportModalImage}
                  />
                )}
                
                <View style={styles.reportModalMeta}>
                  <Text style={styles.modalMetaText}>
                    📅 Submitted: {new Date(selectedReport.created_at).toLocaleDateString()} at {new Date(selectedReport.created_at).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.modalMetaText}>
                    📍 Location: {selectedReport.location_address || 'Not specified'}
                  </Text>
                  <Text style={styles.modalMetaText}>
                    📋 Category: {selectedReport.category || 'General'}
                  </Text>
                  <Text style={styles.modalMetaText}>
                    ⚡ Priority: {selectedReport.priority || 'Medium'}
                  </Text>
                </View>
              </View>
              
              {/* Amazon-style Tracking */}
              <View style={styles.trackingContainer}>
                <Text style={styles.trackingTitle}>Progress Tracking</Text>
                {selectedReport.trackingStages?.map((stage, index) => 
                  renderTrackingStage(
                    stage, 
                    index + 1 === selectedReport.currentStage,
                    stage.status === 'completed',
                    index === selectedReport.trackingStages.length - 1
                  )
                )}
              </View>
            </ScrollView>
          )}
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
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
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-around',
    marginTop: -10,
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
  reportsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  noReports: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noReportsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 15,
  },
  noReportsSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reportTitle: {
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
  reportDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
    lineHeight: 20,
  },
  reportImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  reportMeta: {
    marginBottom: 15,
  },
  reportDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 3,
  },
  reportLocation: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 3,
  },
  reportCategory: {
    fontSize: 12,
    color: '#95a5a6',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    borderRadius: 2,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  trackingButtonText: {
    fontSize: 14,
    color: '#3498db',
    marginLeft: 5,
    fontWeight: '500',
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
  reportInfo: {
    marginBottom: 30,
  },
  reportModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  reportModalDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
    lineHeight: 24,
  },
  reportModalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  reportModalMeta: {
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
});

export default PersonalReports;
