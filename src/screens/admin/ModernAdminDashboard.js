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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, makeApiCall } from '../../../config/supabase';

const { width, height } = Dimensions.get('window');

// Clean Civic Complaint Dashboard
const ModernAdminDashboard = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolutionRate: 0,
    totalCitizens: 0
  });
  const [loading, setLoading] = useState(false);
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
      const response = await makeApiCall(`${apiClient.baseUrl}/api/admin/dashboard`);
      
      if (response.success && response.data) {
        const apiData = response.data;
        const complaints = apiData.complaints;
        const users = apiData.users;
        
        // Map API data to civic complaint dashboard format
        const mappedData = {
          totalComplaints: complaints.total || 0,
          resolvedComplaints: complaints.resolved || 0,
          pendingComplaints: complaints.pending || 0,
          inProgressComplaints: complaints.inProgress || 0,
          resolutionRate: complaints.resolutionRate || 0,
          totalCitizens: users.citizens || 0,
          avgResolutionDays: complaints.avgResolutionDays || 0
        };
        
        setDashboardData(mappedData);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
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
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['authToken', 'userData']);
            navigation.replace('Welcome');
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greetingText}>Hey, {userData?.fullName || 'Admin'}!</Text>
          <Text style={styles.headerSubtitle}>Civic Complaint Management</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <View style={styles.profileImage}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        {/* Total Complaints Card */}
        <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.statCard}>
          <Ionicons name="document-text" size={24} color="#fff" style={styles.cardIcon} />
          <Text style={styles.statNumber}>{dashboardData.totalComplaints}</Text>
          <Text style={styles.statLabel}>Total Complaints</Text>
        </LinearGradient>

        {/* Resolved Complaints Card */}
        <LinearGradient colors={['#5CB85C', '#449D44']} style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" style={styles.cardIcon} />
          <Text style={styles.statNumber}>{dashboardData.resolvedComplaints}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </LinearGradient>
      </View>

      <View style={styles.statsRow}>
        {/* Pending Complaints Card */}
        <LinearGradient colors={['#F0AD4E', '#EC971F']} style={styles.statCard}>
          <Ionicons name="time" size={24} color="#fff" style={styles.cardIcon} />
          <Text style={styles.statNumber}>{dashboardData.pendingComplaints}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </LinearGradient>

        {/* In Progress Card */}
        <LinearGradient colors={['#5BC0DE', '#46B8DA']} style={styles.statCard}>
          <Ionicons name="sync" size={24} color="#fff" style={styles.cardIcon} />
          <Text style={styles.statNumber}>{dashboardData.inProgressComplaints}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </LinearGradient>
      </View>

      {/* Resolution Rate Card - Full Width */}
      <View style={styles.fullWidthCard}>
        <LinearGradient colors={['#D9534F', '#C9302C']} style={styles.resolutionCard}>
          <View style={styles.resolutionContent}>
            <Ionicons name="bar-chart" size={28} color="#fff" />
            <View style={styles.resolutionInfo}>
              <Text style={styles.resolutionRate}>{dashboardData.resolutionRate}%</Text>
              <Text style={styles.resolutionLabel}>Resolution Rate</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Total Citizens Card - Full Width */}
      <View style={styles.fullWidthCard}>
        <View style={styles.citizensCard}>
          <View style={styles.citizensContent}>
            <Ionicons name="people" size={28} color="#4A90E2" />
            <View style={styles.citizensInfo}>
              <Text style={styles.citizensNumber}>{dashboardData.totalCitizens}</Text>
              <Text style={styles.citizensLabel}>Registered Citizens</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );





  const renderBottomNavigation = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
        <Ionicons name="home" size={24} color="#4A90E2" />
        <Text style={[styles.navText, styles.activeNavText]}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('PriorityQueue')}
      >
        <Ionicons name="list" size={24} color="#999" />
        <Text style={styles.navText}>Queue</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('CitizenManagement')}
      >
        <Ionicons name="people" size={24} color="#999" />
        <Text style={styles.navText}>Citizens</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('AdminComplaintMap')}
      >
        <Ionicons name="map" size={24} color="#999" />
        <Text style={styles.navText}>Map</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStatsCards()}
      </ScrollView>

      {renderBottomNavigation()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileButton: {
    padding: 2,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E17055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    width: (width - 50) / 2,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    alignItems: 'center',
  },
  cardIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  fullWidthCard: {
    marginTop: 15,
  },
  resolutionCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  resolutionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resolutionInfo: {
    marginLeft: 15,
  },
  resolutionRate: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  resolutionLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  citizensCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  citizensContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  citizensInfo: {
    marginLeft: 15,
  },
  citizensNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  citizensLabel: {
    fontSize: 16,
    color: '#666',
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeNavItem: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
  },
  navText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default ModernAdminDashboard;