# Alpaca Trading Simulator

A React Native mobile app for simulating stock trading using the Alpaca API. This app allows users to practice paper trading without risking real money.

## Features

- Paper trading simulation with real market data
- Portfolio tracking and performance analysis
- Real-time stock quotes and charts
- Order management (market, limit, stop, stop-limit)
- Watchlist functionality
- Demo mode with pre-configured API keys

## Getting Started

### Prerequisites

- Node.js
- Expo CLI
- Alpaca account (optional for custom API keys)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

### Using the App

- **Demo Mode**: The app comes with pre-configured paper trading API keys for quick testing
- **Custom API Keys**: You can connect your own Alpaca account by providing your API keys

## API Configuration

The app uses the Alpaca API for paper trading. Default API keys are provided for demo purposes, but you can use your own keys:

1. Create an account at [Alpaca](https://alpaca.markets/)
2. Generate API keys in the Paper Trading section
3. Enter your keys in the app's login screen

## Technologies Used

- React Native
- Expo
- Zustand for state management
- Alpaca API for trading simulation