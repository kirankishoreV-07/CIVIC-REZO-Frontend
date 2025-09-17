import React, { useRef, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
  Text,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FloatingChatbotButton = ({ onPress, style }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    // Simple pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    // Hide tooltip after 5 seconds
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    return () => {
      pulseAnimation.stop();
      clearTimeout(tooltipTimer);
    };
  }, []);

  const handlePress = () => {
    setShowTooltip(false);
    onPress();
  };

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      {/* Pulse Ring */}
      <Animated.View 
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulseAnim }],
          }
        ]} 
      />
      
      {/* Main Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityLabel="Open CivicStack Assistant"
        accessibilityHint="Get help with app features and civic issues"
      >
        <MaterialCommunityIcons 
          name="robot-happy" 
          size={32} 
          color="#fff" 
        />
        
        {/* Help Badge */}
        <View style={styles.helpBadge}>
          <MaterialCommunityIcons name="help" size={12} color="#fff" />
        </View>
      </TouchableOpacity>
      
      {/* Tooltip */}
      {showTooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>Need help? Ask me!</Text>
          <View style={styles.tooltipArrow} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.3)',
    top: -10,
    left: -10,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  helpBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 15,
  },
  tooltip: {
    position: 'absolute',
    bottom: 75,
    right: -10,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    right: 25,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0, 0, 0, 0.85)',
  },
});

export default FloatingChatbotButton;
