import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Search, X, DollarSign, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useMarketStore } from '@/stores/marketStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useOrderStore } from '@/stores/orderStore';
import { OrderSide, OrderType, TimeInForce } from '@/types/alpaca';
import Colors from '@/constants/colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function TradeScreen() {
  const { symbol: initialSymbol, side: initialSide } = useLocalSearchParams<{ symbol?: string, side?: string }>();
  const router = useRouter();
  
  const [symbol, setSymbol] = useState(initialSymbol || '');
  const [side, setSide] = useState<OrderSide>(initialSide as OrderSide || 'buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [timeInForce, setTimeInForce] = useState<TimeInForce>('day');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { 
    searchResults,
    marketData,
    isLoading: marketLoading,
    error: marketError,
    searchAssets,
    fetchMarketData
  } = useMarketStore();
  
  const {
    account,
    isLoading: accountLoading,
    fetchAccount
  } = usePortfolioStore();
  
  const {
    isLoading: orderLoading,
    error: orderError,
    placeOrder
  } = useOrderStore();

  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
      fetchMarketData([initialSymbol]);
    }
    fetchAccount();
  }, [initialSymbol]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      await searchAssets(searchQuery);
    }
  };

  const selectSymbol = (selectedSymbol: string) => {
    setSymbol(selectedSymbol);
    setIsSearching(false);
    setSearchQuery('');
    fetchMarketData([selectedSymbol]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const validateOrder = () => {
    if (!symbol) {
      Alert.alert('Error', 'Please select a stock symbol');
      return false;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return false;
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      Alert.alert('Error', 'Please enter a valid limit price');
      return false;
    }

    if (orderType === 'stop' && (!stopPrice || parseFloat(stopPrice) <= 0)) {
      Alert.alert('Error', 'Please enter a valid stop price');
      return false;
    }

    if (orderType === 'stop_limit' && 
        (!limitPrice || parseFloat(limitPrice) <= 0 || 
         !stopPrice || parseFloat(stopPrice) <= 0)) {
      Alert.alert('Error', 'Please enter valid limit and stop prices');
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateOrder()) return;

    const orderParams = {
      symbol,
      qty: parseFloat(quantity),
      side,
      type: orderType,
      timeInForce,
      limitPrice: limitPrice ? parseFloat(limitPrice) : undefined,
      stopPrice: stopPrice ? parseFloat(stopPrice) : undefined
    };

    // Confirm order
    Alert.alert(
      'Confirm Order',
      `${side.toUpperCase()} ${quantity} shares of ${symbol} at ${orderType.toUpperCase()} price`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Place Order', 
          onPress: async () => {
            const order = await placeOrder(orderParams);
            if (order) {
              Alert.alert(
                'Order Placed',
                `Your ${side} order for ${symbol} has been placed successfully.`,
                [
                  { 
                    text: 'View Orders', 
                    onPress: () => router.push('/orders') 
                  },
                  { 
                    text: 'OK', 
                    onPress: () => router.back() 
                  }
                ]
              );
            }
          }
        }
      ]
    );
  };

  const stockData = symbol ? marketData[symbol] : null;
  const isLoading = marketLoading || accountLoading;
  const error = marketError || orderError;

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Trade',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView style={styles.scrollContainer}>
          {error && <ErrorMessage message={error} />}
          
          <Card style={styles.card} variant="dark">
            <View style={styles.symbolContainer}>
              <Text style={styles.label}>Symbol</Text>
              <TouchableOpacity 
                style={styles.symbolSelector}
                onPress={() => setIsSearching(true)}
              >
                {symbol ? (
                  <Text style={styles.selectedSymbol}>{symbol}</Text>
                ) : (
                  <Text style={styles.symbolPlaceholder}>Select a stock</Text>
                )}
                <Search size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {isSearching && (
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
                    autoFocus
                    placeholderTextColor={Colors.placeholder}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={clearSearch}>
                      <X size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.searchResults}>
                  {marketLoading ? (
                    <LoadingSpinner size="small" message="Searching..." />
                  ) : searchResults.length === 0 ? (
                    <Text style={styles.emptyMessage}>
                      {searchQuery ? 'No results found' : 'Search for a stock symbol'}
                    </Text>
                  ) : (
                    searchResults.map(asset => (
                      <TouchableOpacity 
                        key={asset.id} 
                        style={styles.searchResultItem}
                        onPress={() => selectSymbol(asset.symbol)}
                      >
                        <Text style={styles.searchResultSymbol}>{asset.symbol}</Text>
                        <Text style={styles.searchResultName} numberOfLines={1}>
                          {asset.name || 'Unknown'}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>
            )}
            
            {stockData && (
              <View style={styles.stockInfo}>
                <Text style={styles.stockPrice}>${stockData.price.toFixed(2)}</Text>
                <Text
                  style={[
                    styles.stockChange,
                    { color: stockData.change >= 0 ? Colors.positive : Colors.negative }
                  ]}
                >
                  {stockData.change >= 0 ? '+' : ''}
                  {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                </Text>
              </View>
            )}
            
            <View style={styles.sideContainer}>
              <Text style={styles.label}>Side</Text>
              <View style={styles.sideButtons}>
                <TouchableOpacity
                  style={[
                    styles.sideButton,
                    side === 'buy' && styles.sideButtonActive,
                    side === 'buy' && { backgroundColor: `${Colors.positive}20` }
                  ]}
                  onPress={() => setSide('buy')}
                >
                  <Text
                    style={[
                      styles.sideButtonText,
                      side === 'buy' && styles.sideButtonTextActive,
                      side === 'buy' && { color: Colors.positive }
                    ]}
                  >
                    Buy
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.sideButton,
                    side === 'sell' && styles.sideButtonActive,
                    side === 'sell' && { backgroundColor: `${Colors.negative}20` }
                  ]}
                  onPress={() => setSide('sell')}
                >
                  <Text
                    style={[
                      styles.sideButtonText,
                      side === 'sell' && styles.sideButtonTextActive,
                      side === 'sell' && { color: Colors.negative }
                    ]}
                  >
                    Sell
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.quantityContainer}>
              <Text style={styles.label}>Quantity</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter quantity"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  returnKeyType="done"
                  placeholderTextColor={Colors.placeholder}
                />
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.advancedToggle}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Text style={styles.advancedToggleText}>
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </Text>
              {showAdvanced ? (
                <ChevronUp size={20} color={Colors.primary} />
              ) : (
                <ChevronDown size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
            
            {showAdvanced && (
              <>
                <View style={styles.orderTypeContainer}>
                  <Text style={styles.label}>Order Type</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.orderTypeButtons}
                  >
                    {['market', 'limit', 'stop', 'stop_limit'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.orderTypeButton,
                          orderType === type && styles.orderTypeButtonActive
                        ]}
                        onPress={() => setOrderType(type as OrderType)}
                      >
                        <Text
                          style={[
                            styles.orderTypeButtonText,
                            orderType === type && styles.orderTypeButtonTextActive
                          ]}
                        >
                          {type.replace('_', ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                {(orderType === 'limit' || orderType === 'stop_limit') && (
                  <View style={styles.priceContainer}>
                    <Text style={styles.label}>Limit Price</Text>
                    <View style={styles.inputContainer}>
                      <DollarSign size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter limit price"
                        value={limitPrice}
                        onChangeText={setLimitPrice}
                        keyboardType="numeric"
                        returnKeyType="done"
                        placeholderTextColor={Colors.placeholder}
                      />
                    </View>
                  </View>
                )}
                
                {(orderType === 'stop' || orderType === 'stop_limit') && (
                  <View style={styles.priceContainer}>
                    <Text style={styles.label}>Stop Price</Text>
                    <View style={styles.inputContainer}>
                      <DollarSign size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter stop price"
                        value={stopPrice}
                        onChangeText={setStopPrice}
                        keyboardType="numeric"
                        returnKeyType="done"
                        placeholderTextColor={Colors.placeholder}
                      />
                    </View>
                  </View>
                )}
                
                <View style={styles.timeInForceContainer}>
                  <Text style={styles.label}>Time in Force</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timeInForceButtons}
                  >
                    {[
                      { value: 'day', label: 'Day' },
                      { value: 'gtc', label: 'GTC' },
                      { value: 'ioc', label: 'IOC' },
                      { value: 'fok', label: 'FOK' }
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.timeInForceButton,
                          timeInForce === option.value && styles.timeInForceButtonActive
                        ]}
                        onPress={() => setTimeInForce(option.value as TimeInForce)}
                      >
                        <Text
                          style={[
                            styles.timeInForceButtonText,
                            timeInForce === option.value && styles.timeInForceButtonTextActive
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}
            
            {account && (
              <View style={styles.accountInfo}>
                <Text style={styles.accountInfoLabel}>Available Cash</Text>
                <Text style={styles.accountInfoValue}>
                  ${parseFloat(account.cash).toFixed(2)}
                </Text>
              </View>
            )}
            
            <Button
              title={`Place ${side.toUpperCase()} Order`}
              onPress={handleSubmitOrder}
              loading={orderLoading}
              disabled={isLoading || !symbol || !quantity}
              style={[
                styles.submitButton,
                { backgroundColor: side === 'buy' ? Colors.positive : Colors.negative }
              ]}
            />
          </Card>
          
          <Text style={styles.disclaimer}>
            This is a paper trading simulator. No real money is involved.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  card: {
    margin: 16,
  },
  symbolContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  symbolSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  symbolPlaceholder: {
    fontSize: 16,
    color: Colors.placeholder,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
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
  searchResults: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
  },
  emptyMessage: {
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  stockInfo: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stockPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  stockChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  sideContainer: {
    marginBottom: 16,
  },
  sideButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sideButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sideButtonActive: {
    borderColor: 'transparent',
  },
  sideButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sideButtonTextActive: {
    fontWeight: '700',
  },
  quantityContainer: {
    marginBottom: 16,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  advancedToggleText: {
    color: Colors.primary,
    marginRight: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  orderTypeContainer: {
    marginBottom: 16,
  },
  orderTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  orderTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderTypeButtonActive: {
    borderColor: Colors.primary,
  },
  orderTypeButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  orderTypeButtonTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.text,
    fontSize: 16,
  },
  priceContainer: {
    marginBottom: 16,
  },
  timeInForceContainer: {
    marginBottom: 16,
  },
  timeInForceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeInForceButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeInForceButtonActive: {
    borderColor: Colors.primary,
  },
  timeInForceButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  timeInForceButtonTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  accountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accountInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  accountInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  submitButton: {
    height: 50,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
});