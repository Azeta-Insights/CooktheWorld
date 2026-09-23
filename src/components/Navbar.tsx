import React, { useState } from 'react';
import { 
  Compass, 
  BookOpen, 
  Sparkles, 
  User, 
  LogOut, 
  Shield, 
  Wifi, 
  WifiOff, 
  Crown, 
  Menu, 
  X,
  Bookmark,
  ShoppingBag,
  History,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: 'cookbook' | 'passport' | 'kitchen';
  onSelectView: (view: 'cookbook' | 'passport' | 'kitchen') => void;
  onOpenAuth: () => void;
  onOpenUnlock: () => void;
  onOpenAdmin: () => void;
  onOpenAIChef: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenAuth,
  onOpenUnlock,
  onOpenAdmin,
  onOpenAIChef
}) => {
  const { user, profile, isOnline, isAdmin, isPremium, passport, shoppingList, favorites, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const countriesVisitedCount = Object.keys(passport).length;
  const uncheckedShoppingCount = shoppingList.filter(i => !i.checked).length;

  return (
    <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-xl border-b border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onSelectView('cookbook')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-stone-950 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-100 group-hover:text-amber-400 transition-colors">
                  Cook The World
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-stone-400 font-medium tracking-wide">
                Explore the world. One recipe at a time.
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-stone-900/90 rounded-full border border-stone-800/80">
            <button
              onClick={() => onSelectView('cookbook')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                currentView === 'cookbook'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Cookbook
            </button>

            <button
              onClick={() => onSelectView('passport')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                currentView === 'passport'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Food Passport
              {countriesVisitedCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentView === 'passport' ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {countriesVisitedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectView('kitchen')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                currentView === 'kitchen'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              My Kitchen
              {(favorites.size > 0 || uncheckedShoppingCount > 0) && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentView === 'kitchen' ? 'bg-stone-950 text-amber-400' : 'bg-stone-800 text-stone-300'
                }`}>
                  {favorites.size + uncheckedShoppingCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenAIChef}
              className="px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Chef
            </button>
          </nav>

          {/* Right Controls: Online status, Unlock/Premium badge, Admin, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Online / Offline badge */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                isOnline 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                  : 'bg-amber-950/60 text-amber-300 border-amber-700/60 animate-pulse'
              }`}
              title={isOnline ? 'Connected to Cook The World Cloud' : 'Offline mode: 50 Starters & Saved Recipes are available offline'}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
              <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline Mode'}</span>
            </div>

            {/* Admin Console Link (if admin) */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/70 text-xs font-semibold transition-colors"
                title="Open Admin Console (Tester Requests & Recipe Insights)"
              >
                <Shield className="w-3.5 h-3.5 text-red-400" />
                Admin
              </button>
            )}

            {/* World Unlock CTA / Premium Pill */}
            {!isPremium ? (
              <button
                onClick={onOpenUnlock}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all transform active:scale-95"
              >
                <Crown className="w-3.5 h-3.5 fill-stone-950" />
                <span>Unlock World</span>
                <span className="hidden sm:inline opacity-80 font-mono text-xs">₦2,500</span>
              </button>
            ) : (
              <div 
                onClick={onOpenUnlock}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-semibold hover:bg-amber-500/25 transition-colors"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">World Pass</span>
              </div>
            )}

            {/* Profile / Auth Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-800 border border-stone-700 hover:border-amber-500 flex items-center justify-center text-sm font-bold text-amber-400 transition-all overflow-hidden focus:outline-none"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-60 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-800">
                      <p className="text-xs font-semibold text-stone-200 truncate">{user.displayName || 'Cook The World Chef'}</p>
                      <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPremium ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-stone-800 text-stone-400'
                      }`}>
                        {isPremium ? 'Lifetime World Pass' : 'Free Explorer'}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectView('kitchen')}
                      className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:text-white hover:bg-stone-800 flex items-center gap-2.5"
                    >
                      <History className="w-3.5 h-3.5 text-stone-400" />
                      Cooking History & Notes
                    </button>

                    <button
                      onClick={() => onSelectView('kitchen')}
                      className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:text-white hover:bg-stone-800 flex items-center gap-2.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-stone-400" />
                      Shopping List ({shoppingList.length})
                    </button>

                    <button
                      onClick={() => onSelectView('kitchen')}
                      className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:text-white hover:bg-stone-800 flex items-center gap-2.5"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-stone-400" />
                      Favorites ({favorites.size})
                    </button>

                    {isAdmin && (
                      <button
                        onClick={onOpenAdmin}
                        className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2.5"
                      >
                        <Shield className="w-3.5 h-3.5 text-red-400" />
                        Admin Console
                      </button>
                    )}

                    <div className="border-t border-stone-800 my-1" />

                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800 flex items-center gap-2.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 sm:py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700/80 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-stone-800 space-y-2 animate-in slide-in-from-top-3">
            <button
              onClick={() => {
                onSelectView('cookbook');
                setMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                currentView === 'cookbook' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:bg-stone-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Cookbook (300+ Recipes)</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectView('passport');
                setMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                currentView === 'passport' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:bg-stone-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4" />
                <span>Food Passport</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                {countriesVisitedCount} Visited
              </span>
            </button>

            <button
              onClick={() => {
                onSelectView('kitchen');
                setMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                currentView === 'kitchen' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:bg-stone-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>My Kitchen (History & Shopping)</span>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenAIChef();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-400 hover:bg-stone-900 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Chef (Mentor & Timer)</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/40 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
