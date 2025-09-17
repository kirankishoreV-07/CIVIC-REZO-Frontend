import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const CustomTextInput = ({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  maxLength = 1000,
  style,
  ...props
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempText, setTempText] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setTempText(value || '');
  }, [value]);

  const openModal = () => {
    setTempText(value || '');
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const saveText = () => {
    onChangeText(tempText);
    setIsModalVisible(false);
  };

  const cancelEdit = () => {
    setTempText(value || '');
    setIsModalVisible(false);
  };

  return (
    <View style={style}>
      {/* Display Input */}
      <TouchableOpacity 
        style={[
          styles.displayInput,
          multiline && styles.displayInputMultiline
        ]}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.displayText,
          !value && styles.placeholderText,
          multiline && styles.multilineText
        ]} numberOfLines={multiline ? 3 : 1}>
          {value || placeholder}
        </Text>
        <View style={styles.editIconContainer}>
          <Ionicons 
            name="create-outline" 
            size={20} 
            color="#666" 
            style={styles.editIcon}
          />
        </View>
      </TouchableOpacity>

      {/* Full Screen Modal Editor */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={cancelEdit}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={cancelEdit}
            >
              <Ionicons name="close" size={24} color="#666" />
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              {multiline ? 'Edit Description' : 'Edit Title'}
            </Text>
            
            <TouchableOpacity 
              style={[styles.headerButton, styles.saveButton]}
              onPress={saveText}
            >
              <Text style={[styles.headerButtonText, styles.saveButtonText]}>Save</Text>
              <Ionicons name="checkmark" size={24} color="#2E7D32" />
            </TouchableOpacity>
          </View>

          {/* Text Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={tempText}
              onChangeText={setTempText}
              placeholder={placeholder}
              placeholderTextColor="#999"
              style={[
                styles.modalTextInput,
                multiline && styles.modalTextArea
              ]}
              multiline={multiline}
              numberOfLines={multiline ? 10 : 1}
              maxLength={maxLength}
              autoFocus={true}
              returnKeyType={multiline ? "default" : "done"}
              onSubmitEditing={multiline ? undefined : saveText}
              keyboardType="default"
              autoCapitalize="sentences"
              autoCorrect={true}
              spellCheck={true}
              textAlignVertical={multiline ? "top" : "center"}
              selectTextOnFocus={true}
              {...props}
            />
            
            {/* Character Count */}
            <View style={styles.characterCountContainer}>
              <Text style={[
                styles.characterCount,
                tempText.length > maxLength * 0.9 && styles.characterCountWarning
              ]}>
                {tempText.length}/{maxLength}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setTempText('')}
            >
              <Ionicons name="trash-outline" size={20} color="#f44336" />
              <Text style={styles.quickActionText}>Clear</Text>
            </TouchableOpacity>
            
            {multiline && (
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => {
                  // Add common phrases for civic complaints
                  const commonPhrases = [
                    "This issue has been ongoing for several days.",
                    "It poses a safety risk to residents.",
                    "Immediate attention is required.",
                    "The problem affects daily life in the area."
                  ];
                  
                  Alert.alert(
                    "Quick Phrases",
                    "Select a phrase to add:",
                    commonPhrases.map(phrase => ({
                      text: phrase.substring(0, 30) + "...",
                      onPress: () => {
                        setTempText(prev => prev ? prev + " " + phrase : phrase);
                      }
                    })).concat([{ text: "Cancel", style: "cancel" }])
                  );
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color="#2E7D32" />
                <Text style={styles.quickActionText}>Add Phrase</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  displayInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E3F2FD',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  displayInputMultiline: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  displayText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 22,
  },
  multilineText: {
    fontSize: 15,
    lineHeight: 20,
  },
  placeholderText: {
    color: '#999999',
    fontStyle: 'italic',
  },
  editIconContainer: {
    marginLeft: 10,
    paddingTop: 2,
  },
  editIcon: {
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#E8F5E8',
  },
  headerButtonText: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 4,
  },
  saveButtonText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flex: 1,
    padding: 16,
  },
  modalTextInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalTextArea: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
  },
  characterCountWarning: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  quickActionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
});

export default CustomTextInput;
