import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const CitizenAuthScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.title}>Citizen Portal</Text>
          <Text style={styles.subtitle}>
            Join thousands of citizens making their city better
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('CitizenLogin')}
          >
            <Text style={styles.buttonText}>Login to Account</Text>
            <Text style={styles.buttonSubtext}>
              Access your existing citizen account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signupButton]}
            onPress={() => navigation.navigate('CitizenSignup')}
          >
            <Text style={styles.buttonText}>Create New Account</Text>
            <Text style={styles.buttonSubtext}>
              Register as a new citizen user
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>What you can do:</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📝</Text>
            <Text style={styles.featureText}>Submit and track complaints</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>View complaint analytics</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🗺️</Text>
            <Text style={styles.featureText}>Explore complaint heatmaps</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureText}>Chat with AI assistant</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButton: {
    backgroundColor: '#2E7D32',
  },
  signupButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#E8F5E8',
    textAlign: 'center',
  },
  features: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 25,
  },
  featureText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
});

export default CitizenAuthScreen;
