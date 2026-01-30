
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, Loader2, Check } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setEmail('');
      setPassword('');
      setName('');
      setMode('signin');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));

    if (mode === 'signup') {
        const { user, error } = await authService.signUp(email, password, name);
        if (error) {
            setError(error);
            setLoading(false);
        } else {
            // Auto login after signup
            await authService.signIn(email, password, rememberMe);
            window.location.reload();
        }
    } else {
        const { user, error } = await authService.signIn(email, password, rememberMe);
        if (error) {
            setError(error);
            setLoading(false);
        } else {
            window.location.reload();
        }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#191919] border border-[#333] rounded-2xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#888] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-medium text-white mb-2">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-[#888]">
            {mode === 'signin' ? 'Sign in to access your pro features.' : 'Join Impersio to save your history.'}
            </p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
                <div className="space-y-1">
                    <label className="text-xs font-medium text-[#888] ml-1">Full Name</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3 w-4 h-4 text-[#666]" />
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#222] border border-[#333] rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#21808D] transition-colors placeholder-[#444]"
                            placeholder="John Doe"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-medium text-[#888] ml-1">Email</label>
                <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#666]" />
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#222] border border-[#333] rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#21808D] transition-colors placeholder-[#444]"
                    placeholder="you@example.com"
                />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-[#888] ml-1">Password</label>
                <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#666]" />
                <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#222] border border-[#333] rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#21808D] transition-colors placeholder-[#444]"
                    placeholder="••••••••"
                />
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#21808D] border-[#21808D]' : 'bg-transparent border-[#444] group-hover:border-[#666]'}`}>
                        {rememberMe && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm text-[#888] group-hover:text-white select-none">Remember me</span>
                </label>
                
                {mode === 'signin' && (
                    <button type="button" className="text-sm text-[#21808D] hover:underline">
                        Forgot password?
                    </button>
                )}
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#21808D] hover:bg-[#1A6A76] text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#888]">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button 
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-white font-medium hover:underline"
            >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
        </div>
      </div>
    </div>
  );
};
