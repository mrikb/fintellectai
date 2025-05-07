import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { MarketData } from '@/types/alpaca';

interface StockItemProps {
  data: MarketData;
  onPress: () => void;
}

export default function StockItem({ data, onPress }: StockItemProps) {
  const { symbol, price, change, changePercent } = data;
  const isPositive = change >= 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.symbolContainer}>
        <Text style={styles.symbol}>{symbol}</Text>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
        <View style={styles.changeContainer}>
          {isPositive ? (
            <TrendingUp size={14} color={Colors.positive} />
          ) : (
            <TrendingDown size={14} color={Colors.negative} />
          )}
          <Text
            style={[
              styles.change,
              { color: isPositive ? Colors.positive : Colors.negative }
            ]}
          >
            {change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  symbolContainer: {
    flex: 1,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  change: {
    fontSize: 12,
  },
});