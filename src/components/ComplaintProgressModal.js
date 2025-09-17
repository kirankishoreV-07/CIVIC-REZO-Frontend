import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { makeApiCall } from '../../config/supabase';

const { width, height } = Dimensions.get('window');

const ComplaintProgressModal = ({ visible, onClose, complaintId, complaintTitle }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchComplaintProgress();
      
      // Animate modal in
      Animated.spring(modalAnimation, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate modal out
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, complaintId]);

  const fetchComplaintProgress = async () => {
    try {
      const response = await makeApiCall(`/complaint-details/${complaintId}/progress`, 'GET');
      
      if (response.success) {
        setProgressData(response.data);
      } else {
        Alert.alert('Error', 'Failed to load complaint progress');
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      Alert.alert('Error', 'Unable to load complaint progress');
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (stageStatus, stageNumber) => {
    switch (stageStatus) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={28} color="#27ae60" />;
      case 'in_progress':
        return (
          <View style={styles.activeStageIcon}>
            <LinearGradient
              colors={['#3498db', '#2980b9']}
              style={styles.activeStageGradient}
            >
              <Text style={styles.activeStageNumber}>{stageNumber}</Text>
            </LinearGradient>
          </View>
        );
      case 'pending':
        return (
          <View style={styles.pendingStageIcon}>
            <Text style={styles.pendingStageNumber}>{stageNumber}</Text>
          </View>
        );
      default:
        return <Ionicons name="ellipse-outline" size={28} color="#95a5a6" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return ['#f39c12', '#e67e22'];
      case 'in_progress':
        return ['#3498db', '#2980b9'];
      case 'resolved':
        return ['#27ae60', '#229954'];
      case 'rejected':
        return ['#e74c3c', '#c0392b'];
      default:
        return ['#95a5a6', '#7f8c8d'];
    }
  };

  const formatTimelineAction = (action) => {
    const actionTypes = {
      'complaint_submitted': 'Complaint Submitted',
      'status_updated': 'Status Updated',
      'stage_completed': 'Stage Completed',
      'officer_assigned': 'Officer Assigned',
      'contractor_assigned': 'Contractor Assigned',
      'note_added': 'Note Added'
    };
    return actionTypes[action] || action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  scale: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                },
                {
                  translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                }
              ],
              opacity: modalAnimation
            }
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={['#3498db', '#2980b9']}
            style={styles.modalHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Ionicons name="analytics-outline" size={24} color="#fff" />
                <Text style={styles.modalTitle}>Progress Tracker</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.complaintTitle} numberOfLines={2}>{complaintTitle}</Text>
          </LinearGradient>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text style={styles.loadingText}>Loading progress...</Text>
            </View>
          ) : progressData ? (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Progress Overview */}
              <View style={styles.progressOverview}>
                <LinearGradient
                  colors={getStatusColor(progressData.complaint.status)}
                  style={styles.progressCard}
                >
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressPercentage}>{progressData.progress.percentage}%</Text>
                    <Text style={styles.progressLabel}>Complete</Text>
                  </View>
                  <View style={styles.progressStats}>
                    <Text style={styles.progressStatsText}>
                      {progressData.progress.completed_stages} of {progressData.progress.total_stages} stages completed
                    </Text>
                    <Text style={styles.statusText}>
                      Status: {progressData.complaint.status?.charAt(0).toUpperCase() + progressData.complaint.status?.slice(1).replace('_', ' ')}
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Current Stage */}
              {progressData.progress.current_stage && (
                <View style={styles.currentStageContainer}>
                  <Text style={styles.sectionTitle}>Current Stage</Text>
                  <View style={styles.currentStageCard}>
                    <LinearGradient
                      colors={['#e8f4fd', '#d4e8fc']}
                      style={styles.currentStageGradient}
                    >
                      <View style={styles.currentStageHeader}>
                        <Ionicons name="time-outline" size={20} color="#3498db" />
                        <Text style={styles.currentStageTitle}>
                          {progressData.progress.current_stage.stage_name}
                        </Text>
                      </View>
                      <Text style={styles.currentStageDescription}>
                        {progressData.progress.current_stage.stage_description}
                      </Text>
                      {progressData.progress.current_stage.estimated_completion_date && (
                        <Text style={styles.estimatedDate}>
                          Expected completion: {progressData.progress.current_stage.formatted_estimated_date}
                        </Text>
                      )}
                      {progressData.progress.current_stage.officers && (
                        <View style={styles.assignedPersonnel}>
                          <Ionicons name="person-outline" size={16} color="#666" />
                          <Text style={styles.personnelText}>
                            Officer: {progressData.progress.current_stage.officers.name} ({progressData.progress.current_stage.officers.department})
                          </Text>
                        </View>
                      )}
                    </LinearGradient>
                  </View>
                </View>
              )}

              {/* Stages Timeline */}
              <View style={styles.stagesContainer}>
                <Text style={styles.sectionTitle}>Progress Stages</Text>
                {progressData.stages && progressData.stages.map((stage, index) => (
                  <View key={stage.id || index} style={styles.stageItem}>
                    <View style={styles.stageLeftColumn}>
                      {getStageIcon(stage.stage_status, stage.stage_number)}
                      {index < progressData.stages.length - 1 && (
                        <View style={[
                          styles.stageLine,
                          { backgroundColor: stage.stage_status === 'completed' ? '#27ae60' : '#e0e0e0' }
                        ]} />
                      )}
                    </View>
                    <View style={styles.stageContent}>
                      <Text style={[
                        styles.stageName,
                        { color: stage.stage_status === 'completed' ? '#27ae60' : '#333' }
                      ]}>
                        {stage.stage_name}
                      </Text>
                      {stage.stage_description && (
                        <Text style={styles.stageDescription}>{stage.stage_description}</Text>
                      )}
                      <View style={styles.stageDetails}>
                        {stage.stage_status === 'completed' && stage.formatted_completion_date && (
                          <Text style={styles.stageDate}>
                            ✅ Completed: {stage.formatted_completion_date}
                          </Text>
                        )}
                        {stage.stage_status === 'in_progress' && stage.formatted_estimated_date && (
                          <Text style={styles.stageDate}>
                            🕐 Expected: {stage.formatted_estimated_date}
                          </Text>
                        )}
                        {stage.officers && (
                          <Text style={styles.stagePersonnel}>
                            👮 Officer: {stage.officers.name}
                          </Text>
                        )}
                        {stage.contractors && (
                          <Text style={styles.stagePersonnel}>
                            🔧 Contractor: {stage.contractors.name}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Recent Activity Timeline */}
              {progressData.timeline && progressData.timeline.length > 0 && (
                <View style={styles.timelineContainer}>
                  <Text style={styles.sectionTitle}>Recent Activity</Text>
                  {progressData.timeline.slice(0, 5).map((entry, index) => (
                    <View key={entry.id || index} style={styles.timelineItem}>
                      <View style={styles.timelineDot} />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineAction}>
                          {formatTimelineAction(entry.action_type)}
                        </Text>
                        <Text style={styles.timelineDescription}>
                          {entry.action_description}
                        </Text>
                        <Text style={styles.timelineDate}>
                          {entry.formatted_date}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Report Info */}
              <View style={styles.reportInfoContainer}>
                <Text style={styles.sectionTitle}>Report Information</Text>
                <View style={styles.reportInfoCard}>
                  <View style={styles.reportInfoRow}>
                    <Text style={styles.reportInfoLabel}>Submitted:</Text>
                    <Text style={styles.reportInfoValue}>{progressData.complaint.formatted_created_date}</Text>
                  </View>
                  <View style={styles.reportInfoRow}>
                    <Text style={styles.reportInfoLabel}>Category:</Text>
                    <Text style={styles.reportInfoValue}>
                      {progressData.complaint.category?.replace('_', ' ')}
                    </Text>
                  </View>
                  <View style={styles.reportInfoRow}>
                    <Text style={styles.reportInfoLabel}>Priority:</Text>
                    <Text style={[styles.reportInfoValue, { color: '#e74c3c' }]}>
                      {progressData.complaint.priority_score ? `${progressData.complaint.priority_score.toFixed(1)}/10` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.reportInfoRow}>
                    <Text style={styles.reportInfoLabel}>Reporter:</Text>
                    <Text style={styles.reportInfoValue}>{progressData.complaint.user?.full_name || 'Anonymous'}</Text>
                  </View>
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
              <Text style={styles.errorText}>Unable to load progress data</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width - 40,
    maxHeight: height - 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
  closeButton: {
    padding: 4,
  },
  complaintTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
    lineHeight: 22,
  },
  modalContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  progressOverview: {
    padding: 20,
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  progressLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    opacity: 0.9,
  },
  progressStats: {
    flex: 1,
    marginLeft: 20,
  },
  progressStatsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  currentStageContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
  },
  currentStageCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  currentStageGradient: {
    padding: 16,
  },
  currentStageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentStageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginLeft: 8,
  },
  currentStageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  estimatedDate: {
    fontSize: 13,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 8,
  },
  assignedPersonnel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personnelText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  stagesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  stageItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stageLeftColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 28,
  },
  activeStageIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  activeStageGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStageNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  pendingStageIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bdc3c7',
  },
  pendingStageNumber: {
    color: '#7f8c8d',
    fontSize: 12,
    fontWeight: '600',
  },
  stageLine: {
    width: 2,
    height: 30,
    marginTop: 8,
  },
  stageContent: {
    flex: 1,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  stageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  stageDetails: {},
  stageDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  stagePersonnel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timelineContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498db',
    marginTop: 6,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  timelineDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  timelineDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  reportInfoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reportInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  reportInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  reportInfoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
});

export default ComplaintProgressModal;
