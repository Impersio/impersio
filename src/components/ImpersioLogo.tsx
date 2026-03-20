import { ImpersioLogo as Logo } from './Icons';

export default function ImpersioLogo({ className }: { className?: string }) {
  return <Logo className={className || "h-8 w-8 text-[#1c7483] mx-auto"} />;
}
