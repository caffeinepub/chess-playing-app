import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateComment, useGetSelfProfile } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface CommentComposerProps {
  postId: string;
}

export default function CommentComposer({ postId }: CommentComposerProps) {
  const [content, setContent] = useState('');
  const createComment = useCreateComment();
  const { data: profile } = useGetSelfProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (content.length > 500) {
      toast.error('Comment is too long (max 500 characters)');
      return;
    }

    try {
      await createComment.mutateAsync({
        postId,
        content: content.trim(),
        authorUsername: profile?.displayName || 'Anonymous',
      });

      setContent('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={500}
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{content.length}/500</span>
        <Button type="submit" disabled={createComment.isPending || !content.trim()}>
          {createComment.isPending ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Posting...
            </>
          ) : (
            'Post Comment'
          )}
        </Button>
      </div>
    </form>
  );
}
