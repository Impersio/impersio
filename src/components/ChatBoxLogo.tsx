import { SciraLogo } from '@/components/logos/scira-logo';

export default function ChatBoxLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
                 <SciraLogo className="w-8 h-8 text-[#1c7483]" />
                 <span className="font-sans font-bold tracking-tight text-xl mb-0.5">Impersio ai</span>
    </div>
  );
}
