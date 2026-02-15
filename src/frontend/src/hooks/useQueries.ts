import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Post, Comment, SocialProfile, UserProfile } from '../backend';
import { ExternalBlob } from '../backend';

// Query keys
export const queryKeys = {
  currentUserProfile: ['currentUserProfile'],
  selfProfile: ['selfProfile'],
  profile: (id: string) => ['profile', id],
  feed: ['feed'],
  post: (id: string) => ['post', id],
  comments: (postId: string) => ['comments', postId],
  followers: (userId: string) => ['followers', userId],
  following: (userId: string) => ['following', userId],
  profiles: (search?: string) => ['profiles', search],
};

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: queryKeys.currentUserProfile,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUserProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.selfProfile });
    },
  });
}

export function useGetSelfProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SocialProfile>({
    queryKey: queryKeys.selfProfile,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSelfProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetProfileById(id?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SocialProfile>({
    queryKey: queryKeys.profile(id || ''),
    queryFn: async () => {
      if (!actor || !id) throw new Error('Actor or ID not available');
      return actor.getProfileById(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
      image,
    }: {
      displayName: string;
      bio: string;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProfile(displayName, bio, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.selfProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUserProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}

// Feed Queries
export function useGetFeed() {
  const { actor, isFetching: actorFetching } = useActor();

  return useInfiniteQuery<Post[]>({
    queryKey: queryKeys.feed,
    queryFn: async ({ pageParam = 0 }) => {
      if (!actor) return [];
      return actor.getFeed(BigInt(10), BigInt(pageParam as number));
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    enabled: !!actor && !actorFetching,
  });
}

// Post Queries
export function useGetPostById(postId?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post>({
    queryKey: queryKeys.post(postId || ''),
    queryFn: async () => {
      if (!actor || !postId) throw new Error('Actor or post ID not available');
      return actor.getPostById(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caption, image }: { caption: string; image: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(caption, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.selfProfile });
    },
  });
}

export function useToggleLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleLike(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
    },
  });
}

// Comment Queries
export function useGetCommentsByPostId(postId?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: queryKeys.comments(postId || ''),
    queryFn: async () => {
      if (!actor || !postId) return [];
      return actor.getCommentsByPostId(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
  });
}

export function useCreateComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
      authorUsername,
    }: {
      postId: string;
      content: string;
      authorUsername: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createComment(postId, content, authorUsername);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
    },
  });
}

// Follow Queries
export function useToggleFollow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = { __principal__: targetPrincipal } as any;
      return actor.toggleFollow(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}

export function useCountFollowers(userId?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: queryKeys.followers(userId || ''),
    queryFn: async () => {
      if (!actor || !userId) return BigInt(0);
      const principal = { __principal__: userId } as any;
      return actor.countFollowers(principal);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useCountFollowing(userId?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: queryKeys.following(userId || ''),
    queryFn: async () => {
      if (!actor || !userId) return BigInt(0);
      const principal = { __principal__: userId } as any;
      return actor.countFollowing(principal);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}
