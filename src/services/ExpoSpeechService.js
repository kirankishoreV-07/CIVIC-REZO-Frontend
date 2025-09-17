import * as Speech from 'expo-speech';

/**
 * Service wrapper for Expo's Speech API
 * Provides a consistent interface for text-to-speech functionality
 */
class ExpoSpeechService {
  constructor() {
    this.isSpeaking = false;
    this.voices = [];
    this.defaultVoice = null;
    this.defaultLanguage = 'en-US';
    this.initializeVoices();
  }

  /**
   * Initialize available voices
   */
  async initializeVoices() {
    try {
      // Get available voices from Expo Speech
      const availableVoices = await Speech.getAvailableVoicesAsync();
      
      if (availableVoices && availableVoices.length > 0) {
        this.voices = availableVoices;
        
        // Find a default voice for English
        this.defaultVoice = availableVoices.find(voice => 
          voice.language && voice.language.startsWith('en')
        );
        
        console.log(`🎙️ ExpoSpeechService initialized with ${availableVoices.length} voices`);
      } else {
        console.warn('No voices available for Expo Speech');
      }
    } catch (error) {
      console.error('Failed to initialize voices:', error);
    }
  }
  
  /**
   * Get all available voices
   * @returns {Array} List of available voice options
   */
  getVoices() {
    return this.voices;
  }
  
  /**
   * Get voices for a specific language
   * @param {string} languageCode - Language code (e.g., 'en-US', 'hi-IN')
   * @returns {Array} List of voices for the specified language
   */
  getVoicesForLanguage(languageCode) {
    if (!languageCode) return this.voices;
    
    const baseCode = languageCode.split('-')[0].toLowerCase();
    return this.voices.filter(voice => 
      voice.language && 
      (voice.language.toLowerCase() === languageCode.toLowerCase() || 
       voice.language.toLowerCase().startsWith(baseCode))
    );
  }
  
  /**
   * Speak the provided text
   * @param {string} text - Text to be spoken
   * @param {Object} options - Speech options (rate, pitch, language, voice)
   * @returns {Promise} Promise that resolves when speech is completed
   */
  async speak(text, options = {}) {
    if (!text) {
      console.warn('No text provided for speech');
      return;
    }
    
    try {
      // Stop any ongoing speech
      if (this.isSpeaking) {
        await this.stop();
      }
      
      this.isSpeaking = true;
      
      // Default options
      const speechOptions = {
        language: options.language || this.defaultLanguage,
        pitch: options.pitch || 1.0,
        rate: options.rate || 0.9,
        voice: options.voice || (this.defaultVoice ? this.defaultVoice.identifier : undefined),
        onStart: options.onStart || (() => console.log('Started speaking')),
        onDone: options.onDone || (() => {
          console.log('Finished speaking');
          this.isSpeaking = false;
        }),
        onStopped: options.onStopped || (() => {
          console.log('Speech stopped');
          this.isSpeaking = false;
        }),
        onError: options.onError || ((error) => {
          console.error('Speech error:', error);
          this.isSpeaking = false;
        })
      };
      
      // Log speech details
      console.log(`🔊 Speaking text (${speechOptions.language}): "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      
      // Start speech
      const speechId = await Speech.speak(text, speechOptions);
      return speechId;
    } catch (error) {
      console.error('Speech error:', error);
      this.isSpeaking = false;
      throw error;
    }
  }
  
  /**
   * Stop any ongoing speech
   */
  async stop() {
    try {
      await Speech.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }
  
  /**
   * Check if the device is currently speaking
   * @returns {boolean} True if speech is in progress
   */
  isCurrentlySpeaking() {
    return this.isSpeaking;
  }
  
  /**
   * Get a list of supported languages
   * @returns {Array} List of language codes and names
   */
  getSupportedLanguages() {
    // Extract unique languages from available voices
    const languageSet = new Set();
    const languages = [];
    
    this.voices.forEach(voice => {
      if (voice.language && !languageSet.has(voice.language)) {
        languageSet.add(voice.language);
        
        // Map language code to name
        const languageName = this.getLanguageName(voice.language);
        languages.push({
          code: voice.language,
          name: languageName
        });
      }
    });
    
    return languages.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  /**
   * Get a human-readable language name from a language code
   * @param {string} languageCode - Language code (e.g., 'en-US')
   * @returns {string} Human-readable language name
   */
  getLanguageName(languageCode) {
    const languageNames = {
      'en-US': 'English (US)',
      'en-GB': 'English (UK)',
      'es-ES': 'Spanish',
      'fr-FR': 'French',
      'de-DE': 'German',
      'it-IT': 'Italian',
      'ja-JP': 'Japanese',
      'ko-KR': 'Korean',
      'pt-BR': 'Portuguese (Brazil)',
      'ru-RU': 'Russian',
      'zh-CN': 'Chinese (Simplified)',
      'zh-TW': 'Chinese (Traditional)',
      'ar-SA': 'Arabic',
      'hi-IN': 'Hindi',
      'id-ID': 'Indonesian',
      'nl-NL': 'Dutch',
      'pl-PL': 'Polish',
      'sv-SE': 'Swedish',
      'tr-TR': 'Turkish',
      'th-TH': 'Thai',
      'vi-VN': 'Vietnamese'
    };
    
    return languageNames[languageCode] || languageCode;
  }
}

// Create a singleton instance
const expoSpeechService = new ExpoSpeechService();

export default expoSpeechService;
