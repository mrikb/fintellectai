import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  DollarSign
} from 'lucide-react-native';
import { alpacaApi } from '@/services/alpacaApi';
import { useOrderStore } from '@/stores/orderStore';
import { Order } from '@/types/alpaca';
import Colors from '@/constants/colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { cancelOrder } = useOrderStore();

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const orderData = await alpacaApi.getOrder(id);
      setOrder(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = () => {
    if (!order) return;
    
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel this ${order.side.toUpperCase()} order for ${order.qty} shares of ${order.symbol}?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(order.id);
              Alert.alert(
                'Order Canceled',
                'Your order has been canceled successfully.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (err) {
              Alert.alert(
                'Error',
                'Failed to cancel order. Please try again.'
              );
            }
          }
        }
      ]
    );
  };

  const getStatusIcon = () => {
    if (!order) return null;
    
    switch (order.status) {
      case 'filled':
        return <CheckCircle size={24} color={Colors.positive} />;
      case 'canceled':
      case 'expired':
      case 'rejected':
        return <XCircle size={24} color={Colors.negative} />;
      case 'partially_filled':
        return <AlertTriangle size={24} color={Colors.warning} />;
      default:
        return <Clock size={24} color={Colors.primary} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getOrderTypeText = () => {
    if (!order) return '';
    
    let text = `${order.side.toUpperCase()} ${order.qty} ${order.symbol}`;
    
    if (order.type === 'limit' && order.limit_price) {
      text += ` @ $${order.limit_price}`;
    } else if (order.type === 'stop' && order.stop_price) {
      text += ` @ $${order.stop_price}`;
    } else if (order.type === 'stop_limit' && order.stop_price && order.limit_price) {
      text += ` @ $${order.stop_price}-$${order.limit_price}`;
    }
    
    return text;
  };

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid order ID</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Order Details',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.container}>
        {isLoading ? (
          <LoadingSpinner message="Loading order details..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadOrder} />
        ) : order ? (
          <>
            <View style={styles.statusContainer}>
              {getStatusIcon()}
              <Text style={[
                styles.statusText,
                { 
                  color: order.status === 'filled' 
                    ? Colors.positive 
                    : order.status === 'canceled' || order.status === 'expired' || order.status === 'rejected'
                    ? Colors.negative
                    : Colors.primary
                }
              ]}>
                {order.status.toUpperCase()}
              </Text>
            </View>
            
            <Card style={styles.card} variant="dark">
              <Text style={styles.orderTitle}>{getOrderTypeText()}</Text>
              
              <View style={styles.orderSummary}>
                <View style={[
                  styles.orderSide, 
                  { backgroundColor: order.side === 'buy' ? `${Colors.positive}20` : `${Colors.negative}20` }
                ]}>
                  <Text style={[
                    styles.orderSideText,
                    { color: order.side === 'buy' ? Colors.positive : Colors.negative }
                  ]}>
                    {order.side.toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.orderType}>
                  <Text style={styles.orderTypeText}>{order.type.toUpperCase()}</Text>
                </View>
                
                <View style={styles.orderTimeInForce}>
                  <Text style={styles.orderTimeInForceText}>{order.time_in_force.toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Calendar size={16} color={Colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Created At</Text>
                    <Text style={styles.detailValue}>{formatDate(order.created_at)}</Text>
                  </View>
                </View>
                
                {order.filled_at && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <CheckCircle size={16} color={Colors.positive} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Filled At</Text>
                      <Text style={styles.detailValue}>{formatDate(order.filled_at)}</Text>
                    </View>
                  </View>
                )}
                
                {order.canceled_at && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <XCircle size={16} color={Colors.negative} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Canceled At</Text>
                      <Text style={styles.detailValue}>{formatDate(order.canceled_at)}</Text>
                    </View>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <DollarSign size={16} color={Colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Quantity</Text>
                    <Text style={styles.detailValue}>{order.qty} shares</Text>
                  </View>
                </View>
                
                {order.filled_qty && parseFloat(order.filled_qty) > 0 && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <DollarSign size={16} color={Colors.positive} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Filled Quantity</Text>
                      <Text style={styles.detailValue}>{order.filled_qty} shares</Text>
                    </View>
                  </View>
                )}
                
                {order.filled_avg_price && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <DollarSign size={16} color={Colors.positive} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Filled Price</Text>
                      <Text style={styles.detailValue}>${order.filled_avg_price}</Text>
                    </View>
                  </View>
                )}
                
                {order.limit_price && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <DollarSign size={16} color={Colors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Limit Price</Text>
                      <Text style={styles.detailValue}>${order.limit_price}</Text>
                    </View>
                  </View>
                )}
                
                {order.stop_price && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <DollarSign size={16} color={Colors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Stop Price</Text>
                      <Text style={styles.detailValue}>${order.stop_price}</Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.idSection}>
                <Text style={styles.idLabel}>Order ID</Text>
                <Text style={styles.idValue}>{order.id}</Text>
              </View>
            </Card>
            
            {(order.status === 'new' || order.status === 'accepted' || order.status === 'pending_new') && (
              <View style={styles.actionsContainer}>
                <Button 
                  title="Cancel Order" 
                  variant="dark"
                  onPress={handleCancelOrder}
                  textStyle={{ color: Colors.danger }}
                  style={{ borderColor: Colors.danger }}
                />
              </View>
            )}
            
            <View style={styles.actionsContainer}>
              <Button 
                title="View Stock" 
                variant="dark"
                onPress={() => router.push(`/stock/${order.symbol}`)}
              />
            </View>
            
            <View style={styles.actionsContainer}>
              <Button 
                title="Place New Order" 
                onPress={() => router.push('/trade')}
              />
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>Order not found</Text>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  button: {
    alignSelf: 'center',
    minWidth: 150,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    margin: 16,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  orderSide: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  orderSideText: {
    fontWeight: '600',
    fontSize: 14,
  },
  orderType: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderTypeText: {
    color: Colors.text,
    fontSize: 14,
  },
  orderTimeInForce: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderTimeInForceText: {
    color: Colors.text,
    fontSize: 14,
  },
  detailsSection: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  idSection: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  idLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  idValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});