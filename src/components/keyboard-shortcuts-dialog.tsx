import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function KeyboardShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>New Chat</span>
            <kbd className="px-2 py-1 bg-muted rounded">⌘ + K</kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
