import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Toggle guest vote status in local storage
 * @param {string} complaintId - The ID of the complaint
 */
const toggleGuestVoteStatus = async (complaintId) => {
  try {
    const guestVotes = await AsyncStorage.getItem('guestVotes');
    let votesMap = guestVotes ? JSON.parse(guestVotes) : {};
    
    // Toggle the vote status
    votesMap[complaintId] = !votesMap[complaintId];
    
    await AsyncStorage.setItem('guestVotes', JSON.stringify(votesMap));
    console.log(`📱 Guest vote toggled for complaint ${complaintId}: ${votesMap[complaintId]}`);
    
    return votesMap[complaintId];
  } catch (error) {
    console.error('❌ Error toggling guest vote status:', error);
    return false;
  }
};

/**
 * Generate a unique device ID for guest voting
 * This creates a persistent identifier for the device
 */
export const getDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem('deviceId');
    
    if (!deviceId) {
      // Generate a unique device ID
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const platform = Platform.OS;
      deviceId = `${platform}-${timestamp}-${random}`;
      
      await AsyncStorage.setItem('deviceId', deviceId);
      console.log('📱 Generated new device ID:', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('❌ Error getting device ID:', error);
    // Fallback to a temporary ID if storage fails
    return `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
};

/**
 * Enhanced voting function that handles both authenticated and guest voting
 * @param {string} complaintId - The ID of the complaint to vote on
 * @param {object} apiClient - API client configuration
 * @param {function} makeApiCall - Function to make API calls
 */
export const handleVoting = async (complaintId, apiClient, makeApiCall) => {
  try {
    console.log('🗳️ Starting vote process for complaint:', complaintId);
    
    // First, try authenticated voting
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (authToken) {
        console.log('🔐 Attempting authenticated vote...');
        const voteResponse = await makeApiCall(
          `${apiClient.baseUrl}/api/complaints/vote`,
          {
            method: 'POST',
            body: JSON.stringify({
              complaintId
            })
          }
        );
        
        if (voteResponse.success) {
          console.log('✅ Authenticated vote successful');
          return voteResponse;
        }
      }
    } catch (authError) {
      console.log('⚠️ Authenticated voting failed, trying guest voting:', authError.message);
      
      // If authentication error, try guest voting
      if (authError.message.includes('Authentication required') || 
          authError.message.includes('401') ||
          authError.message.includes('Unauthorized')) {
        
        console.log('🔄 Falling back to guest voting...');
        const deviceId = await getDeviceId();
        
        const guestVoteResponse = await makeApiCall(
          `${apiClient.baseUrl}/api/guest-votes`,
          {
            method: 'POST',
            body: JSON.stringify({
              complaintId,
              deviceId
            })
          }
        );
        
        if (guestVoteResponse.success) {
          console.log('✅ Guest vote successful');
          // Update local storage to track this guest vote
          await toggleGuestVoteStatus(complaintId);
          return guestVoteResponse;
        } else {
          throw new Error(guestVoteResponse.message || 'Guest voting failed');
        }
      } else {
        // Re-throw if it's not an authentication error
        throw authError;
      }
    }
    
    // If we reach here without success, try guest voting as final fallback
    console.log('🔄 Final fallback to guest voting...');
    const deviceId = await getDeviceId();
    
    const guestVoteResponse = await makeApiCall(
      `${apiClient.baseUrl}/api/guest-votes`,
      {
        method: 'POST',
        body: JSON.stringify({
          complaintId,
          deviceId
        })
      }
    );
    
    if (guestVoteResponse.success) {
      console.log('✅ Fallback guest vote successful');
      // Update local storage to track this guest vote
      await toggleGuestVoteStatus(complaintId);
      return guestVoteResponse;
    } else {
      throw new Error(guestVoteResponse.message || 'All voting methods failed');
    }
    
  } catch (error) {
    console.error('❌ Error in voting process:', error);
    throw error;
  }
};

/**
 * Get vote status for current user/device
 * @param {string} complaintId - The ID of the complaint
 * @param {object} apiClient - API client configuration
 * @param {function} makeApiCall - Function to make API calls (optional, uses fetch if not provided)
 */
export const getVoteStatus = async (complaintId, apiClient, makeApiCall = null) => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    
    if (authToken && makeApiCall) {
      // Try to get authenticated vote status first
      try {
        const response = await makeApiCall(
          `${apiClient.baseUrl}/api/complaints/${complaintId}/vote-status`
        );
        
        if (response.success) {
          return response.data;
        }
      } catch (authError) {
        console.log('⚠️ Authenticated vote status check failed, trying guest status');
      }
    }
    
    // Fallback to guest vote status
    const deviceId = await getDeviceId();
    const response = await fetch(
      `${apiClient.baseUrl}/api/guest-votes/status/${complaintId}?deviceId=${deviceId}`
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to get vote status');
    }
    
  } catch (error) {
    console.error('❌ Error getting vote status:', error);
    // Return default status if all methods fail
    return {
      complaintId,
      voteCount: 0,
      userVoteStatus: {
        hasVoted: false,
        voteType: null,
        isActive: false
      }
    };
  }
};
