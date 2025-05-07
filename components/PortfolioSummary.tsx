import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Card from './Card';
import { PortfolioSummary as PortfolioSummaryType } from '@/types/alpaca';

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

export default function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const {
    totalValue,
    cashBalance,
    dayChange,
    dayChangePercent,
    totalGain,
    totalGainPercent,
  } = summary;

  const isDayChangePositive = dayChange >= 0;
  const isTotalGainPositive = totalGain >= 0;

  return (
    <Card style={styles.card} variant="dark">
      <Text style={styles.title}>Portfolio Value</Text>
      <Text style={styles.totalValue}>${totalValue.toFixed(2)}</Text>
      
      <View style={styles.changeContainer}>
        {isDayChangePositive ? (
          <TrendingUp size={16} color={Colors.positive} />
        ) : (
          <TrendingDown size={16} color={Colors.negative} />
        )}
        <Text
          style={[
            styles.change,
            { color: isDayChangePositive ? Colors.positive : Colors.negative }
          ]}
        >
          ${Math.abs(dayChange).toFixed(2)} ({dayChangePercent.toFixed(2)}%) Today
        </Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.label}>Cash Balance</Text>
        <Text style={styles.value}>${cashBalance.toFixed(2)}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Total Gain/Loss</Text>
        <View style={styles.gainLossContainer}>
          {isTotalGainPositive ? (
            <TrendingUp size={14} color={Colors.positive} />
          ) : (
            <TrendingDown size={14} color={Colors.negative} />
          )}
          <Text
            style={[
              styles.gainLoss,
              { color: isTotalGainPositive ? Colors.positive : Colors.negative }
            ]}
          >
            ${Math.abs(totalGain).toFixed(2)} ({totalGainPercent.toFixed(2)}%)
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  title: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  gainLossContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gainLoss: {
    fontSize: 14,
    fontWeight: '600',
  },
});