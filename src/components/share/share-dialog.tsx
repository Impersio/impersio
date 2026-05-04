import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ShareDialog({ 
  isOpen, 
  onOpenChange,
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  chatId?: string | null;
  selectedVisibilityType?: any;
  onVisibilityChange?: (visibility: any) => Promise<void>;
  isOwner?: boolean;
  user?: any;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Share functionality coming soon.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
