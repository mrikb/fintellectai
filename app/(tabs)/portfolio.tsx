import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { PieChart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import Colors from '@/constants/colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import PortfolioSummary from '@/components/PortfolioSummary';
import PositionItem from '@/components/PositionItem';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function PortfolioScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('positions'); // 'positions' or 'allocation'
  
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { 
    account, 
    positions, 
    summary, 
    isLoading, 
    error,
    fetchPortfolio 
  } = usePortfolioStore();

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

  const loadData = async () => {
    await fetchPortfolio();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePositionPress = (symbol: string) => {
    router.push(`/stock/${symbol}`);
  };

  // Calculate allocation percentages for pie chart
  const calculateAllocations = () => {
    if (!positions.length || !summary) return [];
    
    const totalValue = summary.totalValue;
    const cashPercentage = (summary.cashBalance / totalValue) * 100;
    
    const stockAllocations = positions.map(position => ({
      symbol: position.symbol,
      value: parseFloat(position.market_value),
      percentage: (parseFloat(position.market_value) / totalValue) * 100,
      color: getRandomColor(position.symbol),
    }));
    
    return [
      ...stockAllocations,
      {
        symbol: 'Cash',
        value: summary.cashBalance,
        percentage: cashPercentage,
        color: '#555555',
      }
    ].sort((a, b) => b.value - a.value);
  };
  
  // Generate consistent colors based on symbol
  const getRandomColor = (symbol: string) => {
    const colors = [
      '#00c805', '#2962ff', '#ff9800', '#9c27b0', 
      '#f44336', '#00bcd4', '#ffeb3b', '#4caf50'
    ];
    const index = symbol.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const allocations = calculateAllocations();

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please log in to view your portfolio</Text>
        <Button 
          title="Go to Login" 
          onPress={() => router.replace('/auth')} 
          style={styles.button}
        />
      </View>
    );
  }

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading portfolio..." />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {error && <ErrorMessage message={error} onRetry={loadData} />}
      
      {summary && <PortfolioSummary summary={summary} />}
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'positions' && styles.activeTab]}
          onPress={() => setActiveTab('positions')}
        >
          <Text style={[styles.tabText, activeTab === 'positions' && styles.activeTabText]}>
            Positions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'allocation' && styles.activeTab]}
          onPress={() => setActiveTab('allocation')}
        >
          <Text style={[styles.tabText, activeTab === 'allocation' && styles.activeTabText]}>
            Allocation
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'positions' ? (
        <View style={styles.positionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Positions</Text>
            <Button 
              title="Trade" 
              size="small"
              variant="dark"
              onPress={() => router.push('/trade')}
            />
          </View>
          
          {positions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyMessage}>No open positions</Text>
              <Button 
                title="Start Trading" 
                onPress={() => router.push('/trade')} 
                style={styles.emptyButton}
              />
            </View>
          ) : (
            positions.map(position => (
              <PositionItem 
                key={position.symbol} 
                position={position} 
                onPress={() => handlePositionPress(position.symbol)} 
              />
            ))
          )}
        </View>
      ) : (
        <View style={styles.allocationContainer}>
          <Card title="Portfolio Allocation" style={styles.allocationCard} variant="dark">
            {allocations.length === 0 ? (
              <Text style={styles.emptyMessage}>No allocation data available</Text>
            ) : (
              <>
                <View style={styles.chartPlaceholder}>
                  <PieChart size={24} color={Colors.primary} style={styles.chartIcon} />
                  <Text style={styles.chartText}>Portfolio Allocation</Text>
                </View>
                
                <View style={styles.allocationList}>
                  {allocations.map(item => (
                    <View key={item.symbol} style={styles.allocationItem}>
                      <View style={styles.allocationSymbolContainer}>
                        <View 
                          style={[styles.colorIndicator, { backgroundColor: item.color }]} 
                        />
                        <Text style={styles.allocationSymbol}>{item.symbol}</Text>
                      </View>
                      <View style={styles.allocationValues}>
                        <Text style={styles.allocationPercentage}>
                          {item.percentage.toFixed(2)}%
                        </Text>
                        <Text style={styles.allocationValue}>
                          ${item.value.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Card>
        </View>
      )}
      
      {account && (
        <Card title="Account Information" style={styles.accountInfoContainer} variant="dark">
          <View style={styles.accountInfoRow}>
            <Text style={styles.accountInfoLabel}>Account ID</Text>
            <Text style={styles.accountInfoValue}>{account.id}</Text>
          </View>
          
          <View style={styles.accountInfoRow}>
            <Text style={styles.accountInfoLabel}>Status</Text>
            <Text style={[
              styles.accountInfoValue,
              { color: account.status === 'ACTIVE' ? Colors.positive : Colors.warning }
            ]}>
              {account.status}
            </Text>
          </View>
          
          <View style={styles.accountInfoRow}>
            <Text style={styles.accountInfoLabel}>Cash</Text>
            <Text style={styles.accountInfoValue}>${parseFloat(account.cash).toFixed(2)}</Text>
          </View>
          
          <View style={styles.accountInfoRow}>
            <Text style={styles.accountInfoLabel}>Buying Power</Text>
            <Text style={styles.accountInfoValue}>${parseFloat(account.buying_power).toFixed(2)}</Text>
          </View>
          
          <View style={styles.accountInfoRow}>
            <Text style={styles.accountInfoLabel}>Currency</Text>
            <Text style={styles.accountInfoValue}>{account.currency}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.depositButton}
            onPress={() => router.push('/deposit')}
          >
            <DollarSign size={16} color={Colors.primary} />
            <Text style={styles.depositButtonText}>Deposit Funds</Text>
          </TouchableOpacity>
        </Card>
      )}
    </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginVertical: 16,
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: Colors.cardAlt,
  },
  tabText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.text,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  positionsContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 150,
  },
  allocationContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  allocationCard: {
    marginVertical: 0,
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    marginBottom: 16,
  },
  chartIcon: {
    marginBottom: 8,
  },
  chartText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  allocationList: {
    gap: 12,
  },
  allocationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  allocationSymbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  allocationSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  allocationValues: {
    alignItems: 'flex-end',
  },
  allocationPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  allocationValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  accountInfoContainer: {
    margin: 16,
    marginTop: 0,
  },
  accountInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  accountInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  accountInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  depositButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  depositButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
});