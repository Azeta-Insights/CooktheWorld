import React, { useState, useEffect } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  Globe, 
  Download, 
  Award, 
  ShieldCheck, 
  CreditCard, 
  Zap,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { PaystackService } from '../services/paystackService';

interface WorldUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorldUnlockModal: React.FC<WorldUnlockModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, profile, isPremium, isAdmin, requestTestPremium, devFastUnlockPremium, applyEntitlement } = useAuth();
  const [loadingPaystack, setLoadingPaystack] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [testRequestSuccess, setTestRequestSuccess] = useState('');
  const [testerName, setTesterName] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // 1. Keyboard Escape to close modal smoothly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 2. Browser Back Button / Mobile Swipe back listener to return to homepage seamlessly
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ modal: 'world-unlock' }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore in headless
    }
  };

  const handlePaystackPayment = async () => {
    setLoadingPaystack(true);
    setErrorMessage('');

    await PaystackService.initiateWorldUnlock(
      user?.email || 'guest@cooktheworld.app',
      user?.uid || '',
      (result) => {
        setLoadingPaystack(false);
        if (result.entitlement && applyEntitlement) {
          applyEntitlement(result.entitlement);
        }
        triggerCelebration();
        setTimeout(() => {
          onClose();
        }, 1200);
      },
      (err) => {
        setLoadingPaystack(false);
        setErrorMessage(err);
      }
    );
  };

  const handleRequestTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Please sign in first to request test premium access.');
      return;
    }

    setIsSubmittingRequest(true);
    const res = await requestTestPremium(testerName);
    setIsSubmittingRequest(false);

    if (res.success) {
      setTestRequestSuccess(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleDevQuickUnlock = async () => {
    const success = await devFastUnlockPremium();
    if (success) {
      triggerCelebration();
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setErrorMessage('Dev quick unlock failed.');
    }
  };

  const PERKS = [
    { title: 'All 300+ Global Recipes', desc: 'Unlock every dish from over 50 countries around the world.' },
    { title: '100 Chef Questions Each Month', desc: 'Get quick ingredient swaps, step-by-step guidance, and cooking help.' },
    { title: 'Unlimited Offline Recipes', desc: 'Save as many recipes as you want to cook anytime, even without internet.' },
    { title: 'Food Passport & Travel Badges', desc: 'Collect country stamps and badges as you cook your way around the globe.' },
    { title: 'Pay Once, Keep Forever', desc: 'Just ₦2,500 (approx. $3.00 USD) one time. No recurring fees or subscriptions.' }
  ];

  return (
    /* Backdrop: clicking backdrop calls onClose() seamlessly */
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md flex justify-center items-start sm:items-center p-3 sm:p-6 py-6 sm:py-10 animate-in fade-in duration-200"
    >
      {/* Modal Dialog Card: clicking inside does not trigger backdrop close */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-stone-950 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto sm:my-0"
      >
        
        {/* Top-Right Close Button with clear tooltip and hover state */}
        <button
          onClick={onClose}
          aria-label="Close and return to cookbook"
          className="absolute top-4 right-4 p-2.5 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-all z-20 hover:scale-105 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-amber-950/40 via-stone-900/60 to-transparent border-b border-stone-800/80 text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-stone-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/25">
            <Crown className="w-7 h-7 stroke-[2.2]" />
          </div>

          <span className="inline-block text-xs font-bold text-amber-400 uppercase tracking-widest">
            Cook The World Pass
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-black text-stone-100 tracking-tight">
            Unlock The World
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
            Gain lifetime access to the complete global cookbook, unlimited offline downloads, and executive AI Chef guidance.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-stone-900/90 border border-amber-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 font-medium">One-Time Lifetime Pass</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-serif text-3xl sm:text-4xl font-black text-amber-400">
                  ₦2,500
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  (approx. $3.00 USD)
                </span>
              </div>
            </div>

            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              Zero Recurring Fees
            </span>
          </div>

          {/* Value Perks List */}
          <div className="space-y-3">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-stone-200">{perk.title}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {testRequestSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300">
              {testRequestSuccess}
            </div>
          )}

          {/* Action: Paystack Checkout */}
          {!isPremium ? (
            <div className="space-y-3 pt-2">
              <button
                onClick={handlePaystackPayment}
                disabled={loadingPaystack}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <CreditCard className="w-5 h-5" />
                <span>{loadingPaystack ? 'Connecting to Paystack...' : 'Pay ₦2,500 via Paystack'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Dedicated "Return to Cookbook" button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Global Cookbook (Keep Browsing)</span>
              </button>

              {/* Tester Premium Request Form */}
              <div className="pt-4 border-t border-stone-800/80">
                <p className="text-xs text-stone-400 text-center mb-3">
                  Are you a testing partner or reviewer?
                </p>

                <form onSubmit={handleRequestTest} className="flex gap-2">
                  <input
                    type="text"
                    value={testerName}
                    onChange={(e) => setTesterName(e.target.value)}
                    placeholder="Your Name (e.g. Alex Chef Tester)"
                    className="flex-1 py-2.5 px-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingRequest}
                    className="px-4 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-semibold whitespace-nowrap"
                  >
                    Request Tester Access
                  </button>
                </form>
              </div>

              {/* Admin quick access for owner account */}
              {user?.email?.toLowerCase() === 'blessing.waydiva@gmail.com' && (
                <div className="pt-2 text-center">
                  <button
                    onClick={handleDevQuickUnlock}
                    className="text-xs text-amber-400/80 underline hover:text-amber-300 font-sans"
                  >
                    [Admin preview: Enable full access]
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-center space-y-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center mx-auto font-bold">
                ✓
              </div>
              <p className="text-sm font-bold text-emerald-300">
                Your Lifetime World Pass is Active!
              </p>
              <p className="text-xs text-stone-400">
                You have full access to all 300+ recipes, offline downloads, and monthly AI Chef guidance.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Back to Cookbook
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
