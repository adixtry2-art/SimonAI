import { useState, KeyboardEvent, useRef } from 'react';
import { ArrowUp, Paperclip, Image as ImageIcon, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, imageBase64?: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((input.trim() || selectedImage) && !disabled) {
      onSend(input.trim() || 'Analizza questa immagine', selectedImage || undefined);
      setInput('');
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (type: 'image' | 'file') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : '*';
      fileInputRef.current.click();
    }
    setShowAttachMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setSelectedImage(base64String);
          setImagePreview(base64String);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Seleziona solo file immagine (PNG, JPG, GIF)');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-[#0A1929] p-2 sm:p-3 md:p-4">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-2.5 md:space-y-3">
        {imagePreview && (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-16 sm:max-h-20 md:max-h-32 rounded-lg border-2 border-slate-600"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 sm:p-1 transition-colors"
            >
              <X className="w-3 sm:w-4 h-3 sm:h-4" />
            </button>
          </div>
        )}
        <div className="relative">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            disabled={disabled}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-slate-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Paperclip className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>

          {showAttachMenu && (
            <div className="absolute left-2 sm:left-3 bottom-full mb-2 bg-[#1C2E45] border border-slate-700 rounded-xl shadow-xl overflow-hidden z-10">
              <button
                onClick={() => handleFileSelect('image')}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-slate-700 transition-colors w-full text-left"
              >
                <ImageIcon className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-white text-xs sm:text-sm font-medium">Allega immagine</p>
                  <p className="text-slate-400 text-xs">PNG, JPG, GIF</p>
                </div>
              </button>
            </div>
          )}

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi il tuo messaggio..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none bg-[#1C2E45] text-white rounded-2xl sm:rounded-3xl pl-11 sm:pl-14 pr-11 sm:pr-14 py-2 sm:py-3 md:py-4 text-xs sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-400"
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || (!input.trim() && !selectedImage)}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full p-1.5 sm:p-2 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowUp className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
