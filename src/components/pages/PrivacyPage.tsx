
import { ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="flex-1 overflow-y-auto w-full bg-background relative animate-fade-in">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
         <button onClick={onBack} className="p-2 border border-border rounded-lg bg-surface hover:bg-surface-hover transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
         </button>
      </div>
      
      <div className="max-w-3xl mx-auto px-6 py-20 min-h-[80vh]">
        <div className="mb-12 mt-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-sans">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: May 4, 2026
            </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="lead text-lg text-muted-foreground mb-8">
                Your privacy is critically important to us. This policy explains how Impersio AI collects, uses, and protects your personal information.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Information We Collect</h3>
            <p className="text-muted-foreground mb-6">
                We collect information to provide better services to all our users. This includes basic information like your queries, technical log data, and account details when you sign up using your preferred auth provider.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">How We Use Information</h3>
            <p className="text-muted-foreground mb-6">
                The information we collect is used to power the conversational search experience, maintain our services, and develop new features. We do not sell your personal data to third parties.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Data Processing and AI</h3>
            <p className="text-muted-foreground mb-6">
                When you interact with Impersio AI, your queries are processed by sophisticated Large Language Models. These queries may be analyzed to improve system safety and performance, but they are stripped of personally identifiable information where reasonably possible before general model training.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Contact</h3>
            <p className="text-muted-foreground mb-6">
                If you have questions about this Privacy Policy, please contact the founder and creator, Anubhav Sapkota, through our official support channels or the feedback mechanism within the app.
            </p>
        </div>
      </div>
    </div>
  );
}
