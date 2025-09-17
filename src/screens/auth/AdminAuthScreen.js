import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const AdminAuthScreen = ({ navigation }) => {
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
          <Text style={styles.icon}>👨‍💼</Text>
          <Text style={styles.title}>Admin Portal</Text>
          <Text style={styles.subtitle}>
            Manage and oversee civic operations efficiently
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={styles.buttonText}>Admin Login</Text>
            <Text style={styles.buttonSubtext}>
              Access your administrator account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signupButton]}
            onPress={() => navigation.navigate('AdminSignup')}
          >
            <Text style={styles.buttonText}>Register as Admin</Text>
            <Text style={styles.buttonSubtext}>
              Create new administrator account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warning}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Admin accounts require approval from system administrators
          </Text>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Admin Capabilities:</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureText}>Manage all citizen complaints</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>Priority queue management</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureText}>User management system</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Analytics and reporting</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🗺️</Text>
            <Text style={styles.featureText}>City-wide complaint heatmaps</Text>
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
    color: '#1976D2',
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
    color: '#1976D2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginBottom: 20,
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
    backgroundColor: '#1976D2',
  },
  signupButton: {
    backgroundColor: '#1E88E5',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  warning: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
  },
  warningIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
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

export default AdminAuthScreen;
