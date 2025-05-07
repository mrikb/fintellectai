import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <AlertCircle color={Colors.danger} size={24} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
    borderColor: Colors.danger,
    borderWidth: 1,
  },
  message: {
    color: Colors.danger,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.danger,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});