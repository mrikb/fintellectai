import { create } from 'zustand';
import { alpacaApi } from '@/services/alpacaApi';
import { Asset, MarketData, Bar } from '@/types/alpaca';

interface MarketState {
  searchResults: Asset[];
  watchlist: string[];
  marketData: Record<string, MarketData>;
  selectedSymbol: string | null;
  historicalData: Bar[];
  isLoading: boolean;
  error: string | null;
  searchAssets: (query: string) => Promise<void>;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  fetchMarketData: (symbols: string[]) => Promise<void>;
  fetchHistoricalData: (symbol: string, timeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day') => Promise<void>;
  setSelectedSymbol: (symbol: string | null) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  searchResults: [],
  watchlist: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
  marketData: {},
  selectedSymbol: null,
  historicalData: [],
  isLoading: false,
  error: null,

  searchAssets: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const results = await alpacaApi.searchAssets(query);
      set({ searchResults: results, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to search assets' 
      });
    }
  },

  addToWatchlist: (symbol: string) => {
    const { watchlist } = get();
    if (!watchlist.includes(symbol)) {
      set({ watchlist: [...watchlist, symbol] });
    }
  },

  removeFromWatchlist: (symbol: string) => {
    const { watchlist } = get();
    set({ watchlist: watchlist.filter(s => s !== symbol) });
  },

  fetchMarketData: async (symbols: string[]) => {
    if (symbols.length === 0) return;
    
    set({ isLoading: true, error: null });
    try {
      const marketData = { ...get().marketData };
      
      // Process symbols in batches to avoid rate limiting
      const batchSize = 5;
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (symbol) => {
          try {
            const quote = await alpacaApi.getQuote(symbol);
            
            // Get yesterday's close for calculating change
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const startDate = yesterday.toISOString().split('T')[0];
            const endDate = now.toISOString().split('T')[0];
            
            const barsResponse = await alpacaApi.getBars(
              symbol,
              '1Day',
              startDate,
              endDate,
              2
            );
            
            const bars = barsResponse[symbol] || [];
            const previousClose = bars.length > 0 ? bars[0].c : quote.ap;
            const currentPrice = quote.ap;
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            marketData[symbol] = {
              symbol,
              price: currentPrice,
              change,
              changePercent
            };
          } catch (error) {
            console.error(`Failed to fetch data for ${symbol}:`, error);
          }
        }));
      }
      
      set({ marketData, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch market data' 
      });
    }
  },

  fetchHistoricalData: async (symbol: string, timeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day') => {
    if (!symbol) return;
    
    set({ isLoading: true, error: null });
    try {
      // Calculate date range based on timeframe
      const now = new Date();
      const start = new Date(now);
      
      switch (timeframe) {
        case '1Min':
        case '5Min':
          start.setHours(start.getHours() - 24);
          break;
        case '15Min':
        case '1Hour':
          start.setDate(start.getDate() - 7);
          break;
        case '1Day':
          start.setMonth(start.getMonth() - 3);
          break;
      }
      
      const startDate = start.toISOString();
      const endDate = now.toISOString();
      
      const response = await alpacaApi.getBars(
        symbol,
        timeframe,
        startDate,
        endDate
      );
      
      const bars = response[symbol] || [];
      set({ historicalData: bars, selectedSymbol: symbol, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch historical data' 
      });
    }
  },

  setSelectedSymbol: (symbol: string | null) => {
    set({ selectedSymbol: symbol });
    if (symbol) {
      get().fetchHistoricalData(symbol, '1Day');
    }
  }
}));