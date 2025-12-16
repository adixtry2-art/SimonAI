export function LoadingIndicator() {
  return (
    <div className="flex gap-4 p-6 flex-row">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-600">
        <span className="text-white font-bold text-sm">S</span>
      </div>
      <div className="flex-1 space-y-2 text-left">
        <div className="flex gap-1.5 items-center">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
}
