import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { useGetPostById, useGetCommentsByPostId, useToggleLike } from '../hooks/useQueries';
import CommentList from '../components/comments/CommentList';
import CommentComposer from '../components/comments/CommentComposer';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

export default function PostDetailPage() {
  const { postId } = useParams({ from: '/post/$postId' });
  const navigate = useNavigate();
  const { data: post, isLoading: postLoading, isError: postError } = useGetPostById(postId);
  const { data: comments, isLoading: commentsLoading } = useGetCommentsByPostId(postId);
  const toggleLike = useToggleLike();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post ? Number(post.likes) : 0);

  const handleLike = async () => {
    if (!post) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      await toggleLike.mutateAsync(post.id);
    } catch (error) {
      setIsLiked(!newLiked);
      setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  if (postLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive">Failed to load post</p>
        <Button onClick={() => navigate({ to: '/' })}>Back to Feed</Button>
      </div>
    );
  }

  const imageUrl = post.image.getDirectURL();
  const timestamp = new Date(Number(post.timestamp) / 1000000);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Feed
      </Button>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/assets/generated/avatar-placeholder.dim_256x256.png" />
              <AvatarFallback>{post.authorUsername[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.authorUsername}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <img src={imageUrl} alt={post.caption} className="w-full aspect-square object-cover" />
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-4 pt-4">
          <div className="flex items-center gap-4 w-full">
            <Button variant="ghost" size="sm" className="gap-2 px-2" onClick={handleLike}>
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </Button>
          </div>

          <div className="w-full">
            <p className="text-sm">
              <span className="font-semibold mr-2">{post.authorUsername}</span>
              {post.caption}
            </p>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Comments</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <CommentComposer postId={postId} />
          <Separator />
          <CommentList comments={comments || []} isLoading={commentsLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
