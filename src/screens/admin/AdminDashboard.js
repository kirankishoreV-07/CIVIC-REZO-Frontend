import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnvironmentalTheme from '../../theme/EnvironmentalTheme';

const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    loadUserData();
    loadDashboardStats();
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

  const loadDashboardStats = async () => {
    // This will be implemented with actual API call later
    // For now, using placeholder data
    setDashboardStats({
      totalComplaints: 0,
      pendingComplaints: 0,
      resolvedComplaints: 0,
      totalUsers: 0,
    });
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={EnvironmentalTheme.secondary.main} />
      
      {/* Environmental Admin Header */}
      <LinearGradient
        colors={EnvironmentalTheme.gradients.ocean}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Ionicons name="shield-checkmark" size={28} color="#ffffff" />
                <Text style={styles.title}>EcoAdmin</Text>
              </View>
              <Text style={styles.welcomeText}>
                Managing environmental governance, {userData?.fullName || 'Administrator'}!
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.adminBadge}
              onPress={() => Alert.alert('Admin Profile', 'Environmental admin profile')}
            >
              <Ionicons name="star" size={16} color="#ffffff" />
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Environmental Statistics Grid */}
        <LinearGradient
          colors={[EnvironmentalTheme.neutral.white, EnvironmentalTheme.secondary.surface]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="analytics" size={24} color={EnvironmentalTheme.secondary.main} />
              <Text style={styles.cardTitle}>Environmental Overview</Text>
            </View>
            <Text style={styles.cardSubtitle}>Real-time environmental data</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <LinearGradient
              colors={[EnvironmentalTheme.primary.surface, EnvironmentalTheme.primary.light]}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="document-text" size={24} color={EnvironmentalTheme.primary.main} />
              </View>
              <Text style={styles.statNumber}>{dashboardStats.totalComplaints}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </LinearGradient>

            <LinearGradient
              colors={[EnvironmentalTheme.accent.amber + '20', EnvironmentalTheme.accent.amber + '40']}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={24} color={EnvironmentalTheme.accent.amber} />
              </View>
              <Text style={styles.statNumber}>{dashboardStats.pendingComplaints}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </LinearGradient>

            <LinearGradient
              colors={[EnvironmentalTheme.status.success + '20', EnvironmentalTheme.status.success + '40']}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={24} color={EnvironmentalTheme.status.success} />
              </View>
              <Text style={styles.statNumber}>{dashboardStats.resolvedComplaints}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </LinearGradient>

            <LinearGradient
              colors={[EnvironmentalTheme.accent.teal + '20', EnvironmentalTheme.accent.teal + '40']}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={24} color={EnvironmentalTheme.accent.teal} />
              </View>
              <Text style={styles.statNumber}>{dashboardStats.totalUsers}</Text>
              <Text style={styles.statLabel}>Eco Citizens</Text>
            </LinearGradient>
          </View>
        </LinearGradient>

        {/* Environmental Admin Actions */}
        <LinearGradient
          colors={[EnvironmentalTheme.neutral.white, EnvironmentalTheme.primary.surface]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="settings" size={24} color={EnvironmentalTheme.primary.main} />
              <Text style={styles.cardTitle}>Environmental Management</Text>
            </View>
            <Text style={styles.cardSubtitle}>Manage eco-friendly operations</Text>
          </View>
          
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Environmental Reports', 'Manage all environmental reports')}
            >
              <LinearGradient
                colors={[EnvironmentalTheme.primary.main, EnvironmentalTheme.primary.light]}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="document-text" size={24} color="#ffffff" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonText}>Report Management</Text>
                  <Text style={styles.actionSubtext}>Review environmental issues</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Priority Queue', 'Handle urgent environmental issues')}
            >
              <LinearGradient
                colors={[EnvironmentalTheme.accent.amber, EnvironmentalTheme.status.warning]}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="warning" size={24} color="#ffffff" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonText}>Priority Queue</Text>
                  <Text style={styles.actionSubtext}>Handle urgent eco-issues</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Eco Analytics', 'Environmental data and insights')}
            >
              <LinearGradient
                colors={[EnvironmentalTheme.accent.teal, EnvironmentalTheme.secondary.light]}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="map" size={24} color="#ffffff" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonText}>Eco Analytics</Text>
                  <Text style={styles.actionSubtext}>Environmental insights</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Citizen Management', 'Manage eco-citizen accounts')}
            >
              <LinearGradient
                colors={[EnvironmentalTheme.accent.lime, EnvironmentalTheme.primary.light]}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="people" size={24} color="#ffffff" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonText}>Citizen Management</Text>
                  <Text style={styles.actionSubtext}>Manage eco-accounts</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Environmental Reports', 'Generate sustainability reports')}
            >
              <LinearGradient
                colors={[EnvironmentalTheme.secondary.main, EnvironmentalTheme.secondary.light]}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="bar-chart" size={24} color="#ffffff" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonText}>Sustainability Reports</Text>
                  <Text style={styles.actionSubtext}>Generate eco-insights</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Enhanced Recent Activity */}
        <LinearGradient
          colors={[EnvironmentalTheme.neutral.white, EnvironmentalTheme.neutral.gray100]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="time" size={24} color={EnvironmentalTheme.accent.brown} />
              <Text style={styles.cardTitle}>Recent Activity</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="leaf-outline" size={48} color={EnvironmentalTheme.primary.main} />
            </View>
            <Text style={styles.emptyStateTitle}>No Recent Activity</Text>
            <Text style={styles.emptyStateText}>
              Environmental activity will appear here
            </Text>
          </View>
        </LinearGradient>

        {/* Enhanced Admin Profile */}
        <LinearGradient
          colors={[EnvironmentalTheme.neutral.white, EnvironmentalTheme.secondary.surface]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="person-circle" size={24} color={EnvironmentalTheme.secondary.main} />
              <Text style={styles.cardTitle}>Environmental Administrator</Text>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="mail" size={20} color={EnvironmentalTheme.secondary.main} />
                <Text style={styles.infoLabel}>Official Email</Text>
              </View>
              <Text style={styles.infoValue}>{userData?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="call" size={20} color={EnvironmentalTheme.primary.main} />
                <Text style={styles.infoLabel}>Contact</Text>
              </View>
              <Text style={styles.infoValue}>{userData?.phoneNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="shield-checkmark" size={20} color={EnvironmentalTheme.status.success} />
                <Text style={styles.infoLabel}>Role</Text>
              </View>
              <View style={styles.adminStatusBadge}>
                <Ionicons name="leaf" size={16} color={EnvironmentalTheme.secondary.main} />
                <Text style={styles.adminStatusText}>Eco Administrator</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Environmental Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={[EnvironmentalTheme.neutral.white, EnvironmentalTheme.neutral.gray100]}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out" size={24} color={EnvironmentalTheme.status.error} />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EnvironmentalTheme.neutral.light,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: EnvironmentalTheme.spacing.xl,
    borderBottomLeftRadius: EnvironmentalTheme.borderRadius.xl,
    borderBottomRightRadius: EnvironmentalTheme.borderRadius.xl,
    ...EnvironmentalTheme.shadows.large,
  },
  headerContent: {
    paddingHorizontal: EnvironmentalTheme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: EnvironmentalTheme.spacing.xs,
  },
  title: {
    ...EnvironmentalTheme.typography.h2,
    color: EnvironmentalTheme.neutral.white,
    marginLeft: EnvironmentalTheme.spacing.sm,
  },
  welcomeText: {
    ...EnvironmentalTheme.typography.body1,
    color: EnvironmentalTheme.neutral.white,
    opacity: 0.9,
  },
  adminBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: EnvironmentalTheme.spacing.md,
    paddingVertical: EnvironmentalTheme.spacing.xs,
    borderRadius: EnvironmentalTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBadgeText: {
    color: EnvironmentalTheme.neutral.white,
    ...EnvironmentalTheme.typography.caption,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginLeft: EnvironmentalTheme.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: EnvironmentalTheme.spacing.lg,
    marginTop: -15,
  },
  card: {
    borderRadius: EnvironmentalTheme.borderRadius.xl,
    marginBottom: EnvironmentalTheme.spacing.lg,
    ...EnvironmentalTheme.shadows.medium,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: EnvironmentalTheme.spacing.lg,
    paddingBottom: EnvironmentalTheme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...EnvironmentalTheme.typography.h4,
    color: EnvironmentalTheme.neutral.black,
    marginLeft: EnvironmentalTheme.spacing.sm,
  },
  cardSubtitle: {
    ...EnvironmentalTheme.typography.body2,
    color: EnvironmentalTheme.neutral.gray700,
    marginTop: 2,
  },
  viewAllText: {
    ...EnvironmentalTheme.typography.body2,
    color: EnvironmentalTheme.secondary.main,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: EnvironmentalTheme.spacing.sm,
    paddingBottom: EnvironmentalTheme.spacing.sm,
  },
  statCard: {
    width: (width - 80) / 2,
    margin: EnvironmentalTheme.spacing.sm,
    padding: EnvironmentalTheme.spacing.lg,
    borderRadius: EnvironmentalTheme.borderRadius.lg,
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
    ...EnvironmentalTheme.shadows.small,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: EnvironmentalTheme.spacing.sm,
    ...EnvironmentalTheme.shadows.small,
  },
  statNumber: {
    ...EnvironmentalTheme.typography.h2,
    color: EnvironmentalTheme.neutral.black,
    marginBottom: EnvironmentalTheme.spacing.xs,
    fontWeight: 'bold',
  },
  statLabel: {
    ...EnvironmentalTheme.typography.body2,
    color: EnvironmentalTheme.neutral.gray700,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: EnvironmentalTheme.spacing.lg,
    paddingBottom: EnvironmentalTheme.spacing.lg,
  },
  actionButton: {
    marginBottom: EnvironmentalTheme.spacing.md,
    borderRadius: EnvironmentalTheme.borderRadius.lg,
    overflow: 'hidden',
    ...EnvironmentalTheme.shadows.small,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: EnvironmentalTheme.spacing.lg,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: EnvironmentalTheme.spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionButtonText: {
    ...EnvironmentalTheme.typography.body1,
    fontWeight: 'bold',
    color: EnvironmentalTheme.neutral.white,
    marginBottom: 3,
  },
  actionSubtext: {
    ...EnvironmentalTheme.typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: EnvironmentalTheme.spacing.xl,
    paddingHorizontal: EnvironmentalTheme.spacing.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: EnvironmentalTheme.primary.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: EnvironmentalTheme.spacing.md,
  },
  emptyStateTitle: {
    ...EnvironmentalTheme.typography.h4,
    color: EnvironmentalTheme.neutral.black,
    marginBottom: EnvironmentalTheme.spacing.xs,
  },
  emptyStateText: {
    ...EnvironmentalTheme.typography.body2,
    color: EnvironmentalTheme.neutral.gray700,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoContainer: {
    paddingHorizontal: EnvironmentalTheme.spacing.lg,
    paddingBottom: EnvironmentalTheme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: EnvironmentalTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: EnvironmentalTheme.neutral.gray200,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    ...EnvironmentalTheme.typography.body1,
    color: EnvironmentalTheme.neutral.gray700,
    fontWeight: '500',
    marginLeft: EnvironmentalTheme.spacing.sm,
  },
  infoValue: {
    ...EnvironmentalTheme.typography.body1,
    color: EnvironmentalTheme.neutral.black,
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  adminStatusBadge: {
    backgroundColor: EnvironmentalTheme.secondary.surface,
    paddingHorizontal: EnvironmentalTheme.spacing.md,
    paddingVertical: EnvironmentalTheme.spacing.xs,
    borderRadius: EnvironmentalTheme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminStatusText: {
    ...EnvironmentalTheme.typography.body2,
    color: EnvironmentalTheme.secondary.main,
    fontWeight: '600',
    marginLeft: EnvironmentalTheme.spacing.xs,
  },
  logoutButton: {
    marginBottom: EnvironmentalTheme.spacing.sm,
    borderRadius: EnvironmentalTheme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: EnvironmentalTheme.status.error,
    ...EnvironmentalTheme.shadows.small,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: EnvironmentalTheme.spacing.lg,
  },
  logoutButtonText: {
    ...EnvironmentalTheme.typography.body1,
    color: EnvironmentalTheme.status.error,
    fontWeight: 'bold',
    marginLeft: EnvironmentalTheme.spacing.sm,
  },
  bottomSpacer: {
    height: EnvironmentalTheme.spacing.lg,
  },
});

export default AdminDashboard;
