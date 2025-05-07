import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, CheckCircle, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Order } from '@/types/alpaca';

interface OrderItemProps {
  order: Order;
  onPress: () => void;
}

export default function OrderItem({ order, onPress }: OrderItemProps) {
  const {
    symbol,
    qty,
    side,
    type,
    status,
    limit_price,
    stop_price,
    filled_avg_price,
    created_at,
  } = order;

  const getStatusIcon = () => {
    switch (status) {
      case 'filled':
        return <CheckCircle size={16} color={Colors.positive} />;
      case 'canceled':
      case 'expired':
      case 'rejected':
        return <XCircle size={16} color={Colors.negative} />;
      default:
        return <Clock size={16} color={Colors.warning} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'filled':
        return Colors.positive;
      case 'canceled':
      case 'expired':
      case 'rejected':
        return Colors.negative;
      default:
        return Colors.warning;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getOrderTypeText = () => {
    let text = `${side.toUpperCase()} ${qty} ${symbol}`;
    
    if (type === 'limit' && limit_price) {
      text += ` @ $${limit_price}`;
    } else if (type === 'stop' && stop_price) {
      text += ` @ $${stop_price}`;
    } else if (type === 'stop_limit' && stop_price && limit_price) {
      text += ` @ $${stop_price}-$${limit_price}`;
    }
    
    return text;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { borderLeftColor: side === 'buy' ? Colors.positive : Colors.negative }
      ]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={[
            styles.side,
            { color: side === 'buy' ? Colors.positive : Colors.negative }
          ]}>
            {side.toUpperCase()}
          </Text>
          <Text style={styles.symbol}>{symbol}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={[styles.status, { color: getStatusColor() }]}>
            {status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.orderType}>{getOrderTypeText()}</Text>
      
      {filled_avg_price && status === 'filled' && (
        <Text style={styles.filledPrice}>
          Filled @ ${filled_avg_price}
        </Text>
      )}
      
      <Text style={styles.date}>{formatDate(created_at)}</Text>
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
    marginBottom: 8,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  side: {
    fontWeight: '700',
    fontSize: 14,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderType: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  filledPrice: {
    fontSize: 14,
    color: Colors.positive,
    fontWeight: '600',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});