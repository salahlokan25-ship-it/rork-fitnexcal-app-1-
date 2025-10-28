import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Crown, Camera, Brain, BarChart3 } from 'lucide-react-native';
import { useUser } from '@/hooks/user-store';

const FEATURES = [
  {
    icon: Camera,
    title: 'AI Food Recognition',
    description: 'Snap photos of your meals for instant calorie tracking'
  },
  {
    icon: Brain,
    title: 'Smart Nutrition Assistant',
    description: 'Get personalized meal plans and nutrition advice'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track macros, trends, and progress over time'
  }
];

const PLANS = [
  {
    id: 'monthly',
    title: 'Monthly',
    price: '$9.99',
    period: '/month',
    popular: false,
  },
  {
    id: 'yearly',
    title: 'Yearly',
    price: '$59.99',
    period: '/year',
    popular: true,
    savings: 'Save 50%',
  }
];

export default function PaywallScreen() {
  const { upgradeToPremium } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubscribe = async () => {
    console.log('[Paywall] Subscribe pressed', { selectedPlan });
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await upgradeToPremium();
      
      Alert.alert(
        'Welcome to FitnexCal Premium!',
        'You now have access to all premium features.',
        [
          {
            text: 'Start Tracking',
            onPress: () => router.replace('/(tabs)/home')
          }
        ]
      );
    } catch (e) {
      console.error('[Paywall] Subscribe error', e);
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="paywall-screen">
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Crown size={40} color="#FFD700" />
          </View>
          <View style={styles.imagesRow}>
            <Image
              testID="hero-image"
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/8rkcu9wurlh317n5bkjr7' }}
              style={styles.heroImageSingle}
            />
          </View>
          <Text style={styles.title}>Unlock Premium Features</Text>
          <Text style={styles.subtitle}>
            Get the most out of your nutrition journey with AI-powered insights
          </Text>
        </View>

        <View style={styles.plansContainer}>
          <Text style={styles.plansTitle}>Choose Your Plan</Text>
          
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                plan.popular && styles.planCardPopular
              ]}
              onPress={() => {
                console.log('[Paywall] Plan selected', plan.id);
                setSelectedPlan(plan.id as 'monthly' | 'yearly');
              }}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  {plan.savings && (
                    <Text style={styles.planSavings}>{plan.savings}</Text>
                  )}
                </View>
                <View style={styles.planPricing}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
              </View>
              
              <View style={styles.checkContainer}>
                <View style={[
                  styles.checkCircle,
                  selectedPlan === plan.id && styles.checkCircleSelected
                ]}>
                  {selectedPlan === plan.id && (
                    <Check size={16} color="white" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <feature.icon size={24} color="#007AFF" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>


      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.subscribeButton, isLoading && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          <Text style={styles.subscribeButtonText}>
            {isLoading ? 'Processing...' : 'Start Free Trial'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.trialText}>
          7-day free trial, then {PLANS.find(p => p.id === selectedPlan)?.price}{PLANS.find(p => p.id === selectedPlan)?.period}
        </Text>
        
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.skipText}>Continue with limited features</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A84FF',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  plansContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  plansTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#0B5FFF',
  },
  planCardPopular: {
    borderColor: '#0B5FFF',
    backgroundColor: '#f0f8ff',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#0B5FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  planSavings: {
    fontSize: 14,
    color: '#0B5FFF',
    fontWeight: '500',
    marginTop: 2,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  planPeriod: {
    fontSize: 14,
    color: '#666',
  },
  checkContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  benefitsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#666',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#0A84FF',
    borderTopWidth: 0,
    borderTopColor: 'transparent',
  },
  subscribeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0B5FFF',
  },
  trialText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  imagesRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  heroImage: {
    width: '48%',
    height: 168,
    borderRadius: 16,
  },
  heroImageSingle: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  heroImageRight: {
    marginLeft: 8,
  },
});