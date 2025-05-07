import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { alpacaApi } from '@/services/alpacaApi';
import { AlpacaCredentials } from '@/types/alpaca';

interface AuthState {
  isAuthenticated: boolean;
  isPaperTrading: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AlpacaCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  hasCustomCredentials: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isPaperTrading: true,
      isLoading: false,
      error: null,

      login: async (credentials: AlpacaCredentials) => {
        set({ isLoading: true, error: null });
        try {
          // Save credentials to storage
          const success = await alpacaApi.saveCredentials(credentials);
          
          // Verify credentials by making a test API call
          if (success) {
            try {
              await alpacaApi.getAccount();
              set({ 
                isAuthenticated: true, 
                isPaperTrading: credentials.paperTrading,
                isLoading: false 
              });
              return true;
            } catch (error) {
              // Invalid credentials
              await alpacaApi.clearCredentials();
              set({ 
                isAuthenticated: false, 
                error: 'Invalid API credentials. Please check and try again.',
                isLoading: false 
              });
              return false;
            }
          } else {
            set({ 
              isLoading: false, 
              error: 'Failed to save credentials' 
            });
            return false;
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await alpacaApi.clearCredentials();
          set({ 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to logout' 
          });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          if (await alpacaApi.hasCredentials()) {
            try {
              await alpacaApi.getAccount();
              set({ isAuthenticated: true, isLoading: false });
              return true;
            } catch (error) {
              // Invalid or expired credentials
              set({ isAuthenticated: false, isLoading: false });
              return false;
            }
          } else {
            set({ isAuthenticated: false, isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            isAuthenticated: false,
            error: error instanceof Error ? error.message : 'Failed to check authentication' 
          });
          return false;
        }
      },

      hasCustomCredentials: async () => {
        return await alpacaApi.hasCustomCredentials();
      }
    }),
    {
      name: 'alpaca-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);