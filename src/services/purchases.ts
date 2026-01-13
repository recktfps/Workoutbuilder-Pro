/**
 * RevenueCat Purchases Service
 * Handles subscription management and entitlement checks
 */

import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

const REVENUECAT_API_KEY = {
  ios: 'YOUR_IOS_API_KEY',
  android: 'YOUR_ANDROID_API_KEY',
};

const ENTITLEMENT_ID = 'pro';

class PurchasesService {
  private isInitialized = false;
  private customerInfo: CustomerInfo | null = null;

  async initialize(userId?: string): Promise<void> {
    try {
      const apiKey =
        Platform.OS === 'ios' ? REVENUECAT_API_KEY.ios : REVENUECAT_API_KEY.android;

      await Purchases.configure({ apiKey });

      if (userId) {
        await Purchases.logIn(userId);
      }

      // Get initial customer info
      this.customerInfo = await Purchases.getCustomerInfo();
      this.isInitialized = true;

      // Listen for updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        this.customerInfo = info;
      });
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error getting offerings:', error);
      return null;
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      this.customerInfo = customerInfo;
      return this.hasProAccess();
    } catch (error: any) {
      if (error.userCancelled) {
        return false;
      }
      console.error('Error purchasing package:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      this.customerInfo = customerInfo;
      return this.hasProAccess();
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  }

  hasProAccess(): boolean {
    if (!this.customerInfo) return false;

    const entitlement = this.customerInfo.entitlements.active[ENTITLEMENT_ID];
    return entitlement !== undefined && entitlement.isActive;
  }

  isSubscribed(): boolean {
    return this.hasProAccess();
  }

  getSubscriptionStatus(): {
    isPro: boolean;
    expirationDate?: Date;
    willRenew?: boolean;
  } {
    if (!this.customerInfo) {
      return { isPro: false };
    }

    const entitlement = this.customerInfo.entitlements.active[ENTITLEMENT_ID];

    if (!entitlement) {
      return { isPro: false };
    }

    return {
      isPro: true,
      expirationDate: entitlement.expirationDate
        ? new Date(entitlement.expirationDate)
        : undefined,
      willRenew: entitlement.willRenew,
    };
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    if (this.customerInfo) {
      return this.customerInfo;
    }

    this.customerInfo = await Purchases.getCustomerInfo();
    return this.customerInfo;
  }
}

export const purchases = new PurchasesService();
export default purchases;

// Platform import for conditional code
import { Platform } from 'react-native';

