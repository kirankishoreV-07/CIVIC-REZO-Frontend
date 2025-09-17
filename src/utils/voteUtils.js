import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Get guest vote status from local storage
 */
const getGuestVoteStatus = async (complaintId) => {
  try {
    const guestVotes = await AsyncStorage.getItem('guestVotes');
    if (guestVotes) {
      const votesMap = JSON.parse(guestVotes);
      return votesMap[complaintId] || false;
    }
    return false;
  } catch (error) {
    console.error('❌ Error getting guest vote status:', error);
    return false;
  }
};

// Utility function to refetch vote count for a specific complaint
export const refetchComplaintVotes = async (complaintId, apiClient) => {
  try {
    console.log(`🔄 Refetching votes for complaint: ${complaintId}`);
    
    const response = await fetch(`${apiClient.baseUrl}/api/complaints/${complaintId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiClient.token || ''}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.complaint) {
      console.log(`✅ Refetched vote count: ${data.complaint.vote_count}`);
      
      // For authenticated users, use server response
      // For guest users, check local storage for vote status
      let userVoted = data.complaint.userVoted || false;
      
      // If not authenticated (userVoted is false), check guest vote status
      if (!userVoted) {
        const guestVoted = await getGuestVoteStatus(complaintId);
        userVoted = guestVoted;
        console.log(`🔍 Guest vote status for complaint ${complaintId}: ${guestVoted}`);
      }
      
      return {
        success: true,
        voteCount: data.complaint.vote_count || 0,
        userVoted: userVoted
      };
    } else {
      throw new Error('Invalid response format');
    }
    
  } catch (error) {
    console.error('❌ Error refetching complaint votes:', error);
    return {
      success: false,
      error: error.message
    };
  }
};