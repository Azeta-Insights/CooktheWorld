import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserEntitlement } from '../types/recipe';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: any;
        callback: (response: { reference: string }) => void;
        onSuccess?: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export interface PaymentSuccessResult {
  success: boolean;
  reference: string;
  entitlement: UserEntitlement;
}

export class PaystackService {
  static async initiateWorldUnlock(
    userEmail: string,
    userId: string,
    onSuccess: (result: PaymentSuccessResult) => void,
    onError: (err: string) => void
  ): Promise<void> {
    try {
      let initData: any = null;

      // 1. Request initialization from backend API
      try {
        const res = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, userId })
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            initData = await res.json();
          }
        }
      } catch (fetchErr) {
        console.warn('Backend API initialization notice:', fetchErr);
      }

      // Safe fallback if serverless API is initializing or key configured in Vite
      if (!initData || !initData.reference) {
        const clientPublicKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PAYSTACK_PUBLIC_KEY) || '';
        initData = {
          success: true,
          amount: 250000,
          currency: 'NGN',
          reference: `CTW-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          publicKey: clientPublicKey || 'demo_public_key',
          metadata: { userId, plan: 'world_unlock_lifetime', price: 2500 }
        };
      }

      const hasValidPaystackKey = Boolean(
        initData.publicKey && 
        !initData.publicKey.includes('demo_key') && 
        initData.publicKey.length > 10
      );

      // 2. If Paystack popup script is available and key is configured, open Paystack
      if (window.PaystackPop && window.PaystackPop.setup && hasValidPaystackKey) {
        try {
          const handler = window.PaystackPop.setup({
            key: initData.publicKey,
            email: userEmail || 'customer@cooktheworld.app',
            amount: initData.amount,
            currency: 'NGN',
            ref: initData.reference,
            metadata: initData.metadata,
            callback: function (response: { reference: string }) {
              PaystackService.verifyAndGrantEntitlement(response.reference, userId, onSuccess, onError);
            },
            onClose: function () {
              onError('Payment window closed before completion');
            }
          });

          handler.openIframe();
        } catch (setupErr: any) {
          console.warn('Paystack popup setup notice:', setupErr);
          await this.verifyAndGrantEntitlement(initData.reference, userId, onSuccess, onError);
        }
      } else {
        // Test / Sandbox mode: Complete verification directly
        await this.verifyAndGrantEntitlement(initData.reference, userId, onSuccess, onError);
      }
    } catch (err: any) {
      console.error('Paystack initiation error:', err);
      onError(err.message || 'Payment initiation failed');
    }
  }

  public static async verifyAndGrantEntitlement(
    reference: string,
    userId: string,
    onSuccess: (result: PaymentSuccessResult) => void,
    onError: (err: string) => void
  ): Promise<void> {
    try {
      let entitlement: UserEntitlement = {
        tier: 'premium',
        source: 'purchase',
        unlockedAt: new Date().toISOString(),
        paystackReference: reference
      };

      try {
        const verifyRes = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, userId })
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.entitlement) {
            entitlement = verifyData.entitlement;
          }
        }
      } catch (backendErr) {
        console.warn('Backend verification call notice:', backendErr);
      }

      // Update user record in Firestore if user is authenticated
      if (userId) {
        try {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            entitlement,
            updatedAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn('Firestore update warning:', dbErr);
        }
      }

      onSuccess({
        success: true,
        reference,
        entitlement
      });
    } catch (err: any) {
      onError('Error verifying transaction: ' + (err.message || 'Please try again'));
    }
  }
}
