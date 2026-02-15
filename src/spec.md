# Specification

## Summary
**Goal:** Build an Instagram-like social media app on the Internet Computer with Internet Identity sign-in, profiles, posting, following, likes, and comments.

**Planned changes:**
- Add Internet Identity authentication with signed-in/signed-out UI states and access gating for core features.
- Implement a single Motoko canister backend with data models and APIs for profiles, posts (image, caption, timestamps), likes, comments, and follow relationships, including authorization checks.
- Build the home feed with post cards (author, image, caption, counts, time) plus pagination/infinite loading and empty state.
- Add create-post flow (image select + preview, caption, publish) with validation and immediate UI updates via React Query cache invalidation.
- Add post commenting via a post detail view (or expandable section) with loading/error states and input validation.
- Build profile pages (avatar, display name, bio, counts, follow/unfollow, user post grid/list) and allow owners to edit their profile fields.
- Apply a consistent, distinctive theme across the app (avoid blue/purple as primary colors) with feed-first navigation (top bar and/or bottom nav).
- Use React Query for all queries/mutations and ensure relevant refetch/invalidation after likes, comments, follows, profile edits, and new posts.
- Add generated brand assets under `frontend/public/assets/generated` and render them in the app shell/sign-in and at least one empty state.

**User-visible outcome:** Users can sign in with Internet Identity, browse a feed, create image posts with captions, like and comment on posts, follow/unfollow other users, and view/edit profiles with consistent theming and smooth updates without manual refresh.
