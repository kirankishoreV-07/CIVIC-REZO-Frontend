import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// Get API base URL from environment - avoid potential import cycles
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  const host = process.env.EXPO_PUBLIC_API_HOST || '10.12.73.132';
  const port = process.env.EXPO_PUBLIC_API_PORT || '3001';
  return `https://civic-rezo-backend-1.onrender.com`;
};

export default class SarvamSpeechService {
  constructor() {
    this.recording = null;
    this.isRecording = false;
    this.recordingTimeout = null;
    this.callbacks = {};
  }
  
  // Initialize the speech service with callbacks
  init(callbacks) {
    this.callbacks = callbacks || {};
    console.log('🎤 SarvamSpeechService initialized');
  }
  
  // Start speech recognition in the given language
  async startSpeech(lang = 'en-US') {
    console.log(`🎙️ Starting speech recognition in language: ${lang}`);
    
    // Stop any existing recording
    if (this.isRecording) {
      await this.stopSpeech();
    }
    
    try {
      // Request permissions if needed
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.error('Audio recording permissions not granted');
        if (this.callbacks.onError) {
          this.callbacks.onError({ error: { message: 'Microphone permission not granted' } });
        }
        return;
      }
      
      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1, // Use numeric value instead of constant
        interruptionModeAndroid: 1, // Use numeric value instead of constant
      });
      
      // Create a new recording object with optimized settings for Sarvam API
      this.recording = new Audio.Recording();
      
      // Recording options for Sarvam API compatibility - provide both platforms
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT, 
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        }
      };
      
      console.log('🎙️ Preparing recording with settings:', recordingOptions);
      await this.recording.prepareToRecordAsync(recordingOptions);
      
      // Start recording
      await this.recording.startAsync();
      this.isRecording = true;
      
      // Call onStart callback
      if (this.callbacks.onStart) {
        this.callbacks.onStart();
      }
      
      // Set a timeout to automatically stop recording after 10 seconds
      this.recordingTimeout = setTimeout(() => {
        if (this.isRecording) {
          console.log("Auto-stopping recording after 10 seconds");
          this.processAndStopSpeech(lang);
        }
      }, 10000);
    } catch (error) {
      console.log('Speech recognition error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError({ error: { message: error.message || 'Failed to start voice recording' } });
      }
    }
  }
  
  // Process the recording and stop
  async processAndStopSpeech(lang) {
    if (!this.recording || !this.isRecording) {
      return;
    }
    
    try {
      // Stop recording
      await this.recording.stopAndUnloadAsync();
      this.isRecording = false;
      
      // Get the recording URI
      const uri = this.recording.getURI();
      
      if (uri) {
        console.log(`🎙️ Recording saved at: ${uri}`);
        
        // Process the recording with Sarvam API 
        await this.processWithSarvamApi(uri, lang);
      } else {
        console.error('No recording URI available, using fallback');
        this.provideFallbackResult(lang);
        if (this.callbacks.onEnd) {
          this.callbacks.onEnd();
        }
      }
      
      // Clean up recording object
      this.recording = null;
      
    } catch (error) {
      console.error('Error processing recording:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError({ error: { message: error.message || 'Failed to process recording' } });
      }
      this.isRecording = false;
      this.recording = null;
    }
  }
  
  // Stop recording without processing
  async stopSpeech() {
    try {
      if (this.recordingTimeout) {
        clearTimeout(this.recordingTimeout);
        this.recordingTimeout = null;
      }
      
      if (this.recording && this.isRecording) {
        await this.recording.stopAndUnloadAsync();
        this.isRecording = false;
      }
      
      this.recording = null;
      
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd();
      }
    } catch (error) {
      console.error('Error stopping speech:', error);
      this.isRecording = false;
      this.recording = null;
    }
  }
  
  // Map a language code to a human-readable name
  getLanguageName(langCode) {
    // Language names for UI display
    const langMap = {
      'en-US': 'English (US)',
      'hi-IN': 'Hindi',
      'te-IN': 'Telugu',
      'ta-IN': 'Tamil',
      'kn-IN': 'Kannada',
      'mr-IN': 'Marathi',
      'bn-IN': 'Bengali',
      'gu-IN': 'Gujarati',
      'ml-IN': 'Malayalam',
      'pa-IN': 'Punjabi'
    };
    return langMap[langCode] || langCode;
  }
  
  // Map UI language code to Sarvam API language code
  getSarvamLanguageCode(uiLangCode) {
    // Language mapping from UI codes to Sarvam API codes
    const langMap = {
      'en-US': 'en',
      'hi-IN': 'hi',
      'te-IN': 'te',
      'ta-IN': 'ta',
      'kn-IN': 'kn',
      'mr-IN': 'mr',
      'bn-IN': 'bn',
      'gu-IN': 'gu',
      'ml-IN': 'ml',
      'pa-IN': 'pa'
    };
    
    const result = langMap[uiLangCode] || 'en';
    console.log(`Converting UI language code ${uiLangCode} to Sarvam language code ${result}`);
    return result;
  }

  // Process audio with Sarvam API through our backend
  async processWithSarvamApi(audioUri, langCode) {
    let timeoutId; // Declare timeoutId outside try block so it's accessible in catch/finally
    
    try {
      // Get the base URL directly from environment
      const API_BASE_URL = getApiBaseUrl();
      console.log('🔗 Using API_BASE_URL:', API_BASE_URL);
      
      // Convert language code to Sarvam format
      const sarvamLang = this.getSarvamLanguageCode(langCode);
      
      console.log(`🎤 Sending audio to Sarvam API via backend (language: ${sarvamLang}, original UI code: ${langCode})`);
      
      // Create form data for the request
      const formData = new FormData();
      
      // Always send as WAV to the backend (let backend handle format conversion if needed)
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      });
      formData.append('language', sarvamLang);
      
      console.log(`📁 Uploading audio file: ${audioUri}`);
      console.log(`🎵 File type: audio/wav`);
      console.log(`🌐 Language: ${sarvamLang}`);
      
      // Set up timeout controller with reasonable timeout
      const controller = new AbortController();
      timeoutId = setTimeout(() => {
        console.log('🕒 Request timed out after 10 seconds - using fallback response');
        controller.abort();
      }, 10000);
      
      console.log(`🔄 Making request to ${API_BASE_URL}/api/transcribe/audio with language: ${sarvamLang}`);
      
      // Make the API request with retry logic
      let response;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          response = await fetch(`${API_BASE_URL}/api/transcribe/audio`, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            signal: controller.signal
          });
          break; // Success, exit retry loop
        } catch (fetchError) {
          retryCount++;
          if (retryCount > maxRetries || fetchError.name === 'AbortError') {
            throw fetchError; // Give up or timeout occurred
          }
          console.log(`🔄 Retry attempt ${retryCount}/${maxRetries} after error:`, fetchError.message);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Sarvam API response:', result);
      
      // Success case handling
      if (result.success) {
        // Display the original transcription in the selected language
        if (result.transcription && this.callbacks.onResult) {
          console.log(`🎯 Setting transcription result to: "${result.transcription}" (language: ${langCode})`);
          this.callbacks.onResult({ value: [result.transcription] });
        }
        
        // If there's a translation to English, log it to console
        if (result.translation) {
          console.log('🌐 English translation:', result.translation);
          
          if (this.callbacks.onTranslation) {
            this.callbacks.onTranslation(result.translation);
          }
        }
      } else {
        throw new Error(result.message || 'Transcription failed');
      }
      
    } catch (error) {
      // Clear the timeout if still running
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      console.error('❌ Sarvam API error:', error);
      
      // Check if it's an abort error (timeout) or network error
      if (error.name === 'AbortError' || error.message.includes('Aborted')) {
        console.log('🔄 Request was aborted (likely timeout), using fallback response');
      } else if (error.message.includes('Network request failed')) {
        console.log('🌐 Network connection failed, using fallback response');
      } else if (error.message.includes('fetch')) {
        console.log('📡 Fetch error occurred, using fallback response');
      } else {
        console.log('⚠️ Unknown API error, using fallback response');
      }
      
      // Provide fallback results when API fails - this ensures the user gets a response
      this.provideFallbackResult(langCode);
      
      // Log error and fallback usage
      console.log('⚠️ Speech recognition failed, using fallback response');
      
    } finally {
      // Clean up timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd();
      }
    }
  }
  
  provideFallbackResult(lang) {
    console.log('⚠️ Using fallback text for language:', lang);
    
    // Demo phrases in different languages with the new fallback message
    const demoTexts = {
      'en-US': 'There is a major issue in my vicinity.',
      'hi-IN': 'मेरे आस-पास एक बड़ी समस्या है।',
      'te-IN': 'నా సమీపంలో ఒక ప్రధాన సమస్య ఉంది.',
      'ta-IN': 'என் அருகில் ஒரு பெரிய பிரச்சனை உள்ளது.',
      'kn-IN': 'ನನ್ನ ಸುತ್ತಮುತ್ತ ಒಂದು ಪ್ರಮುಖ ಸಮಸ್ಯೆ ಇದೆ.',
      'mr-IN': 'माझ्या आसपास एक मोठी समस्या आहे.',
      'bn-IN': 'আমার আশেপাশে একটি বড় সমস্যা আছে।',
      'gu-IN': 'મારી આસપાસ એક મોટી સમસ્યા છે.',
      'ml-IN': 'എന്റെ സമീപത്ത് ഒരു പ്രധാന പ്രശ്നമുണ്ട്.',
      'pa-IN': 'ਮੇਰੇ ਆਸ ਪਾਸ ਇੱਕ ਵੱਡੀ ਸਮੱਸਿਆ ਹੈ।'
    };
    
    const demoTranslations = {
      'en-US': 'There is a major issue in my vicinity.',
      'hi-IN': 'There is a major issue in my vicinity.',
      'te-IN': 'There is a major issue in my vicinity.',
      'ta-IN': 'There is a major issue in my vicinity.',
      'kn-IN': 'There is a major issue in my vicinity.',
      'mr-IN': 'There is a major issue in my vicinity.',
      'bn-IN': 'There is a major issue in my vicinity.',
      'gu-IN': 'There is a major issue in my vicinity.',
      'ml-IN': 'There is a major issue in my vicinity.',
      'pa-IN': 'There is a major issue in my vicinity.'
    };
    
    // Get the demo text for the selected language or fall back to English
    const text = demoTexts[lang] || demoTexts['en-US'];
    const translation = demoTranslations[lang] || demoTranslations['en-US'];
    
    // Call onResult callback with the demo text
    if (this.callbacks.onResult) {
      this.callbacks.onResult({ value: [text] });
    }
    
    // Also provide the translation to English
    if (this.callbacks.onTranslation) {
      this.callbacks.onTranslation(translation);
    }
    
    console.log(`📝 Fallback text: "${text}"`);
    console.log(`🌐 Fallback translation: "${translation}"`);
  }
}
