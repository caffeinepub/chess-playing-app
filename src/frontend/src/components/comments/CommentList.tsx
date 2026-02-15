import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import type { Comment } from '../../backend';
import { formatDistanceToNow } from 'date-fns';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
}

export default function CommentList({ comments, isLoading }: CommentListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const timestamp = new Date(Number(comment.timestamp) / 1000000);
        const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

        return (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src="/assets/generated/avatar-placeholder.dim_256x256.png" />
              <AvatarFallback>{comment.authorUsername[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm">{comment.authorUsername}</span>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
