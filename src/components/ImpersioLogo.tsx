export default function ImpersioLogo({ className, variant = 'full' }: { className?: string, variant?: 'text' | 'full' }) {
  const src = variant === 'text' 
    ? 'https://storage.googleapis.com/static.ai.studio/build/18435368877/input_file_0.png'
    : 'https://storage.googleapis.com/static.ai.studio/build/18435368877/input_file_1.png';
    
  return (
    <img 
      src={src} 
      alt="Impersio Logo" 
      className={className || (variant === 'full' ? "h-12 w-auto px-4" : "h-16 w-auto")} 
      referrerPolicy="no-referrer"
    />
  );
}
