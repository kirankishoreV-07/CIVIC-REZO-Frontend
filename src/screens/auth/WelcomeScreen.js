import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>🏛️</Text>
          <Text style={styles.title}>CivicStack</Text>
          <Text style={styles.subtitle}>
            Your Voice, Your City, Your Change
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.citizenButton]}
            onPress={() => navigation.navigate('CitizenAuth')}
          >
            <Text style={styles.buttonIcon}>👤</Text>
            <Text style={styles.buttonText}>Continue as Citizen</Text>
            <Text style={styles.buttonSubtext}>
              Report complaints and track progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.adminButton]}
            onPress={() => navigation.navigate('AdminAuth')}
          >
            <Text style={styles.buttonIcon}>👨‍💼</Text>
            <Text style={styles.buttonText}>Continue as Admin</Text>
            <Text style={styles.buttonSubtext}>
              Manage complaints and oversee operations
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Key Features</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤖</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>AI-Powered Analysis</Text>
              <Text style={styles.featureDesc}>
                Smart complaint verification and emotion analysis
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🗺️</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Location-Based</Text>
              <Text style={styles.featureDesc}>
                Interactive maps and location-specific insights
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌐</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Multilingual Support</Text>
              <Text style={styles.featureDesc}>
                Support for multiple Indian languages
              </Text>
            </View>
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 6,
  },
  citizenButton: {
    backgroundColor: '#2E7D32',
  },
  adminButton: {
    backgroundColor: '#1976D2',
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 8,
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
    paddingHorizontal: 20,
  },
  features: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
  },
});

export default WelcomeScreen;
