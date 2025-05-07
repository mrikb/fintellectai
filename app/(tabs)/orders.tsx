import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Filter, Clock, CheckCircle, XCircle, AlertTriangle, PlusCircle } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/orderStore';
import Colors from '@/constants/colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import OrderItem from '@/components/OrderItem';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function OrdersScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { 
    orders, 
    isLoading, 
    error,
    fetchOrders 
  } = useOrderStore();

  useEffect(() => {
    const initialize = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        router.replace('/auth');
      } else {
        loadData();
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    await fetchOrders(statusFilter);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };

  const filterOptions = [
    { label: 'All', value: 'all', icon: null },
    { label: 'Open', value: 'open', icon: <Clock size={14} color={statusFilter === 'open' ? Colors.primary : Colors.textSecondary} /> },
    { label: 'Filled', value: 'filled', icon: <CheckCircle size={14} color={statusFilter === 'filled' ? Colors.primary : Colors.textSecondary} /> },
    { label: 'Canceled', value: 'canceled', icon: <XCircle size={14} color={statusFilter === 'canceled' ? Colors.primary : Colors.textSecondary} /> }
  ];

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please log in to view your orders</Text>
        <Button 
          title="Go to Login" 
          onPress={() => router.replace('/auth')} 
          style={styles.button}
        />
      </View>
    );
  }

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading orders..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Filter size={18} color={Colors.textSecondary} />
          <Text style={styles.filterTitle}>Filter by Status</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterOptions}
        >
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterOption,
                statusFilter === option.value && styles.filterOptionActive
              ]}
              onPress={() => setStatusFilter(option.value)}
            >
              {option.icon && (
                <View style={styles.filterOptionIcon}>
                  {option.icon}
                </View>
              )}
              <Text
                style={[
                  styles.filterOptionText,
                  statusFilter === option.value && styles.filterOptionTextActive
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {error && <ErrorMessage message={error} onRetry={loadData} />}
        
        <Card style={styles.ordersCard} variant="dark">
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyMessage}>No orders found</Text>
              <Button 
                title="Place an Order" 
                onPress={() => router.push('/trade')} 
                style={styles.emptyButton}
              />
            </View>
          ) : (
            orders.map(order => (
              <OrderItem 
                key={order.id} 
                order={order} 
                onPress={() => handleOrderPress(order.id)} 
              />
            ))
          )}
        </Card>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Order Statistics</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {orders.filter(o => o.status === 'filled').length}
              </Text>
              <Text style={styles.statLabel}>Filled</Text>
              <View style={[styles.statIndicator, { backgroundColor: Colors.positive }]} />
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {orders.filter(o => o.status === 'new' || o.status === 'accepted').length}
              </Text>
              <Text style={styles.statLabel}>Open</Text>
              <View style={[styles.statIndicator, { backgroundColor: Colors.warning }]} />
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {orders.filter(o => o.status === 'canceled' || o.status === 'expired' || o.status === 'rejected').length}
              </Text>
              <Text style={styles.statLabel}>Canceled</Text>
              <View style={[styles.statIndicator, { backgroundColor: Colors.negative }]} />
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.floatingButtonContainer}>
        <Button 
          title="Place New Order" 
          onPress={() => router.push('/trade')}
          leftIcon={<PlusCircle size={18} color="black" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    alignSelf: 'center',
    minWidth: 150,
  },
  filterContainer: {
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  filterOptions: {
    paddingHorizontal: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterOptionActive: {
    backgroundColor: Colors.cardAlt,
    borderColor: Colors.primary,
  },
  filterOptionIcon: {
    marginRight: 4,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterOptionTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Space for floating button
  },
  ordersCard: {
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 150,
  },
  statsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statIndicator: {
    position: 'absolute',
    top: 0,
    right: '30%',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
});