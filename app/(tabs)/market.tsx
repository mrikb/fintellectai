import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  RefreshControl, 
  TextInput,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, X, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useMarketStore } from '@/stores/marketStore';
import Colors from '@/constants/colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import StockItem from '@/components/StockItem';
import Card from '@/components/Card';

export default function MarketScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('watchlist'); // 'watchlist', 'popular', 'gainers', 'losers'
  
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { 
    watchlist,
    searchResults,
    marketData,
    isLoading,
    error,
    searchAssets,
    addToWatchlist,
    removeFromWatchlist,
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

  useEffect(() => {
    if (watchlist.length > 0) {
      fetchMarketData(watchlist);
    }
  }, [watchlist]);

  const loadData = async () => {
    if (watchlist.length > 0) {
      await fetchMarketData(watchlist);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      await searchAssets(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleStockPress = (symbol: string) => {
    setSelectedSymbol(symbol);
    router.push(`/stock/${symbol}`);
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.includes(symbol);
  };

  const toggleWatchlist = (symbol: string) => {
    if (isInWatchlist(symbol)) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  // Get market data sorted by performance
  const getSortedMarketData = () => {
    const data = Object.values(marketData);
    
    if (activeCategory === 'gainers') {
      return [...data].sort((a, b) => b.changePercent - a.changePercent);
    } else if (activeCategory === 'losers') {
      return [...data].sort((a, b) => a.changePercent - b.changePercent);
    }
    
    return data;
  };

  const sortedMarketData = getSortedMarketData();

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please log in to view market data</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/auth')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="characters"
            placeholderTextColor={Colors.placeholder}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.categoryTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'watchlist' && styles.activeTab]}
            onPress={() => setActiveCategory('watchlist')}
          >
            <Text style={[styles.categoryText, activeCategory === 'watchlist' && styles.activeText]}>
              Watchlist
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'popular' && styles.activeTab]}
            onPress={() => setActiveCategory('popular')}
          >
            <Text style={[styles.categoryText, activeCategory === 'popular' && styles.activeText]}>
              Popular
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'gainers' && styles.activeTab]}
            onPress={() => setActiveCategory('gainers')}
          >
            <View style={styles.categoryWithIcon}>
              <TrendingUp size={14} color={activeCategory === 'gainers' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.categoryText, activeCategory === 'gainers' && styles.activeText]}>
                Gainers
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'losers' && styles.activeTab]}
            onPress={() => setActiveCategory('losers')}
          >
            <View style={styles.categoryWithIcon}>
              <TrendingDown size={14} color={activeCategory === 'losers' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.categoryText, activeCategory === 'losers' && styles.activeText]}>
                Losers
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading && !refreshing && !isSearching ? (
        <LoadingSpinner message="Loading market data..." />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {error && <ErrorMessage message={error} onRetry={loadData} />}

          {isSearching ? (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Search Results</Text>
                <TouchableOpacity onPress={clearSearch}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>

              {isLoading ? (
                <LoadingSpinner size="small" message="Searching..." />
              ) : searchResults.length === 0 ? (
                <Text style={styles.emptyMessage}>No results found</Text>
              ) : (
                searchResults.map(asset => (
                  <View key={asset.id} style={styles.searchResultItem}>
                    <TouchableOpacity 
                      style={styles.searchResultContent}
                      onPress={() => handleStockPress(asset.symbol)}
                    >
                      <Text style={styles.searchResultSymbol}>{asset.symbol}</Text>
                      <Text style={styles.searchResultName} numberOfLines={1}>
                        {asset.name || 'Unknown'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.watchlistButton}
                      onPress={() => toggleWatchlist(asset.symbol)}
                    >
                      {isInWatchlist(asset.symbol) ? (
                        <Minus size={18} color={Colors.danger} />
                      ) : (
                        <Plus size={18} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          ) : activeCategory === 'watchlist' ? (
            <Card style={styles.watchlistCard} variant="dark">
              {watchlist.length === 0 ? (
                <Text style={styles.emptyMessage}>
                  Your watchlist is empty. Search for stocks to add.
                </Text>
              ) : (
                watchlist.map(symbol => {
                  const data = marketData[symbol];
                  if (!data) return null;
                  
                  return (
                    <View key={symbol} style={styles.watchlistItem}>
                      <StockItem 
                        data={data} 
                        onPress={() => handleStockPress(symbol)} 
                      />
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeFromWatchlist(symbol)}
                      >
                        <X size={16} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </Card>
          ) : activeCategory === 'popular' ? (
            <Card style={styles.popularCard} variant="dark">
              {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT'].map(symbol => (
                <View key={symbol} style={styles.popularItem}>
                  <Text style={styles.popularSymbol}>{symbol}</Text>
                  <TouchableOpacity 
                    style={[
                      styles.addButton,
                      isInWatchlist(symbol) && styles.addButtonDisabled
                    ]}
                    onPress={() => !isInWatchlist(symbol) && addToWatchlist(symbol)}
                    disabled={isInWatchlist(symbol)}
                  >
                    <Text style={[
                      styles.addButtonText,
                      isInWatchlist(symbol) && styles.addButtonTextDisabled
                    ]}>
                      {isInWatchlist(symbol) ? 'Added' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          ) : (
            <Card style={styles.marketListCard} variant="dark">
              {sortedMarketData.length === 0 ? (
                <Text style={styles.emptyMessage}>No market data available</Text>
              ) : (
                sortedMarketData.map(data => (
                  <View key={data.symbol} style={styles.marketListItem}>
                    <TouchableOpacity 
                      style={styles.marketListContent}
                      onPress={() => handleStockPress(data.symbol)}
                    >
                      <View style={styles.marketListSymbolContainer}>
                        <Text style={styles.marketListSymbol}>{data.symbol}</Text>
                        <TouchableOpacity 
                          style={styles.watchlistIconButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(data.symbol);
                          }}
                        >
                          {isInWatchlist(data.symbol) ? (
                            <Minus size={16} color={Colors.danger} />
                          ) : (
                            <Plus size={16} color={Colors.primary} />
                          )}
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.marketListPriceContainer}>
                        <Text style={styles.marketListPrice}>${data.price.toFixed(2)}</Text>
                        <View style={styles.marketListChangeContainer}>
                          {data.change >= 0 ? (
                            <TrendingUp size={14} color={Colors.positive} />
                          ) : (
                            <TrendingDown size={14} color={Colors.negative} />
                          )}
                          <Text
                            style={[
                              styles.marketListChange,
                              { color: data.change >= 0 ? Colors.positive : Colors.negative }
                            ]}
                          >
                            {data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </Card>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.text,
    fontSize: 16,
  },
  categoryTabs: {
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: Colors.cardAlt,
  },
  categoryText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  activeText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  categoryWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
  },
  watchlistCard: {
    margin: 16,
  },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    padding: 8,
  },
  popularCard: {
    margin: 16,
  },
  popularItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  popularSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonDisabled: {
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addButtonText: {
    color: 'black',
    fontWeight: '500',
    fontSize: 12,
  },
  addButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  emptyMessage: {
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
  resultsContainer: {
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  clearText: {
    color: Colors.primary,
    fontSize: 14,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  searchResultName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  watchlistButton: {
    padding: 8,
  },
  marketListCard: {
    margin: 16,
  },
  marketListItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  marketListContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  marketListSymbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marketListSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  watchlistIconButton: {
    padding: 4,
  },
  marketListPriceContainer: {
    alignItems: 'flex-end',
  },
  marketListPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  marketListChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marketListChange: {
    fontSize: 12,
    fontWeight: '500',
  },
});