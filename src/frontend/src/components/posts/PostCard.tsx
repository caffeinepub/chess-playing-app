import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useToggleLike } from '../../hooks/useQueries';
import type { Post } from '../../backend';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();
  const toggleLike = useToggleLike();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(post.likes));

  const imageUrl = post.image.getDirectURL();

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      await toggleLike.mutateAsync(post.id);
    } catch (error) {
      // Revert on error
      setIsLiked(!newLiked);
      setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  const timestamp = new Date(Number(post.timestamp) / 1000000);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/assets/generated/avatar-placeholder.dim_256x256.png" />
            <AvatarFallback>{post.authorUsername[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{post.authorUsername}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <img
          src={imageUrl}
          alt={post.caption}
          className="w-full aspect-square object-cover cursor-pointer"
          onClick={() => navigate({ to: '/post/$postId', params: { postId: post.id } })}
        />
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3 pt-3">
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 px-2"
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm font-medium">{likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 px-2"
            onClick={() => navigate({ to: '/post/$postId', params: { postId: post.id } })}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">Comment</span>
          </Button>
        </div>

        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-semibold mr-2">{post.authorUsername}</span>
            {post.caption}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
