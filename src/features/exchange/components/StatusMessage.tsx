import { ThemedText } from '@/components/themed-text';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';


interface StatusMessageProps {
  error: string | null;
  success: boolean;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ error, success }) => {
  const errorBgColor = '#fef2f2';
  const errorTextColor = '#dc2626';
  const successBgColor = '#f0fdf4';
  const successTextColor = '#16a34a';
  const successIconColor = '#22c55e';

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: errorBgColor }]}>
        <ThemedText style={[styles.errorText, { color: errorTextColor }]}>{error}</ThemedText>
      </View>
    );
  }

  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: successBgColor }]}>
        <FontAwesome name="check-circle" size={20} color={successIconColor} />
        <ThemedText style={[styles.successText, { color: successTextColor }]}>Exchange successful!</ThemedText>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  errorContainer: {
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
