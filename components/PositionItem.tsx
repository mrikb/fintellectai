import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Position } from '@/types/alpaca';

interface PositionItemProps {
  position: Position;
  onPress: () => void;
}

export default function PositionItem({ position, onPress }: PositionItemProps) {
  const {
    symbol,
    qty,
    current_price,
    avg_entry_price,
    unrealized_pl,
    unrealized_plpc,
    market_value,
  } = position;

  const quantity = parseFloat(qty);
  const currentPrice = parseFloat(current_price);
  const avgEntryPrice = parseFloat(avg_entry_price);
  const unrealizedPL = parseFloat(unrealized_pl);
  const unrealizedPLPC = parseFloat(unrealized_plpc) * 100; // Convert to percentage
  const marketValue = parseFloat(market_value);
  
  const isPositive = unrealizedPL >= 0;

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { borderLeftColor: isPositive ? Colors.positive : Colors.negative }
      ]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.shares}>{quantity.toFixed(quantity % 1 === 0 ? 0 : 2)} shares</Text>
      </View>
      
      <View style={styles.details}>
        <View style={styles.priceInfo}>
          <Text style={styles.label}>Current</Text>
          <Text style={styles.value}>${currentPrice.toFixed(2)}</Text>
        </View>
        
        <View style={styles.priceInfo}>
          <Text style={styles.label}>Avg Cost</Text>
          <Text style={styles.value}>${avgEntryPrice.toFixed(2)}</Text>
        </View>
        
        <View style={styles.priceInfo}>
          <Text style={styles.label}>Market Value</Text>
          <Text style={styles.value}>${marketValue.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.profitLoss}>
        <View style={styles.plContainer}>
          {isPositive ? (
            <TrendingUp size={14} color={Colors.positive} />
          ) : (
            <TrendingDown size={14} color={Colors.negative} />
          )}
          <Text
            style={[
              styles.plValue,
              { color: isPositive ? Colors.positive : Colors.negative }
            ]}
          >
            ${Math.abs(unrealizedPL).toFixed(2)} ({unrealizedPLPC.toFixed(2)}%)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  shares: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceInfo: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  profitLoss: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    alignItems: 'center',
  },
  plContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  plValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});