import { useState } from 'react';
import { Crown, LogIn } from 'lucide-react';
import { SubscriptionModal } from './SubscriptionModal';
import { LoginModal } from './LoginModal';

interface ChatHeaderProps {
  isAuthenticated: boolean;
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string, name: string) => void;
}

export function ChatHeader({ isAuthenticated, onLogin, onSignup }: ChatHeaderProps) {
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <header className="bg-[#0A1929] border-b border-slate-700 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-white font-semibold text-sm sm:text-base md:text-lg truncate">Simon</span>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 md:gap-2 flex-shrink-0">
          {!isAuthenticated && (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              <LogIn className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
          <button
            onClick={() => setIsSubscriptionOpen(true)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            <Crown className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Passa a Core</span>
            <span className="sm:hidden">Pro</span>
          </button>
        </div>
      </header>

      <SubscriptionModal isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={onLogin}
        onSignup={onSignup}
      />
    </>
  );
}
