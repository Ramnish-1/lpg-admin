
"use client";

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import Image from 'next/image';

interface ImageViewerDialogProps {
  imageUrl: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageViewerDialog({ imageUrl, isOpen, onOpenChange }: ImageViewerDialogProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
        <div className="relative aspect-video w-full h-full">
          <Image
            src={imageUrl}
            alt="Enlarged product image"
            layout="fill"
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

    