import React, { useState, useContext, createContext } from 'react';

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

export const TooltipProvider = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export const Tooltip = ({ children }: { children?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div 
        className="relative flex items-center"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger = ({ children, asChild }: { children?: React.ReactNode; asChild?: boolean }) => {
  // We ignore asChild for this simple implementation and just render children
  return <>{children}</>;
};

interface TooltipContentProps {
  children?: React.ReactNode;
  side?: 'right' | 'left' | 'top' | 'bottom';
  align?: 'center' | 'start' | 'end';
  hidden?: boolean;
}

export const TooltipContent = ({ children, side = 'right', hidden }: TooltipContentProps) => {
  const context = useContext(TooltipContext);
  
  if (!context?.open || hidden) return null;

  return (
    <div className={`
      absolute z-50 px-2 py-1 text-xs font-medium text-white bg-black rounded shadow-sm whitespace-nowrap pointer-events-none
      ${side === 'right' ? 'left-full ml-2' : ''}
      ${side === 'left' ? 'right-full mr-2' : ''}
      ${side === 'top' ? 'bottom-full mb-2' : ''}
      ${side === 'bottom' ? 'top-full mt-2' : ''}
      animate-in fade-in zoom-in-95 duration-200
    `}>
      {children}
    </div>
  );
};