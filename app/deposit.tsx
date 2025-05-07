import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  TextInput
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Info, DollarSign, CreditCard, Building2, Wallet } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function DepositScreen() {
  const router = useRouter();
  const [amount, setAmount] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState('bank');

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    Alert.alert(
      'Paper Trading Only',
      'This is a paper trading simulator. In a real app, this would connect to a payment processor. For this simulator, your paper trading account already has funds allocated.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Deposit Funds',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.infoContainer}>
          <Info size={24} color={Colors.primary} />
          <Text style={styles.infoText}>
            This is a paper trading simulator. No real money is involved.
          </Text>
        </View>
        
        <Card style={styles.card} variant="dark">
          <Text style={styles.title}>Deposit Funds</Text>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <DollarSign size={20} color={Colors.primary} />
              <TextInput
                style={styles.amountInput}
                placeholder="Enter amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor={Colors.placeholder}
              />
            </View>
          </View>
          
          <View style={styles.quickAmounts}>
            {['100', '500', '1000', '5000'].map(quickAmount => (
              <TouchableOpacity 
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  amount === quickAmount && styles.quickAmountButtonActive
                ]}
                onPress={() => setAmount(quickAmount)}
              >
                <Text style={[
                  styles.quickAmountText,
                  amount === quickAmount && styles.quickAmountTextActive
                ]}>
                  ${quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.methodLabel}>Payment Method</Text>
          <View style={styles.methodOptions}>
            <TouchableOpacity 
              style={[
                styles.methodOption,
                selectedMethod === 'bank' && styles.methodOptionActive
              ]}
              onPress={() => setSelectedMethod('bank')}
            >
              <Building2 
                size={24} 
                color={selectedMethod === 'bank' ? Colors.primary : Colors.textSecondary} 
                style={styles.methodIcon}
              />
              <Text style={[
                styles.methodText,
                selectedMethod === 'bank' && styles.methodTextActive
              ]}>
                Bank
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.methodOption,
                selectedMethod === 'card' && styles.methodOptionActive
              ]}
              onPress={() => setSelectedMethod('card')}
            >
              <CreditCard 
                size={24} 
                color={selectedMethod === 'card' ? Colors.primary : Colors.textSecondary} 
                style={styles.methodIcon}
              />
              <Text style={[
                styles.methodText,
                selectedMethod === 'card' && styles.methodTextActive
              ]}>
                Card
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.methodOption,
                selectedMethod === 'wallet' && styles.methodOptionActive
              ]}
              onPress={() => setSelectedMethod('wallet')}
            >
              <Wallet 
                size={24} 
                color={selectedMethod === 'wallet' ? Colors.primary : Colors.textSecondary} 
                style={styles.methodIcon}
              />
              <Text style={[
                styles.methodText,
                selectedMethod === 'wallet' && styles.methodTextActive
              ]}>
                Wallet
              </Text>
            </TouchableOpacity>
          </View>
          
          <Button 
            title="Deposit Funds" 
            onPress={handleDeposit}
            style={styles.button}
            disabled={!amount || parseFloat(amount) <= 0}
          />
        </Card>
        
        <Card style={styles.card} variant="dark">
          <Text style={styles.title}>About Paper Trading</Text>
          <Text style={styles.description}>
            Paper trading allows you to practice trading without risking real money.
            It's a great way to test strategies and learn about the markets.
          </Text>
          
          <View style={styles.featureRow}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Practice trading with virtual money</Text>
          </View>
          
          <View style={styles.featureRow}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Test strategies without risk</Text>
          </View>
          
          <View style={styles.featureRow}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Learn how markets work</Text>
          </View>
          
          <View style={styles.featureRow}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Track performance over time</Text>
          </View>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  card: {
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountInput: {
    flex: 1,
    height: 50,
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAmountButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAmountButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}20`,
  },
  quickAmountText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  quickAmountTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  methodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  methodOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  methodOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  methodIcon: {
    marginBottom: 8,
  },
  methodText: {
    color: Colors.textSecondary,
  },
  methodTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
  },
});