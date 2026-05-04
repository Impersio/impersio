
import { ArrowLeft, CreditCard, Settings, User as UserIcon } from 'lucide-react';
import { authService } from '@/services/authService';

interface ProfileSettingsPageProps {
  onBack: () => void;
  user: any;
  clerkUser: any;
  openSignIn: () => void;
  setIsProModalOpen: (open: boolean) => void;
}

export default function ProfileSettingsPage({ onBack, user, clerkUser, openSignIn, setIsProModalOpen }: ProfileSettingsPageProps) {
  const isPro = user?.is_pro || false;
  const email = user?.email || clerkUser?.primaryEmailAddress?.emailAddress;
  const name = clerkUser?.fullName || user?.name || 'User';

  return (
    <div className="flex-1 overflow-y-auto w-full bg-background relative animate-fade-in">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
         <button onClick={onBack} className="p-2 border border-border rounded-lg bg-surface hover:bg-surface-hover transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
         </button>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-20 min-h-[80vh]">
        <div className="mb-12 mt-8 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1c7483]/10 flex items-center justify-center text-[#1c7483]">
                <UserIcon className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 font-sans">
                  Profile &amp; Settings
                </h1>
                <p className="text-muted-foreground">
                  Manage your account preferences, subscriptions, and history.
                </p>
            </div>
        </div>

        {(!user && !clerkUser) ? (
            <div className="flex flex-col items-center justify-center p-12 bg-surface border border-border rounded-2xl">
                <UserIcon className="w-12 h-12 text-muted mb-4" />
                <h2 className="text-xl font-bold mb-2">Not Signed In</h2>
                <p className="text-muted-foreground text-center mb-6">Sign in to save your history and access Pro features.</p>
                <button onClick={() => openSignIn()} className="px-6 py-2 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors">
                    Sign In to Impersio
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                <section className="bg-surface p-6 md:p-8 border border-border rounded-2xl">
                    <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2"><UserIcon className="w-5 h-5" /> Account Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-xs font-bold uppercase text-muted tracking-wider block mb-2">Name</label>
                            <div className="text-foreground font-medium text-lg">{name}</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-muted tracking-wider block mb-2">Email</label>
                            <div className="text-foreground font-medium text-lg">{email}</div>
                        </div>
                    </div>
                </section>

                <section className="bg-surface p-6 md:p-8 border border-border rounded-2xl">
                    <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Subscription</h2>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-foreground font-medium text-lg">{isPro ? 'Impersio Pro' : 'Impersio Free'}</span>
                                {isPro && <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#1c7483]/10 text-[#1c7483]">Active</span>}
                            </div>
                            <p className="text-muted text-sm max-w-sm">
                                {isPro ? 'You have access to all premium features and high-volume limits.' : 'Upgrade to Pro for more complex queries and advanced models.'}
                            </p>
                        </div>
                        {!isPro && (
                            <button onClick={() => setIsProModalOpen(true)} className="px-6 py-2 bg-[#1c7483] text-white font-medium rounded-lg hover:bg-[#1a6572] transition-colors w-fit">
                                Upgrade to Pro
                            </button>
                        )}
                        {isPro && (
                            <button className="px-6 py-2 bg-surface hover:bg-surface-hover border border-border text-foreground font-medium rounded-lg transition-colors w-fit">
                                Manage Subscription
                            </button>
                        )}
                    </div>
                </section>

                <section className="bg-surface p-6 md:p-8 border border-border rounded-2xl">
                    <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2"><Settings className="w-5 h-5" /> Preferences</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-foreground">Save History</h3>
                                <p className="text-xs text-muted">Keep a record of your past conversations (this appears in your sidebar).</p>
                            </div>
                            <div className="w-12 h-6 bg-[#1c7483] rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between opacity-50">
                            <div>
                                <h3 className="font-medium text-foreground">Use precise reasoning by default</h3>
                                <p className="text-xs text-muted">Automatically use reasoning models for simple queries.</p>
                            </div>
                            <div className="w-12 h-6 bg-border rounded-full relative cursor-not-allowed">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-muted rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-start">
                    <button onClick={() => { authService.signOut(); window.location.reload(); }} className="px-6 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium rounded-lg transition-colors">
                        Sign Out
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
