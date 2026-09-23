import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Zap, 
  RotateCcw, 
  ChefHat
} from 'lucide-react';
import { Recipe, UserProfile } from '../types/recipe';
import { AIChefService } from '../services/aiService';
import { ActiveTimer } from './ActiveTimerOverlay';

interface AIChefDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRecipe?: Recipe | null;
  userProfile?: UserProfile | null;
  isPremiumUser: boolean;
  isOnline: boolean;
  downloadedIds: Set<string>;
  onStartTimer: (timer: ActiveTimer) => void;
  onOpenUnlockModal: () => void;
  initialPrompt?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'chef';
  text: string;
  title?: string;
  handledLocally?: boolean;
  category?: string;
  timestamp: string;
}

export const AIChefDrawer: React.FC<AIChefDrawerProps> = ({
  isOpen,
  onClose,
  activeRecipe,
  userProfile,
  isPremiumUser,
  isOnline,
  downloadedIds,
  onStartTimer,
  onOpenUnlockModal,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'chef',
      title: 'Welcome to your Global Kitchen!',
      text: activeRecipe
        ? `Hello! I'm here to help you cook **${activeRecipe.title}** from ${activeRecipe.country}. Ask me for ingredient swaps, cooking time tips, or say "Make this for 2" to adjust servings.`
        : 'Hello! I am your personal cooking assistant. Ask me for cooking tips, ingredient substitutions, recipe ideas, or help with what you have in your fridge!',
      handledLocally: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle initial prompt from recipe modal
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  // Support Escape key to close drawer smoothly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    window.history.pushState({ drawer: 'ai-chef' }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || inputValue;
    if (!textToSend.trim() || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInputValue('');
    setIsThinking(true);

    try {
      const response = await AIChefService.askChef(
        textToSend,
        activeRecipe || undefined,
        userProfile,
        downloadedIds,
        isOnline,
        messages.slice(-6)
      );

      const chefMsg: Message = {
        id: `chef-${Date.now()}`,
        sender: 'chef',
        title: response.title,
        text: response.response,
        handledLocally: response.handledLocally,
        category: response.category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, chefMsg]);

      // If action payload includes setting a timer, trigger timer overlay
      if (response.actionPayload?.type === 'set_timer') {
        const minutes = response.actionPayload.data?.minutes || 10;
        onStartTimer({
          id: `timer-${Date.now()}`,
          label: activeRecipe ? `${activeRecipe.title} Timer` : 'Kitchen Timer',
          totalSeconds: minutes * 60,
          remainingSeconds: minutes * 60,
          isRunning: true
        });
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'chef',
          text: 'I could not answer that right now. You can still ask me to adjust servings (e.g. "Make this for 4") or set a kitchen timer!',
          handledLocally: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  // Question counts
  const usage = userProfile?.aiUsage || { rollingCount: 0, todayCount: 0 };
  const monthlyMax = isPremiumUser ? 100 : 5;
  const remainingMonthly = Math.max(0, monthlyMax - usage.rollingCount);

  // Quick friendly suggestion chips
  const quickPrompts = activeRecipe
    ? [
        `Make this for ${activeRecipe.servings === 2 ? 4 : 2}`,
        'What can I substitute in this?',
        'How long does this take?',
        'Is this easy for beginners?'
      ]
    : [
        'I have chicken, rice and onions',
        'Convert 180°C to Fahrenheit',
        'Set a 20-minute timer',
        'What can I use instead of buttermilk?'
      ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-stone-950 border-l border-stone-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200"
      >
        
        {/* Drawer Header - Simple, Warm English */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-stone-100">
                  Kitchen Chef Assistant
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Ready to Help
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {activeRecipe ? `Helping with: ${activeRecipe.title}` : 'Ask any cooking question'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMessages([messages[0]])}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Clear chat and start over"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question Counter Banner in Simple English */}
        <div className="px-4 py-2 bg-stone-900/40 border-b border-stone-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isPremiumUser ? (
                <><strong>{remainingMonthly}</strong> chef questions left this month</>
              ) : (
                <>Free trial: <strong>{remainingMonthly} of 5</strong> questions left</>
              )}
            </span>
          </div>

          {!isPremiumUser ? (
            <button
              onClick={onOpenUnlockModal}
              className="text-amber-400 hover:underline font-semibold"
            >
              Unlock Unlimited Questions
            </button>
          ) : (
            <span className="text-[11px] text-emerald-400 font-medium">World Pass Active</span>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-stone-950 font-medium rounded-tr-sm shadow-md'
                    : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-sm shadow-md'
                }`}
              >
                {msg.title && (
                  <p className="font-serif font-bold text-amber-400 text-sm mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {msg.title}
                  </p>
                )}

                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text}
                </div>

                {/* Friendly tag for instant offline tips */}
                {msg.sender === 'chef' && msg.handledLocally && (
                  <div className="mt-2.5 pt-2 border-t border-stone-800 flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick tip • Free (doesn't count against your questions)</span>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-stone-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-stone-900/80 border border-stone-800 text-xs text-stone-300 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Chef is writing advice for you...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-stone-800 bg-stone-900/30 overflow-x-auto scrollbar-none flex items-center gap-2">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-stone-800 bg-stone-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={activeRecipe ? `Ask about cooking ${activeRecipe.title}...` : 'Ask any cooking or ingredient question...'}
              className="flex-1 py-3 px-4 rounded-xl bg-stone-900 border border-stone-800 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold transition-all shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
