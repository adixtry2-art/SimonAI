import { useState } from 'react';
import { Plus, MessageSquare, Settings, Trash2 } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import type { Conversation } from '../types/chat';

interface SidebarProps {
  conversations: Conversation[];
  currentConversation: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onConversationsDeleted?: () => void;
}

export function Sidebar({ conversations, currentConversation, onNewChat, onSelectConversation, onDeleteConversation, onConversationsDeleted }: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
    <div className="hidden sm:flex sm:w-48 md:w-64 bg-[#0F2035] flex-col border-r border-slate-700">
      <div className="p-2 sm:p-3">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 px-1 sm:px-2 py-2 sm:py-3">
          <img src="/SIMONAI (2).png" alt="SimonAI" className="w-7 sm:w-8 md:w-[35px] h-7 sm:h-8 md:h-[35px] object-contain flex-shrink-0" />
          <span className="text-white font-semibold text-sm sm:text-lg md:text-xl truncate">SimonAI</span>
        </div>

        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl transition-colors font-medium text-xs sm:text-sm"
        >
          <Plus className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
          <span className="truncate">Nova conv</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2">
        {conversations.length > 0 && (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors ${
                  currentConversation === conv.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className="flex items-center gap-1 sm:gap-2 flex-1 text-left min-w-0"
                >
                  <MessageSquare className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{conv.title}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Eliminare questa conversazione?')) {
                      onDeleteConversation(conv.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 sm:p-3 border-t border-slate-700">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm"
        >
          <Settings className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
          <span className="font-medium truncate">Impostazioni</span>
        </button>
      </div>
    </div>

    <SettingsModal
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      onConversationsDeleted={onConversationsDeleted}
    />
    </>
  );
}
