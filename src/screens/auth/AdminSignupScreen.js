import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { apiClient, makeApiCall } from '../../../config/supabase';

const AdminSignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    department: '',
    employeeId: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.fullName || 
        !formData.phoneNumber || !formData.department || !formData.employeeId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Admin password must be at least 8 characters long');
      return false;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    // Admin email validation (should end with gov domain or organization domain)
    if (!formData.email.includes('gov') && !formData.email.includes('civic')) {
      Alert.alert(
        'Warning', 
        'Admin accounts typically use government or organizational email addresses. Continue anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => null }
        ]
      );
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Admin Registration',
      'Admin accounts require approval. Your registration will be reviewed by system administrators.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed', 
          onPress: async () => {
            setLoading(true);
            try {
              const signupData = {
                ...formData,
                userType: 'admin', // Ensure this is always admin
                address: `Department: ${formData.department}, Employee ID: ${formData.employeeId}`,
              };
              delete signupData.confirmPassword;
              delete signupData.department;
              delete signupData.employeeId;

              const response = await makeApiCall(apiClient.auth.signup, {
                method: 'POST',
                body: JSON.stringify(signupData),
              });

              if (response.success) {
                Alert.alert(
                  'Registration Submitted',
                  'Your admin registration has been submitted for approval. You will be notified once your account is activated.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('AdminLogin'),
                    },
                  ]
                );
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Registration failed');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

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
          <Text style={styles.title}>Admin Registration</Text>
          <Text style={styles.subtitle}>Request administrator access</Text>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Admin registrations require approval from system administrators. 
            Please provide accurate information for verification.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Official Email Address *"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Department *"
            value={formData.department}
            onChangeText={(value) => handleInputChange('department', value)}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Employee ID *"
            value={formData.employeeId}
            onChangeText={(value) => handleInputChange('employeeId', value)}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password (min 8 characters) *"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry={!showPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Required for Admin Access:</Text>
            <Text style={styles.infoText}>• Valid government/organizational email</Text>
            <Text style={styles.infoText}>• Official department information</Text>
            <Text style={styles.infoText}>• Employee identification</Text>
            <Text style={styles.infoText}>• Verification by system admin</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit Admin Registration</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={styles.linkText}>
              Already have admin access? Login here
            </Text>
          </TouchableOpacity>
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
    marginBottom: 25,
  },
  icon: {
    fontSize: 50,
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
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    flexDirection: 'row',
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
    lineHeight: 20,
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
  },
  eyeIcon: {
    fontSize: 20,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 3,
  },
  button: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  linkText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminSignupScreen;
