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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnvironmentalTheme from '../../theme/EnvironmentalTheme';
import FloatingChatbotButton from '../../components/FloatingChatbotButton';

const { width } = Dimensions.get('window');

const CitizenDashboard = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
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
      <StatusBar barStyle="light-content" backgroundColor={EnvironmentalTheme.primary.main} />
      
      {/* Environmental Header with Gradient */}
      <LinearGradient
        colors={EnvironmentalTheme.gradients.forest}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Ionicons name="leaf" size={28} color="#ffffff" />
                <Text style={styles.title}>EcoReports</Text>
              </View>
              <Text style={styles.welcomeText}>
                Making our city greener, {userData?.fullName || 'Citizen'}!
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.profileIcon}
              onPress={() => Alert.alert('Profile', 'Environmental profile settings')}
            >
              <Ionicons name="person-circle" size={40} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          {/* Environmental Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={20} color={EnvironmentalTheme.accent.amber} />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={20} color={EnvironmentalTheme.status.success} />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="earth" size={20} color={EnvironmentalTheme.secondary.light} />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Impact</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Environmental Actions Card */}
        <LinearGradient
          colors={[EnvironmentalTheme.neutral.white, EnvironmentalTheme.primary.surface]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="flash" size={24} color={EnvironmentalTheme.primary.main} />
              <Text style={styles.cardTitle}>Eco Actions</Text>
            </View>
            <Text style={styles.cardSubtitle}>Report environmental issues</Text>
          </View>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => navigation.navigate('SubmitComplaint')}
            >
              <LinearGradient
                colors={[EnvironmentalTheme.primary.main, EnvironmentalTheme.primary.light]}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="add-circle" size={28} color="#ffffff" />
                </View>
                <Text style={styles.actionButtonText}>New Report</Text>
                <Text style={styles.actionSubtext}>Submit environmental concern</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'InstagramFeed' }]
                });
              }}
            >
              <LinearGradient
                colors={[EnvironmentalTheme.secondary.main, EnvironmentalTheme.secondary.light]}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="documents" size={28} color="#ffffff" />
                </View>
                <Text style={styles.actionButtonText}>My Reports</Text>
                <Text style={styles.actionSubtext}>Track progress</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.tertiaryAction]}
              onPress={() => navigation.navigate('ComplaintMap')}
            >
              <LinearGradient
                colors={[EnvironmentalTheme.accent.teal, EnvironmentalTheme.secondary.light]}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="map" size={28} color="#ffffff" />
                </View>
                <Text style={styles.actionButtonText}>Complaint Map</Text>
                <Text style={styles.actionSubtext}>View area status</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.quaternaryAction]}
              onPress={() => navigation.navigate('CitizenTransparency')}
            >
              <LinearGradient
                colors={[EnvironmentalTheme.accent.lime, EnvironmentalTheme.primary.light]}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="bar-chart" size={28} color="#ffffff" />
                </View>
                <Text style={styles.actionButtonText}>Transparency</Text>
                <Text style={styles.actionSubtext}>Impact stats</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.chatbotAction]}
              onPress={() => navigation.navigate('CivicChatbot')}
            >
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="chatbubbles" size={28} color="#ffffff" />
                </View>
                <Text style={styles.actionButtonText}>AI Assistant</Text>
                <Text style={styles.actionSubtext}>Get instant help</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.voiceAction]}
              onPress={() => navigation.navigate('SubmitComplaint', { useVoice: true })}
            >
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="mic" size={28} color="#ffffff" />
                </View>
                <Text style={styles.actionButtonText}>Voice Report</Text>
                <Text style={styles.actionSubtext}>Speak your concern</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Environmental Impact Card */}
        <LinearGradient
          colors={[EnvironmentalTheme.neutral.white, EnvironmentalTheme.secondary.surface]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="trending-up" size={24} color={EnvironmentalTheme.secondary.main} />
              <Text style={styles.cardTitle}>Environmental Impact</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="leaf-outline" size={48} color={EnvironmentalTheme.primary.main} />
            </View>
            <Text style={styles.emptyStateTitle}>Start Your Green Journey</Text>
            <Text style={styles.emptyStateText}>
              Your environmental impact will be tracked here as you submit reports
            </Text>
          </View>
        </LinearGradient>

        {/* Account Card with Environmental Theme */}
        <LinearGradient
          colors={[EnvironmentalTheme.neutral.white, EnvironmentalTheme.neutral.gray100]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="person" size={24} color={EnvironmentalTheme.accent.brown} />
              <Text style={styles.cardTitle}>Eco Profile</Text>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="mail" size={20} color={EnvironmentalTheme.primary.main} />
                <Text style={styles.infoLabel}>Email</Text>
              </View>
              <Text style={styles.infoValue}>{userData?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="call" size={20} color={EnvironmentalTheme.secondary.main} />
                <Text style={styles.infoLabel}>Phone</Text>
              </View>
              <Text style={styles.infoValue}>{userData?.phoneNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="shield-checkmark" size={20} color={EnvironmentalTheme.status.success} />
                <Text style={styles.infoLabel}>Status</Text>
              </View>
              <View style={styles.statusBadge}>
                <Ionicons name="leaf" size={16} color={EnvironmentalTheme.primary.main} />
                <Text style={styles.statusText}>Eco Citizen</Text>
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
      
      {/* ELEGANT BLUE CHATBOT BUTTON */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 100,
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
        }}
        onPress={() => {
          console.log('🤖 Blue chatbot button pressed from dashboard!');
          navigation.navigate('CivicChatbot');
        }}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons 
          name="robot-happy" 
          size={28} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>
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
    marginBottom: EnvironmentalTheme.spacing.lg,
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
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: EnvironmentalTheme.borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: EnvironmentalTheme.borderRadius.lg,
    paddingVertical: EnvironmentalTheme.spacing.md,
    paddingHorizontal: EnvironmentalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    marginBottom: EnvironmentalTheme.spacing.xs,
  },
  statNumber: {
    ...EnvironmentalTheme.typography.h3,
    color: EnvironmentalTheme.neutral.white,
    marginBottom: 2,
  },
  statLabel: {
    ...EnvironmentalTheme.typography.caption,
    color: EnvironmentalTheme.neutral.white,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: EnvironmentalTheme.spacing.md,
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
    color: EnvironmentalTheme.primary.main,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: EnvironmentalTheme.spacing.sm,
    paddingBottom: EnvironmentalTheme.spacing.sm,
  },
  actionButton: {
    width: (width - 80) / 2,
    margin: EnvironmentalTheme.spacing.sm,
    borderRadius: EnvironmentalTheme.borderRadius.lg,
    minHeight: 140,
    overflow: 'hidden',
    ...EnvironmentalTheme.shadows.small,
  },
  actionGradient: {
    flex: 1,
    padding: EnvironmentalTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: EnvironmentalTheme.spacing.md,
  },
  actionButtonText: {
    ...EnvironmentalTheme.typography.body1,
    fontWeight: 'bold',
    color: EnvironmentalTheme.neutral.white,
    textAlign: 'center',
    marginBottom: EnvironmentalTheme.spacing.xs,
  },
  actionSubtext: {
    ...EnvironmentalTheme.typography.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
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
  statusBadge: {
    backgroundColor: EnvironmentalTheme.primary.surface,
    paddingHorizontal: EnvironmentalTheme.spacing.md,
    paddingVertical: EnvironmentalTheme.spacing.xs,
    borderRadius: EnvironmentalTheme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    ...EnvironmentalTheme.typography.body2,
    color: EnvironmentalTheme.primary.main,
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
  chatbotAction: {
    // Chatbot button specific styles
  },
  voiceAction: {
    // Voice input button specific styles
  },
  bottomSpacer: {
    height: EnvironmentalTheme.spacing.lg,
  },
});

export default CitizenDashboard;
