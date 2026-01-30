
import React, { useState } from 'react';
import { X, Check, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'info' | 'code'>('info');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = await authService.redeemCode(code);

    setLoading(false);
    if (result.success) {
        setSuccess(true);
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } else {
        setError(result.message);
    }
  };

  if (success) {
      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#191919] border border-[#333] rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
                 <div className="w-16 h-16 bg-[#21808D]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Sparkles className="w-8 h-8 text-[#21808D] animate-pulse" />
                 </div>
                 <h2 className="text-2xl font-serif text-white mb-2">Welcome to Pro!</h2>
                 <p className="text-[#888]">Your subscription has been activated successfully.</p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[400px] bg-[#191919] border border-[#333] rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden font-sans text-[#EAEAEA]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#888] hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {view === 'info' ? (
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                        <span className="font-serif text-2xl tracking-tight text-white">pro</span>
                        <div className="w-6 h-6 rounded-full border border-[#21808D] flex items-center justify-center ml-1">
                            <span className="text-[#21808D] text-[10px] font-bold">P</span>
                        </div>
                    </div>
                    <span className="bg-[#2A2A2A] text-[#21808D] text-xs font-medium px-2 py-1 rounded-md">Popular</span>
                </div>

                <p className="text-[#888] text-sm mb-6">Advanced answers and top AI models</p>

                <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-light text-white">$17</span>
                    <span className="text-sm text-[#888]">/ month or equivalent, when billed annually</span>
                </div>

                <div className="h-px bg-[#333] w-full mb-6"></div>

                <p className="text-sm font-medium text-[#BBB] mb-4">Everything in Free and:</p>

                <ul className="space-y-4 mb-8">
                    {[
                        "Access to the latest AI models, post-trained for higher accuracy",
                        "Select between GPT-5.2, Claude Sonnet 4.5, Gemini 3 Pro, and more",
                        "Better for complex questions and building reports, documents, and apps",
                        "Deeper sourcing from industry index, including proprietary financial data",
                        "Usage limits best for most users"
                    ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-[#888] mt-0.5 shrink-0" />
                            <span className="text-sm text-[#BBB] leading-relaxed">{item}</span>
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={() => setView('code')}
                    className="w-full bg-[#21808D] hover:bg-[#1A6A76] text-black font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    Get Pro
                </button>
            </div>
        ) : (
            <div className="p-8">
                <button 
                    onClick={() => setView('info')}
                    className="text-xs text-[#888] hover:text-white mb-6 flex items-center gap-1"
                >
                    <ArrowRight className="w-3 h-3 rotate-180" /> Back to plan info
                </button>

                <h2 className="text-2xl font-serif text-white mb-2">Redeem Code</h2>
                <p className="text-sm text-[#888] mb-8">Enter your promotional code to activate your 1-year Pro subscription.</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRedeem} className="space-y-4">
                    <input 
                        type="text" 
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="w-full bg-[#222] border border-[#333] rounded-xl py-3 px-4 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-[#21808D] transition-colors uppercase placeholder:text-[#444]"
                        placeholder="IMPERSIO"
                        autoFocus
                    />

                    <button 
                        type="submit"
                        disabled={loading || code.length === 0}
                        className="w-full bg-[#21808D] hover:bg-[#1A6A76] text-black font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Activate Subscription'}
                    </button>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};
