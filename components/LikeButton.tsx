'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { likeStartup } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  startupId: string;
  initialLikes: number;
  isLiked: boolean;
}

const LikeButton = ({ startupId, initialLikes, isLiked }: LikeButtonProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(isLiked);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLike = async () => {
    setIsLoading(true);
    try {
      const result = await likeStartup(startupId);
      
      if (result.status === 'SUCCESS') {
        if (result.action === 'LIKED') {
          setLikes(prev => prev + 1);
          setLiked(true);
        } else {
          setLikes(prev => prev - 1);
          setLiked(false);
        }
        
        toast({
          title: result.action === 'LIKED' ? 'Liked!' : 'Unliked!',
          description: result.action === 'LIKED' ? 'You liked this startup' : 'You unliked this startup',
        });
        
        router.refresh();
      } else {
        console.error('Like error details:', result.error);
        toast({
          title: 'Error',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error('Uncaught error in like operation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLike} 
      disabled={isLoading}
      variant={liked ? "default" : "outline"} 
      className={`flex items-center gap-2 ${liked ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
    >
      <Heart className={`h-5 w-5 ${liked ? 'fill-white' : ''}`} />
      <span>{likes}</span>
    </Button>
  );
};

export default LikeButton; 