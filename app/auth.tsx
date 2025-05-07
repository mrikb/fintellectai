import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Key, AlertCircle, Info } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/Card';

export default function AuthScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error, login, checkAuth, hasCustomCredentials } = useAuthStore();
  
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isPaperTrading, setIsPaperTrading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [hasCustomKeys, setHasCustomKeys] = useState(false);
  const [useDefaultKeys, setUseDefaultKeys] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuth = await checkAuth();
      const hasCustom = await hasCustomCredentials();
      setHasCustomKeys(hasCustom);
      
      if (isAuth) {
        router.replace('/');
      }
    };

    checkAuthentication();
  }, []);

  const handleLogin = async () => {
    if (useDefaultKeys) {
      // Use default keys from config
      const success = await login({
        apiKey: '',  // Will use default from config
        secretKey: '', // Will use default from config
        paperTrading: true
      });
      
      if (success) {
        router.replace('/');
      }
    } else {
      // Use custom keys
      if (!apiKey.trim() || !secretKey.trim()) {
        Alert.alert('Error', 'Please enter both API Key and Secret Key');
        return;
      }

      const credentials = {
        apiKey: apiKey.trim(),
        secretKey: secretKey.trim(),
        paperTrading: isPaperTrading
      };

      const success = await login(credentials);
      if (success) {
        router.replace('/');
      }
    }
  };

  const toggleInfoPanel = () => {
    setShowInfo(!showInfo);
  };

  if (isAuthenticated) {
    return <LoadingSpinner fullScreen message="Already logged in. Redirecting..." />;
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Alpaca Trading</Text>
            <Text style={styles.subtitle}>Connect your Alpaca account to start trading</Text>
          </View>

          <Card style={styles.formContainer} variant="dark">
            <View style={styles.optionsContainer}>
              <Text style={styles.optionsTitle}>Choose Connection Method</Text>
              
              <TouchableOpacity 
                style={[
                  styles.optionButton, 
                  useDefaultKeys && styles.optionButtonActive
                ]}
                onPress={() => setUseDefaultKeys(true)}
              >
                <Text style={[
                  styles.optionButtonText,
                  useDefaultKeys && styles.optionButtonTextActive
                ]}>
                  Use Default API Keys (Demo)
                </Text>
                <Text style={styles.optionButtonDescription}>
                  Quick start with pre-configured paper trading keys
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.optionButton, 
                  !useDefaultKeys && styles.optionButtonActive
                ]}
                onPress={() => setUseDefaultKeys(false)}
              >
                <Text style={[
                  styles.optionButtonText,
                  !useDefaultKeys && styles.optionButtonTextActive
                ]}>
                  Use My Own API Keys
                </Text>
                <Text style={styles.optionButtonDescription}>
                  Connect with your personal Alpaca account
                </Text>
              </TouchableOpacity>
            </View>

            {!useDefaultKeys && (
              <>
                <TouchableOpacity 
                  style={styles.infoButton} 
                  onPress={toggleInfoPanel}
                >
                  <Info size={20} color={Colors.primary} />
                  <Text style={styles.infoButtonText}>How to get API keys</Text>
                </TouchableOpacity>

                {showInfo && (
                  <View style={styles.infoPanel}>
                    <Text style={styles.infoPanelTitle}>Getting Alpaca API Keys</Text>
                    <Text style={styles.infoPanelText}>
                      1. Sign up for an Alpaca account at alpaca.markets{'\n'}
                      2. Go to your Dashboard{'\n'}
                      3. Navigate to "Paper Trading" section{'\n'}
                      4. Click on "API Keys"{'\n'}
                      5. Generate a new key pair{'\n'}
                      6. Copy both the API Key ID and Secret Key
                    </Text>
                    <Text style={styles.infoPanelNote}>
                      Note: This app uses paper trading by default, which means no real money is involved.
                    </Text>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="API Key"
                    value={apiKey}
                    onChangeText={setApiKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={Colors.placeholder}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Key size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Secret Key"
                    value={secretKey}
                    onChangeText={setSecretKey}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={Colors.placeholder}
                  />
                </View>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Paper Trading</Text>
                  <Switch
                    value={isPaperTrading}
                    onValueChange={setIsPaperTrading}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Colors.card}
                  />
                </View>
              </>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={18} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title={useDefaultKeys ? "Connect with Demo Account" : "Connect Account"}
              onPress={handleLogin}
              loading={isLoading}
              style={styles.button}
            />

            <Text style={styles.disclaimer}>
              By connecting your account, you agree to the terms and conditions of this application.
              This is a paper trading simulator and does not involve real money.
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    padding: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  optionButtonTextActive: {
    color: Colors.primary,
  },
  optionButtonDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  infoButtonText: {
    color: Colors.primary,
    marginLeft: 8,
    fontSize: 14,
  },
  infoPanel: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoPanelText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  infoPanelNote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.text,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.danger,
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    height: 50,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});