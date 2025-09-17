import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LocationService from '../services/LocationService';

const LocationPrivacySelector = ({ 
  complaintType = 'general', 
  onLocationSelect, 
  onPrivacyLevelChange,
  visible = true 
}) => {
  const [selectedPrivacyLevel, setSelectedPrivacyLevel] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    // Get recommended privacy level for complaint type
    const recommendedLevel = LocationService.getRecommendedPrivacyLevel(complaintType);
    setSelectedPrivacyLevel(recommendedLevel);
  }, [complaintType]);

  const privacyLevels = [
    {
      level: LocationService.privacyLevels.EXACT,
      title: 'Exact Location',
      subtitle: 'Precise coordinates (±5-10m)',
      icon: '📍',
      color: '#FF4444',
      description: 'For urgent infrastructure issues requiring immediate emergency response',
      recommended: ['fire_hazard', 'electrical_danger', 'sewage_overflow']
    },
    {
      level: LocationService.privacyLevels.STREET,
      title: 'Street-Level',
      subtitle: 'Street accuracy (±25m)',
      icon: '🛣️',
      color: '#4CAF50',
      description: 'For general civic complaints and routine maintenance issues',
      recommended: ['pothole', 'broken_streetlight', 'traffic_signal', 'garbage_collection', 'others']
    }
  ];

  const handleLocationCapture = async () => {
    if (!selectedPrivacyLevel) {
      Alert.alert('Privacy Level Required', 'Please select a privacy level first.');
      return;
    }

    setIsLoading(true);
    try {
      const location = await LocationService.getLocationWithPrivacy(
        selectedPrivacyLevel, 
        complaintType
      );
      
      setCurrentLocation(location);
      onLocationSelect?.(location);
      onPrivacyLevelChange?.(selectedPrivacyLevel);
      
      // Validate location accuracy for complaint type
      const validation = LocationService.validateLocationAccuracy(location, complaintType);
      if (!validation.isAccurate) {
        Alert.alert('Location Accuracy', validation.message);
      }
      
    } catch (error) {
      Alert.alert('Location Error', error.message);
    }
    setIsLoading(false);
  };

  const selectPrivacyLevel = (level) => {
    setSelectedPrivacyLevel(level);
    setCurrentLocation(null); // Clear previous location when privacy level changes
  };

  const getRecommendationBadge = (levelConfig) => {
    if (levelConfig.recommended.includes(complaintType)) {
      return (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
      );
    }
    return null;
  };

  const PrivacyInfoModal = () => (
    <Modal
      visible={showPrivacyModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPrivacyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Location Privacy Levels</Text>
          
          {privacyLevels.map((levelConfig) => (
            <View key={levelConfig.level} style={styles.modalItem}>
              <Text style={styles.modalItemTitle}>
                {levelConfig.icon} {levelConfig.title}
              </Text>
              <Text style={styles.modalItemDescription}>
                {levelConfig.description}
              </Text>
              <Text style={styles.modalItemSubtitle}>
                Accuracy: {levelConfig.subtitle}
              </Text>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowPrivacyModal(false)}
          >
            <Text style={styles.modalCloseText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Location Privacy Settings</Text>
        <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
          <Icon name="info-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Choose location accuracy for your {complaintType} complaint
      </Text>

      <View style={styles.privacyLevels}>
        {privacyLevels.map((levelConfig) => (
          <TouchableOpacity
            key={levelConfig.level}
            style={[
              styles.privacyOption,
              selectedPrivacyLevel === levelConfig.level && styles.selectedOption,
              { borderColor: levelConfig.color }
            ]}
            onPress={() => selectPrivacyLevel(levelConfig.level)}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionIcon}>{levelConfig.icon}</Text>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{levelConfig.title}</Text>
                <Text style={styles.optionSubtitle}>{levelConfig.subtitle}</Text>
              </View>
              {getRecommendationBadge(levelConfig)}
            </View>
            <Text style={styles.optionDescription}>
              {levelConfig.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.captureButton,
          !selectedPrivacyLevel && styles.disabledButton,
          isLoading && styles.loadingButton
        ]}
        onPress={handleLocationCapture}
        disabled={!selectedPrivacyLevel || isLoading}
      >
        <Icon 
          name={isLoading ? "hourglass-empty" : "location-on"} 
          size={20} 
          color="#FFF" 
        />
        <Text style={styles.captureButtonText}>
          {isLoading ? 'Getting Location...' : 'Capture Location'}
        </Text>
      </TouchableOpacity>

      {currentLocation && (
        <View style={styles.locationPreview}>
          <Text style={styles.previewTitle}>Location Captured</Text>
          <Text style={styles.previewText}>
            📍 Accuracy: ±{currentLocation.radiusM}m ({currentLocation.precision})
          </Text>
          <Text style={styles.previewText}>
            🔒 Privacy: {currentLocation.description}
          </Text>
          <Text style={styles.coordsText}>
            {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      <PrivacyInfoModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  privacyLevels: {
    marginBottom: 16,
  },
  privacyOption: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedOption: {
    borderWidth: 2,
    backgroundColor: '#f0f8ff',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  optionDescription: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    lineHeight: 18,
  },
  recommendedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  captureButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loadingButton: {
    backgroundColor: '#FF9800',
  },
  captureButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  locationPreview: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 2,
  },
  coordsText: {
    fontSize: 11,
    color: '#555',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalItemDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  modalItemSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  modalCloseButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LocationPrivacySelector;
