'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { client } from '@/sanity/lib/client';
import { COMMENTS_BY_STARTUP_QUERY } from '@/sanity/lib/queries';
import CommentForm from './CommentForm';

interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  author: {
    _id: string;
    name: string;
    username?: string;
    image: string;
  };
}

interface CommentListProps {
  startupId: string;
}

const CommentList = ({ startupId }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const fetchedComments = await client.fetch(COMMENTS_BY_STARTUP_QUERY, { startupId });
      setComments(fetchedComments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [startupId]);

  const handleCommentAdded = () => {
    fetchComments();
  };

  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h3 className="text-24-bold mb-6">Comments</h3>
      
      <CommentForm startupId={startupId} onCommentAdded={handleCommentAdded} />

      <div className="mt-8 space-y-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="border-b border-gray-100 pb-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.author.image} alt={comment.author.name} />
                  <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-16-semibold">{comment.author.name}</p>
                    <p className="text-14-regular text-gray-400">{formatDate(comment.createdAt)}</p>
                  </div>
                  <p className="text-16-regular mt-2 whitespace-pre-line">{comment.text}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentList; 