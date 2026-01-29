
import React, { useState, useEffect } from 'react';
import { X, User, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSetProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
        const user = { id: 'local-user', email: `${name.toLowerCase()}@local`, user_metadata: { full_name: name } };
        localStorage.setItem('impersio_local_user', JSON.stringify(user));
        // Force a page reload or state update to reflect the user change
        window.location.reload(); 
        setLoading(false);
        onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold text-primary mb-2">
           Set Profile
        </h2>
        <p className="text-sm text-muted mb-6">
           Enter your name to personalize your experience. This is stored locally on your device.
        </p>

        <form onSubmit={handleSetProfile} className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs font-medium text-muted ml-1">Name</label>
                <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-primary focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Your name"
                    autoFocus
                />
                </div>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-background font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
            </button>
        </form>
      </div>
    </div>
  );
};
