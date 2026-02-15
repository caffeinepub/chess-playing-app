import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from './hooks/useAuth';
import LoginCard from './components/auth/LoginCard';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import AppShell from './components/layout/AppShell';
import FeedPage from './pages/FeedPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import ProfilePage from './pages/ProfilePage';

// Root layout component
function RootLayout() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginCard />;
  }

  return (
    <>
      <ProfileSetupDialog />
      <AppShell>
        <Outlet />
      </AppShell>
    </>
  );
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Feed route
const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: FeedPage,
});

// Create post route
const createPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: CreatePostPage,
});

// Post detail route
const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post/$postId',
  component: PostDetailPage,
});

// Profile route
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$profileId',
  component: ProfilePage,
});

// Self profile route
const selfProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  feedRoute,
  createPostRoute,
  postDetailRoute,
  profileRoute,
  selfProfileRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
