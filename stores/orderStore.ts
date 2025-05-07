import { create } from 'zustand';
import { alpacaApi } from '@/services/alpacaApi';
import { Order, OrderSide, OrderType, TimeInForce } from '@/types/alpaca';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: (status?: string) => Promise<void>;
  placeOrder: (params: {
    symbol: string;
    qty: number;
    side: OrderSide;
    type: OrderType;
    timeInForce: TimeInForce;
    limitPrice?: number;
    stopPrice?: number;
  }) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async (status = 'all') => {
    set({ isLoading: true, error: null });
    try {
      const orders = await alpacaApi.getOrders(status);
      set({ orders, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch orders' 
      });
    }
  },

  placeOrder: async ({ 
    symbol, 
    qty, 
    side, 
    type, 
    timeInForce, 
    limitPrice, 
    stopPrice 
  }) => {
    set({ isLoading: true, error: null });
    try {
      const orderParams: any = {
        symbol,
        qty,
        side,
        type,
        time_in_force: timeInForce
      };

      if (type === 'limit' || type === 'stop_limit') {
        orderParams.limit_price = limitPrice;
      }

      if (type === 'stop' || type === 'stop_limit') {
        orderParams.stop_price = stopPrice;
      }

      const order = await alpacaApi.createOrder(orderParams);
      
      // Refresh orders list
      await get().fetchOrders();
      
      set({ isLoading: false });
      return order;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to place order' 
      });
      return null;
    }
  },

  cancelOrder: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      await alpacaApi.cancelOrder(orderId);
      
      // Refresh orders list
      await get().fetchOrders();
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to cancel order' 
      });
      return false;
    }
  }
}));