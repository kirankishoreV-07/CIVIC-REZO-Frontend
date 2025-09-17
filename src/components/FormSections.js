import React, { memo } from 'react';
import { View, Text } from 'react-native';
import StableTextInput from './StableTextInput';

// Memoized form section to prevent unnecessary re-renders
export const TitleSection = memo(({ 
  title, 
  onTitleChange, 
  titleStyle, 
  inputStyle, 
  maxLength = 100 
}) => {
  console.log('TitleSection render');
  
  return (
    <View style={titleStyle}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Complaint Title *</Text>
      <StableTextInput
        value={title}
        onChangeText={onTitleChange}
        style={inputStyle}
        placeholder="Brief title describing the issue"
        maxLength={maxLength}
        returnKeyType="next"
      />
      {maxLength && (
        <Text style={{ textAlign: 'right', fontSize: 12, color: '#666', marginTop: 4 }}>
          {title.length}/{maxLength}
        </Text>
      )}
    </View>
  );
});

TitleSection.displayName = 'TitleSection';

// Memoized description section
export const DescriptionSection = memo(({ 
  description, 
  onDescriptionChange, 
  sectionStyle, 
  inputStyle, 
  maxLength = 500 
}) => {
  console.log('DescriptionSection render');
  
  return (
    <View style={sectionStyle}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Description *</Text>
      <StableTextInput
        value={description}
        onChangeText={onDescriptionChange}
        style={inputStyle}
        placeholder="Detailed description of the civic issue"
        multiline
        numberOfLines={6}
        maxLength={maxLength}
      />
      {maxLength && (
        <Text style={{ textAlign: 'right', fontSize: 12, color: '#666', marginTop: 4 }}>
          {description.length}/{maxLength}
        </Text>
      )}
    </View>
  );
});

DescriptionSection.displayName = 'DescriptionSection';

export default { TitleSection, DescriptionSection };
