import { MessageCircle, Lightbulb, Wrench, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onSuggestionClick: (message: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    { icon: MessageCircle, text: 'Inizia una conversazione', prompt: 'Dimmi di cosa vuoi parlare' },
    { icon: Lightbulb, text: 'Chiedi informazioni', prompt: 'Di che informazioni hai bisogno?' },
    { icon: Wrench, text: 'Risolvi problemi', prompt: 'Che problema vorresti risolvere?' },
    { icon: Sparkles, text: 'Intrattieniti', prompt: 'Come posso intrattenerti oggi?' }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-9">
      <div className="max-w-2xl w-full text-center space-y-4 sm:space-y-6 md:space-y-8">
        <img src="/SIMONAI (2).png" alt="SimonAI" className="inline-block w-16 sm:w-20 md:w-[100px] h-16 sm:h-20 md:h-[100px] object-contain mb-2" />

        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
            Benvenuto in SimonAI
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
            Sono qui per aiutarti con qualsiasi domanda o conversazione. Inizia scrivendo un messaggio!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 bg-[#1C2E45] hover:bg-[#243548] border border-slate-700 hover:border-blue-600 rounded-xl sm:rounded-2xl transition-all text-center sm:text-left group"
            >
              <suggestion.icon className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 group-hover:text-blue-400 mx-auto sm:mx-0" />
              <span className="text-white text-xs sm:text-sm md:text-sm font-medium line-clamp-2">{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
