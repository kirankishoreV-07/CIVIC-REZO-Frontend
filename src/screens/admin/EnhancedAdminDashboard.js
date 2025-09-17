import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, makeApiCall } from '../../../config/supabase';

const { width, height } = Dimensions.get('window');

const EnhancedAdminDashboard = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    topPriorityComplaints: [],
    locationHotspots: [],
    recentActivity: [],
    stageProgress: {},
    costAnalysis: {}
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await makeApiCall(`${apiClient.baseUrl}/api/admin-enhanced/dashboard/overview`);
      
      if (response.success) {
        // Handle the actual API response structure
        setDashboardData({
          overview: response.data.overview || {},
          topPriorityComplaints: response.data.topPriorityComplaints || [],
          locationHotspots: response.data.locationHotspots || [],
          recentActivity: response.data.recentActivity || [],
          stageProgress: response.data.stageProgress || {},
          costAnalysis: response.data.costAnalysis || {}
        });
      } else {
        Alert.alert('Error', 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('authToken');
      navigation.replace('Welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToPriorityQueue = () => {
    navigation.navigate('PriorityQueue');
  };

  const navigateToCitizenManagement = () => {
    navigation.navigate('CitizenManagement');
  };

  const navigateToComplaintDetails = (complaintId) => {
    navigation.navigate('ComplaintDetails', { complaintId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.loadingGradient}>
          <Ionicons name="analytics" size={50} color="#fff" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </LinearGradient>
      </View>
    );
  }

  const { overview } = dashboardData;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.adminName}>{userData?.full_name || 'Admin'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overview Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="document-text-outline" size={24} color="#e74c3c" />
              <Text style={styles.statNumber}>{overview.totalComplaints || 0}</Text>
              <Text style={styles.statLabel}>Total Complaints</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="hourglass-outline" size={24} color="#f39c12" />
              <Text style={styles.statNumber}>{overview.pendingComplaints || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="construct-outline" size={24} color="#3498db" />
              <Text style={styles.statNumber}>{overview.inProgressComplaints || 0}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#27ae60" />
              <Text style={styles.statNumber}>{overview.resolvedComplaints || 0}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>

          <View style={styles.performanceStats}>
            <View style={styles.performanceStat}>
              <Text style={styles.performanceLabel}>Resolution Rate</Text>
              <Text style={styles.performanceValue}>{overview.resolutionRate || 0}%</Text>
            </View>
            <View style={styles.performanceStat}>
              <Text style={styles.performanceLabel}>Avg Resolution Time</Text>
              <Text style={styles.performanceValue}>{overview.avgResolutionTime || 0}h</Text>
            </View>
            <View style={styles.performanceStat}>
              <Text style={styles.performanceLabel}>Active Citizens</Text>
              <Text style={styles.performanceValue}>{overview.activeUsers || 0}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={navigateToPriorityQueue}>
              <LinearGradient colors={['#ff6b6b', '#ee5a24']} style={styles.actionGradient}>
                <Ionicons name="list-outline" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Priority Queue</Text>
                <Text style={styles.actionSubtitle}>Manage complaints by priority</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={navigateToCitizenManagement}>
              <LinearGradient colors={['#4834d4', '#686de0']} style={styles.actionGradient}>
                <Ionicons name="people-outline" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Citizen Management</Text>
                <Text style={styles.actionSubtitle}>Manage user accounts</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Priority Complaints */}
        <View style={styles.prioritySection}>
          <Text style={styles.sectionTitle}>🔥 High Priority Complaints</Text>
          {(dashboardData.topPriorityComplaints || []).length > 0 ? (
            (dashboardData.topPriorityComplaints || []).slice(0, 3).map((complaint, index) => (
              <TouchableOpacity
                key={complaint.id}
                style={styles.priorityCard}
                onPress={() => navigateToComplaintDetails(complaint.id)}
              >
                <View style={styles.priorityHeader}>
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityScore}>{(complaint.priority_score * 100).toFixed(0)}%</Text>
                  </View>
                  <View style={styles.priorityInfo}>
                    <Text style={styles.priorityTitle} numberOfLines={2}>
                      {complaint.category?.replace(/_/g, ' ').toUpperCase() || 'Complaint'}
                    </Text>
                    <Text style={styles.priorityLocation} numberOfLines={1}>
                      📍 Priority Score: {complaint.priority_score || 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.priorityFooter}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{complaint.status.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.priorityDate}>
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyActivityCard}>
              <Ionicons name="flame-outline" size={32} color="#95a5a6" />
              <Text style={styles.emptyActivityText}>No high priority complaints</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.viewAllButton} onPress={navigateToPriorityQueue}>
            <Text style={styles.viewAllText}>View All Complaints</Text>
            <Ionicons name="arrow-forward" size={16} color="#3498db" />
          </TouchableOpacity>
        </View>

        {/* Location Hotspots */}
        {(dashboardData.locationHotspots || []).length > 0 && (
          <View style={styles.hotspotsSection}>
            <Text style={styles.sectionTitle}>🗺️ Complaint Hotspots</Text>
            {(dashboardData.locationHotspots || []).slice(0, 3).map((hotspot, index) => (
              <View key={index} style={styles.hotspotCard}>
                <View style={styles.hotspotHeader}>
                  <Ionicons name="location" size={20} color="#e74c3c" />
                  <Text style={styles.hotspotLocation}>{hotspot.area_name}</Text>
                </View>
                <Text style={styles.hotspotCount}>
                  {hotspot.complaint_count} complaints in this area
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>📋 Recent Activity</Text>
          {(dashboardData.recentActivity || []).length > 0 ? (
            (dashboardData.recentActivity || []).slice(0, 5).map((activity, index) => (
              <View key={activity.id || index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons 
                    name={getActivityIcon(activity.event_type)} 
                    size={16} 
                    color="#3498db" 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.event_title}</Text>
                  <Text style={styles.activityTime}>
                    {formatActivityTime(activity.created_at)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyActivityCard}>
              <Ionicons name="time-outline" size={32} color="#95a5a6" />
              <Text style={styles.emptyActivityText}>No recent activity</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

// Helper functions
const getActivityIcon = (eventType) => {
  const icons = {
    'created': 'add-circle-outline',
    'stage_update': 'construct-outline',
    'assigned': 'person-add-outline',
    'completed': 'checkmark-circle-outline',
    'note_added': 'document-text-outline'
  };
  return icons[eventType] || 'information-circle-outline';
};

const formatActivityTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMinutes = Math.floor((now - time) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return `${Math.floor(diffMinutes / 1440)}d ago`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  adminName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: width / 2 - 25,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  performanceStat: {
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 2,
  },
  actionsSection: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    elevation: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: width / 2 - 25,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.9,
    marginTop: 2,
    textAlign: 'center',
  },
  prioritySection: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    elevation: 2,
  },
  priorityCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityScore: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priorityInfo: {
    flex: 1,
  },
  priorityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  priorityLocation: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  priorityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priorityDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
  viewAllText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  hotspotsSection: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    elevation: 2,
  },
  hotspotCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  hotspotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotspotLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  hotspotCount: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  activitySection: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  bottomPadding: {
    height: 20,
  },
  emptyActivityCard: {
    alignItems: 'center',
    paddingVertical: 30,
    opacity: 0.6,
  },
  emptyActivityText: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
  },
});

export default EnhancedAdminDashboard;
