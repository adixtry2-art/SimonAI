import type { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0 w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 rounded-full flex items-center justify-center bg-blue-600">
        <span className="text-white font-bold text-xs sm:text-sm">
          {isUser ? 'U' : 'S'}
        </span>
      </div>
      <div className={`flex-1 space-y-2 sm:space-y-2.5 md:space-y-3 ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
        {message.imageUrl && (
          <div className="inline-block">
            <img
              src={message.imageUrl}
              alt="Uploaded"
              className="max-w-xs sm:max-w-sm md:max-w-sm rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-600 shadow-lg"
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}
        <div className={`inline-block text-white whitespace-pre-wrap leading-relaxed text-xs sm:text-sm md:text-base ${
          isUser ? 'bg-blue-700 rounded-2xl sm:rounded-3xl px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3' : ''
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}
