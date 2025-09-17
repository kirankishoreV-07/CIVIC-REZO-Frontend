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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, makeApiCall } from '../../../config/supabase';
import EnvironmentalTheme from '../../theme/EnvironmentalTheme';

const CitizenLoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await makeApiCall(apiClient.auth.login, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.success) {
        // Verify user type is citizen
        if (response.data.user.userType !== 'citizen') {
          Alert.alert('Access Denied', 'This is the citizen portal. Please use the admin portal to login as an administrator.');
          setLoading(false);
          return;
        }

        // Store auth token and user data
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

        Alert.alert('Success', 'Login successful!');
        navigation.replace('InstagramFeed');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={EnvironmentalTheme.primary.main} />
      
      {/* Environmental Header Gradient */}
      <LinearGradient
        colors={EnvironmentalTheme.gradients.forest}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="leaf" size={48} color="#ffffff" />
            </View>
            <Text style={styles.title}>EcoReports</Text>
            <Text style={styles.subtitle}>Citizen Portal - Join the green movement</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[EnvironmentalTheme.neutral.white, EnvironmentalTheme.primary.surface]}
          style={styles.formCard}
        >
          <View style={styles.formHeader}>
            <Ionicons name="person-circle" size={32} color={EnvironmentalTheme.primary.main} />
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to continue your environmental journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color={EnvironmentalTheme.primary.main} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={EnvironmentalTheme.neutral.gray500}
              />
            </View>

            <View style={styles.passwordContainer}>
              <Ionicons name="lock-closed" size={20} color={EnvironmentalTheme.primary.main} />
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                placeholderTextColor={EnvironmentalTheme.neutral.gray500}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye' : 'eye-off'} 
                  size={20} 
                  color={EnvironmentalTheme.neutral.gray500} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? [EnvironmentalTheme.neutral.gray300, EnvironmentalTheme.neutral.gray300] : [EnvironmentalTheme.primary.main, EnvironmentalTheme.primary.light]}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="log-in" size={20} color="#ffffff" />
                    <Text style={styles.buttonText}>Login</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('CitizenSignup')}
            >
              <Text style={styles.linkText}>
                Don't have an account? 
              </Text>
              <Text style={styles.linkTextBold}> Create one</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => Alert.alert('Forgot Password', 'Environmental password reset coming soon.')}
            >
              <Ionicons name="help-circle" size={16} color={EnvironmentalTheme.secondary.main} />
              <Text style={styles.forgotText}> Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.footer}>
          <View style={styles.footerCard}>
            <Ionicons name="business" size={20} color={EnvironmentalTheme.secondary.main} />
            <Text style={styles.footerText}>Need admin access? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
              <Text style={styles.footerLink}>Switch to Admin Portal</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EnvironmentalTheme.neutral.light,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: EnvironmentalTheme.spacing.xl,
    borderBottomLeftRadius: EnvironmentalTheme.borderRadius.xl,
    borderBottomRightRadius: EnvironmentalTheme.borderRadius.xl,
  },
  headerContent: {
    paddingHorizontal: EnvironmentalTheme.spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: EnvironmentalTheme.spacing.lg,
  },
  backButtonText: {
    ...EnvironmentalTheme.typography.body1,
    color: EnvironmentalTheme.neutral.white,
    fontWeight: '500',
    marginLeft: EnvironmentalTheme.spacing.xs,
  },
  header: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: EnvironmentalTheme.spacing.md,
  },
  title: {
    ...EnvironmentalTheme.typography.h1,
    color: EnvironmentalTheme.neutral.white,
    marginBottom: EnvironmentalTheme.spacing.xs,
  },
  subtitle: {
    ...EnvironmentalTheme.typography.body1,
    color: EnvironmentalTheme.neutral.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: EnvironmentalTheme.spacing.lg,
    marginTop: -15,
  },
  formCard: {
    borderRadius: EnvironmentalTheme.borderRadius.xl,
    padding: EnvironmentalTheme.spacing.xl,
    marginBottom: EnvironmentalTheme.spacing.lg,
    ...EnvironmentalTheme.shadows.medium,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: EnvironmentalTheme.spacing.xl,
  },
  formTitle: {
    ...EnvironmentalTheme.typography.h3,
    color: EnvironmentalTheme.neutral.black,
    marginTop: EnvironmentalTheme.spacing.sm,
    marginBottom: EnvironmentalTheme.spacing.xs,
  },
  formSubtitle: {
    ...EnvironmentalTheme.typography.body2,
    color: EnvironmentalTheme.neutral.gray700,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EnvironmentalTheme.neutral.white,
    borderWidth: 2,
    borderColor: EnvironmentalTheme.neutral.gray200,
    borderRadius: EnvironmentalTheme.borderRadius.md,
    paddingHorizontal: EnvironmentalTheme.spacing.md,
    marginBottom: EnvironmentalTheme.spacing.md,
    ...EnvironmentalTheme.shadows.small,
  },
  input: {
    flex: 1,
    padding: EnvironmentalTheme.spacing.md,
    ...EnvironmentalTheme.typography.body1,
    marginLeft: EnvironmentalTheme.spacing.sm,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EnvironmentalTheme.neutral.white,
    borderWidth: 2,
    borderColor: EnvironmentalTheme.neutral.gray200,
    borderRadius: EnvironmentalTheme.borderRadius.md,
    paddingHorizontal: EnvironmentalTheme.spacing.md,
    marginBottom: EnvironmentalTheme.spacing.lg,
    ...EnvironmentalTheme.shadows.small,
  },
  passwordInput: {
    flex: 1,
    padding: EnvironmentalTheme.spacing.md,
    ...EnvironmentalTheme.typography.body1,
    marginLeft: EnvironmentalTheme.spacing.sm,
  },
  eyeButton: {
    padding: EnvironmentalTheme.spacing.sm,
  },
  button: {
    borderRadius: EnvironmentalTheme.borderRadius.md,
    marginBottom: EnvironmentalTheme.spacing.lg,
    ...EnvironmentalTheme.shadows.medium,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: EnvironmentalTheme.spacing.lg,
  },
  buttonText: {
    ...EnvironmentalTheme.typography.body1,
    color: EnvironmentalTheme.neutral.white,
    fontWeight: 'bold',
    marginLeft: EnvironmentalTheme.spacing.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: EnvironmentalTheme.spacing.md,
  },
  linkText: {
    ...EnvironmentalTheme.typography.body1,
    color: EnvironmentalTheme.neutral.gray700,
  },
  linkTextBold: {
    ...EnvironmentalTheme.typography.body1,
    color: EnvironmentalTheme.primary.main,
    fontWeight: '600',
  },
  forgotText: {
    ...EnvironmentalTheme.typography.body1,
    color: EnvironmentalTheme.secondary.main,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginBottom: EnvironmentalTheme.spacing.lg,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EnvironmentalTheme.neutral.white,
    padding: EnvironmentalTheme.spacing.lg,
    borderRadius: EnvironmentalTheme.borderRadius.lg,
    ...EnvironmentalTheme.shadows.small,
  },
  footerText: {
    ...EnvironmentalTheme.typography.body2,
    color: EnvironmentalTheme.neutral.gray700,
    marginLeft: EnvironmentalTheme.spacing.sm,
  },
  footerLink: {
    ...EnvironmentalTheme.typography.body2,
    color: EnvironmentalTheme.secondary.main,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: EnvironmentalTheme.spacing.lg,
  },
});

export default CitizenLoginScreen;
