import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
  variant?: 'default' | 'dark';
}

export default function Card({ children, title, style, variant = 'default' }: CardProps) {
  return (
    <View style={[
      styles.card, 
      variant === 'dark' && styles.darkCard,
      style
    ]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  darkCard: {
    backgroundColor: Colors.cardAlt,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.text,
  },
});