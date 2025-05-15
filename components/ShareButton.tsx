'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  title: string;
  description: string;
}

const ShareButton = ({ title, description }: ShareButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Get the current URL
      const url = window.location.href;
      
      // Check if the Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title,
          text: description,
          url,
        });
        
        toast({
          title: 'Shared!',
          description: 'Content shared successfully',
        });
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(url);
        
        toast({
          title: 'Link copied!',
          description: 'URL copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to share content',
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button 
      onClick={handleShare} 
      disabled={isSharing}
      variant="outline" 
      className="flex items-center gap-2"
    >
      <Share2 className="h-5 w-5" />
      <span>Share</span>
    </Button>
  );
};

export default ShareButton; 