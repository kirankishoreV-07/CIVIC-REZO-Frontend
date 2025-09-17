import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, makeApiCall } from '../../../config/supabase';

const { width } = Dimensions.get('window');

const CitizenManagement = ({ navigation }) => {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [sortBy, setSortBy] = useState('recent'); // recent, complaints_count, name

  useEffect(() => {
    loadCitizens();
  }, [searchText, sortBy]);

  const loadCitizens = async (page = 1) => {
    try {
      if (page === 1) setLoading(true);
      
      const params = new URLSearchParams({
        sort: sortBy
      });
      
      // Remove the limit parameter to get all users
      // if (searchText) params.append('search', searchText);
      if (searchText && searchText.trim()) {
        params.append('search', searchText.trim());
      }
      
      const response = await makeApiCall(
        `${apiClient.baseUrl}/api/admin-enhanced/citizens?${params}`
      );
      
      if (response.success) {
        if (page === 1) {
          setCitizens(response.data.citizens);
        } else {
          setCitizens(prev => [...prev, ...response.data.citizens]);
        }
        setPagination(response.data.pagination);
      } else {
        Alert.alert('Error', response.message || 'Failed to load citizens');
      }
    } catch (error) {
      console.error('Load citizens error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCitizens(1);
    setRefreshing(false);
  };

  const loadMoreCitizens = async () => {
    if (pagination.page < pagination.totalPages) {
      await loadCitizens(pagination.page + 1);
    }
  };

  const openCitizenDetails = (citizen) => {
    // Navigate to the new CitizenDetails screen
    navigation.navigate('CitizenDetails', { citizenId: citizen.id });
  };

  const updateCitizenStatus = async (citizenId, newStatus) => {
    try {
      const response = await makeApiCall(
        `${apiClient.baseUrl}/api/admin-enhanced/citizens/${citizenId}/status`,
        'PUT',
        { status: newStatus }
      );

      if (response.success) {
        Alert.alert('Success', `Citizen status updated to ${newStatus}`);
        setShowCitizenModal(false);
        await loadCitizens(1);
      } else {
        Alert.alert('Error', response.message || 'Failed to update citizen status');
      }
    } catch (error) {
      console.error('Update citizen status error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const renderCitizenCard = (citizen) => {
    const getStatusColor = (status) => {
      const colors = {
        'active': '#27ae60',
        'inactive': '#95a5a6',
        'banned': '#e74c3c',
        'suspended': '#f39c12'
      };
      return colors[status] || '#95a5a6';
    };

    const getEngagementLevel = (complaintsCount) => {
      if (complaintsCount >= 10) return { level: 'High', color: '#e74c3c' };
      if (complaintsCount >= 5) return { level: 'Medium', color: '#f39c12' };
      if (complaintsCount >= 1) return { level: 'Low', color: '#3498db' };
      return { level: 'None', color: '#95a5a6' };
    };

    const engagement = getEngagementLevel(citizen.complaints_count || 0);

    return (
      <TouchableOpacity
        key={citizen.id}
        style={styles.citizenCard}
        onPress={() => openCitizenDetails(citizen)}
      >
        {/* Profile Image */}
        <View style={styles.profileSection}>
          {citizen.profile_image ? (
            <Image source={{ uri: citizen.profile_image }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultProfileImage}>
              <Text style={styles.profileInitial}>
                {citizen.full_name ? citizen.full_name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          
          {/* Status Indicator */}
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(citizen.status) }]} />
        </View>

        {/* Citizen Info */}
        <View style={styles.citizenInfo}>
          <Text style={styles.citizenName} numberOfLines={1}>
            {citizen.full_name || 'Unknown User'}
          </Text>
          
          <Text style={styles.citizenEmail} numberOfLines={1}>
            {citizen.email}
          </Text>
          
          <Text style={styles.citizenPhone} numberOfLines={1}>
            📞 {citizen.phone_number || 'No phone number'}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{citizen.complaints_count || 0}</Text>
              <Text style={styles.statLabel}>Complaints</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{citizen.votes_count || 0}</Text>
              <Text style={styles.statLabel}>Votes</Text>
            </View>
            
            <View style={[styles.engagementBadge, { backgroundColor: engagement.color }]}>
              <Text style={styles.engagementText}>{engagement.level}</Text>
            </View>
          </View>

          {/* Join Date */}
          <Text style={styles.joinDate}>
            Joined: {new Date(citizen.created_at).toLocaleDateString()}
          </Text>

          {/* Last Activity */}
          {citizen.last_complaint_date && (
            <Text style={styles.lastActivity}>
              Last complaint: {new Date(citizen.last_complaint_date).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Action Arrow */}
        <View style={styles.actionArrow}>
          <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#9b59b6', '#8e44ad']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Citizen Management</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#7f8c8d"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Options */}
        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'recent' && styles.activeSortButton]}
              onPress={() => setSortBy('recent')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'recent' && styles.activeSortText]}>
                Recent
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'complaints_count' && styles.activeSortButton]}
              onPress={() => setSortBy('complaints_count')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'complaints_count' && styles.activeSortText]}>
                Most Active
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'name' && styles.activeSortButton]}
              onPress={() => setSortBy('name')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'name' && styles.activeSortText]}>
                Name
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Citizens List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMoreCitizens();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && citizens.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text>Loading citizens...</Text>
          </View>
        ) : (
          <>
            {citizens.map(renderCitizenCard)}
            
            {pagination.page < pagination.totalPages && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreCitizens}>
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            )}
            
            {citizens.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={50} color="#bdc3c7" />
                <Text style={styles.emptyText}>No citizens found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search criteria</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Citizen Details Modal */}
      <Modal
        visible={showCitizenModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCitizenModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.citizenModal}>
            {selectedCitizen && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Citizen Details</Text>
                  <TouchableOpacity onPress={() => setShowCitizenModal(false)}>
                    <Ionicons name="close" size={24} color="#2c3e50" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  {/* Profile Section */}
                  <View style={styles.modalProfileSection}>
                    {selectedCitizen.profile_image ? (
                      <Image 
                        source={{ uri: selectedCitizen.profile_image }} 
                        style={styles.modalProfileImage} 
                      />
                    ) : (
                      <View style={styles.modalDefaultProfile}>
                        <Text style={styles.modalProfileInitial}>
                          {selectedCitizen.full_name ? selectedCitizen.full_name.charAt(0).toUpperCase() : 'U'}
                        </Text>
                      </View>
                    )}
                    
                    <Text style={styles.modalCitizenName}>
                      {selectedCitizen.full_name || 'Unknown User'}
                    </Text>
                    
                    <View style={[
                      styles.modalStatusBadge, 
                      { backgroundColor: getStatusColor(selectedCitizen.status) }
                    ]}>
                      <Text style={styles.modalStatusText}>
                        {selectedCitizen.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Contact Information */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Contact Information</Text>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Email:</Text>
                      <Text style={styles.modalInfoValue}>{selectedCitizen.email}</Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Phone:</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedCitizen.phone_number || 'Not provided'}
                      </Text>
                    </View>
                  </View>

                  {/* Activity Statistics */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Activity Statistics</Text>
                    <View style={styles.modalStatsGrid}>
                      <View style={styles.modalStatCard}>
                        <Text style={styles.modalStatNumber}>
                          {selectedCitizen.complaints?.length || 0}
                        </Text>
                        <Text style={styles.modalStatLabel}>Total Complaints</Text>
                      </View>
                      
                      <View style={styles.modalStatCard}>
                        <Text style={styles.modalStatNumber}>
                          {selectedCitizen.resolved_complaints || 0}
                        </Text>
                        <Text style={styles.modalStatLabel}>Resolved</Text>
                      </View>
                      
                      <View style={styles.modalStatCard}>
                        <Text style={styles.modalStatNumber}>
                          {selectedCitizen.votes_count || 0}
                        </Text>
                        <Text style={styles.modalStatLabel}>Votes Cast</Text>
                      </View>
                      
                      <View style={styles.modalStatCard}>
                        <Text style={styles.modalStatNumber}>
                          {selectedCitizen.reputation_score || 0}
                        </Text>
                        <Text style={styles.modalStatLabel}>Reputation</Text>
                      </View>
                    </View>
                  </View>

                  {/* Recent Complaints */}
                  {selectedCitizen.complaints && selectedCitizen.complaints.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Recent Complaints</Text>
                      {selectedCitizen.complaints.slice(0, 3).map((complaint) => (
                        <TouchableOpacity
                          key={complaint.id}
                          style={styles.modalComplaintItem}
                          onPress={() => {
                            setShowCitizenModal(false);
                            navigation.navigate('ComplaintDetails', { 
                              complaintId: complaint.id 
                            });
                          }}
                        >
                          <Text style={styles.modalComplaintTitle} numberOfLines={1}>
                            {complaint.title}
                          </Text>
                          <Text style={styles.modalComplaintStatus}>
                            {complaint.status.toUpperCase()}
                          </Text>
                          <Text style={styles.modalComplaintDate}>
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      
                      {selectedCitizen.complaints.length > 3 && (
                        <TouchableOpacity 
                          style={styles.viewAllButton}
                          onPress={() => {
                            setShowCitizenModal(false);
                            navigation.navigate('PriorityQueue', { 
                              filterUserId: selectedCitizen.id 
                            });
                          }}
                        >
                          <Text style={styles.viewAllText}>
                            View all {selectedCitizen.complaints.length} complaints
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Account Information */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Account Information</Text>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Member Since:</Text>
                      <Text style={styles.modalInfoValue}>
                        {new Date(selectedCitizen.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Last Activity:</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedCitizen.last_sign_in_at 
                          ? new Date(selectedCitizen.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: '#3498db' }]}
                    onPress={() => {
                      setShowCitizenModal(false);
                      navigation.navigate('AdminCitizenChat', { 
                        citizenId: selectedCitizen.id 
                      });
                    }}
                  >
                    <Ionicons name="chatbubble-outline" size={18} color="#fff" />
                    <Text style={styles.modalActionText}>Message</Text>
                  </TouchableOpacity>

                  {selectedCitizen.status === 'active' ? (
                    <TouchableOpacity 
                      style={[styles.modalActionButton, { backgroundColor: '#f39c12' }]}
                      onPress={() => {
                        Alert.alert(
                          'Suspend Citizen',
                          'Are you sure you want to suspend this citizen?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Suspend', 
                              onPress: () => updateCitizenStatus(selectedCitizen.id, 'suspended') 
                            }
                          ]
                        );
                      }}
                    >
                      <Ionicons name="pause-circle-outline" size={18} color="#fff" />
                      <Text style={styles.modalActionText}>Suspend</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.modalActionButton, { backgroundColor: '#27ae60' }]}
                      onPress={() => updateCitizenStatus(selectedCitizen.id, 'active')}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                      <Text style={styles.modalActionText}>Activate</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: '#e74c3c' }]}
                    onPress={() => {
                      Alert.alert(
                        'Ban Citizen',
                        'Are you sure you want to ban this citizen? This action cannot be undone.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Ban', 
                            style: 'destructive',
                            onPress: () => updateCitizenStatus(selectedCitizen.id, 'banned') 
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="ban-outline" size={18} color="#fff" />
                    <Text style={styles.modalActionText}>Ban</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );

  function getStatusColor(status) {
    const colors = {
      'active': '#27ae60',
      'inactive': '#95a5a6',
      'banned': '#e74c3c',
      'suspended': '#f39c12'
    };
    return colors[status] || '#95a5a6';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchSection: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginRight: 10,
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    marginRight: 8,
  },
  activeSortButton: {
    backgroundColor: '#9b59b6',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeSortText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  citizenCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileSection: {
    position: 'relative',
    marginRight: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9b59b6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  citizenInfo: {
    flex: 1,
  },
  citizenName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  citizenEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  citizenPhone: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  engagementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  engagementText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  joinDate: {
    fontSize: 11,
    color: '#95a5a6',
  },
  lastActivity: {
    fontSize: 11,
    color: '#95a5a6',
  },
  actionArrow: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
    textAlign: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#9b59b6',
    margin: 15,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  citizenModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalContent: {
    flex: 1,
  },
  modalProfileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  modalProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  modalDefaultProfile: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9b59b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalProfileInitial: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalCitizenName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  modalInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalStatCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  modalComplaintItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalComplaintTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modalComplaintStatus: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  modalComplaintDate: {
    fontSize: 11,
    color: '#95a5a6',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  viewAllText: {
    color: '#9b59b6',
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  modalActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default CitizenManagement;
