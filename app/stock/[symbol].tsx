import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ArrowLeft,
  Plus,
  Minus,
  DollarSign,
  BarChart2
} from 'lucide-react-native';
import { useMarketStore } from '@/stores/marketStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import Colors from '@/constants/colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import Button from '@/components/Button';
import Card from '@/components/Card';

const { width: screenWidth } = Dimensions.get('window');

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<'1Min' | '5Min' | '15Min' | '1Hour' | '1Day'>('1Day');
  
  const { 
    marketData, 
    historicalData,
    watchlist,
    selectedSymbol,
    isLoading: marketLoading,
    error: marketError,
    fetchMarketData,
    fetchHistoricalData,
    addToWatchlist,
    removeFromWatchlist
  } = useMarketStore();
  
  const {
    positions,
    isLoading: positionsLoading,
    fetchPositions
  } = usePortfolioStore();

  useEffect(() => {
    if (symbol) {
      loadData();
    }
  }, [symbol, timeframe]);

  const loadData = async () => {
    if (!symbol) return;
    
    await Promise.all([
      fetchMarketData([symbol]),
      fetchHistoricalData(symbol, timeframe),
      fetchPositions()
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTimeframeChange = (newTimeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day') => {
    setTimeframe(newTimeframe);
  };

  const toggleWatchlist = () => {
    if (!symbol) return;
    
    if (watchlist.includes(symbol)) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  const handleTrade = () => {
    router.push(`/trade?symbol=${symbol}`);
  };

  const isInWatchlist = symbol ? watchlist.includes(symbol) : false;
  const stockData = symbol ? marketData[symbol] : null;
  const position = symbol ? positions.find(p => p.symbol === symbol) : null;
  
  const isLoading = (marketLoading || positionsLoading) && !refreshing;
  const error = marketError;

  // Generate mock chart data points
  const generateChartPoints = () => {
    if (!historicalData || historicalData.length === 0) return [];
    
    // Use actual data points if available
    return historicalData.map((bar, index) => ({
      x: index,
      y: bar.c,
      timestamp: new Date(bar.t).toLocaleTimeString(),
    }));
  };

  const chartPoints = generateChartPoints();
  const hasChartData = chartPoints.length > 0;
  
  // Calculate min and max for chart scaling
  const minValue = hasChartData ? Math.min(...chartPoints.map(p => p.y)) * 0.995 : 0;
  const maxValue = hasChartData ? Math.max(...chartPoints.map(p => p.y)) * 1.005 : 0;
  const chartHeight = 200;
  const chartWidth = screenWidth - 32;
  
  // Calculate chart line path
  const getChartPath = () => {
    if (!hasChartData) return '';
    
    const range = maxValue - minValue;
    const points = chartPoints.map((point, index) => {
      const x = (index / (chartPoints.length - 1)) * chartWidth;
      const y = chartHeight - ((point.y - minValue) / range) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return points;
  };

  if (!symbol) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid stock symbol</Text>
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
          title: symbol,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={toggleWatchlist} style={styles.watchlistButton}>
              {isInWatchlist ? (
                <Minus size={24} color={Colors.danger} />
              ) : (
                <Plus size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <LoadingSpinner message={`Loading ${symbol} data...`} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadData} />
        ) : (
          <>
            {stockData && (
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${stockData.price.toFixed(2)}</Text>
                <View style={styles.changeContainer}>
                  {stockData.change >= 0 ? (
                    <TrendingUp size={20} color={Colors.positive} />
                  ) : (
                    <TrendingDown size={20} color={Colors.negative} />
                  )}
                  <Text
                    style={[
                      styles.change,
                      { color: stockData.change >= 0 ? Colors.positive : Colors.negative }
                    ]}
                  >
                    ${Math.abs(stockData.change).toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.timeframeContainer}>
              {['1Min', '5Min', '15Min', '1Hour', '1Day'].map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[
                    styles.timeframeButton,
                    timeframe === tf && styles.timeframeButtonActive
                  ]}
                  onPress={() => handleTimeframeChange(tf as any)}
                >
                  <Text
                    style={[
                      styles.timeframeText,
                      timeframe === tf && styles.timeframeTextActive
                    ]}
                  >
                    {tf}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.chartContainer}>
              {hasChartData ? (
                <View style={styles.chartContent}>
                  <View style={styles.chartYAxis}>
                    <Text style={styles.chartAxisLabel}>${maxValue.toFixed(2)}</Text>
                    <Text style={styles.chartAxisLabel}>${((maxValue + minValue) / 2).toFixed(2)}</Text>
                    <Text style={styles.chartAxisLabel}>${minValue.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.chartArea}>
                    {/* Chart grid lines */}
                    <View style={[styles.chartGridLine, { top: 0 }]} />
                    <View style={[styles.chartGridLine, { top: chartHeight / 2 }]} />
                    <View style={[styles.chartGridLine, { top: chartHeight }]} />
                    
                    {/* SVG Chart */}
                    <View style={styles.svgContainer}>
                      <svg width={chartWidth} height={chartHeight}>
                        <path
                          d={getChartPath()}
                          stroke={stockData && stockData.change >= 0 ? Colors.positive : Colors.negative}
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.chartPlaceholder}>
                  <BarChart2 size={32} color={Colors.textSecondary} style={styles.chartIcon} />
                  <Text style={styles.chartPlaceholderText}>
                    Chart data loading...
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.actionsContainer}>
              <Button 
                title="Buy" 
                onPress={() => router.push(`/trade?symbol=${symbol}&side=buy`)}
                style={[styles.actionButton, styles.buyButton]}
              />
              <Button 
                title="Sell" 
                onPress={() => router.push(`/trade?symbol=${symbol}&side=sell`)}
                style={[styles.actionButton, styles.sellButton]}
                variant="dark"
              />
            </View>
            
            {position && (
              <Card title="Your Position" style={styles.positionCard} variant="dark">
                <View style={styles.positionDetails}>
                  <View style={styles.positionRow}>
                    <Text style={styles.positionLabel}>Shares</Text>
                    <Text style={styles.positionValue}>
                      {parseFloat(position.qty).toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.positionRow}>
                    <Text style={styles.positionLabel}>Avg. Cost</Text>
                    <Text style={styles.positionValue}>
                      ${parseFloat(position.avg_entry_price).toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.positionRow}>
                    <Text style={styles.positionLabel}>Market Value</Text>
                    <Text style={styles.positionValue}>
                      ${parseFloat(position.market_value).toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.positionRow}>
                    <Text style={styles.positionLabel}>Unrealized P/L</Text>
                    <Text
                      style={[
                        styles.positionValue,
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
              </Card>
            )}
            
            <Card title="Market Information" style={styles.infoCard} variant="dark">
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Symbol</Text>
                <Text style={styles.infoValue}>{symbol}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>
                  <Clock size={14} color={Colors.textSecondary} style={styles.infoIcon} />
                  {new Date().toLocaleTimeString()}
                </Text>
              </View>
              
              {stockData && (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Day Range</Text>
                    <Text style={styles.infoValue}>
                      ${(stockData.price - stockData.change).toFixed(2)} - ${stockData.price.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Volume</Text>
                    <Text style={styles.infoValue}>
                      {hasChartData && historicalData.length > 0 
                        ? historicalData.reduce((sum, bar) => sum + bar.v, 0).toLocaleString() 
                        : 'N/A'}
                    </Text>
                  </View>
                </>
              )}
            </Card>
          </>
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
  watchlistButton: {
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
  priceContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  change: {
    fontSize: 18,
    fontWeight: '600',
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timeframeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  timeframeButtonActive: {
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeframeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  timeframeTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: Colors.card,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chartContent: {
    flexDirection: 'row',
    height: 200,
    paddingHorizontal: 16,
  },
  chartYAxis: {
    width: 50,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: 8,
  },
  chartAxisLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  chartArea: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  chartGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border,
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    padding: 16,
  },
  chartIcon: {
    marginBottom: 8,
  },
  chartPlaceholderText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  buyButton: {
    backgroundColor: Colors.positive,
  },
  sellButton: {
    borderColor: Colors.negative,
  },
  positionCard: {
    margin: 16,
  },
  positionDetails: {
    gap: 12,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  positionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  tradeButton: {
    height: 50,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 4,
  },
});