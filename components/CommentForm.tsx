'use client';

import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import { createComment } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

interface CommentFormProps {
  startupId: string;
  onCommentAdded: () => void;
}

const CommentForm = ({ startupId, onCommentAdded }: CommentFormProps) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createComment(startupId, comment);
      
      if (result.status === 'SUCCESS') {
        setComment('');
        toast({
          title: 'Comment added',
          description: 'Your comment has been added successfully',
        });
        onCommentAdded();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add comment',
          variant: 'destructive',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="comment" className="text-16-medium text-gray-700">
          Add a comment
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="mt-2 min-h-[100px]"
          disabled={isSubmitting}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting || !comment.trim()}
        className="bg-pink-500 hover:bg-pink-600 text-white"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
        <Send className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
};

export default CommentForm; 