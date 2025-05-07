import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AlpacaCredentials, Account, Position, Order, Asset, Bar, Quote } from '@/types/alpaca';
import { getApiKey, getSecretKey, isPaperTrading, saveApiCredentials, clearApiCredentials, hasCustomCredentials } from '@/config/alpacaConfig';

const BASE_URL_PAPER = 'https://paper-api.alpaca.markets';
const BASE_URL_LIVE = 'https://api.alpaca.markets';
const DATA_URL = 'https://data.alpaca.markets';

class AlpacaApi {
  private apiKey: string = '';
  private secretKey: string = '';
  private isPaperTrading: boolean = true;

  constructor() {
    this.loadCredentials();
  }

  private async loadCredentials() {
    try {
      this.apiKey = await getApiKey();
      this.secretKey = await getSecretKey();
      this.isPaperTrading = await isPaperTrading();
    } catch (error) {
      console.error('Failed to load Alpaca credentials:', error);
    }
  }

  async saveCredentials(credentials: AlpacaCredentials) {
    try {
      this.apiKey = credentials.apiKey;
      this.secretKey = credentials.secretKey;
      this.isPaperTrading = credentials.paperTrading;
      
      const success = await saveApiCredentials(
        credentials.apiKey,
        credentials.secretKey,
        credentials.paperTrading
      );
      
      return success;
    } catch (error) {
      console.error('Failed to save Alpaca credentials:', error);
      return false;
    }
  }

  async clearCredentials() {
    try {
      this.apiKey = await getApiKey();
      this.secretKey = await getSecretKey();
      this.isPaperTrading = true;
      
      const success = await clearApiCredentials();
      return success;
    } catch (error) {
      console.error('Failed to clear Alpaca credentials:', error);
      return false;
    }
  }

  async hasCredentials(): Promise<boolean> {
    await this.loadCredentials();
    return !!(this.apiKey && this.secretKey);
  }

  async hasCustomCredentials(): Promise<boolean> {
    return await hasCustomCredentials();
  }

  private getBaseUrl(): string {
    return this.isPaperTrading ? BASE_URL_PAPER : BASE_URL_LIVE;
  }

  private getHeaders(): HeadersInit {
    return {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.secretKey,
      'Content-Type': 'application/json'
    };
  }

  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    body?: any, 
    baseUrl: string = this.getBaseUrl()
  ): Promise<T> {
    if (!this.apiKey || !this.secretKey) {
      await this.loadCredentials();
      if (!this.apiKey || !this.secretKey) {
        throw new Error('API credentials not set');
      }
    }

    const url = `${baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      // Handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : {} as T;
    } catch (error) {
      console.error(`Error in ${method} request to ${endpoint}:`, error);
      throw error;
    }
  }

  // Account endpoints
  async getAccount(): Promise<Account> {
    return this.request<Account>('/v2/account');
  }

  // Positions endpoints
  async getPositions(): Promise<Position[]> {
    return this.request<Position[]>('/v2/positions');
  }

  async getPosition(symbol: string): Promise<Position> {
    return this.request<Position>(`/v2/positions/${symbol}`);
  }

  async closePosition(symbol: string): Promise<Order> {
    return this.request<Order>(`/v2/positions/${symbol}`, 'DELETE');
  }

  async closeAllPositions(): Promise<Order[]> {
    return this.request<Order[]>('/v2/positions', 'DELETE');
  }

  // Orders endpoints
  async getOrders(status: string = 'open', limit: number = 50): Promise<Order[]> {
    return this.request<Order[]>(`/v2/orders?status=${status}&limit=${limit}`);
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.request<Order>(`/v2/orders/${orderId}`);
  }

  async createOrder(params: {
    symbol: string;
    qty: number;
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop' | 'stop_limit';
    time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
    limit_price?: number;
    stop_price?: number;
    client_order_id?: string;
  }): Promise<Order> {
    return this.request<Order>('/v2/orders', 'POST', params);
  }

  async cancelOrder(orderId: string): Promise<void> {
    return this.request<void>(`/v2/orders/${orderId}`, 'DELETE');
  }

  async cancelAllOrders(): Promise<void> {
    return this.request<void>('/v2/orders', 'DELETE');
  }

  // Assets endpoints
  async getAssets(status: string = 'active'): Promise<Asset[]> {
    return this.request<Asset[]>(`/v2/assets?status=${status}`);
  }

  async getAsset(symbol: string): Promise<Asset> {
    return this.request<Asset>(`/v2/assets/${symbol}`);
  }

  // Market Data endpoints
  async getBars(
    symbol: string,
    timeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day',
    start: string,
    end: string,
    limit: number = 1000
  ): Promise<{ [symbol: string]: Bar[] }> {
    return this.request<{ [symbol: string]: Bar[] }>(
      `/v2/stocks/${symbol}/bars?timeframe=${timeframe}&start=${start}&end=${end}&limit=${limit}`,
      'GET',
      undefined,
      DATA_URL
    );
  }

  async getQuote(symbol: string): Promise<Quote> {
    return this.request<Quote>(
      `/v2/stocks/${symbol}/quotes/latest`,
      'GET',
      undefined,
      DATA_URL
    );
  }

  // Search for assets
  async searchAssets(query: string): Promise<Asset[]> {
    const assets = await this.getAssets();
    return assets.filter(asset => 
      asset.symbol.toLowerCase().includes(query.toLowerCase()) || 
      (asset.name && asset.name.toLowerCase().includes(query.toLowerCase()))
    );
  }
}

export const alpacaApi = new AlpacaApi();