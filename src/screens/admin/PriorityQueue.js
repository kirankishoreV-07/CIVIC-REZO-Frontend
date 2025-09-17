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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { apiClient, makeApiCall } from '../../../config/supabase';

const { width, height } = Dimensions.get('window');

const PriorityQueue = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('');
  const [filterAssigned, setFilterAssigned] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  
  // Status change modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [officers, setOfficers] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  const categories = [
    'pothole', 'broken_streetlight', 'drainage_problem', 
    'garbage_not_collected', 'water_supply_issue', 'road_damage',
    'public_toilet_issue', 'park_maintenance', 'noise_pollution', 'other'
  ];
  
  const statusOptions = ['pending', 'in_progress', 'resolved', 'rejected'];
  
  const priorityOptions = [
    { label: 'Low Priority (0-3)', value: 'low' },
    { label: 'Medium Priority (4-6)', value: 'medium' },
    { label: 'High Priority (7-8)', value: 'high' },
    { label: 'Critical Priority (9-10)', value: 'critical' }
  ];

  const dateRangeOptions = [
    { label: 'Last 24 Hours', value: '1' },
    { label: 'Last 3 Days', value: '3' },
    { label: 'Last Week', value: '7' },
    { label: 'Last Month', value: '30' },
    { label: 'Last 3 Months', value: '90' }
  ];

  const assignmentOptions = [
    { label: 'Unassigned', value: 'unassigned' },
    { label: 'Assigned to Officer', value: 'officer_assigned' },
    { label: 'Assigned to Contractor', value: 'contractor_assigned' },
    { label: 'Fully Assigned', value: 'fully_assigned' }
  ];

  useEffect(() => {
    loadComplaints();
  }, [searchText, filterLocation, filterCategory, filterStatus, filterPriority, filterDateRange, filterAssigned]);

  const loadComplaints = async (page = 1) => {
    try {
      if (page === 1) setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (searchText) params.append('search', searchText);
      if (filterLocation) params.append('location', filterLocation);
      if (filterCategory) params.append('category', filterCategory);
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterDateRange) params.append('days', filterDateRange);
      if (filterAssigned) params.append('assigned', filterAssigned);
      
      console.log('🔍 Loading complaints with filters:', {
        searchText, filterLocation, filterCategory, filterStatus, 
        filterPriority, filterDateRange, filterAssigned
      });
      
      const response = await makeApiCall(
        `${apiClient.baseUrl}/api/admin-enhanced/complaints/priority-queue?${params}`
      );
      
      if (response.success) {
        if (page === 1) {
          setComplaints(response.data.complaints);
        } else {
          setComplaints(prev => [...prev, ...response.data.complaints]);
        }
        setPagination(response.data.pagination);
        console.log(`✅ Loaded ${response.data.complaints.length} complaints`);
      } else {
        Alert.alert('Error', response.message || 'Failed to load complaints');
      }
    } catch (error) {
      console.error('Load complaints error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadComplaints(1);
    setRefreshing(false);
  };

  const loadMoreComplaints = async () => {
    if (pagination.page < pagination.totalPages) {
      await loadComplaints(pagination.page + 1);
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setFilterLocation('');
    setFilterCategory('');
    setFilterStatus('');
    setFilterPriority('');
    setFilterDateRange('');
    setFilterAssigned('');
    setShowFilters(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchText) count++;
    if (filterLocation) count++;
    if (filterCategory) count++;
    if (filterStatus) count++;
    if (filterPriority) count++;
    if (filterDateRange) count++;
    if (filterAssigned) count++;
    return count;
  };

  const navigateToComplaintDetails = (complaintId) => {
    navigation.navigate('ComplaintDetails', { complaintId });
  };

  // Load officers and contractors when component mounts
  useEffect(() => {
    loadOfficersAndContractors();
  }, []);

  const loadOfficersAndContractors = async () => {
    try {
      const [officersResponse, contractorsResponse] = await Promise.all([
        makeApiCall(`${apiClient.baseUrl}/api/admin-enhanced/officers`),
        makeApiCall(`${apiClient.baseUrl}/api/admin-enhanced/contractors`)
      ]);

      if (officersResponse.success) {
        setOfficers(officersResponse.data || []);
      }
      if (contractorsResponse.success) {
        setContractors(contractorsResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load officers/contractors:', error);
      // Set empty arrays on error to prevent crashes
      setOfficers([]);
      setContractors([]);
    }
  };

  const showStatusChangeModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(''); // Start with empty selection to force user choice
    setStatusNotes('');
    setSelectedOfficer('');
    setSelectedContractor('');
    setShowStatusModal(true);
    
    // Load officers and contractors if not already loaded
    if (officers.length === 0 || contractors.length === 0) {
      loadOfficersAndContractors();
    }
  };

  const updateComplaintStatus = async () => {
    if (!selectedComplaint || !newStatus) {
      Alert.alert('Validation Error', 'Please select a new status before proceeding.');
      return;
    }

    if (newStatus === selectedComplaint.status) {
      Alert.alert('No Changes', 'The selected status is the same as the current status.');
      return;
    }

    setStatusChangeLoading(true);
    try {
      console.log('🔄 Updating complaint status:', {
        complaintId: selectedComplaint.id,
        currentStatus: selectedComplaint.status,
        newStatus: newStatus,
        officer: selectedOfficer,
        contractor: selectedContractor
      });

      const response = await makeApiCall(
        `${apiClient.baseUrl}/api/admin-enhanced/complaints/${selectedComplaint.id}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({
            status: newStatus,
            notes: statusNotes,
            oldStatus: selectedComplaint.status,
            adminId: selectedOfficer || null,
            assignedOfficerId: selectedOfficer || null,
            assignedContractorId: selectedContractor || null
          })
        }
      );

      if (response.success) {
        const officerName = selectedOfficer ? 
          officers.find(o => o.id.toString() === selectedOfficer)?.name : null;
        const contractorName = selectedContractor ? 
          contractors.find(c => c.id.toString() === selectedContractor)?.name : null;
        
        let successMessage = `Status updated to "${newStatus.replace('_', ' ').toUpperCase()}"`;
        if (officerName) successMessage += `\nOfficer assigned: ${officerName}`;
        if (contractorName) successMessage += `\nContractor assigned: ${contractorName}`;

        Alert.alert(
          'Success! ✅', 
          successMessage,
          [{ 
            text: 'OK', 
            onPress: () => {
              setShowStatusModal(false);
              // Reset form
              setNewStatus('');
              setStatusNotes('');
              setSelectedOfficer('');
              setSelectedContractor('');
              // Refresh the list
              loadComplaints(1);
            }
          }]
        );
      } else {
        console.error('❌ Status update failed:', response);
        Alert.alert('Update Failed', response.message || 'Failed to update complaint status. Please try again.');
      }
    } catch (error) {
      console.error('❌ Status update error:', error);
      Alert.alert(
        'Network Error', 
        'Failed to connect to server. Please check your connection and try again.'
      );
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const renderComplaintCard = (complaint) => {
    const stagesCompleted = complaint.complaint_stages?.filter(s => s.stage_status === 'completed').length || 0;
    const totalStages = complaint.complaint_stages?.length || 0;
    const currentStage = complaint.complaint_stages?.find(s => s.stage_status === 'in_progress') || 
                       complaint.complaint_stages?.find(s => s.stage_status === 'pending');
    
    return (
      <TouchableOpacity
        key={complaint.id}
        style={styles.complaintCard}
        onPress={() => navigateToComplaintDetails(complaint.id)}
      >
        {/* Priority Badge */}
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(complaint.priority_score) }]}>
          <Text style={styles.priorityScore}>{complaint.priority_score}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.complaintContent}>
          <View style={styles.complaintHeader}>
            <Text style={styles.complaintTitle} numberOfLines={2}>
              {complaint.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
              <Text style={styles.statusText}>{complaint.status.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.complaintLocation} numberOfLines={1}>
            📍 {complaint.location_address || 'Location not specified'}
          </Text>

          <Text style={styles.complaintUser}>
            👤 {complaint.users?.full_name || complaint.user_name || 'Unknown User'}
          </Text>

          {/* Progress Bar */}
          {totalStages > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(stagesCompleted / totalStages) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {stagesCompleted}/{totalStages} stages completed
              </Text>
            </View>
          )}

          {/* Current Stage */}
          {currentStage && (
            <View style={styles.currentStageSection}>
              <Text style={styles.currentStageLabel}>Current Stage:</Text>
              <Text style={styles.currentStageName}>{currentStage.stage_name || 'Processing'}</Text>
              {currentStage.officers && (
                <Text style={styles.assignedOfficer}>
                  👮 {currentStage.officers.name} ({currentStage.officers.department || 'No Dept'})
                </Text>
              )}
              {currentStage.contractors && (
                <Text style={styles.assignedContractor}>
                  🔧 {currentStage.contractors.name}{currentStage.contractors.company_name ? ` - ${currentStage.contractors.company_name}` : ''}
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => navigateToComplaintDetails(complaint.id)}
            >
              <Ionicons name="eye-outline" size={16} color="#3498db" />
              <Text style={styles.buttonText}>View Status</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => showStatusChangeModal(complaint)}
            >
              <Ionicons name="create-outline" size={16} color="#e67e22" />
              <Text style={styles.buttonText}>Change Status</Text>
            </TouchableOpacity>
          </View>

          {/* Timestamp */}
          <Text style={styles.timestamp}>
            Created: {new Date(complaint.created_at).toLocaleDateString()} • 
            Updated: {new Date(complaint.updated_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getPriorityColor = (score) => {
    if (score >= 8) return '#e74c3c';
    if (score >= 6) return '#f39c12';
    if (score >= 4) return '#3498db';
    return '#95a5a6';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f39c12',
      'in_progress': '#3498db',
      'resolved': '#27ae60',
      'rejected': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#e74c3c', '#c0392b']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Priority Queue</Text>
        <TouchableOpacity 
          style={styles.filterButtonContainer}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter-outline" size={24} color="#fff" />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by issue name or location..."
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

        {/* Active Filters Display */}
        {(filterLocation || filterCategory || filterStatus || filterPriority || filterDateRange || filterAssigned) && (
          <View style={styles.activeFilters}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filterLocation && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>📍 {filterLocation}</Text>
                  <TouchableOpacity onPress={() => setFilterLocation('')}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              {filterCategory && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>🏷️ {filterCategory.replace('_', ' ')}</Text>
                  <TouchableOpacity onPress={() => setFilterCategory('')}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              {filterStatus && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>📊 {filterStatus.replace('_', ' ')}</Text>
                  <TouchableOpacity onPress={() => setFilterStatus('')}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              {filterPriority && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>⚡ {priorityOptions.find(p => p.value === filterPriority)?.label.split(' ')[0] || filterPriority}</Text>
                  <TouchableOpacity onPress={() => setFilterPriority('')}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              {filterDateRange && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>📅 {dateRangeOptions.find(d => d.value === filterDateRange)?.label || filterDateRange}</Text>
                  <TouchableOpacity onPress={() => setFilterDateRange('')}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              {filterAssigned && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>👤 {assignmentOptions.find(a => a.value === filterAssigned)?.label || filterAssigned}</Text>
                  <TouchableOpacity onPress={() => setFilterAssigned('')}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.clearAllChip} onPress={clearFilters}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Complaints List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMoreComplaints();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && complaints.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text>Loading complaints...</Text>
          </View>
        ) : (
          <>
            {complaints.map(renderComplaintCard)}
            
            {pagination.page < pagination.totalPages && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreComplaints}>
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            )}
            
            {complaints.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={50} color="#bdc3c7" />
                <Text style={styles.emptyText}>No complaints found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search criteria</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Enhanced Filter Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleContainer}>
                <Ionicons name="filter-outline" size={24} color="#2c3e50" />
                <Text style={styles.modalTitle}>Filter Complaints</Text>
              </View>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
              {/* Search by Location */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>📍 Search by Location</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter area, landmark, or address..."
                  placeholderTextColor="#bdc3c7"
                  value={filterLocation}
                  onChangeText={setFilterLocation}
                />
              </View>

              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>🏷️ Complaint Category</Text>
                <View style={styles.modernPickerContainer}>
                  <Picker
                    selectedValue={filterCategory}
                    onValueChange={setFilterCategory}
                    style={styles.modernPicker}
                  >
                    <Picker.Item label="All Categories" value="" color="#bdc3c7" />
                    {categories.map(cat => (
                      <Picker.Item 
                        key={cat} 
                        label={cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                        value={cat} 
                      />
                    ))}
                  </Picker>
                  <Ionicons name="chevron-down" size={20} color="#7f8c8d" style={styles.pickerIcon} />
                </View>
              </View>

              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>📊 Complaint Status</Text>
                <View style={styles.modernPickerContainer}>
                  <Picker
                    selectedValue={filterStatus}
                    onValueChange={setFilterStatus}
                    style={styles.modernPicker}
                  >
                    <Picker.Item label="All Statuses" value="" color="#bdc3c7" />
                    {statusOptions.map(status => (
                      <Picker.Item 
                        key={status} 
                        label={status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                        value={status} 
                      />
                    ))}
                  </Picker>
                  <Ionicons name="chevron-down" size={20} color="#7f8c8d" style={styles.pickerIcon} />
                </View>
              </View>

              {/* Priority Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>⚡ Priority Level</Text>
                <View style={styles.modernPickerContainer}>
                  <Picker
                    selectedValue={filterPriority}
                    onValueChange={setFilterPriority}
                    style={styles.modernPicker}
                  >
                    <Picker.Item label="All Priority Levels" value="" color="#bdc3c7" />
                    {priorityOptions.map(priority => (
                      <Picker.Item 
                        key={priority.value} 
                        label={priority.label} 
                        value={priority.value} 
                      />
                    ))}
                  </Picker>
                  <Ionicons name="chevron-down" size={20} color="#7f8c8d" style={styles.pickerIcon} />
                </View>
              </View>

              {/* Date Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>📅 Date Range</Text>
                <View style={styles.modernPickerContainer}>
                  <Picker
                    selectedValue={filterDateRange}
                    onValueChange={setFilterDateRange}
                    style={styles.modernPicker}
                  >
                    <Picker.Item label="All Time" value="" color="#bdc3c7" />
                    {dateRangeOptions.map(range => (
                      <Picker.Item 
                        key={range.value} 
                        label={range.label} 
                        value={range.value} 
                      />
                    ))}
                  </Picker>
                  <Ionicons name="chevron-down" size={20} color="#7f8c8d" style={styles.pickerIcon} />
                </View>
              </View>

              {/* Assignment Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>👤 Assignment Status</Text>
                <View style={styles.modernPickerContainer}>
                  <Picker
                    selectedValue={filterAssigned}
                    onValueChange={setFilterAssigned}
                    style={styles.modernPicker}
                  >
                    <Picker.Item label="All Assignments" value="" color="#bdc3c7" />
                    {assignmentOptions.map(assignment => (
                      <Picker.Item 
                        key={assignment.value} 
                        label={assignment.label} 
                        value={assignment.value} 
                      />
                    ))}
                  </Picker>
                  <Ionicons name="chevron-down" size={20} color="#7f8c8d" style={styles.pickerIcon} />
                </View>
              </View>

              {/* Filter Summary */}
              {getActiveFilterCount() > 0 && (
                <View style={styles.filterSummary}>
                  <Text style={styles.filterSummaryTitle}>
                    🔍 Active Filters ({getActiveFilterCount()})
                  </Text>
                  <Text style={styles.filterSummaryText}>
                    {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} applied to your complaint search
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Ionicons name="refresh-outline" size={20} color="#7f8c8d" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={() => setShowFilters(false)}
              >
                <Ionicons name="checkmark-outline" size={20} color="#fff" />
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Change Modal - Modern Interface */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modernStatusModal}>
            {/* Header */}
            <View style={styles.modernModalHeader}>
              <View style={styles.headerTitleContainer}>
                <Ionicons name="settings-outline" size={24} color="#2c3e50" />
                <Text style={styles.modernModalTitle}>Update Complaint Status</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modernModalBody} showsVerticalScrollIndicator={false}>
              {/* Complaint Info Card */}
              {selectedComplaint && (
                <View style={styles.modernComplaintInfo}>
                  <View style={styles.complaintIconContainer}>
                    <Ionicons name="document-text" size={20} color="#3498db" />
                  </View>
                  <View style={styles.complaintDetails}>
                    <Text style={styles.modernComplaintTitle} numberOfLines={2}>
                      {selectedComplaint.title}
                    </Text>
                    <View style={styles.currentStatusContainer}>
                      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(selectedComplaint.status) }]} />
                      <Text style={styles.modernCurrentStatus}>
                        Current: {selectedComplaint.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Status Selection */}
              <View style={styles.modernFieldContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="flag-outline" size={16} color="#e74c3c" />
                  <Text style={styles.modernFieldLabel}>New Status *</Text>
                </View>
                <View style={styles.modernPickerContainer}>
                  <Picker
                    selectedValue={newStatus}
                    onValueChange={setNewStatus}
                    style={styles.modernPicker}
                  >
                    <Picker.Item label="Choose New Status" value="" color="#bdc3c7" />
                    <Picker.Item label="🟡 Pending" value="pending" />
                    <Picker.Item label="🔵 In Progress" value="in_progress" />
                    <Picker.Item label="🟢 Resolved" value="resolved" />
                    <Picker.Item label="🔴 Rejected" value="rejected" />
                  </Picker>
                  <Ionicons name="chevron-down-outline" size={20} color="#7f8c8d" style={styles.pickerIcon} />
                </View>
              </View>

              {/* Officer Assignment */}
              <View style={styles.modernFieldContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="person-outline" size={16} color="#3498db" />
                  <Text style={styles.modernFieldLabel}>Assign Officer</Text>
                </View>
                <View style={styles.modernPickerContainer}>
                  <Picker
                    selectedValue={selectedOfficer}
                    onValueChange={setSelectedOfficer}
                    style={styles.modernPicker}
                  >
                    <Picker.Item label="👮 Select Officer (Optional)" value="" color="#bdc3c7" />
                    {officers.map(officer => (
                      <Picker.Item 
                        key={officer.id} 
                        label={`👮 ${officer.name} - ${officer.department || 'No Dept'}`} 
                        value={officer.id.toString()} 
                      />
                    ))}
                  </Picker>
                  <Ionicons name="chevron-down-outline" size={20} color="#7f8c8d" style={styles.pickerIcon} />
                </View>
              </View>

              {/* Contractor Assignment */}
              <View style={styles.modernFieldContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="construct-outline" size={16} color="#e67e22" />
                  <Text style={styles.modernFieldLabel}>Assign Contractor</Text>
                </View>
                <View style={styles.modernPickerContainer}>
                  <Picker
                    selectedValue={selectedContractor}
                    onValueChange={setSelectedContractor}
                    style={styles.modernPicker}
                  >
                    <Picker.Item label="🔧 Select Contractor (Optional)" value="" color="#bdc3c7" />
                    {contractors.map(contractor => (
                      <Picker.Item 
                        key={contractor.id} 
                        label={`🔧 ${contractor.name}${contractor.specialization ? ` - ${contractor.specialization}` : ''}`} 
                        value={contractor.id.toString()} 
                      />
                    ))}
                  </Picker>
                  <Ionicons name="chevron-down-outline" size={20} color="#7f8c8d" style={styles.pickerIcon} />
                </View>
              </View>

              {/* Notes Section */}
              <View style={styles.modernFieldContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="document-text-outline" size={16} color="#9b59b6" />
                  <Text style={styles.modernFieldLabel}>Notes & Comments</Text>
                </View>
                <View style={styles.modernTextInputContainer}>
                  <TextInput
                    style={styles.modernNotesInput}
                    placeholder="Add notes about this status change..."
                    placeholderTextColor="#bdc3c7"
                    value={statusNotes}
                    onChangeText={setStatusNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Preview Section */}
              {newStatus && (
                <View style={styles.previewSection}>
                  <View style={styles.previewTitleRow}>
                    <Ionicons name="eye-outline" size={16} color="#27ae60" />
                    <Text style={styles.previewTitle}>Preview Changes</Text>
                  </View>
                  <View style={styles.previewContent}>
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Status:</Text>
                      <Text style={[styles.previewValue, { color: getStatusColor(newStatus) }]}>
                        {newStatus.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    {selectedOfficer && (
                      <View style={styles.previewRow}>
                        <Text style={styles.previewLabel}>Officer:</Text>
                        <Text style={styles.previewValue}>
                          {officers.find(o => o.id.toString() === selectedOfficer)?.name || 'Unknown'}
                        </Text>
                      </View>
                    )}
                    {selectedContractor && (
                      <View style={styles.previewRow}>
                        <Text style={styles.previewLabel}>Contractor:</Text>
                        <Text style={styles.previewValue}>
                          {contractors.find(c => c.id.toString() === selectedContractor)?.name || 'Unknown'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modernModalActions}>
              <TouchableOpacity 
                style={styles.modernCancelButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Ionicons name="close-outline" size={20} color="#7f8c8d" />
                <Text style={styles.modernCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modernUpdateButton, 
                  statusChangeLoading && styles.buttonDisabled,
                  !newStatus && styles.buttonDisabled
                ]}
                onPress={updateComplaintStatus}
                disabled={statusChangeLoading || !newStatus}
              >
                {statusChangeLoading ? (
                  <>
                    <Ionicons name="sync-outline" size={20} color="#fff" />
                    <Text style={styles.modernUpdateText}>Updating...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-outline" size={20} color="#fff" />
                    <Text style={styles.modernUpdateText}>Update Status</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
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
  filterButtonContainer: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f39c12',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
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
  activeFilters: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 5,
  },
  filterChipText: {
    color: '#fff',
    fontSize: 12,
    marginRight: 5,
    fontWeight: '500',
  },
  clearAllChip: {
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  clearAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  complaintCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  priorityBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 1,
  },
  priorityScore: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  complaintContent: {
    padding: 15,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 50, // Space for priority badge
  },
  complaintTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  complaintLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  complaintUser: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  progressSection: {
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  currentStageSection: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  currentStageLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  currentStageName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    marginTop: 2,
  },
  assignedOfficer: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 2,
  },
  assignedContractor: {
    fontSize: 12,
    color: '#e67e22',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    marginRight: 5,
    justifyContent: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    marginLeft: 5,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#95a5a6',
    textAlign: 'center',
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
    backgroundColor: '#3498db',
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
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
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
  filterContent: {
    padding: 20,
    maxHeight: 500,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterSummary: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27ae60',
    marginTop: 8,
  },
  filterSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 4,
  },
  filterSummaryText: {
    fontSize: 12,
    color: '#2c3e50',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  clearButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Status Modal Styles
  statusModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
  },
  statusModalBody: {
    maxHeight: 400,
  },
  complaintInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  complaintModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  currentStatus: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  pickerStyle: {
    height: 50,
    color: '#2c3e50',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
    backgroundColor: '#fff',
  },

  // Modern Status Modal Styles
  modernStatusModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 15,
    maxHeight: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modernModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
  },
  modernModalBody: {
    padding: 20,
    maxHeight: 500,
  },
  modernComplaintInfo: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  complaintIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  complaintDetails: {
    flex: 1,
  },
  modernComplaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  currentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  modernCurrentStatus: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  modernFieldContainer: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modernFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  modernPickerContainer: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    minHeight: 50,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pickerIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
    pointerEvents: 'none',
  },
  modernPicker: {
    height: 50,
    color: '#2c3e50',
    paddingHorizontal: 12,
  },
  pickerItem: {
    fontSize: 16,
    color: '#2c3e50',
    height: 50,
  },
  modernTextInputContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modernNotesInput: {
    padding: 15,
    fontSize: 14,
    color: '#2c3e50',
    minHeight: 100,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  previewSection: {
    backgroundColor: '#f0f8f0',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#d4edda',
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
    marginLeft: 8,
  },
  previewContent: {
    gap: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  previewLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  previewValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  modernModalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  modernCancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modernCancelText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
  modernUpdateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modernUpdateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#bdc3c7',
  },
});

export default PriorityQueue;
