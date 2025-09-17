import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SimpleChatbotButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name="robot-happy" size={30} color="#fff" />
      <Text style={styles.buttonText}>Help</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#3498db',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 1000,
  },
  buttonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default SimpleChatbotButton;
