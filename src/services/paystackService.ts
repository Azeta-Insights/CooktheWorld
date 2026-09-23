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
      // 1. Request initialization from backend
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, userId })
      });

      if (!res.ok) {
        throw new Error('Failed to initialize Paystack transaction');
      }

      const initData = await res.json();
      const hasValidPaystackKey = initData.publicKey && !initData.publicKey.includes('demo_key');

      // 2. Check if Paystack script is loaded in window and key is real
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
              // Standard synchronous function so Paystack Inline JS does not throw "Attribute callback must be a valid function"
              PaystackService.verifyAndGrantEntitlement(response.reference, userId, onSuccess, onError);
            },
            onClose: function () {
              onError('Payment window closed before completion');
            }
          });

          handler.openIframe();
        } catch (setupErr: any) {
          console.error('Paystack setup error:', setupErr);
          // If setup fails due to key restrictions or popup blocking, proceed with verification
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
      const verifyRes = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, userId })
      });

      const verifyData = await verifyRes.json();
      if (verifyData.verified) {
        // Update user record in Firestore if user is authenticated
        if (userId) {
          try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
              entitlement: verifyData.entitlement,
              updatedAt: new Date().toISOString()
            });
          } catch (dbErr) {
            console.warn('Firestore update warning:', dbErr);
          }
        }

        onSuccess({
          success: true,
          reference,
          entitlement: verifyData.entitlement
        });
      } else {
        onError(verifyData.message || 'Payment verification could not be confirmed');
      }
    } catch (err: any) {
      onError('Error verifying transaction: ' + err.message);
    }
  }
}
