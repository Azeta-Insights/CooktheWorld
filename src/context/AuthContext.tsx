import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import {
  UserProfile,
  UserEntitlement,
  CookingRecord,
  ShoppingItem,
  PassportCountry,
  PremiumRequest,
  Recipe
} from '../types/recipe';
import { OfflineStorageService } from '../services/offlineStorage';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isOnline: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  favorites: Set<string>;
  cookingHistory: CookingRecord[];
  passport: Record<string, PassportCountry>;
  shoppingList: ShoppingItem[];
  downloadedRecipeIds: Set<string>;
  // Auth operations
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  // Cooking & Kitchen operations
  toggleFavorite: (recipeId: string) => Promise<void>;
  recordCookedRecipe: (record: Omit<CookingRecord, 'id' | 'cookedAt'>) => Promise<void>;
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => Promise<void>;
  addToShoppingList: (recipe: Recipe) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearCompletedShopping: () => void;
  downloadRecipe: (recipeId: string) => void;
  removeDownloadedRecipe: (recipeId: string) => void;
  downloadAllPremiumRecipes: (recipeIds: string[]) => void;
  // Entitlement & Admin
  applyEntitlement: (entitlement: UserEntitlement) => void;
  requestTestPremium: (name: string) => Promise<{ success: boolean; message: string }>;
  devFastUnlockPremium: () => Promise<boolean>;
  syncOfflineData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_EMAIL = 'blessing.waydiva@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // User kitchen state
  const [favorites, setFavorites] = useState<Set<string>>(new Set(OfflineStorageService.getLocalFavorites()));
  const [cookingHistory, setCookingHistory] = useState<CookingRecord[]>([]);
  const [passport, setPassport] = useState<Record<string, PassportCountry>>(OfflineStorageService.getLocalPassport());
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(OfflineStorageService.getLocalShoppingList());
  const [downloadedRecipeIds, setDownloadedRecipeIds] = useState<Set<string>>(OfflineStorageService.getDownloadedRecipeIds());

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Push queued offline activities when connectivity returns
  const syncOfflineData = async () => {
    if (!user || !navigator.onLine) return;
    const queue = OfflineStorageService.getOfflineCookingQueue();
    if (queue.length === 0) return;

    try {
      for (const record of queue) {
        const historyRef = doc(collection(db, 'users', user.uid, 'cookingHistory'));
        await setDoc(historyRef, {
          ...record,
          id: historyRef.id,
          cookedAt: record.cookedAt || new Date().toISOString()
        });

        // Update passport
        const passportRef = doc(db, 'users', user.uid, 'passport', record.countryCode);
        const pSnap = await getDoc(passportRef);
        if (pSnap.exists()) {
          const data = pSnap.data();
          const dishes = data.dishNames || [];
          if (!dishes.includes(record.recipeTitle)) dishes.push(record.recipeTitle);
          await updateDoc(passportRef, {
            recipesCooked: (data.recipesCooked || 1) + 1,
            lastCookedAt: new Date().toISOString(),
            dishNames: dishes
          });
        } else {
          await setDoc(passportRef, {
            countryCode: record.countryCode,
            country: record.country,
            continent: record.continent,
            recipesCooked: 1,
            firstCookedAt: new Date().toISOString(),
            lastCookedAt: new Date().toISOString(),
            dishNames: [record.recipeTitle]
          });
        }
      }
      OfflineStorageService.clearOfflineCookingQueue();
    } catch (err) {
      console.warn('Offline sync error (will retry next connection):', err);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserProfile;
            setProfile(data);
          } else {
            // Brand new user: Start completely clean!
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Chef',
              photoURL: fbUser.photoURL || undefined,
              entitlement: {
                tier: 'free',
                source: 'default'
              },
              preferences: {
                dietary: [],
                allergies: [],
                favoriteIngredients: [],
                avoidIngredients: [],
                preferredCookingTime: 'any',
                spicePreference: 'medium'
              },
              aiUsage: {
                totalCount: 0,
                rollingCount: 0,
                todayCount: 0,
                lastResetDay: new Date().toISOString().split('T')[0],
                lastResetMonth: new Date().toISOString().slice(0, 7)
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }

          // Fetch user subcollections
          loadUserSubcollections(fbUser.uid);
        } catch (err) {
          console.warn('Error fetching user profile from Firestore (using local):', err);
        }
      } else {
        setProfile(null);
        setCookingHistory([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserSubcollections = async (uid: string) => {
    try {
      // 1. Favorites
      const favsRef = collection(db, 'users', uid, 'favorites');
      const favsSnap = await getDocs(favsRef);
      const favSet = new Set<string>();
      favsSnap.forEach(d => favSet.add(d.id));
      setFavorites(favSet);

      // 2. Cooking History
      const histRef = collection(db, 'users', uid, 'cookingHistory');
      const histSnap = await getDocs(histRef);
      const historyList: CookingRecord[] = [];
      histSnap.forEach(d => historyList.push(d.data() as CookingRecord));
      historyList.sort((a, b) => new Date(b.cookedAt).getTime() - new Date(a.cookedAt).getTime());
      setCookingHistory(historyList);

      // 3. Passport
      const passRef = collection(db, 'users', uid, 'passport');
      const passSnap = await getDocs(passRef);
      const passMap: Record<string, PassportCountry> = {};
      passSnap.forEach(d => {
        passMap[d.id] = d.data() as PassportCountry;
      });
      setPassport(passMap);
    } catch (err) {
      console.warn('Error loading subcollections:', err);
    }
  };

  // Auth Actions
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user && name) {
      await updateProfile(cred.user, { displayName: name });
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);
      await deleteUser(user);
    } catch (err) {
      console.error('Delete account error:', err);
      throw err;
    }
  };

  // Kitchen Actions
  const toggleFavorite = async (recipeId: string) => {
    const isNowFav = OfflineStorageService.toggleLocalFavorite(recipeId);
    const next = new Set(favorites);
    if (isNowFav) next.add(recipeId);
    else next.delete(recipeId);
    setFavorites(next);

    if (user && isOnline) {
      try {
        const favRef = doc(db, 'users', user.uid, 'favorites', recipeId);
        if (isNowFav) {
          await setDoc(favRef, { recipeId, favoritedAt: new Date().toISOString() });
        } else {
          await deleteDoc(favRef);
        }
      } catch (err) {
        console.warn('Error syncing favorite to Firestore:', err);
      }
    }
  };

  const recordCookedRecipe = async (recordData: Omit<CookingRecord, 'id' | 'cookedAt'>) => {
    const newRecord: CookingRecord = {
      ...recordData,
      id: `cook-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      cookedAt: new Date().toISOString()
    };

    // 1. Update local history and queue
    setCookingHistory(prev => [newRecord, ...prev]);
    OfflineStorageService.queueOfflineCookingRecord(newRecord);

    // 2. Stamp Passport locally
    const updatedCountry = OfflineStorageService.stampLocalPassport(
      recordData.countryCode,
      recordData.country,
      recordData.continent,
      recordData.recipeTitle
    );
    setPassport(prev => ({ ...prev, [recordData.countryCode]: updatedCountry }));

    // 3. Sync to Firestore if online
    if (user && isOnline) {
      try {
        const historyRef = doc(db, 'users', user.uid, 'cookingHistory', newRecord.id);
        await setDoc(historyRef, newRecord);

        const passportRef = doc(db, 'users', user.uid, 'passport', recordData.countryCode);
        await setDoc(passportRef, updatedCountry, { merge: true });
      } catch (err) {
        console.warn('Queued for offline sync:', err);
      }
    }
  };

  const updatePreferences = async (prefs: Partial<UserProfile['preferences']>) => {
    if (!profile) return;
    const nextPrefs = { ...profile.preferences, ...prefs };
    setProfile(prev => prev ? { ...prev, preferences: nextPrefs } : null);

    if (user && isOnline) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          preferences: nextPrefs,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Error saving preferences:', err);
      }
    }
  };

  const addToShoppingList = (recipe: Recipe) => {
    const updated = OfflineStorageService.addRecipeToShoppingList(recipe);
    setShoppingList(updated);
  };

  const toggleShoppingItem = (id: string) => {
    const current = [...shoppingList];
    const item = current.find(i => i.id === id);
    if (item) {
      item.checked = !item.checked;
      OfflineStorageService.saveLocalShoppingList(current);
      setShoppingList(current);
    }
  };

  const removeShoppingItem = (id: string) => {
    const filtered = shoppingList.filter(i => i.id !== id);
    OfflineStorageService.saveLocalShoppingList(filtered);
    setShoppingList(filtered);
  };

  const clearCompletedShopping = () => {
    const filtered = shoppingList.filter(i => !i.checked);
    OfflineStorageService.saveLocalShoppingList(filtered);
    setShoppingList(filtered);
  };

  const downloadRecipe = (recipeId: string) => {
    OfflineStorageService.downloadRecipe(recipeId);
    setDownloadedRecipeIds(OfflineStorageService.getDownloadedRecipeIds());
  };

  const removeDownloadedRecipe = (recipeId: string) => {
    OfflineStorageService.removeDownloadedRecipe(recipeId);
    setDownloadedRecipeIds(OfflineStorageService.getDownloadedRecipeIds());
  };

  const downloadAllPremiumRecipes = (recipeIds: string[]) => {
    OfflineStorageService.downloadAllRecipes(recipeIds);
    setDownloadedRecipeIds(OfflineStorageService.getDownloadedRecipeIds());
  };

  // Request Test Premium
  const requestTestPremium = async (name: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Please sign in before requesting test premium.' };
    }

    try {
      const reqId = `req-${user.uid}`;
      const reqRef = doc(db, 'premiumRequests', reqId);
      await setDoc(reqRef, {
        id: reqId,
        userId: user.uid,
        name: name || user.displayName || 'Tester',
        email: user.email || '',
        requestedAt: new Date().toISOString(),
        status: 'pending'
      });

      return {
        success: true,
        message: 'Your request for Test Premium has been submitted to the admin console for review!'
      };
    } catch (err: any) {
      console.error('Request Test Premium Error:', err);
      return { success: false, message: err.message || 'Unable to submit request.' };
    }
  };

  // Developer Fast Unlock Premium
  const devFastUnlockPremium = async (): Promise<boolean> => {
    if (!user?.email) return false;
    try {
      const res = await fetch('/api/admin/dev-grant-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, userId: user.uid })
      });
      const data = await res.json();
      if (data.success && data.entitlement) {
        setProfile(prev => prev ? { ...prev, entitlement: data.entitlement } : null);
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, { entitlement: data.entitlement });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Dev grant premium error:', err);
      return false;
    }
  };

  const applyEntitlement = (entitlement: UserEntitlement) => {
    setProfile(prev => prev ? { ...prev, entitlement } : null);
  };

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isPremium = profile?.entitlement.tier === 'premium' || profile?.entitlement.tier === 'test_premium';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isOnline,
        isAdmin,
        isPremium,
        favorites,
        cookingHistory,
        passport,
        shoppingList,
        downloadedRecipeIds,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        deleteAccount,
        toggleFavorite,
        recordCookedRecipe,
        updatePreferences,
        addToShoppingList,
        toggleShoppingItem,
        removeShoppingItem,
        clearCompletedShopping,
        downloadRecipe,
        removeDownloadedRecipe,
        downloadAllPremiumRecipes,
        applyEntitlement,
        requestTestPremium,
        devFastUnlockPremium,
        syncOfflineData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
