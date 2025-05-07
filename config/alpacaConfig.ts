import AsyncStorage from '@react-native-async-storage/async-storage';

// Default paper trading API keys (these are just placeholders and won't work)
// Users should replace these with their own keys
const DEFAULT_PAPER_API_KEY = 'PKHTOQKMNVUD5HGLMGVM';
const DEFAULT_PAPER_SECRET_KEY = 'qrxeV73yQJKaQpannQe1w24xxzS02UgjhCUs0pAF';

// Storage keys
const API_KEY_STORAGE_KEY = 'alpaca_api_key';
const SECRET_KEY_STORAGE_KEY = 'alpaca_secret_key';
const PAPER_TRADING_STORAGE_KEY = 'alpaca_paper_trading';

/**
 * Get the stored API key or return the default
 */
export const getApiKey = async (): Promise<string> => {
  try {
    const storedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    return storedKey || DEFAULT_PAPER_API_KEY;
  } catch (error) {
    console.error('Failed to get API key:', error);
    return DEFAULT_PAPER_API_KEY;
  }
};

/**
 * Get the stored Secret key or return the default
 */
export const getSecretKey = async (): Promise<string> => {
  try {
    const storedKey = await AsyncStorage.getItem(SECRET_KEY_STORAGE_KEY);
    return storedKey || DEFAULT_PAPER_SECRET_KEY;
  } catch (error) {
    console.error('Failed to get Secret key:', error);
    return DEFAULT_PAPER_SECRET_KEY;
  }
};

/**
 * Get the paper trading setting
 */
export const isPaperTrading = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(PAPER_TRADING_STORAGE_KEY);
    return value === null ? true : value === 'true';
  } catch (error) {
    console.error('Failed to get paper trading setting:', error);
    return true;
  }
};

/**
 * Save API credentials
 */
export const saveApiCredentials = async (
  apiKey: string,
  secretKey: string,
  paperTrading: boolean
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    await AsyncStorage.setItem(SECRET_KEY_STORAGE_KEY, secretKey);
    await AsyncStorage.setItem(PAPER_TRADING_STORAGE_KEY, paperTrading.toString());
    return true;
  } catch (error) {
    console.error('Failed to save API credentials:', error);
    return false;
  }
};

/**
 * Clear API credentials
 */
export const clearApiCredentials = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
    await AsyncStorage.removeItem(SECRET_KEY_STORAGE_KEY);
    await AsyncStorage.removeItem(PAPER_TRADING_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear API credentials:', error);
    return false;
  }
};

/**
 * Check if custom credentials are set
 */
export const hasCustomCredentials = async (): Promise<boolean> => {
  try {
    const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    const secretKey = await AsyncStorage.getItem(SECRET_KEY_STORAGE_KEY);
    return !!(apiKey && secretKey);
  } catch (error) {
    console.error('Failed to check for custom credentials:', error);
    return false;
  }
};