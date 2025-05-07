import { create } from 'zustand';
import { alpacaApi } from '@/services/alpacaApi';
import { Account, Position, PortfolioSummary } from '@/types/alpaca';

interface PortfolioState {
  account: Account | null;
  positions: Position[];
  summary: PortfolioSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchAccount: () => Promise<void>;
  fetchPositions: () => Promise<void>;
  fetchPortfolio: () => Promise<void>;
  calculateSummary: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  account: null,
  positions: [],
  summary: null,
  isLoading: false,
  error: null,

  fetchAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      const account = await alpacaApi.getAccount();
      set({ account, isLoading: false });
      get().calculateSummary();
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch account' 
      });
    }
  },

  fetchPositions: async () => {
    set({ isLoading: true, error: null });
    try {
      const positions = await alpacaApi.getPositions();
      set({ positions, isLoading: false });
      get().calculateSummary();
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch positions' 
      });
    }
  },

  fetchPortfolio: async () => {
    set({ isLoading: true, error: null });
    try {
      const [account, positions] = await Promise.all([
        alpacaApi.getAccount(),
        alpacaApi.getPositions()
      ]);
      set({ account, positions, isLoading: false });
      get().calculateSummary();
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch portfolio data' 
      });
    }
  },

  calculateSummary: () => {
    const { account, positions } = get();
    
    if (!account) return;
    
    const totalValue = parseFloat(account.portfolio_value);
    const cashBalance = parseFloat(account.cash);
    
    // Calculate day change
    const lastEquity = parseFloat(account.last_equity);
    const dayChange = totalValue - lastEquity;
    const dayChangePercent = lastEquity > 0 ? (dayChange / lastEquity) * 100 : 0;
    
    // Calculate total gain (this is simplified, would need deposit/withdrawal data for accuracy)
    // For now, we'll just use the unrealized P&L from positions
    let totalGain = 0;
    positions.forEach(position => {
      totalGain += parseFloat(position.unrealized_pl);
    });
    
    const totalGainPercent = totalValue > 0 ? (totalGain / totalValue) * 100 : 0;
    
    set({
      summary: {
        totalValue,
        cashBalance,
        dayChange,
        dayChangePercent,
        totalGain,
        totalGainPercent
      }
    });
  }
}));