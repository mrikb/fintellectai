import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  LogOut, 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  ChevronRight,
  RefreshCw,
  Moon,
  DollarSign,
  Lock,
  AlertCircle
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function SettingsScreen() {
  const router = useRouter();
  const { isAuthenticated, isPaperTrading, logout, hasCustomCredentials } = useAuthStore();
  const [usingCustomKeys, setUsingCustomKeys] = useState(false);

  useEffect(() => {
    const checkCredentials = async () => {
      const hasCustom = await hasCustomCredentials();
      setUsingCustomKeys(hasCustom);
    };
    
    checkCredentials();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please log in to view settings</Text>
        <Button 
          title="Go to Login" 
          onPress={() => router.replace('/auth')} 
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.accountTypeContainer}>
          <Text style={styles.accountTypeLabel}>
            {isPaperTrading ? 'Paper Trading Account' : 'Live Trading Account'}
          </Text>
        </View>
        <Text style={styles.headerText}>Settings</Text>
        
        {!usingCustomKeys && (
          <View style={styles.demoAccountBadge}>
            <Text style={styles.demoAccountText}>Demo Account</Text>
          </View>
        )}
      </View>

      <Card style={styles.section} variant="dark">
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <User size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Profile</Text>
            <Text style={styles.settingDescription}>Manage your account details</Text>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/deposit')}
        >
          <View style={styles.settingIconContainer}>
            <DollarSign size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Deposit Funds</Text>
            <Text style={styles.settingDescription}>Add funds to your account</Text>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <RefreshCw size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Reset Portfolio</Text>
            <Text style={styles.settingDescription}>Reset your paper trading account</Text>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        {!usingCustomKeys && (
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/auth')}
          >
            <View style={styles.settingIconContainer}>
              <Lock size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Connect Real Account</Text>
              <Text style={styles.settingDescription}>Use your own Alpaca API keys</Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </Card>

      <Card style={styles.section} variant="dark">
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Bell size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Notifications</Text>
            <Text style={styles.settingDescription}>Manage notification settings</Text>
          </View>
          <Switch 
            value={true} 
            onValueChange={() => {}}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.card}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Moon size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Always use dark mode</Text>
          </View>
          <Switch 
            value={true} 
            onValueChange={() => {}}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.card}
          />
        </View>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Shield size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Privacy</Text>
            <Text style={styles.settingDescription}>Manage privacy settings</Text>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Lock size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Security</Text>
            <Text style={styles.settingDescription}>Manage security settings</Text>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </Card>

      <Card style={styles.section} variant="dark">
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <HelpCircle size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Help Center</Text>
            <Text style={styles.settingDescription}>Get help with the app</Text>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <AlertCircle size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>About</Text>
            <Text style={styles.settingDescription}>App information and legal</Text>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </Card>

      <View style={styles.logoutContainer}>
        <Button 
          title="Logout" 
          variant="dark"
          onPress={handleLogout}
          leftIcon={<LogOut size={18} color={Colors.danger} />}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Alpaca Paper Trading Simulator v1.0.0</Text>
        <Text style={styles.footerText}>
          This is a simulation app. No real money is involved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  button: {
    alignSelf: 'center',
    minWidth: 150,
  },
  header: {
    backgroundColor: Colors.card,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },
  accountTypeContainer: {
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  accountTypeLabel: {
    color: 'black',
    fontSize: 12,
    fontWeight: '600',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  demoAccountBadge: {
    backgroundColor: Colors.cardAlt,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoAccountText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  logoutContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  logoutButton: {
    borderColor: Colors.danger,
  },
  logoutButtonText: {
    color: Colors.danger,
  },
  footer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
});