import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, ChevronRight, DollarSign, BarChart3 } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useMarketStore } from '@/stores/marketStore';
import Colors from '@/constants/colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PortfolioSummary from '@/components/PortfolioSummary';
import StockItem from '@/components/StockItem';

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { 
    account, 
    positions, 
    summary, 
    isLoading: portfolioLoading, 
    error: portfolioError,
    fetchPortfolio 
  } = usePortfolioStore();
  
  const { 
    watchlist, 
    marketData, 
    isLoading: marketLoading, 
    error: marketError,
    fetchMarketData,
    setSelectedSymbol
  } = useMarketStore();

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
    if (watchlist.length > 0) {
      await fetchMarketData(watchlist);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStockPress = (symbol: string) => {
    setSelectedSymbol(symbol);
    router.push(`/stock/${symbol}`);
  };

  const isLoading = portfolioLoading || marketLoading;
  const error = portfolioError || marketError;

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please log in to view your dashboard</Text>
        <Button 
          title="Go to Login" 
          onPress={() => router.replace('/auth')} 
          style={styles.button}
        />
      </View>
    );
  }

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  // Calculate market trend
  const marketTrend = Object.values(marketData).reduce((acc, stock) => {
    return acc + stock.changePercent;
  }, 0) / (Object.values(marketData).length || 1);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {error && <ErrorMessage message={error} onRetry={loadData} />}
      
      {summary && <PortfolioSummary summary={summary} />}
      
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => router.push('/trade')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.positive}20` }]}>
            <DollarSign size={20} color={Colors.positive} />
          </View>
          <Text style={styles.quickActionText}>Trade</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => router.push('/deposit')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.secondary}20` }]}>
            <DollarSign size={20} color={Colors.secondary} />
          </View>
          <Text style={styles.quickActionText}>Deposit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => router.push('/portfolio')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.primary}20` }]}>
            <BarChart3 size={20} color={Colors.primary} />
          </View>
          <Text style={styles.quickActionText}>Portfolio</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.marketOverview}>
        <View style={styles.marketHeader}>
          <Text style={styles.marketTitle}>Market Overview</Text>
          <View style={styles.marketTrend}>
            {marketTrend >= 0 ? (
              <TrendingUp size={16} color={Colors.positive} />
            ) : (
              <TrendingDown size={16} color={Colors.negative} />
            )}
            <Text style={[
              styles.marketTrendText,
              { color: marketTrend >= 0 ? Colors.positive : Colors.negative }
            ]}>
              {marketTrend.toFixed(2)}%
            </Text>
          </View>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.marketScroll}
        >
          {Object.values(marketData).map(stock => (
            <TouchableOpacity 
              key={stock.symbol}
              style={styles.marketItem}
              onPress={() => handleStockPress(stock.symbol)}
            >
              <Text style={styles.marketSymbol}>{stock.symbol}</Text>
              <Text style={styles.marketPrice}>${stock.price.toFixed(2)}</Text>
              <Text style={[
                styles.marketChange,
                { color: stock.change >= 0 ? Colors.positive : Colors.negative }
              ]}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <Card title="Watchlist" style={styles.card} variant="dark">
        {watchlist.length === 0 ? (
          <Text style={styles.emptyMessage}>No stocks in watchlist</Text>
        ) : (
          <View>
            {watchlist.map(symbol => {
              const data = marketData[symbol];
              if (!data) return null;
              
              return (
                <StockItem 
                  key={symbol} 
                  data={data} 
                  onPress={() => handleStockPress(symbol)} 
                />
              );
            })}
            
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/market')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </Card>
      
      <Card title="Recent Positions" style={styles.card} variant="dark">
        {positions.length === 0 ? (
          <Text style={styles.emptyMessage}>No open positions</Text>
        ) : (
          <View>
            {positions.slice(0, 3).map(position => (
              <View key={position.symbol} style={styles.positionItem}>
                <View style={styles.positionHeader}>
                  <Text style={styles.positionSymbol}>{position.symbol}</Text>
                  <Text style={styles.positionQty}>
                    {parseFloat(position.qty).toFixed(2)} shares
                  </Text>
                </View>
                <View style={styles.positionDetails}>
                  <Text style={styles.positionValue}>
                    ${parseFloat(position.market_value).toFixed(2)}
                  </Text>
                  <Text 
                    style={[
                      styles.positionPL,
                      { 
                        color: parseFloat(position.unrealized_pl) >= 0 
                          ? Colors.positive 
                          : Colors.negative 
                      }
                    ]}
                  >
                    ${parseFloat(position.unrealized_pl).toFixed(2)} (
                    {(parseFloat(position.unrealized_plpc) * 100).toFixed(2)}%)
                  </Text>
                </View>
              </View>
            ))}
            
            {positions.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push('/portfolio')}
              >
                <Text style={styles.viewAllText}>View All Positions</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: Colors.card,
    marginBottom: 16,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.text,
  },
  marketOverview: {
    backgroundColor: Colors.card,
    paddingVertical: 16,
    marginBottom: 16,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  marketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  marketTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marketTrendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  marketScroll: {
    paddingHorizontal: 12,
  },
  marketItem: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    width: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  marketSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  marketPrice: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  marketChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyMessage: {
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  positionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  positionSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  positionQty: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionValue: {
    fontSize: 14,
    color: Colors.text,
  },
  positionPL: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
});