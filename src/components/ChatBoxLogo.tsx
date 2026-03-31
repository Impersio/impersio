export default function ChatBoxLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Perplexity_AI_logo.svg"
        alt="Perplexity Logo"
        className="h-8 w-auto"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
