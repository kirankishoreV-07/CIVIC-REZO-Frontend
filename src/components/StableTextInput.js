import React, { memo, forwardRef } from 'react';
import { TextInput } from 'react-native';

// Memoized TextInput component to prevent unnecessary re-renders
// This component only re-renders when its props actually change
const StableTextInput = memo(forwardRef(({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  style,
  autoCorrect = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  returnKeyType = 'default',
  blurOnSubmit = false,
  textAlignVertical = 'top',
  editable = true,
  ...otherProps
}, ref) => {
  console.log('StableTextInput render:', placeholder?.substring(0, 20));
  
  return (
    <TextInput
      ref={ref}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      numberOfLines={numberOfLines}
      maxLength={maxLength}
      style={style}
      autoCorrect={autoCorrect}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      returnKeyType={returnKeyType}
      blurOnSubmit={blurOnSubmit}
      textAlignVertical={textAlignVertical}
      editable={editable}
      {...otherProps}
    />
  );
}));

StableTextInput.displayName = 'StableTextInput';

export default StableTextInput;
