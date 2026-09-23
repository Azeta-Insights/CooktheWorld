import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  Users, 
  Check, 
  XCircle, 
  RotateCcw, 
  HelpCircle, 
  TrendingUp, 
  Database,
  BarChart3,
  Search,
  Plus
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { PremiumRequest } from '../types/recipe';
import { ALL_RECIPES, ALL_STARTER_RECIPES } from '../data/recipes';
import { useAuth } from '../context/AuthContext';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'insights' | 'metrics'>('requests');
  const [requests, setRequests] = useState<PremiumRequest[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Quick grant tester form state
  const [quickTesterEmail, setQuickTesterEmail] = useState('');
  const [quickTesterName, setQuickTesterName] = useState('');
  const [isAddingTester, setIsAddingTester] = useState(false);

  const handleQuickAddTester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTesterEmail.trim()) return;
    setIsAddingTester(true);
    try {
      const testerId = `tester-${Date.now()}`;
      const newReq: PremiumRequest = {
        id: `req-${testerId}`,
        userId: testerId,
        name: quickTesterName.trim() || 'Direct Tester',
        email: quickTesterEmail.trim().toLowerCase(),
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };
      await setDoc(doc(db, 'premiumRequests', newReq.id), newReq);
      setActionMessage(`Added request for ${quickTesterEmail}. Click Approve to grant access.`);
      setQuickTesterEmail('');
      setQuickTesterName('');
      loadRequests();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsAddingTester(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRequests();
      loadInsights();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      window.history.pushState({ modal: 'admin-console' }, '');
      const handlePopState = () => {
        onClose();
      };
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose]);

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const q = query(collection(db, 'premiumRequests'));
      const snap = await getDocs(q);
      const list: PremiumRequest[] = [];
      snap.forEach(d => list.push(d.data() as PremiumRequest));
      setRequests(list);
    } catch (err) {
      console.warn('Error loading premium requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch('/api/recipe-insights');
      const data = await res.json();
      setInsights(data.insights || []);
    } catch (err) {
      console.warn('Error loading recipe question insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleApproveRequest = async (req: PremiumRequest) => {
    try {
      // 1. Update request doc
      await updateDoc(doc(db, 'premiumRequests', req.id), {
        status: 'approved',
        reviewedAt: new Date().toISOString()
      });

      // 2. Grant test_premium to user doc
      await updateDoc(doc(db, 'users', req.userId), {
        entitlement: {
          tier: 'test_premium',
          source: 'test',
          unlockedAt: new Date().toISOString()
        }
      });

      setActionMessage(`Approved Test Premium for ${req.email}`);
      loadRequests();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  const handleRejectRequest = async (req: PremiumRequest) => {
    try {
      await updateDoc(doc(db, 'premiumRequests', req.id), {
        status: 'rejected',
        reviewedAt: new Date().toISOString()
      });
      setActionMessage(`Rejected request for ${req.email}`);
      loadRequests();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  const handleRevokeAccess = async (req: PremiumRequest) => {
    try {
      await updateDoc(doc(db, 'premiumRequests', req.id), {
        status: 'revoked',
        reviewedAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', req.userId), {
        entitlement: {
          tier: 'free',
          source: 'default'
        }
      });

      setActionMessage(`Revoked access for ${req.email}`);
      loadRequests();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-stone-950 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="p-6 border-b border-stone-800 bg-stone-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-100">
                Cook The World Admin Console
              </h2>
              <p className="text-xs text-stone-400">
                Managed by Blessing (blessing.waydiva@gmail.com)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Admin Account Status Banner */}
        {!isAdmin && (
          <div className="px-6 py-2.5 bg-amber-950/40 border-b border-amber-800/40 text-xs text-amber-300">
            <strong>Admin Note:</strong> You are currently signed in as {user?.email || 'Guest'}. Please ensure you are signed in with <strong>blessing.waydiva@gmail.com</strong> so Firestore rules allow approving live tester documents.
          </div>
        )}

        {/* Tab Controls */}
        <div className="px-6 py-2.5 bg-stone-900/40 border-b border-stone-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'requests' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tester Requests ({requests.filter(r => r.status === 'pending').length} pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'insights' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Recipe Question Insights ({insights.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'metrics' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Catalog Metrics</span>
          </button>
        </div>

        {actionMessage && (
          <div className="px-6 py-2 bg-amber-950/40 border-b border-amber-800/40 text-xs text-amber-300 font-mono">
            {actionMessage}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: TESTER REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-400">
                  Manage tester permissions and grant Test Premium access for QA reviewers.
                </p>
                <button
                  onClick={loadRequests}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {/* Direct Grant / Add Tester Quick Form */}
              <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Directly Grant or Create Tester Access</span>
                </div>
                <form onSubmit={handleQuickAddTester} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={quickTesterEmail}
                    onChange={(e) => setQuickTesterEmail(e.target.value)}
                    placeholder="Tester Email (e.g. tester@example.com)"
                    required
                    className="flex-1 py-2 px-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={quickTesterName}
                    onChange={(e) => setQuickTesterName(e.target.value)}
                    placeholder="Name (Optional)"
                    className="sm:w-44 py-2 px-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isAddingTester}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold whitespace-nowrap shadow-md"
                  >
                    {isAddingTester ? 'Adding...' : 'Add Tester Request'}
                  </button>
                </form>
              </div>

              {requests.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-stone-900/40 border border-stone-800 text-xs text-stone-400">
                  No tester access requests submitted yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-stone-100">{req.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            req.status === 'rejected' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {req.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 font-mono">{req.email}</p>
                        <p className="text-[10px] text-stone-500 mt-1">
                          Requested: {new Date(req.requestedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(req)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req)}
                              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-900 text-stone-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}

                        {req.status === 'approved' && (
                          <button
                            onClick={() => handleRevokeAccess(req)}
                            className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold"
                          >
                            Revoke Access
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECIPE QUESTION INSIGHTS */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-100">
                  Recipe Question Insights
                </h3>
                <p className="text-xs text-stone-400">
                  Questions asked by home cooks to AI Chef. Grouped by category so you can identify common kitchen blockers and enhance recipe FAQs.
                </p>
              </div>

              {insights.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-stone-900/40 border border-stone-800 text-xs text-stone-400">
                  No cooking questions logged yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {insights.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                            {item.category}
                          </span>
                          <span className="text-xs font-bold text-stone-300">
                            {item.recipeTitle}
                          </span>
                        </div>
                        <p className="text-xs text-stone-200 italic">
                          "{item.question}"
                        </p>
                      </div>

                      <span className="text-[10px] text-stone-500 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 text-center">
                  <p className="font-mono text-3xl font-bold text-amber-400">{ALL_RECIPES.length}</p>
                  <p className="text-xs text-stone-400 mt-1">Total Recipes</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 text-center">
                  <p className="font-mono text-3xl font-bold text-emerald-400">{ALL_STARTER_RECIPES.length}</p>
                  <p className="text-xs text-stone-400 mt-1">Free Starters</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 text-center">
                  <p className="font-mono text-3xl font-bold text-stone-100">52</p>
                  <p className="text-xs text-stone-400 mt-1">Total Countries</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 text-center">
                  <p className="font-mono text-3xl font-bold text-stone-100">6</p>
                  <p className="text-xs text-stone-400 mt-1">Continents</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
