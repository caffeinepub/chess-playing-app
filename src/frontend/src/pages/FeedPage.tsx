import { useEffect } from 'react';
import { useGetFeed } from '../hooks/useQueries';
import PostCard from '../components/posts/PostCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useGetFeed();

  const posts = data?.pages.flat() || [];

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load feed. Please try again.</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <img
          src="/assets/generated/empty-feed.dim_1200x600.png"
          alt="No posts yet"
          className="w-full max-w-md rounded-lg opacity-80"
        />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">No posts yet</h2>
          <p className="text-muted-foreground">Be the first to share something amazing!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-muted-foreground py-4">You've reached the end</p>
      )}
    </div>
  );
}
